#!/bin/bash

#####################################################################
# Script to establish AWS SSO session and run development environment
#
# Usage: ./dev.sh [profile_name]
#
#   1. Set AWS SSO profile (default or provided)
#   2. Sign out if currently signed in
#   3. Sign in to AWS SSO
#   4. Check Docker status
#   5. Create Docker containers
#   6. Start development environment
#
# Note: This script assumes that you have already configured your
# AWS SSO profile and have the necessary permissions to run the
# development environment.
#####################################################################

# Regular Colors
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

# Set AWS SSO profile based on the first argument or default to "magiscribe-dev"
export AWS_PROFILE=${1:-"magiscribe-dev"}

# Function to sign out
sign_out() {
    echo -e "${YELLOW}Signing out of current session...${NC}"
    aws sso logout
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully signed out.${NC}"
    else
        echo -e "${RED}Failed to sign out. Continuing anyway...${NC}"
    fi
}

# Function to sign in
sign_in() {
    echo -e "${YELLOW}Signing in to AWS SSO...${NC}"
    aws sso login --profile $AWS_PROFILE
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully signed in.${NC}"
    else
        echo -e "${RED}Failed to sign in. Exiting.${NC}"
        exit 1
    fi
}

# Main execution starts here
echo -e "${GREEN}Starting AWS SSO session management...${NC}"

# Always sign out first
sign_out

# Then sign in
sign_in

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
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker containers created successfully.${NC}"
else
    echo -e "${RED}Failed to create Docker containers. Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}Starting development environment...${NC}"
pnpm start:dev