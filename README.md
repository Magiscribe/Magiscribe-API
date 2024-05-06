# ![GraphQL API](docs/banner.png) <!-- omit in toc -->

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Dependabot](https://img.shields.io/badge/dependabot-025E8C?style=for-the-badge&logo=dependabot&logoColor=white)

---

# Table of Contents <!-- omit in toc -->

- [Overview](#overview)
  - [Architecture](#architecture)
- [Zero to Hero](#zero-to-hero)
    - [Pre-requisites](#pre-requisites)
    - [General Setup](#general-setup)
    - [Infrastructure Setup](#infrastructure-setup)
    - [API Local Development Setup](#api-local-development-setup)
      - [Docker Compose](#docker-compose)

# Overview

This repository contains a Node.js application that uses Expresses and Apollo Server to create a GraphQL API.

## Architecture

![Architecture](docs/architecture.svg)

# Zero to Hero

### Pre-requisites

- [ ] [Node.js](https://nodejs.org/en) (version 22.x or later)
- [ ] [AWS CLI](https://aws.amazon.com/cli)
- [ ] [Terraform CDKTF](https://learn.hashicorp.com/tutorials/terraform/cdktf-install)
- [ ] [Docker](https://www.docker.com/get-started)

### General Setup

1. Configure AWS CLI. You can do this with `aws configure`. If the environment you working with is managed by AWS SSO, you can run `aws configure sso`. For more on this see [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html).

2. Enable `corepack` for `pnpm` to install the dependencies. You can do this by running the following command:

```bash
corepack enable pnpm
```

3. Download the repository

```bash
git clone git@github.com:AI-Whiteboard/PoC-Apollo-GraphQL-API.git
```

4. Run the setup script. This will check for all required dependencies and the install Node dependencies.

```bash
sh setup.sh
```

### Infrastructure Setup

1. Check into `/infrastructure` directory

```bash
cd infrastructure
```

2. Install the dependencies

```bash
pnpm install
```

3. Deploy the networking layer. Note, the first time you run this, it will create a new Hosted Zone in Route 53. You will need to point your domain registrar to the name servers provided by Route 53 so that it can manage the DNS records and auto-verify the SSL certificates created by this project.

```bash
pnpm deploy:networking
```

4. Deploy the App layer

```bash
pnpm deploy:apps
```

5. Deploy the client layer

```bash
pnpm deploy:client
```

### API Local Development Setup

1. Check into `/api` directory

```bash
cd api
```

2. Install the dependencies

```bash
pnpm install
```

3. Start the application in development mode

```bash
pnpm dev
```

#### Docker Compose

To run the application using Docker Compose, you can run the following command:

```bash
docker-compose up
```
