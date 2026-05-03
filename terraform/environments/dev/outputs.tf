output "instance_id" {
  description = "EC2 instance ID."
  value       = module.compute.instance_id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = module.compute.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = module.compute.public_dns
}

output "application_url" {
  description = "Public HTTP URL of the application."
  value       = "http://${module.compute.elastic_ip}"
}

output "ansible_transfer_bucket_name" {
  description = "Private S3 bucket used by Ansible SSM connection for temporary file transfers."
  value       = module.artifact.bucket_name
}

output "elastic_ip" {
  description = "Elastic IP associated with the application."
  value       = module.compute.elastic_ip
}