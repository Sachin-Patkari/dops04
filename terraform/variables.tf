variable "resource_group" {
  type        = string
  default     = "devops-rg"
}

variable "location" {
  type        = string
  default     = "centralindia"
}

variable "vm_name" {
  type        = string
  default     = "devops-vm"
}

variable "vm_username" {
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  type        = string
  default     = ""
}

variable "vm_size" {
  type        = string
  default     = "Standard_B1s"
}

# ACR name variable (static by default, Terraform will override)
variable "acr_name" {
  type        = string
  default     = "devopsacr"
}
