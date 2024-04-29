#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Confirm the user wants to run the setup script
read -p "This script will check for required dependencies and install Node modules. Do you want to continue? (y/n) " -n 1 -r
echo

# Check for AWS CLI
echo -e "${GREEN}Checking for AWS CLI...${NC}"
if ! [ -x "$(command -v aws)" ]; then
  echo -e "${RED}Error: AWS CLI is not installed.${NC}" >&2
  echo 'For windows, you can install AWS CLI via Chocolatey: https://chocolatey.org/packages/awscli' >&2
  echo 'For MacOS, you can install AWS CLI via Homebrew: https://formulae.brew.sh/formula/awscli' >&2
  exit 1
fi

# Check for Node
echo -e "${GREEN}Checking for Node...${NC}"
if ! [ -x "$(command -v node)" ]; then
  echo -e "${RED}Error: Node is not installed.${NC}" >&2
  echo 'You can install Node via NVM: https://github.com/nvm-sh/nvm' >&2
  exit 1
fi

# Checking that Node is at least version 20
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION != v20* ]]; then
  echo -e "${RED}Error: Node version is not at least v20.${NC}" >&2
  echo 'Please install Node version 20 or higher using your preferred method.' >&2
  exit 1
fi

# Check for PNPM
echo -e "${GREEN}Checking for PNPM...${NC}"
if ! [ -x "$(command -v pnpm)" ]; then
  echo -e "${RED}Error: PNPM is not enabled.${NC}" >&2
  echo 'Enabling PNPM...'
  read -p "Do you want to enable PNPM? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    corepack enable pnpm
  fi
fi

# Check for CDKTF CLI
if ! [ -x "$(command -v cdktf)" ]; then
  echo -e "${RED}Error: CDKTF is not installed.${NC}" >&2
  echo 'Installing CDKTF...'
  read -p "Do you want to install CDKTF? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    npm install -g cdktf-cli
  fi
fi

# List of directories
directories=("infrastructure" "api")

# Loop over directories
for dir in "${directories[@]}"
do
  # Change to directory
  cd $dir

  # Run pnpm install
  echo -e "${GREEN}Running pnpm install in $dir...${NC}"
  pnpm install
  echo -e "${GREEN}Done!${NC}"

  # Change back to the original directory
  cd -
done