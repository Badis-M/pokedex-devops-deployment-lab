variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block used by the project VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block used by the public subnet."
  type        = string
  default     = "10.40.1.0/24"
}