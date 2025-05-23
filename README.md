# ![GraphQL API](./docs/banner.png) <!-- omit in toc -->

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Apollo Server](https://img.shields.io/badge/-Apollo%20Server-311C87?style=for-the-badge&logo=apollo-graphql)
![Fastify](https://img.shields.io/badge/-Fastify-202020?style=for-the-badge&logo=fastify&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

# Table of Contents <!-- omit in toc -->

- [Overview](#overview)
  - [Short Demos](#short-demos)
- [Zero to Hero](#zero-to-hero)
  - [Pre-requisites](#pre-requisites)
  - [General Setup](#general-setup)
  - [API Development Setup](#api-development-setup)
    - [Docker Build and Run](#docker-build-and-run)
- [Technical Documentation](#technical-documentation)
  - [ERD](#erd)

# Overview

This repository contains a Node.js application that uses Expresses and Apollo Server to create a GraphQL API.

## Short Demos

**Agent Lab:**
The following video demonstrates the GraphQL API in action. The API is used to query the database for agents, capabilities, and their related prompts. It allows easy creation of new agents, capabilities, and prompts as well as additional features like per-organization authorization through Clerk.

https://github.com/user-attachments/assets/1dac0771-db65-4cf1-ad5e-aa70c54a8c4e

**Inquiry Builder:**
The following video demonstrates the GraphQL API in action. The API is used to query the database for inquiry graphs. An inquiry graph is a dictated conversation flows that can be used to generate a conversation between an agent and a user. It allows for stakeholders to get a dynamic conversation flow between a user and an agent to probe for information or insights, while ensuring that the agent stays on tasks, asks the right questions in the right order, and does not miss any important information while still allowing the user and conversation to go off script at certain times depending on the graph.

https://github.com/user-attachments/assets/908ae6d8-e7e9-4fb1-8964-90411095353e

# Zero to Hero

### Pre-requisites

- [ ] [Node.js](https://nodejs.org/en) (version 22.x or later)
- [ ] [AWS CLI](https://aws.amazon.com/cli)
- [ ] [Terraform CDKTF](https://learn.hashicorp.com/tutorials/terraform/cdktf-install)
- [ ] [Docker](https://www.docker.com/get-started)
- [ ] [MongoDB](https://www.mongodb.com/products/self-managed/community-edition)

### General Setup

> The following steps are required to setup the project for local development and deployment.

1. Configure AWS CLI. You can do this with `aws configure`. If the environment you working with is managed by AWS SSO, you can run `aws configure sso`. For more on this see [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html).

2. Enable `corepack` for `pnpm` to install the dependencies. You can do this by running the following command:

```bash
corepack enable pnpm
corepack use pnpm@latest
```

3. Download the repository

```bash
git clone git@github.com:Magiscribe/Magiscribe-API.git
```

4. Change directory to the project root

```bash
cd Magiscribe-API
```

5. Run the install script. This will install the dependencies for the API and Infrastructure projects.

```bash
pnpm i
```

### API Development Setup

> The following steps are required for local development of the API.

1. Check into `/app` directory

```bash
cd app
```

2. Copy the `.env.example` file to `.env` and update the values as needed.

```bash
cp .env.example .env
```

2. Install the dependencies

```bash
pnpm install
```

3. Start the Docker container for the database and Python execution environment.

```bash
pnpm docker:up
```

4. Run the seed script to populate the database with sample data.

```bash
pnpm db:import
```

4. Start the application in development mode

```bash
pnpm dev
```

5. Open the browser and navigate to `http://localhost:3000/graphql` to access the GraphQL playground.

- Important Note: To bypass Clerk authentication, you can use the following header in the GraphQL playground:
  ```json
  {
    "Authorization": "Sandbox"
  }
  ```

#### Docker Build and Run

To run the application using Docker, you can run the following command:

```bash
docker build -t graphql-api .
docker run -p 3000:3000 graphql-api -e PORT=3000 -d
```

# Technical Documentation

## ERD

```mermaid
erDiagram
    User {
        string _id
        date createdAt
        date updatedAt
    }

    Inquiry {
        string[] userId
        object data
        ObjectId[] responses
        date createdAt
        date updatedAt
    }

    InquiryResponse {
        string userId
        object data
        ObjectId threadId
        date createdAt
        date updatedAt
    }

    Collection {
        string name
        date createdAt
        date updatedAt
    }

    Prompt {
        string name
        ObjectId logicalCollection
        string text
        date createdAt
        date updatedAt
    }

    Capability {
        string name
        ObjectId logicalCollection
        string alias
        string llmModel
        string description
        ObjectId[] prompts
        string outputMode
        string subscriptionFilter
        string outputFilter
        date createdAt
        date updatedAt
    }

    Agent {
        string name
        ObjectId logicalCollection
        string description
        object reasoning
        ObjectId[] capabilities
        boolean memoryEnabled
        string subscriptionFilter
        string outputFilter
        date createdAt
        date updatedAt
    }

    Asset {
        string[] owners
        string s3Key
        date createdAt
        date updatedAt
    }

    Thread {
        string subscriptionId
        object[] messages
        date createdAt
        date updatedAt
    }

    Audio {
        string text
        string voiceId
        string s3Key
        date expiresAt
        date createdAt
        date updatedAt
    }

    User ||--o{ Inquiry : "creates"
    User ||--o{ InquiryResponse : "has"
    User ||--o{ Asset : "owns"
    User ||--o{ Thread : "participates in"
    User ||--o{ Audio : "creates"
    Inquiry ||--o{ InquiryResponse : "has"
    InquiryResponse ||--|| Thread : "references"
    Collection ||--o{ Prompt : "contains"
    Collection ||--o{ Capability : "contains"
    Collection ||--o{ Agent : "contains"
    Prompt }|--o{ Capability : "used by"
    Capability }|--o{ Agent : "belongs to"
    Agent ||--o{ Thread : "participates in"
    Thread ||--o{ Message : "contains"

```
