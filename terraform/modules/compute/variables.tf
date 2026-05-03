variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type used for the application host."
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID where the EC2 instance is created."
  type        = string
}

variable "security_group_id" {
  description = "Security group ID attached to the EC2 instance."
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile name used for SSM access."
  type        = string
}

variable "elastic_ip_allocation_id" {
  description = "Existing Elastic IP allocation ID associated with the EC2 instance."
  type        = string
}