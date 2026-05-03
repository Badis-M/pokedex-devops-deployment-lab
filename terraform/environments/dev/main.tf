module "network" {
  source = "../../modules/network"

  project_name = var.project_name
  environment  = var.environment
}

module "security" {
  source = "../../modules/security"

  project_name                 = var.project_name
  environment                  = var.environment
  vpc_id                       = module.network.vpc_id
  ansible_transfer_bucket_name = module.artifact.bucket_name
}

module "compute" {
  source = "../../modules/compute"

  project_name             = var.project_name
  environment              = var.environment
  instance_type            = var.instance_type
  subnet_id                = module.network.public_subnet_id
  security_group_id        = module.security.app_security_group_id
  instance_profile_name    = module.security.instance_profile_name
  elastic_ip_allocation_id = var.elastic_ip_allocation_id
}

module "artifact" {
  source       = "../../modules/artifact"
  project_name = var.project_name
  environment  = var.environment
}