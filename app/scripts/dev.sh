#!/bin/bash

# Set AWS SSO profile
export AWS_PROFILE=magiscribe-dev

# Check if logged in
ACCOUNT=$(aws sts get-caller-identity --profile $AWS_PROFILE)

if [ $? -ne 0 ]; then
    echo "Logging in..."
    aws sso login --profile $AWS_PROFILE
fi

# If not logged in, login
if [ $? -ne 0 ]; then
    echo "Logging in..."
    aws sso login --profile $AWS_PROFILE
fi

# Run pnpm dev
pnpm docker:up

pnpm start:dev
