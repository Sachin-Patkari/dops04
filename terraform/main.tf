########################################################
# random suffix used to help make acr name unique
########################################################
resource "random_string" "suffix" {
  length  = 4
  upper   = false
  numeric = true
  special = false
}

########################################################
# Resource Group
# - IMPORTANT: if this RG already exists, import it (commands below)
########################################################
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group
  location = var.location
}

########################################################
# Virtual Network + Subnet + NSG
########################################################
resource "azurerm_virtual_network" "vnet" {
  name                = "${var.resource_group}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "${var.resource_group}-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_network_security_group" "nsg" {
  name                = "${var.resource_group}-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "Allow-HTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-SSH"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-Prom"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "9090"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "assoc" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

########################################################
# Public IP (with DNS FQDN)
########################################################
resource "azurerm_public_ip" "pip" {
  name                = "${var.resource_group}-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Basic"

  domain_name_label = "${var.resource_group}-app"
}

########################################################
# NIC
########################################################
resource "azurerm_network_interface" "nic" {
  name                = "${var.resource_group}-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}

########################################################
# Linux VM (small)
########################################################
resource "azurerm_linux_virtual_machine" "vm" {
  name                = var.vm_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  size                = var.vm_size
  admin_username      = var.vm_username
  network_interface_ids = [azurerm_network_interface.nic.id]

  admin_ssh_key {
    username   = var.vm_username
    public_key = var.ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # -------------------- AUTOMATION SCRIPT --------------------
  custom_data = base64encode(<<EOF
#!/bin/bash

# Update & Install Docker
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release
apt-get install -y docker.io

# Enable Docker
systemctl start docker
systemctl enable docker

# Login not required for DockerHub public repo
# Pull Docker image
docker pull YOUR_DOCKERHUB_USERNAME/YOUR_IMAGE_NAME:latest

# Stop previous container if running
docker stop app || true
docker rm app || true

# Run container
docker run -d --name app -p 80:80 YOUR_DOCKERHUB_USERNAME/YOUR_IMAGE_NAME:latest

EOF
  )
  # -----------------------------------------------------------

  tags = {
    environment = "devops-auto"
  }
}

########################################################
# Azure Container Registry
# - If this ACR already exists in the resource group, you must import it OR delete it before apply.
########################################################
resource "azurerm_container_registry" "acr" {
  name                = "${var.acr_name}${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}
