# 23 — Interview Goals

**Document status:** Complete  
**Last updated:** June 2026

---

## Purpose of this document

DevOps Forge is built to produce real capability — not just familiarity with tools. This document defines what a learner should be able to demonstrate in a job interview after completing the full curriculum. It serves two purposes:

1. **Curriculum validation** — if the curriculum cannot produce these outcomes, it is not complete
2. **Learner orientation** — a learner reading this document understands what they are working toward

---

## The target outcome

A learner who completes the full DevOps Forge curriculum — all seven modules, all challenges, all documentation — should be able to interview confidently for an entry-level or junior DevOps engineer role. Specifically, they should be able to:

- Demonstrate hands-on experience with each technology (not just book knowledge)
- Explain the reasoning behind common DevOps practices (not just the commands)
- Troubleshoot problems in each area (not just reproduce happy-path examples)
- Connect the technologies to each other (how Docker relates to Kubernetes, how Terraform relates to AWS)

---

## By module

### Docker

**Can demonstrate:**
- Running containers from existing images
- Building custom images from a Dockerfile
- Managing container lifecycle (start, stop, inspect, remove)
- Port mapping and volume mounting
- Multi-stage builds for production-ready images
- Pushing images to Docker Hub or a private registry

**Can explain:**
- What a container is and how it differs from a virtual machine
- How image layers work and why they matter for build speed
- When to use volumes vs bind mounts
- How container networking works at a basic level
- The principle of keeping images small and stateless

**Common interview questions they can answer:**
- "Walk me through what happens when you run `docker run nginx`."
- "How would you reduce the size of a Docker image?"
- "What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?"
- "How do containers communicate with each other?"
- "What is the difference between an image and a container?"

---

### Docker Compose

**Can demonstrate:**
- Writing a `docker-compose.yml` for a multi-service application
- Managing services with `up`, `down`, `logs`, `ps`
- Using environment variables from `.env` files
- Defining named volumes for data persistence
- Overriding configuration for different environments

**Can explain:**
- Why `depends_on` is not sufficient for service readiness
- How Compose networking works (service names as hostnames)
- When to use Compose vs a full orchestration system like Kubernetes

**Common interview questions:**
- "How would you set up a local development environment with a web app and a database using Docker Compose?"
- "How do you handle configuration differences between your dev and production environments in Compose?"
- "What does `depends_on` actually guarantee?"

---

### GitHub Actions

**Can demonstrate:**
- Creating a CI workflow that runs tests on push
- Using marketplace actions (`actions/checkout`, `actions/setup-node`)
- Storing and referencing secrets in workflows
- Building and pushing a Docker image in CI
- Setting up job dependencies with `needs`

**Can explain:**
- The difference between events, jobs, and steps
- How runners work and what they provide
- Why CI matters and what problems it prevents
- The difference between CI (testing) and CD (deployment)

**Common interview questions:**
- "Walk me through your CI/CD setup on a recent project."
- "How would you prevent a broken build from reaching production?"
- "How do you store secrets securely in a GitHub Actions workflow?"
- "What is a matrix build and when would you use one?"

---

### GitLab CI

**Can demonstrate:**
- Writing a `.gitlab-ci.yml` with stages and jobs
- Using Docker images as job environments
- Caching dependencies between pipeline runs
- Passing artifacts between jobs

**Can explain:**
- How GitLab CI differs from GitHub Actions architecturally
- What a GitLab Runner is and how it executes jobs
- How to structure a pipeline for a deployment workflow

**Common interview questions:**
- "Have you worked with GitLab CI? How does it compare to GitHub Actions?"
- "How would you cache npm packages between pipeline runs in GitLab CI?"
- "What are pipeline stages used for?"

---

### AWS

**Can demonstrate:**
- Launching and connecting to an EC2 instance
- Creating and configuring S3 buckets
- Writing and applying IAM policies
- Creating a VPC with public and private subnets
- Basic understanding of ECS for container deployment

**Can explain:**
- The AWS shared responsibility model
- The principle of least privilege and why it matters
- The difference between Regions and Availability Zones
- What a Security Group is and how it differs from a NACL
- Why IAM roles are preferred over IAM users for machine access

**Common interview questions:**
- "How would you secure an application running on AWS?"
- "What is the difference between an IAM user and an IAM role?"
- "How would you give an EC2 instance access to an S3 bucket?"
- "What is a VPC and why do you need one?"
- "How do you handle secrets in an AWS environment?"

---

### Terraform

**Can demonstrate:**
- Writing a Terraform configuration that provisions cloud resources
- Using `init`, `plan`, and `apply` correctly
- Using variables and outputs
- Storing state remotely in S3
- Organising configuration into modules

**Can explain:**
- What infrastructure as code is and why it matters
- How Terraform state works and why it is important
- The difference between `terraform plan` and `terraform apply`
- What a Terraform provider is
- The difference between `resource` and `data` blocks

**Common interview questions:**
- "How does Terraform manage state? What happens if two people run `apply` at the same time?"
- "What is the difference between `terraform plan` and `terraform apply`?"
- "How would you structure Terraform code for a team?"
- "What is a Terraform module and when would you create one?"
- "How do you handle secrets in Terraform?"

---

### Kubernetes

**Can demonstrate:**
- Running and inspecting Pods with `kubectl`
- Creating Deployments and scaling them
- Exposing applications with Services
- Using ConfigMaps and Secrets
- Performing a rolling update without downtime

**Can explain:**
- The control plane / worker node architecture
- What a Pod is and why it is the basic unit of scheduling
- The difference between a Pod and a Deployment
- How Kubernetes self-heals (reconciliation loop)
- The difference between ClusterIP, NodePort, and LoadBalancer services
- What a PersistentVolumeClaim is for

**Common interview questions:**
- "What happens when a Pod crashes in Kubernetes?"
- "How do you update an application in Kubernetes without downtime?"
- "What is the difference between a Deployment and a StatefulSet?"
- "How do you pass configuration to a Pod?"
- "How does Kubernetes networking work?"

---

## Cross-cutting skills

Beyond the technology-specific knowledge, a learner completing the curriculum should demonstrate:

**Troubleshooting methodology:**
- Reading and understanding error messages
- Using logs (`docker logs`, `kubectl logs`, CloudWatch)
- Knowing what to check when something does not work (the common failure modes)

**Security mindset:**
- Defaults are not always safe; always ask what the minimum required permissions are
- Secrets do not belong in code, environment files committed to version control, or logs
- The principle of least privilege applies everywhere

**The "why" behind the tools:**
- Containers exist to solve the "works on my machine" problem
- CI/CD exists to catch errors as early as possible
- Infrastructure as code exists to make infrastructure reproducible and reviewable
- Kubernetes exists to manage containerised applications at a scale where manual management is impractical

A learner who can only recite commands without explaining the problems those commands solve is not ready for a DevOps role. The curriculum is designed to produce understanding, not just familiarity.
