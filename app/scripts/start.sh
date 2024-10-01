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

# Check if logged in
echo -e "${GREEN}Checking if logged in...${NC}"
aws sts get-caller-identity &> /dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}Not logged in.${NC} Logging in..."
    aws sso login
    echo -e "${GREEN}Logged in.${NC}"
else
    echo -e "${GREEN}Logged in.${NC}"
fi

# Check if Docker is running
echo -e "${GREEN}Checking if Docker is installed...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed.${NC} Please install Docker."
    exit 1
fi

echo -e "${GREEN}Checking if Docker is running...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}Docker is not running. Attempting to start Docker...${NC}"
    if ! sudo systemctl start docker; then
        echo -e "${RED}Failed to start Docker.${NC} Please start Docker manually."
        exit 1
    else
        echo -e "${GREEN}Docker has been started.${NC}"
    fi
else
    echo -e "${GREEN}Docker is running.${NC}"
fi

echo -e "${GREEN}Creating Docker containers...${NC}"
pnpm docker:up
echo -e "${GREEN}Docker containers created.${NC}"

echo -e "${GREEN}Starting development environment...${NC}"
pnpm start:dev