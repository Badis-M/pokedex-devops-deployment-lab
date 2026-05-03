# 04 — Ansible SSM Deployment

## Purpose

This document explains how Ansible deploys the app to AWS without SSH.

The final deployment uses:

```text
Dockerized Ansible control node
→ AWS dynamic inventory
→ SSM connection plugin
→ S3 transfer bucket
→ EC2
→ Docker deployment
```

No SSH port is opened.

No SSH key is used.

---

## Final Ansible structure

```text
ansible/
├── ansible.cfg
├── inventories
│   └── aws_ec2.aws_ec2.yml
└── playbooks
    └── deploy.yml
```

---

## Why SSM instead of SSH?

Traditional Ansible uses SSH:

```text
Ansible → SSH → EC2
```

This project uses SSM:

```text
Ansible → AWS SSM → EC2
```

Benefits:

- no port 22
- no SSH keys
- access controlled by IAM
- better security posture
- aligns with AWS operational practices

---

## Initial issue with local Ansible

Running Ansible locally on macOS caused:

```text
Python quit unexpectedly
A worker was found in a dead state
```

The problem was not AWS or Terraform.

What worked:

```text
Terraform apply
EC2 creation
SSM instance online
AWS inventory discovery
```

What failed:

```text
Ansible local Python/macOS + amazon.aws.aws_ssm connection plugin
```

---

## Fix: Dockerized Ansible control node

Instead of running Ansible directly on macOS, the project uses a Linux-based Docker image.

This image contains:

- Python 3.13
- Ansible Core
- boto3
- botocore
- amazon.aws collection
- AWS CLI
- Session Manager Plugin

This made the Ansible SSM connection stable.

---

## Ansible config

File:

```text
ansible/ansible.cfg
```

Important parts:

```ini
[defaults]
inventory = inventories/aws_ec2.aws_ec2.yml
host_key_checking = False
interpreter_python = auto_silent
retry_files_enabled = False
stdout_callback = default

[inventory]
enable_plugins = amazon.aws.aws_ec2, yaml, ini
```

---

## AWS EC2 dynamic inventory

File:

```text
ansible/inventories/aws_ec2.aws_ec2.yml
```

Purpose:

```text
Discover EC2 instances dynamically from AWS tags.
```

Key filters:

```yaml
filters:
  tag:Project: pokedex-devops-deployment-lab
  tag:Environment: dev
  instance-state-name: running
```

This means Ansible only targets running EC2 instances created for this project.

---

## Inventory file naming

The file is named:

```text
aws_ec2.aws_ec2.yml
```

An earlier name like `aws_ssm.yml` was parsed incorrectly as YAML/INI inventory.

Some Ansible inventory plugins rely on filename patterns.

---

## SSM connection variables

The inventory composes host variables:

```yaml
compose:
  ansible_host: instance_id
  ansible_connection: "'amazon.aws.aws_ssm'"
  ansible_aws_ssm_region: "'eu-west-3'"
  ansible_aws_ssm_profile: "'poke-website'"
  ansible_aws_ssm_bucket_name: lookup('env', 'ANSIBLE_SSM_BUCKET')
  ansible_python_interpreter: "'/usr/bin/python3'"
```

Important:

```text
ansible_connection = amazon.aws.aws_ssm
```

This tells Ansible not to use SSH.

---

## Why `ANSIBLE_SSM_BUCKET` is dynamic

The S3 bucket name changes after `terraform destroy/apply` because it includes a random suffix.

Hardcoding this in Ansible breaks after the next recreate.

So the Makefile injects it dynamically from Terraform output:

```bash
terraform output -raw ansible_transfer_bucket_name
```

---

## Why Ansible needs an S3 bucket

With SSH, Ansible transfers modules over SSH.

With SSM, there is no SSH channel.

Ansible uses S3 as a transfer mechanism:

```text
Ansible container
→ S3 transfer bucket
→ SSM
→ EC2 executes module
→ result returned
```

---

## Testing inventory

Command:

```bash
make ansible-inventory
```

Expected shape:

```text
@all:
  |--@aws_ec2:
  |  |--i-xxxxxxxxxxxxxxxxx
```

---

## Testing SSM connection

Command:

```bash
make ansible-ping
```

Expected:

```text
i-xxxxxxxxxxxxxxxxx | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

This confirms Ansible Docker, AWS credentials, inventory, SSM, S3, EC2 SSM agent and IAM permissions are working.

---

## Deployment playbook

File:

```text
ansible/playbooks/deploy.yml
```

High-level steps:

```text
1. Install Docker
2. Start Docker
3. Copy Dockerfile and .dockerignore
4. Prepare a clean local app bundle
5. Copy the bundle to EC2
6. Build Docker image on EC2
7. Remove old containers
8. Create Docker network
9. Run app container
10. Create Caddy config
11. Run Caddy container
12. Verify health endpoint inside Docker network
```

---

## Why create a local deployment bundle?

The first attempt copied the whole repo:

```yaml
src: ../../
```

This was too broad and tried to copy:

```text
app/node_modules
terraform/environments/dev/.terraform
docs
ansible
```

Observed sizes:

```text
app/node_modules                       63M
terraform/environments/dev/.terraform  784M
```

So the playbook was changed to create a clean bundle with only:

```text
app/package.json
app/package-lock.json
app/src
app/public
app/views
```

---

## Docker network

The playbook creates:

```text
pokedex-network
```

Both containers join this network:

```text
pokedex-devops-deployment-lab
caddy
```

This allows Caddy to reach the app by container name:

```text
http://pokedex-devops-deployment-lab:3000
```

---

## App container

The app container runs without public port mapping:

```bash
docker run -d \
  --name pokedex-devops-deployment-lab \
  --network pokedex-network \
  --restart unless-stopped \
  pokedex-devops-deployment-lab:latest
```

It is reachable by Caddy inside the Docker network.

It is not directly exposed to the Internet.

---

## Caddy container

Caddy runs with ports:

```text
80:80
443:443
```

It receives public traffic and proxies to the app container.

---

## Healthcheck from Docker network

Since the app no longer exposes port 3000 on the EC2 host, the healthcheck runs through a temporary curl container in the same Docker network:

```bash
docker run --rm \
  --network pokedex-network \
  curlimages/curl:latest \
  http://pokedex-devops-deployment-lab:3000/health
```

---

## Deployment command

```bash
make deploy
```

This runs the Ansible playbook from the Dockerized Ansible control node.

---

## Current known warnings

Ansible may show warnings such as:

```text
The 'tags' host variable is deprecated. Use 'ec2_tags' instead.
Found variable using reserved name 'tags'.
```

These warnings come from the AWS inventory plugin exposing EC2 tags.

They are not blocking.

---

## Main lessons

This layer teaches:

```text
Ansible dynamic inventory
AWS EC2 inventory plugin
SSM connection plugin
S3 transfer bucket
Dockerized control node
SSM without SSH
Docker network deployment
reverse proxy deployment
local bundle preparation
```
