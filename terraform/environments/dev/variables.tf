variable "aws_region" {
  description = "AWS region where resources are created."
  type        = string
  default     = "eu-west-3"
}

variable "aws_profile" {
  description = "Local AWS CLI profile used by Terraform."
  type        = string
  default     = "poke-website"
}

variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
  default     = "pokedex-devops-deployment-lab"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type used for the application host."
  type        = string
  default     = "t3.micro"
}

variable "elastic_ip_allocation_id" {
  description = "Existing Elastic IP allocation ID associated with the application EC2 instance."
  type        = string
}