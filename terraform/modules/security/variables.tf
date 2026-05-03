variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the security group is created."
  type        = string
}

variable "ansible_transfer_bucket_name" {
  description = "S3 bucket name used by Ansible SSM connection for temporary file transfers."
  type        = string
}