# 08 — DevOps Curriculum

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document describes the full planned curriculum for DevOps Forge: the seven learning modules, their sequencing, the concepts each module covers, and the challenge plan for each. It is the authoritative reference for what the platform teaches and in what order.

The curriculum is designed for a learner who starts with zero knowledge of infrastructure and finishes with the ability to work on a real DevOps team. Every module builds on the ones before it. The sequencing is not arbitrary — it reflects the order in which concepts genuinely depend on each other.

---

## Sequencing rationale

```
Docker
  ↓  (containers are the building block of everything else)
Docker Compose
  ↓  (multi-container apps before automated pipelines)
GitHub Actions
  ↓  (CI/CD using the most common platform)
GitLab CI
  ↓  (alternative CI/CD — same concepts, different syntax)
AWS
  ↓  (cloud infrastructure to deploy to)
Terraform
  ↓  (infrastructure as code to manage that cloud infrastructure)
Kubernetes
      (orchestration of containerised applications at scale)
```

A learner who skips Docker and goes straight to Kubernetes will be confused about what a Pod is. A learner who skips AWS and goes straight to Terraform will not understand what they are provisioning. The unlock system enforces this order.

---

## Module 1 — Docker

**Category:** Containers  
**Estimated hours:** 8  
**Unlock state:** Unlocked by default  
**Prerequisites:** None

### What this module teaches

Docker is the entry point into modern DevOps. Before anything else — pipelines, cloud infrastructure, Kubernetes — a learner needs to understand what a container is, why it exists, and how to work with one. Docker is the most widely used container runtime and the clearest way to learn these concepts.

By the end of this module, a learner should be able to:
- Explain what a container is and how it differs from a virtual machine
- Pull and run images from Docker Hub
- Start, stop, and inspect running containers
- Map ports between a container and the host
- Write a Dockerfile and build a custom image
- Understand image layers and the build cache
- Pass environment variables into containers
- Mount volumes to persist data across container restarts
- Understand the Docker networking basics

### Planned challenges (10–12 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Your First Container | Beginner | 50 |
| 2 | Run a Web Server in a Container | Beginner | 75 |
| 3 | Build Your First Docker Image | Intermediate | 100 |
| 4 | Pass Environment Variables to a Container | Beginner | 50 |
| 5 | Persist Data with Docker Volumes | Intermediate | 100 |
| 6 | Connect Two Containers with a Network | Intermediate | 100 |
| 7 | Inspect and Debug a Running Container | Beginner | 75 |
| 8 | Tag and Push an Image to Docker Hub | Intermediate | 100 |
| 9 | Use a Multi-Stage Build | Advanced | 125 |
| 10 | Reduce Image Size | Advanced | 125 |

*Challenges 1–3 are seeded. Challenges 4–10 are planned.*

---

## Module 2 — Docker Compose

**Category:** Containers  
**Estimated hours:** 6  
**Unlock state:** Unlocked by default  
**Prerequisites:** Docker fundamentals

### What this module teaches

Real applications are not single containers. A web application typically needs a database, a cache, and sometimes a background worker running alongside it. Docker Compose lets you define and manage these multi-container applications declaratively in a single YAML file.

By the end of this module, a learner should be able to:
- Write a `docker-compose.yml` that defines multiple services
- Use `docker compose up`, `down`, `logs`, and `ps`
- Configure environment variables with `.env` files
- Persist database data with named volumes
- Control service startup order with `depends_on`
- Define service-to-service networking
- Override compose configuration for different environments (dev vs production)

### Planned challenges (8–10 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Define a Multi-Service Application | Beginner | 75 |
| 2 | Environment Variables and Secrets | Intermediate | 100 |
| 3 | Add a Redis Cache to Your Stack | Intermediate | 100 |
| 4 | Override Configuration with Compose Files | Intermediate | 100 |
| 5 | Health Checks for Service Readiness | Advanced | 125 |
| 6 | Build and Push a Compose Application | Advanced | 125 |

*Challenges 1–2 are seeded. Challenges 3–6 are planned.*

---

## Module 3 — GitHub Actions

**Category:** CI/CD  
**Estimated hours:** 10  
**Unlock state:** Locked (unlocks after Docker Compose)  
**Prerequisites:** Docker, Docker Compose

### What this module teaches

CI/CD (Continuous Integration / Continuous Delivery) is the practice of automatically testing and deploying code every time a change is pushed. GitHub Actions is the most widely used CI/CD platform among open source and small-to-medium teams, and it integrates directly into the repository.

By the end of this module, a learner should be able to:
- Understand what CI/CD is and why it exists
- Write a workflow YAML file that triggers on push
- Define jobs and steps
- Use marketplace actions (checkout, setup-node, etc.)
- Run tests automatically in a workflow
- Build and push a Docker image in a workflow
- Set up secrets in GitHub for use in workflows
- Create separate workflows for CI (test) and CD (deploy)
- Debug failing workflow runs in the GitHub Actions UI

### Planned challenges (10–12 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Your First GitHub Actions Workflow | Beginner | 75 |
| 2 | Run Tests Automatically on Push | Beginner | 75 |
| 3 | Set Up Secrets for a Workflow | Intermediate | 100 |
| 4 | Build and Push a Docker Image in CI | Intermediate | 100 |
| 5 | Deploy to a Server on Merge to Main | Advanced | 150 |
| 6 | Matrix Builds — Test on Multiple Node Versions | Advanced | 125 |
| 7 | Reusable Workflows | Advanced | 125 |

*Challenge 1 is seeded. Challenges 2–7 are planned.*

---

## Module 4 — GitLab CI

**Category:** CI/CD  
**Estimated hours:** 8  
**Unlock state:** Locked (unlocks after GitHub Actions)  
**Prerequisites:** GitHub Actions fundamentals

### What this module teaches

GitLab CI is the built-in CI/CD system for GitLab repositories. While GitHub Actions uses a marketplace of community actions, GitLab CI uses a more self-contained model with runners and Docker executor patterns. Many enterprise teams use GitLab CI exclusively.

By the end of this module, a learner should be able to:
- Write a `.gitlab-ci.yml` with stages and jobs
- Understand the relationship between runners and jobs
- Use Docker images as job environments
- Cache dependencies between pipeline runs
- Define artifacts that pass between jobs
- Set up environment-specific deployment stages
- Use variables and protected variables
- Debug failing pipelines in the GitLab UI

### Planned challenges (8–10 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Create a Basic GitLab Pipeline | Beginner | 75 |
| 2 | Run Tests with a Specific Docker Image | Beginner | 75 |
| 3 | Cache Node Modules Between Runs | Intermediate | 100 |
| 4 | Pass Artifacts Between Jobs | Intermediate | 100 |
| 5 | Deploy to a Staging Environment | Advanced | 150 |

*Challenge 1 is seeded. Challenges 2–5 are planned.*

---

## Module 5 — AWS

**Category:** Cloud  
**Estimated hours:** 16  
**Unlock state:** Locked (unlocks after GitLab CI)  
**Prerequisites:** Understanding of CI/CD and containers

### What this module teaches

Amazon Web Services is the dominant cloud platform. Understanding AWS is a requirement for nearly every DevOps role. This module focuses on the core services used in real production environments rather than attempting to cover all 200+ AWS services.

By the end of this module, a learner should be able to:
- Navigate the AWS Console confidently
- Understand Regions, Availability Zones, and the global infrastructure model
- Launch and connect to EC2 instances
- Configure Security Groups as firewalls
- Create and manage S3 buckets
- Understand IAM users, roles, and policies
- Apply the principle of least privilege
- Create a VPC with public and private subnets
- Deploy a containerised application using ECS or EC2
- Understand the basics of RDS (managed databases)

### Planned challenges (12–15 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Launch Your First EC2 Instance | Beginner | 100 |
| 2 | Connect to an EC2 Instance via SSH | Beginner | 75 |
| 3 | Create an S3 Bucket and Upload a File | Beginner | 75 |
| 4 | Configure a Security Group | Intermediate | 100 |
| 5 | Create an IAM User with Least-Privilege Access | Intermediate | 100 |
| 6 | Create a VPC with Public and Private Subnets | Advanced | 150 |
| 7 | Deploy a Container to ECS | Advanced | 150 |
| 8 | Set Up an RDS Database | Advanced | 150 |

*Challenge 1 is seeded. Challenges 2–8 are planned.*

---

## Module 6 — Terraform

**Category:** Infrastructure  
**Estimated hours:** 12  
**Unlock state:** Locked (unlocks after AWS)  
**Prerequisites:** AWS fundamentals

### What this module teaches

Terraform is the most widely used infrastructure-as-code tool. Once a learner understands what they are trying to create in AWS (or any cloud), Terraform gives them a way to define and manage it through code — making infrastructure reproducible, version-controlled, and reviewable.

By the end of this module, a learner should be able to:
- Understand the IaC principle and why it matters
- Write Terraform configuration in HCL
- Use `terraform init`, `plan`, `apply`, and `destroy`
- Manage state files (local and remote)
- Use variables and outputs
- Reference existing resources with data sources
- Organise configuration into modules
- Provision a complete AWS environment (VPC, EC2, S3) with Terraform

### Planned challenges (10–12 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Write Your First Terraform Configuration | Beginner | 100 |
| 2 | Use Variables to Make Config Reusable | Beginner | 75 |
| 3 | Store Terraform State in S3 | Intermediate | 100 |
| 4 | Provision an EC2 Instance | Intermediate | 100 |
| 5 | Create a VPC with Terraform | Advanced | 150 |
| 6 | Build a Reusable Terraform Module | Advanced | 150 |

*Challenge 1 is seeded. Challenges 2–6 are planned.*

---

## Module 7 — Kubernetes

**Category:** Orchestration  
**Estimated hours:** 20  
**Unlock state:** Locked (unlocks after Terraform)  
**Prerequisites:** Docker, Docker Compose, AWS, Terraform

### What this module teaches

Kubernetes is the industry-standard platform for running containerised applications at scale. It handles scheduling, self-healing, scaling, and networking of containers across a cluster of machines. It is the most complex module — deliberately placed last because it requires solid container knowledge and an understanding of cloud infrastructure.

By the end of this module, a learner should be able to:
- Explain the Kubernetes control plane and worker node architecture
- Work with `kubectl` to inspect and manage cluster resources
- Create and manage Pods, Deployments, and ReplicaSets
- Expose applications with Services (ClusterIP, NodePort, LoadBalancer)
- Manage configuration with ConfigMaps and Secrets
- Use PersistentVolumes and PersistentVolumeClaims for storage
- Scale a Deployment up and down
- Perform a rolling update with zero downtime
- Understand Namespaces and resource organisation
- Write production-quality Kubernetes manifests

### Planned challenges (15+ total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Run Your First Pod | Beginner | 100 |
| 2 | Create a Deployment | Beginner | 100 |
| 3 | Expose a Deployment with a Service | Beginner | 100 |
| 4 | Scale a Deployment | Beginner | 75 |
| 5 | Use a ConfigMap for Configuration | Intermediate | 100 |
| 6 | Use a Secret for Sensitive Values | Intermediate | 100 |
| 7 | Perform a Rolling Update | Intermediate | 125 |
| 8 | Persist Data with a PersistentVolumeClaim | Intermediate | 125 |
| 9 | Set Resource Requests and Limits | Advanced | 125 |
| 10 | Deploy with Helm | Advanced | 150 |
| 11 | Set Up Horizontal Pod Autoscaling | Advanced | 150 |

*Challenge 1 is seeded. Challenges 2–11 are planned.*

---

## Curriculum summary

| Module | Challenges Seeded | Challenges Planned | Total XP (at full plan) |
|--------|------------------|--------------------|-------------------------|
| Docker | 3 | 7–9 more | ~1,075 |
| Docker Compose | 2 | 4–6 more | ~650 |
| GitHub Actions | 1 | 6 more | ~825 |
| GitLab CI | 1 | 4 more | ~600 |
| AWS | 1 | 7 more | ~1,075 |
| Terraform | 1 | 5 more | ~750 |
| Kubernetes | 1 | 10 more | ~1,450 |
| **Total** | **10** | **~43 more** | **~6,425** |

A learner who completes the full curriculum would accumulate approximately 6,400 XP — well above the 5,500 XP threshold for the Master level.
