# 03 — Terraform AWS Infrastructure

## Purpose

This document explains the AWS infrastructure managed with Terraform.

The goal is to provision a small, reproducible AWS environment for the Pokédex app.

The infrastructure is designed to be:

- simple
- low-cost
- reproducible
- SSM-first
- SSH-free
- compatible with Docker deployment
- suitable for later CI/CD automation

---

## Final Terraform structure

```text
terraform/
├── environments
│   └── dev
│       ├── main.tf
│       ├── outputs.tf
│       ├── providers.tf
│       ├── terraform.tfvars
│       ├── terraform.tfvars.example
│       └── variables.tf
└── modules
    ├── artifact
    ├── compute
    ├── network
    └── security
```

---

## High-level architecture

```text
Internet
→ OVH DNS
→ Elastic IP
→ AWS EC2
→ Caddy container on 80/443
→ Docker network
→ Node.js app container on 3000
```

Provisioned by Terraform:

```text
VPC
Public subnet
Internet Gateway
Route table
Security Group
IAM Role for SSM
IAM Instance Profile
S3 bucket for Ansible SSM transfers
EC2 instance
Elastic IP association
```

Elastic IP itself was created manually and is referenced by Terraform through its allocation ID.

---

## Why modules?

Modules separate responsibilities.

| Module | Responsibility |
|---|---|
| `network` | VPC, subnet, internet gateway, route table |
| `security` | security group, IAM role, instance profile, S3 permissions |
| `compute` | EC2 instance and Elastic IP association |
| `artifact` | private S3 bucket for Ansible SSM transfers |

This makes the infrastructure easier to read and maintain.

---

## AWS profile

A dedicated IAM user/profile was created:

```text
AWS profile: poke-website
Region: eu-west-3
```

Terraform uses:

```hcl
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
```

This avoids mixing credentials from other projects.

---

## Default tags

All resources get common tags:

```text
Project     = pokedex-ci-cd-lab
Environment = dev
ManagedBy   = terraform
```

Tags are used by:

- AWS console filtering
- Ansible dynamic inventory
- cost tracking
- cleanup

---

## Network module

The network module creates:

```text
VPC: 10.40.0.0/16
Public subnet: 10.40.1.0/24
Internet Gateway
Public route table
Default route to Internet
Route table association
```

Why we created a VPC:

The AWS account/region did not have a default VPC.

Terraform initially failed with:

```text
Error: no matching EC2 VPC found
```

So a dedicated project VPC was added.

---

## Public subnet

The subnet is public because it has a route to the Internet Gateway.

This allows:

- inbound HTTP/HTTPS traffic
- outbound package installation
- outbound SSM communication
- outbound Docker pulls

---

## Security module

The security module creates:

1. Security group
2. IAM role for EC2
3. IAM instance profile
4. SSM policy attachment
5. S3 transfer bucket policy

---

## Security Group

The EC2 security group allows:

```text
80/tcp  from 0.0.0.0/0
443/tcp from 0.0.0.0/0
egress  all
```

It does not allow SSH.

```text
No port 22.
No SSH key pair.
No bastion.
```

Administration happens through SSM.

---

## Why keep port 80 open?

Port 80 is used by Caddy for:

- HTTP access
- automatic redirect to HTTPS
- Let's Encrypt HTTP challenge

Caddy needs to be reachable on port 80 and 443 for automatic certificate management.

---

## IAM role for SSM

EC2 assumes this IAM role:

```text
pokedex-ci-cd-lab-dev-ec2-ssm-role
```

It has the AWS managed policy:

```text
AmazonSSMManagedInstanceCore
```

This allows the EC2 instance to appear in AWS Systems Manager.

---

## S3 bucket for Ansible SSM

Ansible's `amazon.aws.aws_ssm` connection plugin needs a bucket to transfer temporary files/modules.

Terraform creates:

```text
pokedex-ci-cd-lab-dev-ansible-transfer-<random>
```

The bucket is:

- private
- encrypted with AES256
- blocked from public access

---

## S3 permissions

The EC2 role receives permissions for the Ansible transfer bucket:

```text
s3:GetObject
s3:PutObject
s3:DeleteObject
s3:ListBucket
```

This allows Ansible to move temporary execution files through S3 while using SSM.

---

## Compute module

The compute module creates:

- Amazon Linux 2023 EC2 instance
- Elastic IP association

The EC2 uses:

```text
t3.micro
Amazon Linux 2023
SSM instance profile
HTTP/HTTPS security group
IMDSv2 required
```

---

## AMI lookup

Terraform finds a recent Amazon Linux 2023 AMI instead of hardcoding one.

This keeps the project more portable across future rebuilds.

---

## IMDSv2

The EC2 metadata options include:

```hcl
metadata_options {
  http_tokens = "required"
}
```

This enforces IMDSv2.

That is a security improvement over optional metadata tokens.

---

## Elastic IP

The Elastic IP was created manually in the AWS Console:

```text
Allocation ID: <EIP_ALLOCATION_ID>
```

Terraform receives it through:

```hcl
elastic_ip_allocation_id = "<EIP_ALLOCATION_ID>"
```

Then associates it:

```hcl
resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = var.elastic_ip_allocation_id
}
```

---

## Why Elastic IP is external to Terraform

The EC2 is temporary.

The IP must stay stable for DNS.

If Terraform destroyed the EIP every time, DNS would break after every `destroy/apply`.

Current model:

```text
Elastic IP durable
EC2 temporary
DNS stable
```

Tradeoff:

```text
Stable DNS
but fixed monthly IPv4 cost
```

---

## Why `associate_public_ip_address = false`

The instance does not need an automatic public IP because the Elastic IP provides public reachability.

Final output can therefore show:

```text
elastic_ip       = <ELASTIC_IP>
application_url  = http://<ELASTIC_IP>
public_ip        = ""
public_dns       = ""
```

This is expected.

---

## Terraform outputs

Important outputs:

```hcl
output "ansible_transfer_bucket_name" {
  value = module.artifact.bucket_name
}

output "elastic_ip" {
  value = module.compute.elastic_ip
}

output "application_url" {
  value = "http://${module.compute.elastic_ip}"
}

output "instance_id" {
  value = module.compute.instance_id
}
```

Outputs are used by Makefile, Ansible and manual testing.

---

## Terraform commands

Initialize:

```bash
make tf-init
```

Plan:

```bash
make tf-plan
```

Apply:

```bash
make tf-apply
```

Outputs:

```bash
make tf-output
```

Destroy:

```bash
make tf-destroy
```

---

## Important `.gitignore` rules

Commit:

```text
terraform/**/*.tf
terraform/**/terraform.tfvars.example
```

Do not commit:

```text
terraform.tfvars
terraform.tfstate
.terraform/
.terraform.lock.hcl
```

`terraform.tfvars` may contain project-specific values such as the Elastic IP allocation ID.

State files can contain sensitive infrastructure details.

---

## Cost-sensitive resources

Resources with potential cost:

| Resource | Cost risk |
|---|---|
| EC2 `t3.micro` | hourly |
| EBS root volume | storage |
| Public IPv4 / Elastic IP | hourly |
| S3 bucket | very low storage/request cost |
| Data transfer | usage-based |

No NAT Gateway, ALB, RDS or EKS is used.

This keeps the project relatively low-cost.

---

## Main lessons

This Terraform layer teaches:

```text
modular Terraform
AWS provider configuration
IAM roles and instance profiles
SSM-first EC2 access
VPC networking
public subnet routing
security groups
S3 private bucket
Elastic IP association
Terraform outputs
cost-aware infrastructure
```
