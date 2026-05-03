AWS_PROFILE ?= poke-website
AWS_REGION ?= eu-west-3

APP_DIR := app
TERRAFORM_DIR := terraform/environments/dev

APP_IMAGE ?= pokedex-devops-deployment-lab:local
ANSIBLE_IMAGE ?= pokedex-ansible:local
ANSIBLE_PLATFORM ?= linux/amd64

.PHONY: app-check app-build ansible-build tf-init tf-plan tf-apply tf-output ansible-inventory ansible-ping deploy health tf-destroy check-infra

check-infra:
	@cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output -raw ansible_transfer_bucket_name >/dev/null || \
		( echo "Terraform outputs not found. Run: make tf-apply"; exit 1 )

app-check:
	cd $(APP_DIR) && npm run check

app-build:
	docker build -t $(APP_IMAGE) .

ansible-build:
	docker build --platform $(ANSIBLE_PLATFORM) -t $(ANSIBLE_IMAGE) -f tools/ansible/Dockerfile .

tf-init:
	cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform init

tf-plan:
	cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform plan

tf-apply:
	cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform apply

tf-output:
	cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output

ansible-inventory:
	@ANSIBLE_SSM_BUCKET=$$(cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output -raw ansible_transfer_bucket_name 2>/dev/null); \
	if [ -z "$$ANSIBLE_SSM_BUCKET" ]; then \
		echo "Terraform outputs not found. Run: make tf-apply"; \
		exit 1; \
	fi; \
	docker run --rm \
		--platform $(ANSIBLE_PLATFORM) \
		-v ~/.aws:/root/.aws:ro \
		-v "$$(pwd)":/workspace \
		-w /workspace/ansible \
		-e AWS_PROFILE=$(AWS_PROFILE) \
		-e ANSIBLE_SSM_BUCKET="$$ANSIBLE_SSM_BUCKET" \
		$(ANSIBLE_IMAGE) \
		ansible-inventory --graph

ansible-ping:
	@ANSIBLE_SSM_BUCKET=$$(cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output -raw ansible_transfer_bucket_name 2>/dev/null); \
	if [ -z "$$ANSIBLE_SSM_BUCKET" ]; then \
		echo "Terraform outputs not found. Run: make tf-apply"; \
		exit 1; \
	fi; \
	docker run --rm \
		--platform $(ANSIBLE_PLATFORM) \
		-v ~/.aws:/root/.aws:ro \
		-v "$$(pwd)":/workspace \
		-w /workspace/ansible \
		-e AWS_PROFILE=$(AWS_PROFILE) \
		-e ANSIBLE_SSM_BUCKET="$$ANSIBLE_SSM_BUCKET" \
		$(ANSIBLE_IMAGE) \
		ansible aws_ec2 -m ping -f 1

deploy:
	@ANSIBLE_SSM_BUCKET=$$(cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output -raw ansible_transfer_bucket_name 2>/dev/null); \
	if [ -z "$$ANSIBLE_SSM_BUCKET" ]; then \
		echo "Terraform outputs not found. Run: make tf-apply"; \
		exit 1; \
	fi; \
	docker run --rm \
		--platform $(ANSIBLE_PLATFORM) \
		-v ~/.aws:/root/.aws:ro \
		-v "$$(pwd)":/workspace \
		-w /workspace/ansible \
		-e AWS_PROFILE=$(AWS_PROFILE) \
		-e ANSIBLE_SSM_BUCKET="$$ANSIBLE_SSM_BUCKET" \
		$(ANSIBLE_IMAGE) \
		ansible-playbook playbooks/deploy.yml -f 1

health:
	@APPLICATION_URL=$$(cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform output -raw application_url 2>/dev/null); \
	if [ -z "$$APPLICATION_URL" ]; then \
		echo "Terraform outputs not found. Run: make tf-apply"; \
		exit 1; \
	fi; \
	curl "$$APPLICATION_URL/health"

tf-destroy:
	cd $(TERRAFORM_DIR) && AWS_PROFILE=$(AWS_PROFILE) terraform destroy