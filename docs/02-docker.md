# 02 — Docker: Application Image and Ansible Tooling Image

## Purpose

This document explains how Docker is used in the project.

The project uses two different Docker images:

1. An application image
2. An Ansible tooling image

They have different purposes and should not be mixed.

---

## Final Docker-related structure

```text
.
├── Dockerfile
├── .dockerignore
├── app/
└── tools
    └── ansible
        ├── Dockerfile
        ├── requirements.txt
        └── requirements.yml
```

---

## Why two Dockerfiles?

| Dockerfile | Image | Purpose |
|---|---|---|
| `Dockerfile` | `pokedex-ci-cd-lab:local` | Runs the Node.js app |
| `tools/ansible/Dockerfile` | `pokedex-ansible:local` | Runs Ansible, AWS CLI and SSM plugin |

This is a clean separation:

```text
Application runtime image
→ what runs the website

Tooling image
→ what deploys the website
```

The app image should not contain Ansible, AWS CLI or deployment tooling.

The tooling image should not be the production web app.

---

## Application Dockerfile

Location:

```text
Dockerfile
```

Final version:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY app/package*.json ./

RUN npm ci --omit=dev

COPY app/src ./src
COPY app/public ./public
COPY app/views ./views

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Application Dockerfile line by line

### Base image

```dockerfile
FROM node:22-alpine
```

This starts from an official Node.js image.

It already includes:

- Linux Alpine
- Node.js 22
- npm

`alpine` is a lightweight Linux distribution.

---

### Working directory

```dockerfile
WORKDIR /app
```

All following commands run inside `/app`.

---

### Copy package files first

```dockerfile
COPY app/package*.json ./
```

This copies `package.json` and `package-lock.json` into the image before the source code to improve Docker cache usage.

If source code changes but dependencies do not, Docker can reuse the `npm ci` layer.

---

### Install production dependencies

```dockerfile
RUN npm ci --omit=dev
```

`npm ci` installs exactly what is locked in `package-lock.json`.

`--omit=dev` skips development dependencies such as Jest, ESLint, Nodemon and Supertest.

This makes the production image smaller and cleaner.

---

### Copy source files

```dockerfile
COPY app/src ./src
COPY app/public ./public
COPY app/views ./views
```

The image receives only the files needed to run the app:

```text
src/     → Express server
public/  → CSS, browser JS, images
views/   → EJS templates
```

---

### Environment variables

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

The app reads:

```js
const PORT = process.env.PORT || 3000;
```

---

### Expose port

```dockerfile
EXPOSE 3000
```

This documents that the container listens on port 3000.

It does not publish the port by itself.

---

### Start command

```dockerfile
CMD ["npm", "start"]
```

When a container starts, Docker runs `npm start`, which runs `node src/server.js`.

---

## Build the app image

From the repository root:

```bash
docker build -t pokedex-ci-cd-lab:local .
```

---

## Run the app image locally

```bash
docker run --rm -p 3000:3000 pokedex-ci-cd-lab:local
```

Meaning:

```text
host port 3000
→ container port 3000
```

Then test:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","service":"pokedex-ci-cd-lab"}
```

---

## `.dockerignore`

The `.dockerignore` prevents unnecessary files from being sent to Docker during build.

Example:

```dockerignore
.git
node_modules
app/node_modules
docs
terraform
ansible
npm-debug.log
.DS_Store
.env
*.tfstate
*.tfstate.*
```

Important distinction:

| File | Purpose |
|---|---|
| `.dockerignore` | excludes files from Docker build context |
| `.gitignore` | excludes files from Git commits |

It is valid to exclude `terraform/` from Docker because the app image does not need Terraform.

It is not valid to exclude all Terraform files from Git.

---

## Image vs container

```text
Image
→ immutable template

Container
→ running instance of an image
```

Example:

```bash
docker build -t pokedex-ci-cd-lab:local .
```

creates an image.

```bash
docker run pokedex-ci-cd-lab:local
```

creates a running container from that image.

---

## Application deployment on EC2

Ansible builds the application image on the EC2 instance:

```bash
docker build -t pokedex-ci-cd-lab:latest .
```

Then runs it inside a Docker network:

```bash
docker run -d \
  --name pokedex-ci-cd-lab \
  --network pokedex-network \
  --restart unless-stopped \
  pokedex-ci-cd-lab:latest
```

The app container does not expose port 3000 publicly.

Caddy connects to it through the internal Docker network.

---

## Why not expose Node directly?

Before Caddy:

```text
Internet → EC2 port 80 → Node container
```

With Caddy:

```text
Internet → Caddy port 80/443 → Node container on Docker network
```

This is cleaner because only the reverse proxy is public.

---

## Ansible tooling image

Location:

```text
tools/ansible/Dockerfile
```

Purpose:

```text
Provide a stable Linux-based Ansible control node.
```

This avoids local macOS/Python compatibility issues.

---

## Ansible tooling image contents

It includes:

- Python 3.13
- Ansible Core
- boto3
- botocore
- amazon.aws collection
- AWS CLI v2
- AWS Session Manager Plugin

These are required to connect to EC2 through SSM without SSH.

---

## Why `--platform linux/amd64`?

The AWS Session Manager Plugin `.deb` used here is for `amd64`.

On Apple Silicon Macs, Docker defaults to ARM64.

Without forcing the platform, installation failed with architecture dependency issues.

Build command:

```bash
docker build \
  --platform linux/amd64 \
  -t pokedex-ansible:local \
  -f tools/ansible/Dockerfile .
```

---

## Run Ansible from Docker

Example:

```bash
docker run --rm \
  --platform linux/amd64 \
  -v ~/.aws:/root/.aws:ro \
  -v "$PWD":/workspace \
  -w /workspace/ansible \
  -e AWS_PROFILE=poke-website \
  -e ANSIBLE_SSM_BUCKET=<bucket-name> \
  pokedex-ansible:local \
  ansible-inventory --graph
```

Important mounts:

| Mount | Purpose |
|---|---|
| `~/.aws:/root/.aws:ro` | gives the container read-only AWS credentials |
| `$PWD:/workspace` | gives the container access to the project |
| `-w /workspace/ansible` | runs Ansible from the correct directory |

---

## Main lessons

Docker is used for two different layers:

```text
App Docker image
→ portable runtime for Node.js app

Ansible Docker image
→ portable deployment environment
```

This makes the project reproducible across machines and avoids local dependency problems.
