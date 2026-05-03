# 08 — Full Rebuild Runbook

## Purpose

This runbook explains how to rebuild and redeploy the full project from scratch.

It is written as an operational procedure.

Use it when you want to prove that you can recreate the project without relying on memory.

---

## Final target

At the end, you should have:

```text
https://pokedex.badiscloud.fr
```

served by:

```text
OVH DNS
→ AWS Elastic IP
→ AWS EC2
→ Caddy container
→ Node.js app container
```

Provisioning and deployment:

```text
Terraform → AWS infrastructure
Ansible via SSM → server configuration and deployment
Docker → app and tooling
Makefile → automation
```

---

## Final repository structure

```text
.
├── app
├── ansible
├── docs
├── terraform
├── tools
├── Dockerfile
├── .dockerignore
├── .gitignore
└── Makefile
```

---

## Step 1 — Validate local app

From the repository root:

```bash
cd app
npm ci
npm run check
npm start
```

Test:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{"status":"ok","service":"pokedex-devops-deployment-lab"}
```

Stop the server:

```text
Ctrl + C
```

Return to root:

```bash
cd ..
```

---

## Step 2 — Build and test the app Docker image

Build:

```bash
docker build -t pokedex-devops-deployment-lab:local .
```

Run:

```bash
docker run --rm -p 3000:3000 pokedex-devops-deployment-lab:local
```

In another terminal:

```bash
curl http://localhost:3000/health
```

---

## Step 3 — Prepare AWS profile

Dedicated profile:

```text
poke-website
```

Check:

```bash
AWS_PROFILE=poke-website aws sts get-caller-identity
AWS_PROFILE=poke-website aws configure get region
```

Expected region:

```text
eu-west-3
```

---

## Step 4 — Confirm local tools

```bash
terraform version
docker version
aws --version
session-manager-plugin --version
```

---

## Step 5 — Create Elastic IP manually

AWS Console:

```text
EC2
→ Network & Security
→ Elastic IPs
→ Allocate Elastic IP address
```

Region:

```text
eu-west-3
```

Tag:

```text
Name = pokedex-devops-deployment-lab-shared-eip
```

Record the allocation ID:

```text
<EIP_ALLOCATION_ID>
```

This value is used in:

```text
terraform/environments/dev/terraform.tfvars
```

---

## Step 6 — Create Terraform variables

File:

```text
terraform/environments/dev/terraform.tfvars
```

Example:

```hcl
aws_region               = "eu-west-3"
aws_profile              = "poke-website"
project_name             = "pokedex-devops-deployment-lab"
environment              = "dev"
instance_type            = "t3.micro"
elastic_ip_allocation_id = "<EIP_ALLOCATION_ID>"
```

Do not commit this file.

---

## Step 7 — Initialize Terraform

```bash
make tf-init
```

---

## Step 8 — Plan infrastructure

```bash
make tf-plan
```

Expected infrastructure:

```text
VPC
Public subnet
Internet Gateway
Route table
Security Group
IAM Role
IAM Instance Profile
S3 transfer bucket
EC2 instance
Elastic IP association
```

---

## Step 9 — Apply infrastructure

```bash
make tf-apply
```

Approve:

```text
yes
```

Expected outputs:

```text
ansible_transfer_bucket_name = "pokedex-devops-deployment-lab-dev-ansible-transfer-..."
application_url = "http://<ELASTIC_IP>"
elastic_ip = "<ELASTIC_IP>"
instance_id = "i-..."
```

---

## Step 10 — Verify SSM in AWS

```bash
AWS_PROFILE=poke-website aws ssm describe-instance-information \
  --region eu-west-3 \
  --query "InstanceInformationList[*].[InstanceId,PingStatus,PlatformName]" \
  --output table
```

Expected:

```text
Instance ID | Online | Amazon Linux
```

---

## Step 11 — Build Ansible tooling image

```bash
make ansible-build
```

This builds:

```text
pokedex-ansible:local
```

---

## Step 12 — Verify Ansible inventory

```bash
make ansible-inventory
```

Expected:

```text
@aws_ec2:
  |--i-xxxxxxxxxxxxxxxxx
```

---

## Step 13 — Verify Ansible SSM connectivity

```bash
make ansible-ping
```

Expected:

```text
SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

---

## Step 14 — Configure DNS

Domain:

```text
badiscloud.fr
```

OVH DNS record:

```text
Type: A
Subdomain: pokedex
Target: <ELASTIC_IP>
```

Verify:

```bash
dig pokedex.badiscloud.fr A
```

Expected:

```text
pokedex.badiscloud.fr. 3600 IN A <ELASTIC_IP>
```

---

## Step 15 — Deploy the application

```bash
make deploy
```

The playbook does:

```text
Install Docker
Start Docker
Copy clean app bundle
Build app Docker image
Create Docker network
Run app container
Create Caddy config
Run Caddy container
Verify internal health endpoint
```

Expected recap:

```text
failed=0
unreachable=0
```

---

## Step 16 — Test HTTP and HTTPS

Test HTTPS headers:

```bash
curl -I https://pokedex.badiscloud.fr
```

Expected:

```text
HTTP/2 200
server: Caddy
```

Test HTTPS health:

```bash
curl https://pokedex.badiscloud.fr/health
```

Expected:

```json
{"status":"ok","service":"pokedex-devops-deployment-lab"}
```

Open in browser:

```text
https://pokedex.badiscloud.fr
```

---

## Step 17 — If HTTPS gives 502

A 502 from Caddy means:

```text
Browser → Caddy works
Caddy → app container fails
```

Check that both containers are in the same Docker network:

```text
pokedex-network
```

Caddyfile should be:

```text
pokedex.badiscloud.fr {
    reverse_proxy pokedex-devops-deployment-lab:3000
}
```

---

## Step 18 — Daily cleanup

Destroy AWS infrastructure:

```bash
make tf-destroy
```

Approve:

```text
yes
```

This destroys most AWS infrastructure but does not release the manually created Elastic IP.

---

## Step 19 — Elastic IP cleanup if stopping project

If the project is no longer needed:

```text
AWS Console
→ EC2
→ Elastic IPs
→ select <ELASTIC_IP>
→ Release Elastic IP address
```

Only do this if you no longer want DNS stability.

After releasing it, remove or update the OVH DNS record.

---

## Step 20 — Full normal workflow

When starting from zero infrastructure:

```bash
make tf-apply
make ansible-build
make ansible-ping
make deploy
make health
```

When done:

```bash
make tf-destroy
```

---

## Step 21 — Common verification commands

Terraform outputs:

```bash
make tf-output
```

DNS:

```bash
dig pokedex.badiscloud.fr A
```

HTTPS:

```bash
curl -I https://pokedex.badiscloud.fr
```

Health:

```bash
curl https://pokedex.badiscloud.fr/health
```

---

## Step 22 — Mental model

```text
Terraform creates the machine and cloud plumbing.
Ansible configures and deploys the app.
Docker packages and runs services.
Caddy exposes HTTPS.
OVH DNS maps the domain to AWS.
SSM replaces SSH.
Makefile hides long commands.
```

---

## Final success criteria

The project is correctly rebuilt when:

```text
[ ] Terraform apply succeeds
[ ] EC2 appears Online in SSM
[ ] Ansible ping succeeds
[ ] Ansible deploy succeeds
[ ] DNS points to Elastic IP
[ ] HTTPS returns 200
[ ] /health returns JSON
[ ] Browser loads the Pokédex
[ ] terraform destroy works cleanly
```
