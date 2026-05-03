# 06 — Troubleshooting Log

## Purpose

This document records the main issues encountered during the project and how they were fixed.

This is one of the most important files for learning because real DevOps work is often about diagnosing failures across layers.

---

## 1. Broken Pokémon type filtering

### Symptom

The page by type displayed all Pokémon instead of only the selected type.

### Diagnosis

Backend test with curl:

```bash
curl "http://localhost:3000/api/pokemon/type/fire?limit=5&offset=0"
```

returned only Fire Pokémon.

But the browser was calling:

```text
/api/pokemon?limit=48&offset=0
```

### Cause

The wrong frontend script was loaded.

`pokedex.ejs` was loading `all.js` instead of `pokedex.js`.

### Fix

Use:

```html
<script src="/js/pokedex.js"></script>
```

on the type page.

### Lesson

If backend output is correct but the browser shows wrong data, inspect:

```text
DevTools → Network → Fetch/XHR
```

---

## 2. `Cannot set properties of null`

### Symptom

Browser console:

```text
TypeError: Cannot set properties of null (setting 'textContent')
```

### Cause

`pokedex.js` expected:

```html
<h1 id="page-title">Pokédex</h1>
```

But the EJS view had:

```html
<h1>Pokédex</h1>
```

### Fix

Add the expected ID:

```html
<h1 id="page-title">Pokédex</h1>
```

### Lesson

Frontend JavaScript and HTML have a contract.

---

## 3. ESLint errors after moving functions to `utils.js`

### Symptom

ESLint reported:

```text
formatPokemonName is not defined
extractPokemonId is not defined
createSpritePlaceholder is not defined
```

### Cause

Browser scripts were relying on functions from another script file.

The browser may load them correctly, but ESLint analyzes files individually.

### Fix

Expose utilities explicitly:

```js
window.pokedexUtils = {
    formatPokemonName,
    extractPokemonId,
    createSpritePlaceholder,
};
```

Then import from `window`:

```js
const { formatPokemonName } = window.pokedexUtils;
```

---

## 4. Duplicate `formatPokemonName`

### Symptom

Pokémon detail page or back button behavior broke after the utils refactor.

### Cause

`pokemon.js` both imported and redefined `formatPokemonName`.

### Fix

Remove the duplicate local function.

---

## 5. `npm start` seemed to keep running in background

### Symptom

Running `npm start` seemed to leave the server running.

### Cause

Another terminal already had `npm run dev` running through Nodemon.

### Diagnostic command

```bash
lsof -i :3000
```

---

## 6. Terraform failed: no default VPC

### Symptom

```text
Error: no matching EC2 VPC found
```

### Cause

The AWS account/region had no default VPC.

### Fix

Create a dedicated network module with VPC, subnet, internet gateway, route table and route table association.

---

## 7. Terraform failed: S3 CreateBucket AccessDenied

### Symptom

```text
AccessDenied: not authorized to perform: s3:CreateBucket
```

### Cause

The new IAM user `poke-website` did not have S3 permissions.

### Fix

Temporarily add S3 permissions to the lab IAM group.

Later improvement: replace broad permissions with least-privilege custom policy.

---

## 8. Terraform failed: DNS lookup AWS endpoints

### Symptom

```text
lookup ec2.eu-west-3.amazonaws.com: no such host
lookup iam.amazonaws.com: no such host
```

### Cause

Local DNS/network issue on the Mac.

### Fix

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## 9. Ansible inventory file parsed incorrectly

### Symptom

```text
Plugin configuration YAML file, not YAML inventory
Invalid host pattern 'plugin:'
```

### Cause

The dynamic inventory file was named `aws_ssm.yml`.

### Fix

Rename to:

```text
aws_ec2.aws_ec2.yml
```

---

## 10. Ansible tried SSH instead of SSM

### Symptom

```text
Failed to connect to the host via ssh:
Could not resolve hostname i-...
```

### Cause

The inventory did not correctly apply the SSM connection variables.

### Fix

Use quoted expressions in `compose`:

```yaml
compose:
  ansible_connection: "'amazon.aws.aws_ssm'"
  ansible_aws_ssm_region: "'eu-west-3'"
  ansible_aws_ssm_profile: "'poke-website'"
```

---

## 11. Local Ansible crashed on macOS

### Symptom

```text
Python quit unexpectedly
A worker was found in a dead state
```

### Cause

Local macOS/Python/Ansible/plugin combination crashed with the SSM connection plugin.

### Final fix

Use a Dockerized Ansible control node.

---

## 12. Ansible SSM failed with `NoneType`

### Symptom

```text
expected string or bytes-like object, got 'NoneType'
```

### Cause

The SSM connection plugin needed a real S3 bucket for transfers.

### Fix

Add a Terraform-managed private S3 transfer bucket and pass its name to Ansible.

---

## 13. Ansible SSM failed with `HeadBucket 404`

### Symptom

```text
An error occurred (404) when calling the HeadBucket operation: Not Found
```

### Cause

Terraform destroy/apply recreated the transfer bucket with a new random suffix.

Ansible inventory still pointed to the old bucket.

### Fix

Do not hardcode the bucket name.

Inject it dynamically from Terraform output through the Makefile.

---

## 14. Makefile injected Terraform warning into Docker command

### Symptom

```text
ANSIBLE_SSM_BUCKET=╷ │ Warning: No outputs found ...
docker: invalid reference format
```

### Cause

Makefile variables were evaluated too early.

### Fix

Compute outputs inside each target and validate them before running Docker.

---

## 15. Ansible copied too much data

### Symptom

The copy task took very long.

### Cause

The playbook copied the entire repo, including:

```text
app/node_modules
terraform/environments/dev/.terraform
```

Observed sizes:

```text
app/node_modules                       63M
terraform/environments/dev/.terraform  784M
```

### Fix

Create a clean local deployment bundle containing only the app runtime files.

---

## 16. `copy` module does not support `exclude`

### Symptom

```text
Unsupported parameters for copy module: exclude
```

### Fix

Prepare a clean local bundle instead of trying to exclude files during copy.

---

## 17. Caddy install failed on Amazon Linux 2023

### Symptom

```text
Repository 'amazonlinux-2023-x86_64' does not exist in project '@caddy/caddy'
```

### Fix

Run Caddy as a Docker container instead of installing it via DNF.

---

## 18. HTTPS returned 502

### Symptom

```text
HTTP/2 502
server: Caddy
```

### Cause

Caddy was reachable and HTTPS worked, but Caddy could not reach the Node app.

### Fix

Create a Docker network and use:

```text
reverse_proxy pokedex-devops-deployment-lab:3000
```

---

## 19. Empty `public_ip` and `public_dns` after Elastic IP

### Symptom

Terraform outputs:

```text
public_ip = ""
public_dns = ""
```

### Cause

The EC2 instance was configured with `associate_public_ip_address = false` because the Elastic IP provides public reachability.

### Fix

Use:

```text
elastic_ip
application_url
```

instead.

---

## Main troubleshooting method

```text
1. Identify which layer is failing
2. Validate with a direct command
3. Isolate the failing component
4. Fix the smallest possible scope
5. Retest
```

Layers:

```text
Browser
Frontend JS
Express backend
Docker
Terraform
AWS IAM
AWS networking
SSM
Ansible
Caddy
DNS
HTTPS
```
