output "instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = aws_instance.app.public_dns
}

output "elastic_ip" {
  description = "Elastic IP associated with the EC2 instance."
  value       = aws_eip_association.app.public_ip
}