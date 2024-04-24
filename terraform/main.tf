# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }
}
provider "azurerm" {
  features {}
}

variable "github_auth" {
  type        = string
  description = "Token for authorization"
  # We love security :)
  default     = "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"
}

resource "random_integer" "ri" {
  min = 10000
  max = 99999
}

# Create the resource group
resource "azurerm_resource_group" "rg" {
  name     = "whiteboard-graphql-poc-${random_integer.ri.result}"
  location = "eastus"
}

# Create the Linux App Service Plan
resource "azurerm_service_plan" "appserviceplan" {
  name                = "whiteboard-graphql-poc-asp-${random_integer.ri.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_container_registry" "acr" {
  name                = "whiteboard15612385"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "whiteboard" {
  name                       = "whiteboard-environment"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
}

resource "azurerm_container_app" "whiteboard" {
  name                         = "whiteboard-app"
  container_app_environment_id = azurerm_container_app_environment.whiteboard.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  registry {
    server   = "ghcr.io"
    username = "ai-whiteboard"
    password_secret_name = "clientsecret"
  }

    secret {
    name  = "clientsecret"
    value = "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"
  }

  template {
    container {
      name   = "whiteboardcontainerapp"
      image  = "ghcr.io/ai-whiteboard/poc-apollo-graphql-api:latest"
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}