terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "azurerm" {
  features {}

  # explicit subscription to avoid "could not determine subscription" errors
  subscription_id = "63671924-dfab-4bf3-8e02-69bcf92be433"
}
