# 07 — Cost and Cleanup

## Purpose

This document explains the project cost model and the cleanup strategy.

The goal is to avoid surprise AWS bills while keeping the deployment realistic.

---

## Cost philosophy

This project is designed to be:

```text
low-cost
destroyable
reproducible
portfolio-grade
```

The infrastructure can be recreated with:

```bash
make tf-apply
make deploy
```

and destroyed with:

```bash
make tf-destroy
```

---

## Important idea

Terraform itself does not cost money.

AWS resources cost money while they exist.

```text
terraform apply
→ creates resources
→ resources may cost money

terraform destroy
→ deletes resources
→ most costs stop
```

---

## Resources with potential cost

| Resource | Cost behavior |
|---|---|
| EC2 `t3.micro` | hourly while running |
| EBS root volume | storage while volume exists |
| Public IPv4 / Elastic IP | hourly while allocated |
| S3 transfer bucket | tiny storage/request cost |
| Data transfer | usage-based |
| Route 53 hosted zone | not used currently |
| ALB | not used |
| NAT Gateway | not used |
| RDS | not used |
| EKS | not used |

---

## Resources generally not directly billed

The following are generally not billed directly by themselves:

```text
VPC
subnet
route table
internet gateway
security group
IAM role
IAM policy
instance profile
```

However, resources attached to them may generate costs.

---

## Elastic IP cost

The project uses a manually created Elastic IP:

```text
<ELASTIC_IP>
```

Reason:

```text
DNS needs a stable IP.
```

Tradeoff:

```text
Elastic IP has an hourly public IPv4 cost.
```

Approximate monthly cost:

```text
0.005 USD/hour × 24 × 30 ≈ 3.60 USD/month
```

This cost remains as long as the Elastic IP exists.

Even if the EC2 is destroyed, the Elastic IP can still cost money.

---

## Why keep the Elastic IP?

Without it:

```text
terraform destroy/apply
→ new EC2 public IP
→ DNS breaks
→ OVH record must be updated
```

With it:

```text
Elastic IP stable
→ DNS keeps working
→ EC2 can be recreated behind the same IP
```

This is worth the small fixed cost for a portfolio domain.

---

## EC2 cost

The EC2 instance is created by Terraform and destroyed by Terraform.

When running, it may cost money depending on:

- Free Tier eligibility
- credits
- instance type
- region
- runtime duration

Instance type:

```text
t3.micro
```

Cleanup:

```bash
make tf-destroy
```

This destroys the EC2 instance.

---

## EBS cost

The EC2 root volume exists while the EC2 exists.

When Terraform destroys the EC2, the root volume should be deleted because it is the default root block device behavior.

Check AWS console if uncertain:

```text
EC2 → Volumes
```

---

## S3 transfer bucket

Terraform creates a private S3 bucket for Ansible SSM transfers.

It stores temporary Ansible transfer files.

Cost is usually extremely low because:

- files are small
- usage is short
- storage is minimal

Terraform destroys it during:

```bash
make tf-destroy
```

If deletion fails, check whether objects remain in the bucket.

---

## Why no NAT Gateway?

NAT Gateway has a significant hourly cost.

This project avoids private subnets and NAT Gateway.

The EC2 sits in a public subnet but has no SSH open.

Administration is done with SSM.

---

## Why no Load Balancer?

Application Load Balancer is useful for production-style AWS HTTPS architectures.

But for this project:

```text
ALB cost is not necessary.
Caddy handles HTTPS on the EC2.
```

This keeps costs lower.

---

## Why no Route 53?

The domain is managed through OVH DNS.

Route 53 hosted zones add a monthly cost.

Using OVH DNS is enough for:

```text
pokedex.badiscloud.fr → Elastic IP
```

---

## Normal cleanup command

At the end of a working session:

```bash
make tf-destroy
```

This removes:

- EC2
- VPC
- subnet
- route table
- internet gateway
- security group
- IAM role/profile/policies
- S3 transfer bucket
- Elastic IP association

It does not remove the manually created Elastic IP itself.

---

## Manual Elastic IP cleanup

If the project is no longer needed, manually release the Elastic IP.

AWS Console:

```text
EC2 → Network & Security → Elastic IPs
→ select <ELASTIC_IP>
→ Actions → Release Elastic IP address
```

Do this only if you no longer want the DNS to stay stable.

If you release it, update or remove the OVH DNS record.

---

## OVH domain cost

The domain `badiscloud.fr` has an annual cost.

This is separate from AWS.

Even if AWS infrastructure is destroyed, the domain remains active.

---

## DNS record cleanup

OVH DNS record:

```text
pokedex.badiscloud.fr → <ELASTIC_IP>
```

If you release the Elastic IP, delete or update this DNS record.

---

## Cost-safe workflow

Recommended daily workflow:

```bash
make tf-apply
make ansible-ping
make deploy
make health

# work/test/demo

make tf-destroy
```

Keep the Elastic IP if you want stable DNS.

Release the Elastic IP only if you stop using the project.

---

## Cost checklist

Before stopping work:

```text
[ ] Did I run make tf-destroy?
[ ] Is EC2 terminated?
[ ] Are there no unexpected EBS volumes?
[ ] Is the S3 transfer bucket gone?
[ ] Do I intentionally keep the Elastic IP?
[ ] Do I know the Elastic IP monthly cost?
```

---

## AWS Console places to check

```text
EC2 → Instances
EC2 → Volumes
EC2 → Elastic IPs
S3 → Buckets
VPC → Your VPCs
IAM → Roles
```

---

## Main lessons

This project teaches that low-cost cloud engineering requires:

```text
knowing which resources cost money
destroying temporary infrastructure
keeping durable resources intentionally
avoiding expensive defaults
tracking public IPv4 costs
documenting cleanup commands
```
