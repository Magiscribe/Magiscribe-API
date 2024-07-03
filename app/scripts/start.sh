#!/bin/bash

#####################################################################
# Script to establish AWS SSO session and run development environment
#
# Usage: ./dev.sh
#
#   1. Set AWS SSO profile
#   2. Check if logged in
#   3. If not logged in, login
#   4. Run pnpm dev
#
# Note: This script assumes that you have already configured your
# AWS SSO profile and have the necessary permissions to run the
# development environment.
#####################################################################

# Regular Colors
GREEN="\033[1;32m"           # Green
YELLOW="\033[1;33m"          # Yellow
RED="\033[1;31m"             # Red
NC="\033[0m"                 # No Color

# Set AWS SSO profile based on the first argument
export AWS_PROFILE=${1:-"magiscribe-dev"}

SSO_ACCOUNT_PROFILE=$(aws sts get-caller-identity --query "Account" --profile default)
SSO_ACCOUNT=$(aws sts get-caller-identity --query "Account")

# Check if logged in
echo -e "${GREEN}Checking if logged in...${NC}"
if [ ${#SSO_ACCOUNT_PROFILE} -eq 14 ] || [ ${#SSO_ACCOUNT} -eq 14 ] || aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}Logged in.${NC}"
else
    echo -e "${RED}Not logged in.${NC} Logging in..."
    aws sso login --profile $AWS_PROFILE
    echo -e "${GREEN}Logged in.${NC}"
fi

# Check if Docker is running
echo -e "${GREEN}Checking if Docker is running...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running.${NC} Please start Docker."
    exit 1
else
    echo -e "${GREEN}Docker is running.${NC}"
fi

echo -e "${GREEN}Creating Docker containers...${NC}"
pnpm docker:up
echo -e "${GREEN}Docker containers created.${NC}"

echo -e "${GREEN}Starting development environment...${NC}"
pnpm start:dev