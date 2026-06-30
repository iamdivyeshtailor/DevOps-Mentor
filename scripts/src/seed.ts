import { db, pool } from "@workspace/db";
import {
  modulesTable,
  challengesTable,
  challengeHintsTable,
  docTopicsTable,
  progressTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HintData {
  hint: string;
}

interface ChallengeData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  content: string;
  tags: string[];
  hints: HintData[];
}

interface DocTopicData {
  title: string;
  summary: string;
  content: string;
  readingMinutes: number;
  tags: string[];
}

interface ModuleData {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: "containers" | "ci_cd" | "cloud" | "infrastructure" | "orchestration";
  estimatedHours: number;
  isUnlocked: boolean;
  sortOrder: number;
  challenges: ChallengeData[];
  docTopics: DocTopicData[];
}

// ─── Clear ────────────────────────────────────────────────────────────────────

async function clearAll() {
  await db.execute(
    sql`TRUNCATE TABLE progress, challenge_hints, challenges, doc_topics, modules RESTART IDENTITY CASCADE`
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

const MODULES: ModuleData[] = [
  // ─────────────────────────────────────────────────────────── Docker ──────
  {
    slug: "docker",
    title: "Docker",
    description:
      "Learn to package applications into containers, manage images, and run isolated environments on any machine — the foundation of modern DevOps.",
    icon: "container",
    category: "containers",
    estimatedHours: 8,
    isUnlocked: true,
    sortOrder: 1,
    challenges: [
      {
        title: "Run Your First Container",
        description:
          "Start a container from a public image and see how Docker isolates applications from the host system.",
        difficulty: "beginner",
        xpReward: 50,
        tags: ["docker", "containers", "basics"],
        content: `## Overview

A container is a lightweight, isolated environment that runs an application and everything it needs — without touching the rest of your system. Docker manages these containers for you.

In this challenge you will pull a public image from Docker Hub and run it as a container.

## Prerequisites

- Docker Desktop installed and running on your machine
- A terminal (Command Prompt, PowerShell, or any Unix shell)

## Your task

**1. Verify Docker is running**

Open your terminal and confirm the Docker daemon is active:

\`\`\`bash
docker --version
docker info
\`\`\`

You should see version information and a list of system details. If you get an error, start Docker Desktop first.

**2. Run the hello-world container**

This image is designed purely to confirm that Docker is working:

\`\`\`bash
docker run hello-world
\`\`\`

Docker will pull the image from Docker Hub and run it. You will see a message that says **"Hello from Docker!"**

**3. Run an interactive Ubuntu container**

\`\`\`bash
docker run -it ubuntu bash
\`\`\`

You are now inside a real Ubuntu container. Try a few commands:

\`\`\`bash
whoami
ls /
cat /etc/os-release
exit
\`\`\`

## Verification

Run \`docker ps -a\` to list all containers (including stopped ones). You should see both the \`hello-world\` container and the Ubuntu container you just exited.

## Key concepts

- **Image** — a read-only template used to create a container
- **Container** — a running instance of an image
- \`docker run\` — pulls the image if needed, then starts a container from it
- \`-it\` — interactive mode with a terminal attached`,
        hints: [
          {
            hint: "If \`docker run hello-world\` fails with a permissions error on Linux, try prefixing the command with \`sudo\`. On Mac and Windows, Docker Desktop handles this automatically.",
          },
          {
            hint: "The \`-it\` flag is two flags combined: \`-i\` (keep stdin open) and \`-t\` (allocate a terminal). Without them, a shell like bash would exit immediately because there is no terminal to attach to.",
          },
          {
            hint: "After typing \`exit\` inside the container, you return to your host terminal. The container has stopped but still exists — check with \`docker ps -a\`.",
          },
        ],
      },
      {
        title: "Explore a Running Container",
        description:
          "Start a container in the background and learn how to inspect, execute commands inside it, and view its logs.",
        difficulty: "beginner",
        xpReward: 50,
        tags: ["docker", "containers", "exec", "logs"],
        content: `## Overview

In real-world use, containers run in the background (called detached mode). You need to know how to check on them, run commands inside them, and read their output — without stopping them.

## Your task

**1. Start a container in detached mode**

Run an Nginx web server in the background:

\`\`\`bash
docker run -d --name webserver -p 8080:80 nginx
\`\`\`

- \`-d\` — detached (background)
- \`--name webserver\` — gives the container a memorable name
- \`-p 8080:80\` — maps port 8080 on your machine to port 80 inside the container

**2. Verify it is running**

\`\`\`bash
docker ps
\`\`\`

You should see \`webserver\` in the list with status \`Up\`.

Open your browser and visit \`http://localhost:8080\` — you should see the Nginx welcome page.

**3. Run a command inside the running container**

\`\`\`bash
docker exec -it webserver bash
\`\`\`

You are now inside the running container. Explore a bit:

\`\`\`bash
cat /etc/nginx/nginx.conf
ls /usr/share/nginx/html
exit
\`\`\`

**4. View container logs**

\`\`\`bash
docker logs webserver
\`\`\`

Each time you visited \`localhost:8080\`, Nginx logged the request. You will see those lines here.

**5. Stop and remove the container**

\`\`\`bash
docker stop webserver
docker rm webserver
\`\`\`

## Verification

After step 5, run \`docker ps -a\` — the \`webserver\` container should no longer appear.

## Key concepts

- \`-d\` — detached mode (runs in the background)
- \`--name\` — assign a human-readable name to a container
- \`-p host:container\` — publish a port so you can reach the container from your machine
- \`docker exec\` — run a command in a running container
- \`docker logs\` — view the stdout/stderr output of a container`,
        hints: [
          {
            hint: "If port 8080 is already in use, try a different host port such as \`-p 9090:80\`.",
          },
          {
            hint: "\`docker exec -it webserver bash\` opens an interactive shell inside the container. The \`-it\` flags work the same way as with \`docker run\`.",
          },
          {
            hint: "You must stop a container before you can remove it, unless you use \`docker rm -f webserver\` which forces removal of a running container.",
          },
        ],
      },
      {
        title: "Build Your First Docker Image",
        description:
          "Write a Dockerfile and build a custom image that packages your own application code.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["docker", "dockerfile", "images", "build"],
        content: `## Overview

A Dockerfile is a plain-text recipe that tells Docker how to build your image, step by step. Every image you use — including Nginx and Ubuntu — was built from a Dockerfile.

## Your task

**1. Create a project directory**

\`\`\`bash
mkdir my-app && cd my-app
\`\`\`

**2. Create a simple application**

Create a file called \`app.sh\`:

\`\`\`bash
#!/bin/sh
echo "Hello from my Docker image!"
echo "Running on: $(uname -a)"
\`\`\`

**3. Write the Dockerfile**

Create a file named \`Dockerfile\` (no extension) in the same directory:

\`\`\`dockerfile
FROM alpine:3.19

WORKDIR /app

COPY app.sh .

RUN chmod +x app.sh

CMD ["./app.sh"]
\`\`\`

What each instruction means:
- \`FROM\` — the base image to start from
- \`WORKDIR\` — sets the working directory inside the image
- \`COPY\` — copies files from your machine into the image
- \`RUN\` — executes a command during the build
- \`CMD\` — the default command to run when a container starts

**4. Build the image**

\`\`\`bash
docker build -t my-app:v1 .
\`\`\`

- \`-t my-app:v1\` — tags the image with a name and version
- \`.\` — tells Docker where to find the Dockerfile (current directory)

**5. Run a container from your image**

\`\`\`bash
docker run my-app:v1
\`\`\`

You should see the output from \`app.sh\`.

## Verification

Run \`docker images\` and confirm \`my-app\` appears in the list.

## Key concepts

- **Dockerfile** — a text file with instructions for building an image
- **Build context** — the directory you pass to \`docker build\` (the \`.\`)
- Each Dockerfile instruction creates a new **layer** in the image
- \`FROM alpine\` — Alpine Linux is a tiny base image (~5 MB), ideal for simple scripts`,
        hints: [
          {
            hint: "The Dockerfile must be named exactly \`Dockerfile\` with a capital D and no file extension. Docker looks for this file by default.",
          },
          {
            hint: "If you see \`no such file or directory\` when Docker tries to copy \`app.sh\`, make sure you are running \`docker build\` from the same directory that contains both \`Dockerfile\` and \`app.sh\`.",
          },
          {
            hint: "The \`.\` at the end of \`docker build -t my-app:v1 .\` is required — it specifies the build context (the directory Docker reads files from). Do not leave it out.",
          },
        ],
      },
      {
        title: "Pass Environment Variables to a Container",
        description:
          "Configure a container at runtime using environment variables instead of hardcoding values into your image.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["docker", "environment", "configuration"],
        content: `## Overview

Hardcoding configuration into an image (like database URLs or API keys) is a bad practice because the same image would need to be rebuilt for each environment. Instead, you pass configuration as environment variables at runtime.

## Your task

**1. Pass a single environment variable**

\`\`\`bash
docker run -e GREETING="Hello, DevOps!" ubuntu printenv GREETING
\`\`\`

The container prints the value of \`GREETING\` and exits.

**2. Pass multiple variables**

\`\`\`bash
docker run \\
  -e APP_NAME="MyApp" \\
  -e APP_ENV="production" \\
  -e APP_PORT="3000" \\
  ubuntu printenv
\`\`\`

\`printenv\` with no arguments prints all environment variables — you will see your three variables in the output.

**3. Use an env file**

Create a file called \`.env\`:

\`\`\`
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
\`\`\`

Now pass it to a container:

\`\`\`bash
docker run --env-file .env ubuntu printenv
\`\`\`

**4. Use environment variables in a Dockerfile**

Create a new Dockerfile:

\`\`\`dockerfile
FROM alpine:3.19
ENV APP_VERSION="1.0.0"
ENV LOG_LEVEL="info"
CMD ["/bin/sh", "-c", "echo App version: $APP_VERSION, Log level: $LOG_LEVEL"]
\`\`\`

Build and run it:

\`\`\`bash
docker build -t env-demo .
docker run env-demo
docker run -e APP_VERSION="2.0.0" env-demo
\`\`\`

Notice how the second run overrides the default set in the Dockerfile.

## Verification

Run the final command and confirm the output shows \`App version: 2.0.0\` — proving that runtime variables override Dockerfile defaults.

## Key concepts

- \`-e KEY=VALUE\` — set a single environment variable at runtime
- \`--env-file\` — load variables from a file (one \`KEY=VALUE\` per line)
- \`ENV\` in a Dockerfile — sets default environment variables baked into the image
- Runtime \`-e\` values always override \`ENV\` defaults`,
        hints: [
          {
            hint: "Never put secrets like passwords or API keys into a Dockerfile \`ENV\` instruction — they get baked into the image layer and can be extracted. Use \`--env-file\` or secret management tools at runtime.",
          },
          {
            hint: "The \`.env\` file used with \`--env-file\` should not use quotes around values and should not have spaces around the \`=\` sign: \`DB_HOST=localhost\` (correct) vs \`DB_HOST = \"localhost\"\` (wrong).",
          },
          {
            hint: "You can combine \`--env-file\` and \`-e\` in the same command. Individual \`-e\` flags take precedence over the file.",
          },
        ],
      },
      {
        title: "Mount a Volume to Persist Data",
        description:
          "Use Docker volumes to store data that survives beyond the lifecycle of a container.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker", "volumes", "persistence", "storage"],
        content: `## Overview

By default, everything written inside a container is lost when that container is removed. Volumes solve this by storing data outside the container's writable layer — on the host or in a Docker-managed location.

## Your task

**1. Create a named volume**

\`\`\`bash
docker volume create mydata
docker volume ls
\`\`\`

**2. Write data to the volume**

\`\`\`bash
docker run --rm -v mydata:/data alpine sh -c "echo 'Hello from container 1' > /data/message.txt"
\`\`\`

- \`--rm\` — automatically remove the container when it exits
- \`-v mydata:/data\` — mount the \`mydata\` volume at \`/data\` inside the container

**3. Read the data from a different container**

\`\`\`bash
docker run --rm -v mydata:/data alpine cat /data/message.txt
\`\`\`

You should see \`Hello from container 1\` — even though this is a completely different container.

**4. Try a bind mount (local directory)**

\`\`\`bash
mkdir hostdir
docker run --rm -v ./hostdir:/data alpine sh -c "echo 'Written by Docker' > /data/from-docker.txt"
cat hostdir/from-docker.txt
\`\`\`

The file now exists on your host machine. This is a **bind mount** — it links a directory from your machine directly into the container.

**5. Inspect the volume**

\`\`\`bash
docker volume inspect mydata
\`\`\`

## Verification

The message written in step 2 is readable in step 3. The file written in step 4 appears in your \`hostdir\` on the host.

## Key concepts

- **Named volume** — Docker manages the storage location; data persists even after container removal
- **Bind mount** — maps a specific host path into the container; useful for development
- \`--rm\` — clean up the container automatically after it exits
- Volumes are the recommended way to persist database data, user uploads, and application state`,
        hints: [
          {
            hint: "Named volumes (\`-v mydata:/data\`) are preferred over bind mounts for production data because Docker manages the location and you don't depend on a specific host path.",
          },
          {
            hint: "On Windows with Docker Desktop, bind mounts using \`./hostdir\` may need the full path or need to be enabled in Docker Desktop settings under Resources > File sharing.",
          },
          {
            hint: "To remove a volume and its data: \`docker volume rm mydata\`. You cannot remove a volume that is currently in use by a container — stop and remove the container first.",
          },
        ],
      },
      {
        title: "Connect Containers with a Network",
        description:
          "Create a Docker network so that multiple containers can communicate with each other by name.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker", "networking", "containers"],
        content: `## Overview

Containers are isolated by default — they cannot reach each other unless you connect them to the same network. Docker's networking model lets containers find each other by name rather than by IP address.

## Your task

**1. Create a custom bridge network**

\`\`\`bash
docker network create mynet
docker network ls
\`\`\`

**2. Start a server container on the network**

\`\`\`bash
docker run -d --name server --network mynet nginx
\`\`\`

**3. Start a client container on the same network and curl the server**

\`\`\`bash
docker run --rm --network mynet alpine sh -c "apk add --no-cache curl && curl -s http://server"
\`\`\`

Notice the URL: \`http://server\` — Docker's DNS resolves container names automatically within a network. You should see the Nginx HTML response.

**4. Confirm isolation: try reaching the server from outside the network**

\`\`\`bash
docker run --rm alpine sh -c "apk add --no-cache curl && curl -s --max-time 2 http://server || echo 'Cannot reach server'"
\`\`\`

This container is not on \`mynet\`, so it cannot find \`server\` by name.

**5. Clean up**

\`\`\`bash
docker stop server
docker rm server
docker network rm mynet
\`\`\`

## Verification

Step 3 returns an Nginx HTML page. Step 4 prints \`Cannot reach server\`.

## Key concepts

- **Bridge network** — the default network type; containers on the same bridge can talk to each other
- **DNS resolution** — Docker automatically creates DNS entries for container names within a network
- Containers on the **default bridge** network can only reach each other by IP, not by name — always create a custom network
- \`--network\` — attach a container to a specific network at startup`,
        hints: [
          {
            hint: "The default bridge network that Docker uses when you don't specify \`--network\` does not support DNS name resolution between containers. Always create a named network for multi-container setups.",
          },
          {
            hint: "If \`curl\` is not available in Alpine, install it first with \`apk add --no-cache curl\`. The \`--no-cache\` flag skips storing the package index, keeping the container clean.",
          },
          {
            hint: "You can connect an already-running container to a network with \`docker network connect mynet container-name\`. This is useful when you forget to specify the network at startup.",
          },
        ],
      },
      {
        title: "Push an Image to Docker Hub",
        description:
          "Tag and publish a custom Docker image to Docker Hub so it can be pulled from any machine.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker", "registry", "docker-hub", "images"],
        content: `## Overview

Docker Hub is the default public registry for Docker images. Pushing your image there makes it available to pull on any machine in the world — or for your CI/CD pipeline to deploy.

## Prerequisites

- A free Docker Hub account (sign up at hub.docker.com)
- The image you built in a previous challenge (\`my-app:v1\`), or any image you have built

## Your task

**1. Log in to Docker Hub**

\`\`\`bash
docker login
\`\`\`

Enter your Docker Hub username and password when prompted.

**2. Tag your image with your Docker Hub username**

Images pushed to Docker Hub must be prefixed with your username:

\`\`\`bash
docker tag my-app:v1 YOUR_USERNAME/my-app:v1
\`\`\`

Replace \`YOUR_USERNAME\` with your actual Docker Hub username.

**3. Push the image**

\`\`\`bash
docker push YOUR_USERNAME/my-app:v1
\`\`\`

Docker uploads each layer. Watch the progress output.

**4. Verify by pulling it back**

Remove your local copy and pull from Docker Hub:

\`\`\`bash
docker rmi YOUR_USERNAME/my-app:v1
docker pull YOUR_USERNAME/my-app:v1
docker run YOUR_USERNAME/my-app:v1
\`\`\`

## Verification

The \`docker pull\` command downloads the image from Docker Hub and the container runs successfully.

## Key concepts

- **Registry** — a server that stores and distributes Docker images
- **Tag** — a label that identifies a specific version of an image (format: \`username/image:tag\`)
- \`latest\` — Docker's default tag when you don't specify one; be careful relying on it in production
- \`docker rmi\` — removes an image from your local machine (does not delete it from the registry)`,
        hints: [
          {
            hint: "If \`docker login\` fails with 2FA enabled on your Docker Hub account, generate an access token at hub.docker.com under Account Settings > Security, then use that token as your password.",
          },
          {
            hint: "The tag must match your Docker Hub username exactly. If your username is \`jsmith\`, the tag must be \`jsmith/my-app:v1\`.",
          },
          {
            hint: "You can also tag an image at build time: \`docker build -t YOUR_USERNAME/my-app:v1 .\` — this skips the separate tag step.",
          },
        ],
      },
      {
        title: "Inspect and Debug a Container",
        description:
          "Use Docker's built-in inspection tools to understand what is happening inside a running container.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker", "debugging", "inspect", "logs"],
        content: `## Overview

When something goes wrong with a container, you need a systematic way to investigate. Docker provides several commands for peering inside a running or stopped container.

## Your task

**1. Start a container to investigate**

\`\`\`bash
docker run -d --name debug-me -e SECRET="hidden-value" -p 8080:80 nginx
\`\`\`

**2. Inspect the container's full configuration**

\`\`\`bash
docker inspect debug-me
\`\`\`

This outputs a large JSON document. Filter specific fields:

\`\`\`bash
docker inspect debug-me --format '{{.State.Status}}'
docker inspect debug-me --format '{{.NetworkSettings.IPAddress}}'
docker inspect debug-me --format '{{range .Config.Env}}{{.}} {{end}}'
\`\`\`

The last command lists all environment variables, including the \`SECRET\` you passed.

**3. View live logs**

\`\`\`bash
docker logs debug-me
docker logs --follow --tail 10 debug-me
\`\`\`

Open \`http://localhost:8080\` in your browser while \`--follow\` is running to see log lines appear in real time. Press \`Ctrl+C\` to stop following.

**4. Check resource usage**

\`\`\`bash
docker stats debug-me --no-stream
\`\`\`

This shows CPU, memory, and network usage at a point in time.

**5. List processes inside the container**

\`\`\`bash
docker top debug-me
\`\`\`

**6. Simulate a broken container and debug it**

\`\`\`bash
docker run --name broken alpine sh -c "echo 'I ran' && exit 1"
docker logs broken
docker inspect broken --format '{{.State.ExitCode}}'
\`\`\`

Exit code \`1\` means the process exited with an error.

**7. Clean up**

\`\`\`bash
docker stop debug-me && docker rm debug-me && docker rm broken
\`\`\`

## Verification

You can retrieve the container's IP address, see its environment variables, watch its logs in real time, and identify the exit code of a failed container.

## Key concepts

- \`docker inspect\` — full JSON configuration and state of a container or image
- \`--format\` — Go template for extracting specific fields from inspect output
- \`docker logs --follow\` — stream logs in real time
- \`docker stats\` — live resource usage metrics
- **Exit code** — \`0\` means success; any other value means the process exited with an error`,
        hints: [
          {
            hint: "Go template syntax can look intimidating. Start with simple formats like \`{{.State.Status}}\` and work up to nested fields. The Docker documentation has a full reference.",
          },
          {
            hint: "\`docker logs\` only works for containers using the default \`json-file\` logging driver. If your container is configured with a different driver (like \`syslog\`), logs go elsewhere.",
          },
          {
            hint: "If a container exits immediately and you cannot exec into it, use \`docker logs container-name\` to see what it printed before exiting. This is the first step in diagnosing any container crash.",
          },
        ],
      },
      {
        title: "Build a Multi-stage Image",
        description:
          "Use multi-stage builds to compile your application in one stage and produce a small, clean production image in another.",
        difficulty: "advanced",
        xpReward: 125,
        tags: ["docker", "multi-stage", "build", "optimization"],
        content: `## Overview

Without multi-stage builds, your production image often contains build tools (compilers, package managers, source code) that are not needed at runtime. This makes images unnecessarily large and increases the attack surface. Multi-stage builds solve this by separating the build environment from the runtime environment.

## Your task

**1. Create a simple Go application**

Create a directory \`go-app\` and inside it create \`main.go\`:

\`\`\`go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello from a Go container!")
    })
    fmt.Println("Server running on :8080")
    http.ListenAndServe(":8080", nil)
}
\`\`\`

**2. Write a single-stage Dockerfile (the naive approach)**

Create \`Dockerfile.naive\`:

\`\`\`dockerfile
FROM golang:1.22-alpine
WORKDIR /app
COPY main.go .
RUN go build -o server main.go
EXPOSE 8080
CMD ["./server"]
\`\`\`

Build and check the size:

\`\`\`bash
docker build -t go-naive -f Dockerfile.naive .
docker images go-naive
\`\`\`

Note the image size — it will be several hundred megabytes because the entire Go toolchain is included.

**3. Write a multi-stage Dockerfile**

Create \`Dockerfile\`:

\`\`\`dockerfile
# Stage 1: build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY main.go .
RUN go build -o server main.go

# Stage 2: runtime
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
\`\`\`

Build and compare:

\`\`\`bash
docker build -t go-multi .
docker images go-multi
\`\`\`

**4. Verify the server runs**

\`\`\`bash
docker run -d --name go-server -p 8080:8080 go-multi
curl http://localhost:8080
docker stop go-server && docker rm go-server
\`\`\`

## Verification

\`go-multi\` is significantly smaller than \`go-naive\` (typically 10-20x). The server responds correctly at \`http://localhost:8080\`.

## Key concepts

- \`AS builder\` — names a stage so later stages can reference it
- \`COPY --from=builder\` — copies only specific files from a previous stage
- The final image contains none of the build tools from stage 1
- This pattern works for any compiled language: Go, Rust, C++, Java, TypeScript`,
        hints: [
          {
            hint: "You do not need Go installed on your machine — the first stage of the Dockerfile provides the Go compiler inside Docker. This is one of the most useful aspects of multi-stage builds: your CI machine only needs Docker.",
          },
          {
            hint: "You can have more than two stages. For example: a stage for installing dependencies, a stage for running tests, and a final stage for the production image. Only the last \`FROM\` determines the output image.",
          },
          {
            hint: "If your binary needs shared libraries from the build stage, you may get a \`not found\` error when running in Alpine. Add \`CGO_ENABLED=0\` to the build command: \`RUN CGO_ENABLED=0 go build -o server main.go\`.",
          },
        ],
      },
      {
        title: "Optimise an Image for Size",
        description:
          "Apply proven techniques to shrink a Docker image: smaller base images, combined layers, and a .dockerignore file.",
        difficulty: "advanced",
        xpReward: 150,
        tags: ["docker", "optimization", "dockerfile", "best-practices"],
        content: `## Overview

Image size matters for three reasons: faster pulls in CI/CD, reduced storage costs, and a smaller attack surface. In this challenge you will apply the most impactful optimisation techniques.

## Your task

**1. Start with an unoptimised image**

Create a directory \`node-app\` with these files:

\`app.js\`:

\`\`\`js
const http = require('http');
http.createServer((req, res) => {
  res.end('Hello\\n');
}).listen(3000);
\`\`\`

\`package.json\`:

\`\`\`json
{
  "name": "node-app",
  "version": "1.0.0",
  "scripts": { "start": "node app.js" }
}
\`\`\`

\`Dockerfile.unoptimised\`:

\`\`\`dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm cache clean --force
RUN rm -rf /tmp/*
CMD ["node", "app.js"]
\`\`\`

Build and note the size:

\`\`\`bash
docker build -t node-unopt -f Dockerfile.unoptimised .
docker images node-unopt
\`\`\`

**2. Create a .dockerignore file**

\`\`\`
node_modules
npm-debug.log
.git
*.md
\`\`\`

This prevents unnecessary files from being sent to the build context, speeding up builds and avoiding accidental inclusions.

**3. Write an optimised Dockerfile**

\`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev && npm cache clean --force
COPY app.js .
USER node
CMD ["node", "app.js"]
\`\`\`

Key changes:
- \`node:20-alpine\` — the Alpine variant is ~70% smaller than the Debian base
- \`COPY package.json\` before \`COPY app.js\` — Docker layer caching; npm install only re-runs when \`package.json\` changes
- \`--omit=dev\` — skips dev dependencies in production
- Combined \`&&\` in a single \`RUN\` — each \`RUN\` creates a layer; combining saves space
- \`USER node\` — run as a non-root user for security

Build and compare:

\`\`\`bash
docker build -t node-opt .
docker images | grep node
\`\`\`

**4. Verify the optimised image works**

\`\`\`bash
docker run -d --name opt-server -p 3000:3000 node-opt
curl http://localhost:3000
docker stop opt-server && docker rm opt-server
\`\`\`

## Verification

\`node-opt\` is significantly smaller than \`node-unopt\`. The server responds to requests.

## Key concepts

- **Alpine base images** — minimalist Linux (~5 MB); use the \`-alpine\` tag when available
- **Layer caching** — Docker reuses unchanged layers; copy dependency manifests before source code
- **Combined RUN commands** — \`RUN a && b && c\` creates one layer instead of three
- **.dockerignore** — exclude files that should not be in the build context
- **Least-privilege** — run containers as a non-root user to limit damage if compromised`,
        hints: [
          {
            hint: "Order your Dockerfile instructions from least frequently changed (base image, package installs) to most frequently changed (application code). This maximises Docker's layer cache and speeds up rebuilds.",
          },
          {
            hint: "Use \`docker history image-name\` to see every layer in an image and its size. This helps you identify which \`RUN\` command is adding the most weight.",
          },
          {
            hint: "Alpine Linux uses \`musl libc\` instead of \`glibc\`. Most Node.js and Python applications work fine, but some native C extensions may not. If you hit compatibility issues, try \`node:20-slim\` (Debian slim) as a middle ground.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to Docker",
        summary:
          "Understand what Docker is, why containers exist, and how they differ from virtual machines.",
        readingMinutes: 6,
        tags: ["docker", "containers", "basics"],
        content: `## What is Docker?

Docker is an open platform for developing, shipping, and running applications. It lets you package your application and all its dependencies into a standardised unit called a **container**.

## Why containers?

Before containers, deploying an application meant wrestling with the question: "It works on my machine — why not in production?" This happened because development machines, staging servers, and production servers had slightly different operating systems, library versions, and configurations.

Containers solve this by bundling the application with everything it needs (runtime, libraries, configuration) into a single portable unit. If it runs in a container on your laptop, it will run identically in CI, staging, and production.

## Containers vs virtual machines

A virtual machine (VM) virtualises an entire computer, including the hardware. Each VM runs its own full operating system kernel — this makes VMs large (gigabytes) and slow to start (minutes).

A container virtualises at the operating system level. All containers on a host share the same OS kernel. This makes containers:
- **Small** — megabytes instead of gigabytes
- **Fast to start** — seconds or milliseconds instead of minutes
- **Efficient** — you can run dozens of containers on hardware that would struggle with a handful of VMs

## Core Docker concepts

**Image** — a read-only, layered template for creating containers. Think of it as a blueprint. You build images from a Dockerfile.

**Container** — a running instance of an image. You can run many containers from the same image, each isolated from the others.

**Dockerfile** — a plain-text file with instructions for building an image. Each instruction (FROM, RUN, COPY, CMD) adds a layer.

**Registry** — a server that stores and distributes images. Docker Hub is the default public registry. Companies often run private registries.

**Docker daemon** — the background service that manages images, containers, networks, and volumes on your machine.

**Docker CLI** — the \`docker\` command you type in your terminal. It talks to the daemon.

## The typical workflow

1. Write a \`Dockerfile\`
2. Build an image: \`docker build -t my-app:v1 .\`
3. Run a container: \`docker run my-app:v1\`
4. Push to a registry: \`docker push my-app:v1\`
5. Pull and run on any other machine: \`docker pull my-app:v1 && docker run my-app:v1\`

## Summary

Docker packages your application and its environment into portable containers. Containers are lighter and faster than VMs, and they run identically everywhere. The Dockerfile is the recipe; the image is the product; the container is the running result.`,
      },
      {
        title: "Understanding Docker Images and Layers",
        summary:
          "Learn how Docker images are built in layers, why caching matters, and how to use this knowledge to write faster, smaller Dockerfiles.",
        readingMinutes: 7,
        tags: ["docker", "images", "layers", "caching"],
        content: `## What is a Docker image?

A Docker image is an ordered collection of filesystem changes — called **layers**. Each instruction in a Dockerfile that modifies the filesystem (\`RUN\`, \`COPY\`, \`ADD\`) creates a new layer. Read-only instructions like \`CMD\`, \`EXPOSE\`, and \`ENV\` create metadata but no filesystem layer.

## How layers work

Imagine building a cake, one tier at a time. The base tier is the \`FROM\` instruction (the base image). Each subsequent \`RUN\` or \`COPY\` adds another tier. Docker stacks these tiers and presents them as a single unified filesystem.

When you run a container, Docker adds one final **writable layer** on top. All changes made inside the running container go into this writable layer. The underlying image layers remain read-only and can be shared across many containers simultaneously.

\`\`\`
Container writable layer  ← your container's changes
─────────────────────────
COPY app/ /app            ← layer 4 (from Dockerfile)
RUN npm install           ← layer 3
COPY package.json .       ← layer 2
FROM node:20-alpine       ← layer 1 (base image)
\`\`\`

## Layer caching

Docker caches each layer. When you rebuild an image, Docker checks whether the instruction and its inputs have changed. If nothing changed, Docker reuses the cached layer instead of re-executing the instruction.

This is why **instruction order matters**:

\`\`\`dockerfile
# Bad: npm install re-runs every time any file changes
COPY . .
RUN npm install

# Good: npm install only re-runs when package.json changes
COPY package.json package-lock.json .
RUN npm install
COPY . .
\`\`\`

In the good version, if you only change \`app.js\`, Docker reuses the cached \`npm install\` layer.

## Inspecting layers

\`\`\`bash
# See all layers and their sizes
docker history my-image:v1

# See the full layer IDs
docker inspect my-image:v1 --format '{{json .RootFS.Layers}}'
\`\`\`

## Shared layers save disk space

If two images share the same base (\`FROM node:20-alpine\`), Docker stores that base layer once and shares it between both images. This is why downloading a second Node.js image is much faster than the first — most layers are already present.

## Minimising layer count

Every \`RUN\` instruction creates a layer. Unnecessary layers add size. Combine related commands with \`&&\`:

\`\`\`dockerfile
# Creates 3 layers — the cleanup layers do not actually remove data from earlier layers
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# Creates 1 layer — cleanup happens within the same layer, so it actually works
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
\`\`\`

## Summary

Docker images are stacks of read-only layers. Each Dockerfile instruction that touches the filesystem creates a layer. Docker caches layers and reuses them when inputs have not changed. Put instructions that change frequently (your application code) at the end of the Dockerfile to maximise cache hits.`,
      },
      {
        title: "Container Networking Fundamentals",
        summary:
          "Learn how Docker containers communicate with each other and with the outside world through networks and port mappings.",
        readingMinutes: 8,
        tags: ["docker", "networking", "ports", "dns"],
        content: `## The problem Docker networking solves

Containers are isolated by default. A web server container cannot talk to a database container unless you explicitly connect them. Docker networking provides the mechanism to do this safely and predictably.

## Network drivers

Docker supports several network drivers. The two you will use most:

**bridge** — the default for standalone containers. Docker creates a virtual network on your machine, and containers on the same bridge can communicate. By default, containers join a network called \`bridge\`, but you should always create named networks.

**host** — the container shares the host machine's network stack directly. There is no isolation between container and host ports. Useful for performance-sensitive applications, but reduces security.

**none** — completely disables networking for a container. Used for batch jobs that don't need network access.

## Custom bridge networks

Always create a custom bridge network rather than using the default:

\`\`\`bash
docker network create my-network
docker run --network my-network --name web nginx
docker run --network my-network --name db postgres
\`\`\`

**Why custom networks?** The default \`bridge\` network does not support DNS resolution by container name. On a custom network, Docker automatically creates DNS entries so containers can reach each other by name (\`http://web\`, \`postgres://db\`).

## Port publishing

Containers are isolated from your host machine. To reach a container from your browser or from another machine, you must publish a port:

\`\`\`bash
docker run -p 8080:80 nginx
#           ^^^^  ^^
#           host  container
\`\`\`

This maps port \`8080\` on your machine to port \`80\` inside the container. Visiting \`http://localhost:8080\` sends traffic to Nginx's port \`80\`.

You can publish multiple ports:

\`\`\`bash
docker run -p 8080:80 -p 8443:443 nginx
\`\`\`

Or let Docker choose a random host port:

\`\`\`bash
docker run -P nginx
docker port container-name  # see which ports were assigned
\`\`\`

## Container-to-container communication

Containers on the same network talk to each other directly — no port publishing needed. The traffic never leaves the host:

\`\`\`bash
docker network create app-net
docker run -d --name api --network app-net my-api
docker run -d --name db  --network app-net postgres

# Inside the 'api' container, connect to Postgres:
# psql -h db -U postgres
\`\`\`

## Inspecting networks

\`\`\`bash
docker network ls                    # list all networks
docker network inspect my-network    # see connected containers, IP ranges
docker inspect container-name        # see the container's network settings
\`\`\`

## Summary

Docker networking isolates containers by default. Custom bridge networks provide DNS resolution between containers. Use \`-p host:container\` to publish ports to the outside world. Containers on the same network communicate by name — no port publishing required.`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────── Docker Compose ──
  {
    slug: "docker-compose",
    title: "Docker Compose",
    description:
      "Define and run multi-container applications with a single YAML file. Stop running docker run commands by hand.",
    icon: "layers",
    category: "containers",
    estimatedHours: 5,
    isUnlocked: true,
    sortOrder: 2,
    challenges: [
      {
        title: "Define a Two-service Application",
        description:
          "Write a docker-compose.yml that starts a web server and a database together with a single command.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["docker-compose", "services", "yaml"],
        content: `## Overview

Running multiple containers by hand — with the right networks, volumes, and environment variables — is tedious and error-prone. Docker Compose describes your entire application in a single YAML file so you can start everything with one command: \`docker compose up\`.

## Your task

**1. Create a project directory**

\`\`\`bash
mkdir compose-demo && cd compose-demo
\`\`\`

**2. Write the Compose file**

Create \`docker-compose.yml\`:

\`\`\`yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

**3. Start the application**

\`\`\`bash
docker compose up
\`\`\`

Watch the logs stream in. Both containers start, and the \`web\` service waits for \`db\` to be ready first (because of \`depends_on\`).

Open \`http://localhost:8080\` — you should see the Nginx welcome page.

**4. Run in the background**

Press \`Ctrl+C\` to stop, then start in detached mode:

\`\`\`bash
docker compose up -d
docker compose ps
\`\`\`

**5. Stop and clean up**

\`\`\`bash
docker compose down
\`\`\`

\`down\` stops and removes the containers. The \`db-data\` volume is preserved. To remove volumes too: \`docker compose down -v\`.

## Verification

\`docker compose ps\` shows both services running. Nginx is reachable at \`http://localhost:8080\`.

## Key concepts

- \`services\` — defines each container in your application
- \`depends_on\` — controls startup order (does not wait for health checks, just container start)
- \`volumes\` — named volumes defined at the project level are shared across services
- \`docker compose up -d\` — starts in the background
- \`docker compose down\` — stops and removes containers`,
        hints: [
          {
            hint: "YAML is indentation-sensitive. Use spaces, not tabs. Each level of nesting must be consistently indented — two spaces per level is the standard.",
          },
          {
            hint: "\`depends_on\` only controls the *start order*, not whether the service is actually ready to accept connections. Postgres may still be initialising after its container starts. For production, use health checks.",
          },
          {
            hint: "If you change the Compose file, run \`docker compose up -d\` again — Compose detects what changed and only recreates the affected containers.",
          },
        ],
      },
      {
        title: "Use Environment Variables from a .env File",
        description:
          "Separate configuration from your Compose file using a .env file so secrets and settings are not hardcoded.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["docker-compose", "environment", "configuration"],
        content: `## Overview

Hardcoding passwords and hostnames directly in \`docker-compose.yml\` means you cannot commit the file to version control safely. Docker Compose automatically reads a \`.env\` file in the same directory and makes those values available in the Compose file via \`\${VARIABLE}\` syntax.

## Your task

**1. Create a .env file**

\`\`\`
POSTGRES_USER=admin
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=myapp
WEB_PORT=8080
\`\`\`

Add \`.env\` to your \`.gitignore\` so it is never committed.

**2. Update docker-compose.yml to use variables**

\`\`\`yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "\${WEB_PORT}:80"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

**3. Verify variable substitution**

\`\`\`bash
docker compose config
\`\`\`

This prints the resolved Compose file with all variables substituted. Confirm the values from \`.env\` appear correctly.

**4. Start and verify**

\`\`\`bash
docker compose up -d
docker compose exec db psql -U admin -d myapp -c "SELECT version();"
docker compose down -v
\`\`\`

**5. Provide a .env.example for teammates**

Create \`.env.example\` (safe to commit):

\`\`\`
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
WEB_PORT=8080
\`\`\`

## Verification

\`docker compose config\` shows the resolved file with real values. The Postgres container accepts connections with the credentials from \`.env\`.

## Key concepts

- \`.env\` — automatically loaded by Compose; do not commit real credentials
- \`\${VARIABLE}\` — references a variable in the Compose file
- \`docker compose config\` — shows the final resolved Compose configuration, great for debugging
- \`.env.example\` — commit this as a template for other developers`,
        hints: [
          {
            hint: "If a variable in \`.env\` is not being picked up, check for leading or trailing spaces around the \`=\` sign. \`KEY = VALUE\` is invalid; it must be \`KEY=VALUE\`.",
          },
          {
            hint: "You can also reference shell environment variables in the Compose file, not just those from \`.env\`. Shell variables take precedence over the \`.env\` file. This is useful for injecting CI secrets.",
          },
          {
            hint: "\`docker compose exec db psql -U admin -d myapp\` connects to the Postgres container using the \`psql\` client inside the container — no Postgres installation needed on your machine.",
          },
        ],
      },
      {
        title: "Add a Redis Cache to a Compose Application",
        description:
          "Extend a Compose application by adding a Redis service and connecting it to the existing web service.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker-compose", "redis", "caching", "networking"],
        content: `## Overview

Real applications rarely have just one service. In this challenge you will add a Redis caching layer alongside a web application and see how Compose makes service discovery between them automatic.

## Your task

**1. Create the application files**

Create \`app.js\` — a simple Node.js app that counts visits using Redis:

\`\`\`js
const express = require('express');
const redis = require('redis');

const app = express();
const client = redis.createClient({ url: 'redis://cache:6379' });

client.connect().catch(console.error);

app.get('/', async (req, res) => {
  const count = await client.incr('visits');
  res.send(\`Visit number: \${count}\`);
});

app.listen(3000, () => console.log('Listening on port 3000'));
\`\`\`

Create \`package.json\`:

\`\`\`json
{
  "name": "redis-demo",
  "dependencies": {
    "express": "^4.18.0",
    "redis": "^4.6.0"
  }
}
\`\`\`

Create \`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY app.js .
CMD ["node", "app.js"]
\`\`\`

**2. Write the Compose file**

\`\`\`yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - cache

  cache:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
\`\`\`

**3. Start and test**

\`\`\`bash
docker compose up --build
\`\`\`

Open \`http://localhost:3000\` and refresh several times. The visit counter increments with each request.

**4. Check Redis directly**

\`\`\`bash
docker compose exec cache redis-cli get visits
\`\`\`

**5. Restart and verify persistence**

\`\`\`bash
docker compose restart web
curl http://localhost:3000
\`\`\`

The counter continues from where it left off — the value is stored in Redis, not in the web process.

\`\`\`bash
docker compose down -v
\`\`\`

## Verification

The visit counter increments. After restarting the web service, the count persists because it is stored in Redis.

## Key concepts

- Services on the same Compose network reach each other by service name (\`redis://cache:6379\`)
- \`build: .\` — Compose builds the image from the local Dockerfile
- \`--build\` — forces Compose to rebuild images before starting
- Redis data is persisted in a named volume so it survives container restarts`,
        hints: [
          {
            hint: "In the \`app.js\` file, the Redis URL is \`redis://cache:6379\` — notice \`cache\` is the service name from the Compose file. Docker Compose automatically sets up DNS so services can find each other by name.",
          },
          {
            hint: "If the web service starts before Redis is ready, you may see a connection error. Add a retry loop to your application, or use a \`healthcheck\` on the Redis service with \`condition: service_healthy\` in \`depends_on\`.",
          },
          {
            hint: "\`docker compose up --build\` rebuilds images even if they already exist. Use this whenever you change \`app.js\` or \`Dockerfile\` — otherwise Compose will run the old image.",
          },
        ],
      },
      {
        title: "Implement a Health Check",
        description:
          "Add health checks to your services so Compose and orchestrators know when a container is genuinely ready.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["docker-compose", "healthcheck", "reliability"],
        content: `## Overview

\`depends_on\` controls start order but does not check whether a service is actually ready to accept connections. A health check runs a command inside the container on a schedule and marks the container as \`healthy\` or \`unhealthy\`. Other services can then wait for \`healthy\` status rather than just container start.

## Your task

**1. Write a Compose file with health checks**

\`\`\`yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 5s
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d myapp"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

**2. Start and watch health status**

\`\`\`bash
docker compose up -d
docker compose ps
\`\`\`

Watch the health column. Initially you may see \`(health: starting)\`. Wait until it shows \`(healthy)\`.

**3. Monitor health in real time**

\`\`\`bash
watch docker compose ps
\`\`\`

Press \`Ctrl+C\` when both services are healthy.

**4. Inspect a health check result**

\`\`\`bash
docker inspect compose-demo-db-1 --format '{{json .State.Health}}' | python3 -m json.tool
\`\`\`

This shows the last few health check results, timestamps, and output.

**5. Clean up**

\`\`\`bash
docker compose down -v
\`\`\`

## Verification

\`docker compose ps\` shows both containers as \`healthy\`. The \`web\` service only starts after \`db\` reports healthy.

## Key concepts

- \`healthcheck.test\` — the command to run. Use \`CMD\` for an exec (no shell) or \`CMD-SHELL\` for a shell command
- \`interval\` — how often to run the check
- \`start_period\` — grace period before the first check; the container is not marked unhealthy during this time
- \`condition: service_healthy\` — tells Compose to wait for the health check to pass, not just the container to start`,
        hints: [
          {
            hint: "\`pg_isready\` is a PostgreSQL utility that returns 0 when the database is accepting connections. It is available inside any official Postgres image — no need to install it.",
          },
          {
            hint: "The \`start_period\` option is crucial for slow-starting services. Without it, health checks begin immediately and the container may be marked unhealthy before it has had time to initialise.",
          },
          {
            hint: "If you cannot get into the container to test the health check command manually: \`docker compose exec db pg_isready -U admin -d myapp\`. If this returns \"accepting connections\", the command is correct.",
          },
        ],
      },
      {
        title: "Override Configuration for Different Environments",
        description:
          "Use docker-compose.override.yml to maintain separate configurations for development and production without duplicating your base Compose file.",
        difficulty: "advanced",
        xpReward: 125,
        tags: ["docker-compose", "override", "environments"],
        content: `## Overview

You want your development environment to have hot-reloading and debug settings, while production should be optimised and secure. Docker Compose's override system lets you keep a shared base file and layer environment-specific additions on top.

## Your task

**1. Create the base Compose file**

\`docker-compose.yml\` (shared across all environments):

\`\`\`yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

**2. Create the development override**

\`docker-compose.override.yml\` (automatically loaded by Compose in development):

\`\`\`yaml
services:
  web:
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NGINX_DEBUG=true

  db:
    ports:
      - "5432:5432"
\`\`\`

By default, \`docker compose up\` merges \`docker-compose.yml\` and \`docker-compose.override.yml\` automatically.

**3. Create the production override**

\`docker-compose.prod.yml\`:

\`\`\`yaml
services:
  web:
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    restart: always
\`\`\`

**4. Test development mode**

\`\`\`bash
mkdir html && echo "<h1>Dev version</h1>" > html/index.html
docker compose up -d
curl http://localhost:8080
\`\`\`

**5. Test production mode**

\`\`\`bash
docker compose down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose ps
\`\`\`

Notice there is no port \`8080\` mapping in production (only port \`80\`), and the database port is not published.

\`\`\`bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
\`\`\`

## Verification

Development mode mounts your local \`html\` directory and publishes port 8080. Production mode does not publish the database port and has restart policies set.

## Key concepts

- \`docker-compose.override.yml\` is merged automatically by Compose; no flags needed
- \`-f file1 -f file2\` — explicitly specify which files to merge (last file wins for conflicts)
- Override files are additive — they do not replace the base, they layer on top
- Never publish database ports in production; only internal services should reach the DB`,
        hints: [
          {
            hint: "Compose merges files by merging maps (dictionaries) recursively and concatenating lists. A service in an override file adds to or replaces fields in the base service — it does not replace the entire service definition.",
          },
          {
            hint: "In CI/CD, always specify files explicitly with \`-f\` even if using the default override: \`docker compose -f docker-compose.yml -f docker-compose.override.yml up\`. This makes the intent clear and prevents surprises.",
          },
          {
            hint: "You can see the final merged configuration for any combination of files with \`docker compose -f docker-compose.yml -f docker-compose.prod.yml config\`.",
          },
        ],
      },
      {
        title: "Build and Push Images with Compose",
        description:
          "Use Docker Compose to build multiple service images and push them to a registry as part of a release workflow.",
        difficulty: "advanced",
        xpReward: 125,
        tags: ["docker-compose", "build", "registry", "ci"],
        content: `## Overview

In a real project, your CI/CD pipeline builds all service images, tags them with the commit SHA or version, and pushes them to a registry. Docker Compose can handle the build and push steps for all services in one command.

## Your task

**1. Create a two-service project**

\`app.js\`:

\`\`\`js
const http = require('http');
http.createServer((req, res) => res.end('Hello from app\\n')).listen(3000);
\`\`\`

\`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY app.js .
CMD ["node", "app.js"]
\`\`\`

**2. Write the Compose file with image tags**

\`\`\`yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: YOUR_USERNAME/compose-app:latest

  proxy:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - app
\`\`\`

Replace \`YOUR_USERNAME\` with your Docker Hub username.

**3. Build all services**

\`\`\`bash
docker compose build
\`\`\`

Compose builds every service that has a \`build\` section. Services using only \`image:\` are not built — they are pulled.

**4. Build with a build argument**

Update the Compose file:

\`\`\`yaml
services:
  app:
    build:
      context: .
      args:
        APP_VERSION: "1.2.0"
    image: YOUR_USERNAME/compose-app:1.2.0
\`\`\`

And update the Dockerfile to use it:

\`\`\`dockerfile
FROM node:20-alpine
ARG APP_VERSION=dev
ENV APP_VERSION=\${APP_VERSION}
WORKDIR /app
COPY app.js .
CMD ["node", "-e", "console.log('Version:', process.env.APP_VERSION); require('./app.js')"]
\`\`\`

\`\`\`bash
docker compose build
\`\`\`

**5. Push all built images**

\`\`\`bash
docker compose push app
\`\`\`

This pushes only the \`app\` service (which has a custom image tag). You must be logged into Docker Hub first.

## Verification

\`docker images\` shows \`YOUR_USERNAME/compose-app:1.2.0\`. \`docker compose push app\` uploads the image to Docker Hub.

## Key concepts

- \`build.args\` — pass build-time arguments to the Dockerfile (\`ARG\` instruction)
- \`image:\` on a service with \`build:\` controls what the built image is tagged as
- \`docker compose build\` — builds all services with a \`build\` section
- \`docker compose push\` — pushes all services with an \`image:\` tag to the registry`,
        hints: [
          {
            hint: "Build arguments (\`ARG\`) are only available during the build process. To make a build argument available at runtime, copy it into an \`ENV\` variable: \`ENV APP_VERSION=\${APP_VERSION}\`.",
          },
          {
            hint: "In CI, use the commit SHA as the image tag for traceability: \`image: myapp:\${GIT_SHA}\`. Many CI systems provide \`GIT_SHA\` or similar as an environment variable.",
          },
          {
            hint: "\`docker compose push\` without arguments pushes all services that have an \`image:\` field. Specify a service name to push only that service: \`docker compose push app\`.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to Docker Compose",
        summary:
          "Learn what Docker Compose is, how it simplifies multi-container setups, and when to use it.",
        readingMinutes: 5,
        tags: ["docker-compose", "basics", "yaml"],
        content: `## What is Docker Compose?

Docker Compose is a tool for defining and running multi-container applications. Instead of running several \`docker run\` commands with various flags and hoping you remember every option, you describe your entire application in a single YAML file called \`docker-compose.yml\`.

## The problem it solves

A typical web application has at least three components: a web server, an application server, and a database. Running all three manually looks like this:

\`\`\`bash
docker network create myapp-net

docker run -d --name db \\
  --network myapp-net \\
  -e POSTGRES_PASSWORD=secret \\
  -v db-data:/var/lib/postgresql/data \\
  postgres:16

docker run -d --name api \\
  --network myapp-net \\
  -e DATABASE_URL=postgres://postgres:secret@db/myapp \\
  -p 3000:3000 \\
  myapp-api:latest

docker run -d --name web \\
  --network myapp-net \\
  -p 8080:80 \\
  nginx:alpine
\`\`\`

With Compose, all of that becomes:

\`\`\`bash
docker compose up -d
\`\`\`

## The Compose file structure

\`\`\`yaml
services:        # define your containers here
  web:
    image: nginx:alpine
    ports:
      - "8080:80"

  api:
    build: ./api
    environment:
      DATABASE_URL: postgres://postgres:secret@db/myapp

  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:         # named volumes
  db-data:

networks:        # optional custom networks (Compose creates one by default)
\`\`\`

## Essential Compose commands

| Command | What it does |
|---|---|
| \`docker compose up\` | Create and start all services |
| \`docker compose up -d\` | Start in the background |
| \`docker compose down\` | Stop and remove containers |
| \`docker compose down -v\` | Also remove volumes |
| \`docker compose ps\` | List running services |
| \`docker compose logs -f\` | Follow logs from all services |
| \`docker compose exec db bash\` | Open a shell in a running service |
| \`docker compose build\` | Build service images |
| \`docker compose restart web\` | Restart one service |

## When to use Compose

- **Local development** — define the full stack so any developer can run it with one command
- **Integration testing** — spin up the whole application in CI for end-to-end tests
- **Simple production deployments** — suitable for single-machine deployments; for multi-machine, look at Kubernetes

## Compose is not Kubernetes

Compose runs on a single machine. It has no built-in high availability, rolling updates, or automatic rescheduling. For production at scale, Kubernetes handles those concerns. Think of Compose as the training wheels that teaches you multi-container thinking before moving to orchestration.`,
      },
      {
        title: "The Compose File Reference",
        summary:
          "A practical guide to the most important fields in a docker-compose.yml, with examples for each.",
        readingMinutes: 8,
        tags: ["docker-compose", "yaml", "reference", "configuration"],
        content: `## Top-level sections

A Compose file has three top-level sections:

\`\`\`yaml
services: { }   # required — defines your containers
volumes:  { }   # optional — declares named volumes
networks: { }   # optional — declares custom networks
\`\`\`

## services — the most important section

Each key under \`services\` becomes a container.

### image

Use a pre-built image from a registry:

\`\`\`yaml
services:
  web:
    image: nginx:1.25-alpine
\`\`\`

### build

Build an image from a Dockerfile:

\`\`\`yaml
services:
  api:
    build:
      context: ./api        # directory containing the Dockerfile
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
\`\`\`

### ports

Map host ports to container ports:

\`\`\`yaml
ports:
  - "8080:80"      # host:container
  - "127.0.0.1:5432:5432"  # bind only on localhost
\`\`\`

### environment

Set environment variables:

\`\`\`yaml
environment:
  DATABASE_URL: postgres://admin:secret@db/myapp
  LOG_LEVEL: info
\`\`\`

Or reference the environment of the shell running Compose:

\`\`\`yaml
environment:
  - DATABASE_URL   # takes the value from the shell's DATABASE_URL
\`\`\`

### env_file

Load variables from a file:

\`\`\`yaml
env_file:
  - .env
  - .env.local
\`\`\`

### volumes

Mount volumes or bind mounts:

\`\`\`yaml
volumes:
  - db-data:/var/lib/postgresql/data   # named volume
  - ./src:/app/src                     # bind mount
  - /etc/ssl/certs:/etc/ssl/certs:ro   # read-only bind mount
\`\`\`

### depends_on

Control start order and optionally wait for health checks:

\`\`\`yaml
depends_on:
  db:
    condition: service_healthy   # wait for health check
  redis:
    condition: service_started   # just wait for container start (default)
\`\`\`

### restart

Automatically restart a container if it exits:

\`\`\`yaml
restart: always          # always restart
restart: unless-stopped  # restart unless explicitly stopped
restart: on-failure      # only restart on non-zero exit codes
\`\`\`

### healthcheck

Check if a service is ready:

\`\`\`yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "admin"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s
\`\`\`

### command and entrypoint

Override the default command from the image:

\`\`\`yaml
command: ["node", "server.js"]
entrypoint: ["/docker-entrypoint.sh"]
\`\`\`

### networks

Connect a service to specific networks:

\`\`\`yaml
services:
  api:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend

networks:
  frontend:
  backend:
\`\`\`

## volumes — named volume declarations

Named volumes must be declared at the top level:

\`\`\`yaml
volumes:
  db-data:               # Docker manages this
  uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/uploads
\`\`\`

## Summary

The Compose file is a declarative description of your application. The \`services\` section is the heart of it. Master the fields covered here and you can describe virtually any multi-container application.`,
      },
      {
        title: "Service Dependencies and Startup Order",
        summary:
          "Understand how depends_on, health checks, and restart policies work together to create reliable multi-container startups.",
        readingMinutes: 6,
        tags: ["docker-compose", "depends-on", "healthcheck", "startup"],
        content: `## The startup order problem

When you run \`docker compose up\`, Compose starts all services simultaneously. This causes a common problem: your application server starts, immediately tries to connect to the database, and crashes — because Postgres is still initialising.

There are three tools to address this:

1. \`depends_on\` — controls start order
2. \`healthcheck\` — defines what "ready" means
3. \`restart\` — handles failures by retrying

## depends_on with conditions

Basic \`depends_on\` only waits for the container to start, not for the application inside it to be ready:

\`\`\`yaml
depends_on:
  - db   # waits for the db container to start, nothing more
\`\`\`

The safer form waits for the health check to pass:

\`\`\`yaml
depends_on:
  db:
    condition: service_healthy
\`\`\`

This requires the \`db\` service to have a \`healthcheck\` defined.

## Defining a health check

\`\`\`yaml
db:
  image: postgres:16-alpine
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
    interval: 5s
    timeout: 3s
    retries: 5
    start_period: 10s
\`\`\`

- \`interval\` — run the check every 5 seconds
- \`timeout\` — if the check takes more than 3 seconds, consider it failed
- \`retries\` — mark unhealthy after 5 consecutive failures
- \`start_period\` — do not count failures during the first 10 seconds (grace period)

## The restart policy as a fallback

Even with health checks, your application code should handle connection failures gracefully. Use \`restart: on-failure\` so that if the app crashes before the DB is ready, Compose will restart it:

\`\`\`yaml
services:
  app:
    image: my-app
    restart: on-failure
    depends_on:
      db:
        condition: service_healthy
\`\`\`

## Dependency chains

Dependencies can chain: if \`web\` depends on \`api\` which depends on \`db\`, Compose resolves the full chain automatically.

\`\`\`yaml
services:
  web:
    depends_on:
      api:
        condition: service_healthy
  api:
    depends_on:
      db:
        condition: service_healthy
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 5s
      retries: 5
\`\`\`

Startup sequence: \`db\` starts → health check passes → \`api\` starts → health check passes → \`web\` starts.

## What to avoid

- Do not rely solely on \`depends_on: service_started\` for databases. Databases always need time to initialise, and \`service_started\` does not wait for that.
- Do not write application code that fails permanently on first connection error. Use a retry loop with exponential backoff.

## Summary

Use \`depends_on\` with \`condition: service_healthy\` to ensure services start in the correct order. Define \`healthcheck\` on every service that other services depend on. Use \`restart: on-failure\` as a safety net for race conditions that slip through.`,
      },
    ],
  },

  // ──────────────────────────────────────────────────── GitHub Actions ──────
  {
    slug: "github-actions",
    title: "GitHub Actions",
    description:
      "Automate your builds, tests, and deployments directly from your GitHub repository using workflow files.",
    icon: "workflow",
    category: "ci_cd",
    estimatedHours: 6,
    isUnlocked: false,
    sortOrder: 3,
    challenges: [
      {
        title: "Run a Workflow on Push",
        description:
          "Create your first GitHub Actions workflow that triggers automatically when code is pushed to the main branch.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["github-actions", "workflow", "ci", "yaml"],
        content: `## Overview

GitHub Actions runs automated workflows in response to events in your repository — pushes, pull requests, tags, and more. In this challenge you will create a workflow that triggers on every push to the main branch.

## Prerequisites

- A GitHub account and an empty repository
- Basic familiarity with Git (\`git add\`, \`git commit\`, \`git push\`)

## Your task

**1. Create the workflow directory**

In your repository, create the directory structure:

\`\`\`
.github/
  workflows/
    hello.yml
\`\`\`

**2. Write the workflow file**

\`.github/workflows/hello.yml\`:

\`\`\`yaml
name: Hello World

on:
  push:
    branches:
      - main

jobs:
  greet:
    runs-on: ubuntu-latest

    steps:
      - name: Check out the code
        uses: actions/checkout@v4

      - name: Print a greeting
        run: echo "Hello from GitHub Actions!"

      - name: Show the runner OS
        run: |
          echo "Runner OS: \${{ runner.os }}"
          echo "Repository: \${{ github.repository }}"
          echo "Branch: \${{ github.ref_name }}"
          echo "Commit SHA: \${{ github.sha }}"
\`\`\`

**3. Push to GitHub**

\`\`\`bash
git add .github/
git commit -m "Add first GitHub Actions workflow"
git push origin main
\`\`\`

**4. View the workflow run**

Go to your GitHub repository → click the **Actions** tab. You should see your \`Hello World\` workflow running or completed.

Click into the run, then click the \`greet\` job, then expand each step to see its output.

## Verification

The Actions tab shows a green checkmark next to your workflow run. The step outputs show the correct OS, repository name, branch, and commit SHA.

## Key concepts

- \`on: push: branches: [main]\` — the trigger: run when code is pushed to main
- \`jobs\` — a workflow contains one or more jobs
- \`runs-on\` — the type of machine (runner) to use; \`ubuntu-latest\` is the most common
- \`steps\` — a job is a sequence of steps executed in order
- \`uses\` — run a community action (reusable code from GitHub's marketplace)
- \`run\` — execute a shell command
- \`\${{ ... }}\` — GitHub Actions expression syntax for accessing context variables`,
        hints: [
          {
            hint: "The workflow file must be placed in exactly \`.github/workflows/\` (note the leading dot). GitHub only looks in that directory for workflow files.",
          },
          {
            hint: "YAML is whitespace-sensitive. If your workflow does not appear in the Actions tab, check for indentation errors. Each level of nesting should be indented by exactly 2 spaces.",
          },
          {
            hint: "\`actions/checkout@v4\` is an official GitHub Action that clones your repository into the runner's workspace. Without it, subsequent steps that read your code would fail because the files are not there.",
          },
        ],
      },
      {
        title: "Run Tests Automatically in CI",
        description:
          "Set up a workflow that installs dependencies and runs a test suite automatically on every push and pull request.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["github-actions", "testing", "ci", "node"],
        content: `## Overview

The primary purpose of CI is to catch broken code before it merges. A workflow that runs your tests on every push ensures every team member's changes are verified automatically.

## Your task

**1. Create a simple Node.js project**

In your repository, create these files:

\`src/add.js\`:

\`\`\`js
function add(a, b) {
  return a + b;
}
module.exports = { add };
\`\`\`

\`src/add.test.js\`:

\`\`\`js
const { add } = require('./add');

test('adds two numbers correctly', () => {
  expect(add(2, 3)).toBe(5);
});

test('handles negative numbers', () => {
  expect(add(-1, 1)).toBe(0);
});
\`\`\`

\`package.json\`:

\`\`\`json
{
  "name": "ci-demo",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
\`\`\`

**2. Write the CI workflow**

\`.github/workflows/ci.yml\`:

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
\`\`\`

**3. Push and observe**

\`\`\`bash
git add .
git commit -m "Add CI workflow with tests"
git push origin main
\`\`\`

In the Actions tab, you will see **two** parallel jobs — one for Node 18 and one for Node 20. This is the **matrix strategy** in action.

**4. Introduce a failing test**

Edit \`src/add.js\` to return the wrong value, push, and watch the CI turn red. Then fix it and push again to see it turn green.

## Verification

Both matrix jobs pass. The Actions tab shows the CI workflow runs on push and pull request events.

## Key concepts

- \`pull_request\` trigger — run CI on every PR, not just merged code
- \`strategy.matrix\` — run the same job with multiple configurations in parallel
- \`actions/setup-node\` — installs the specified Node.js version and optionally caches \`node_modules\`
- \`npm ci\` — like \`npm install\` but uses the lockfile exactly, faster and more reliable in CI`,
        hints: [
          {
            hint: "Use \`npm ci\` (clean install) instead of \`npm install\` in CI. It installs exactly what is in \`package-lock.json\`, is faster, and fails if the lockfile is out of date.",
          },
          {
            hint: "The \`cache: 'npm'\` option in \`actions/setup-node\` automatically caches your \`node_modules\` between runs. This can cut install time from 30 seconds to 2 seconds on subsequent runs.",
          },
          {
            hint: "Matrix builds multiply your CI minutes: 2 Node versions × 1 OS = 2 parallel jobs. If you add 2 OS values, you get 4 jobs. Keep matrices small on free plans.",
          },
        ],
      },
      {
        title: "Use Secrets in a Workflow",
        description:
          "Store sensitive values as GitHub Secrets and access them securely in your workflow without exposing them in logs.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["github-actions", "secrets", "security"],
        content: `## Overview

Workflows often need access to sensitive values: API keys, deployment tokens, database passwords. GitHub Secrets stores these encrypted values and makes them available to workflows without exposing them in code or logs.

## Your task

**1. Add a secret to your repository**

In your GitHub repository:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Name: \`MY_API_KEY\`
- Value: \`supersecret-demo-key-12345\`

**2. Write a workflow that uses the secret**

\`.github/workflows/secrets-demo.yml\`:

\`\`\`yaml
name: Secrets Demo

on:
  push:
    branches: [main]

jobs:
  use-secret:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Use the secret in a command
        env:
          API_KEY: \${{ secrets.MY_API_KEY }}
        run: |
          echo "Key length: \${#API_KEY}"
          echo "First 3 chars: \${API_KEY:0:3}..."
          echo "Direct print (will be masked): \$API_KEY"

      - name: Show that the secret is masked in logs
        run: echo "This would be masked: \${{ secrets.MY_API_KEY }}"
\`\`\`

**3. Push and observe**

\`\`\`bash
git add .github/workflows/secrets-demo.yml
git commit -m "Add secrets demo workflow"
git push origin main
\`\`\`

Open the workflow run in the Actions tab. Expand the steps. Notice:
- GitHub replaces the raw secret value with \`***\` in the logs
- The length and first 3 characters are visible (these are not the secret itself)

**4. Use environment-level secrets**

For production deployments, use **Environment** secrets which require approval:
- Settings → Environments → New environment → \`production\`
- Add secrets to the environment

Then in your workflow:

\`\`\`yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "Deploying with \${{ secrets.DEPLOY_KEY }}"
\`\`\`

## Verification

The workflow runs successfully. The secret value is masked (\`***\`) in the logs but the length confirms it was received.

## Key concepts

- Secrets are encrypted at rest and only decrypted in the runner's memory
- \`\${{ secrets.NAME }}\` — accesses a secret in an expression
- GitHub automatically masks any secret value that appears in logs
- **Repository secrets** — available to all workflows in the repo
- **Environment secrets** — scoped to a specific environment, can require manual approval`,
        hints: [
          {
            hint: "Never print a secret directly with \`echo \${{ secrets.MY_KEY }}\` thinking it will be safe — even though GitHub masks known secret values, if a secret is split or encoded it may not be detected. Keep secrets in env vars and use them indirectly.",
          },
          {
            hint: "Secrets are not passed to workflows triggered by pull requests from forks by default — this is a security measure. You can change this in repo settings, but be careful: a malicious PR could print your secrets.",
          },
          {
            hint: "You can also set organisation-level secrets that are available to all repositories in your organisation, saving you from duplicating the same secret in every repo.",
          },
        ],
      },
      {
        title: "Build and Push a Docker Image in CI",
        description:
          "Write a workflow that builds your Docker image, tags it with the commit SHA, and pushes it to Docker Hub automatically.",
        difficulty: "advanced",
        xpReward: 125,
        tags: ["github-actions", "docker", "registry", "ci-cd"],
        content: `## Overview

Building and pushing Docker images is one of the most common CI/CD tasks. In this challenge you will automate the entire process: every commit to main builds a fresh image, tags it with the commit SHA, and pushes it to Docker Hub.

## Prerequisites

- A Docker Hub account
- Docker Hub username and access token stored as GitHub Secrets:
  - \`DOCKERHUB_USERNAME\`
  - \`DOCKERHUB_TOKEN\` (create at hub.docker.com → Account Settings → Security → New Access Token)

## Your task

**1. Add a simple app and Dockerfile**

\`app.js\`:

\`\`\`js
const http = require('http');
http.createServer((req, res) => res.end('Hello from CI!\\n')).listen(3000);
console.log('Server running on port 3000');
\`\`\`

\`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY app.js .
EXPOSE 3000
CMD ["node", "app.js"]
\`\`\`

**2. Write the workflow**

\`.github/workflows/docker-publish.yml\`:

\`\`\`yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

env:
  IMAGE_NAME: \${{ secrets.DOCKERHUB_USERNAME }}/ci-demo

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
\`\`\`

**3. Push and verify**

\`\`\`bash
git add .
git commit -m "Add Docker build and push workflow"
git push origin main
\`\`\`

After the workflow completes, visit your Docker Hub profile. You should see \`ci-demo\` with two tags: \`latest\` and \`sha-abc1234\` (where \`abc1234\` is the first 7 characters of your commit SHA).

## Verification

The workflow runs without errors. Docker Hub shows the image with both the \`latest\` and SHA-based tags.

## Key concepts

- \`docker/login-action\` — handles Docker Hub authentication securely
- \`docker/setup-buildx-action\` — enables BuildKit, which supports advanced caching
- \`docker/metadata-action\` — generates tags and labels from Git metadata
- \`docker/build-push-action\` — builds and pushes in one step with built-in caching
- \`cache-from/cache-to: type=gha\` — uses GitHub Actions cache to speed up subsequent builds`,
        hints: [
          {
            hint: "Use a Docker Hub **access token** (not your password) for the \`DOCKERHUB_TOKEN\` secret. Access tokens can be scoped (read-only vs read-write) and revoked individually without changing your password.",
          },
          {
            hint: "The \`cache-from: type=gha\` and \`cache-to: type=gha,mode=max\` options store Docker layer cache in GitHub Actions cache. This can dramatically speed up builds when only your application code changes.",
          },
          {
            hint: "The \`docker/metadata-action\` step has an \`id: meta\` so later steps can reference its outputs with \`steps.meta.outputs.tags\`. This pattern (step ID + outputs) is how you pass data between steps in GitHub Actions.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to GitHub Actions",
        summary:
          "Learn what GitHub Actions is, how workflows are structured, and the key concepts you need to get started.",
        readingMinutes: 6,
        tags: ["github-actions", "ci-cd", "automation"],
        content: `## What is GitHub Actions?

GitHub Actions is GitHub's built-in automation platform. It lets you run code in response to events in your repository — pushes, pull requests, issue comments, scheduled times, and more. You define what runs in YAML files called **workflows**, which live in the \`.github/workflows/\` directory of your repository.

## Why use GitHub Actions?

- **Zero setup** — it is built into GitHub; no separate CI server to configure or pay for (within limits)
- **Event-driven** — trigger on any GitHub event: push, PR, release, issue, cron schedule
- **Large ecosystem** — thousands of community-built **Actions** in the GitHub Marketplace
- **Secure secrets** — encrypted storage for API keys and tokens, masked in logs

## Core concepts

**Workflow** — a configurable automated process. A YAML file in \`.github/workflows/\`. You can have multiple workflows.

**Event** — what triggers the workflow. Examples: \`push\`, \`pull_request\`, \`schedule\`, \`workflow_dispatch\` (manual trigger).

**Job** — a set of steps that run on the same machine. Jobs within a workflow run in parallel by default, but can be made dependent on each other.

**Step** — a single task within a job. Either a shell command (\`run\`) or an Action (\`uses\`).

**Runner** — the machine that executes a job. GitHub provides Ubuntu, Windows, and macOS runners. You can also host your own.

**Action** — a reusable piece of code from the marketplace. \`actions/checkout@v4\` is the most common — it clones your repository.

## A minimal workflow

\`\`\`yaml
name: My Workflow           # display name in the Actions tab

on:
  push:                     # trigger on push
    branches: [main]        # only on the main branch

jobs:
  my-job:                   # job ID (used for dependencies)
    runs-on: ubuntu-latest  # runner type

    steps:
      - uses: actions/checkout@v4     # step 1: clone the repo
      - run: echo "Hello, World!"     # step 2: run a command
\`\`\`

## Context and expressions

GitHub Actions provides **context objects** with information about the run:

- \`github.sha\` — the commit SHA that triggered the workflow
- \`github.ref_name\` — the branch or tag name
- \`github.actor\` — the user who triggered the workflow
- \`runner.os\` — the runner's operating system
- \`secrets.MY_SECRET\` — a secret value

Access these with the expression syntax: \`\${{ github.sha }}\`

## Summary

GitHub Actions workflows are YAML files that define what to run, when to run it, and where to run it. They consist of jobs made of steps, triggered by events, and executed on runners. The marketplace provides thousands of prebuilt Actions to accelerate common tasks.`,
      },
      {
        title: "GitHub Actions Workflow Syntax Reference",
        summary:
          "A practical reference for the most important YAML fields in a GitHub Actions workflow file.",
        readingMinutes: 8,
        tags: ["github-actions", "yaml", "reference", "syntax"],
        content: `## on — triggers

\`\`\`yaml
on:
  push:
    branches: [main, develop]
    paths: ['src/**', '*.json']   # only trigger if these paths changed

  pull_request:
    branches: [main]
    types: [opened, synchronize]

  schedule:
    - cron: '0 8 * * 1-5'        # weekdays at 8am UTC

  workflow_dispatch:              # allows manual trigger from UI
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
\`\`\`

## jobs

\`\`\`yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

  test:
    runs-on: ubuntu-latest
    needs: build                  # run after 'build' job completes

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]          # run after both complete
    if: github.ref == 'refs/heads/main'  # conditional
    environment: production       # requires approval if configured
\`\`\`

## steps

\`\`\`yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
    with:
      fetch-depth: 0              # full history; 0 = all commits

  - name: Run tests
    run: npm test
    working-directory: ./frontend
    env:
      NODE_ENV: test
      DATABASE_URL: \${{ secrets.TEST_DB_URL }}

  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: test-results
      path: ./coverage/
      retention-days: 7

  - name: Set an output
    id: version
    run: echo "tag=v1.2.3" >> \$GITHUB_OUTPUT

  - name: Use the output
    run: echo "Releasing \${{ steps.version.outputs.tag }}"
\`\`\`

## environment variables

Three ways to set environment variables:

\`\`\`yaml
# Workflow-level (available to all jobs)
env:
  NODE_VERSION: '20'

jobs:
  build:
    # Job-level (available to all steps in this job)
    env:
      CI: true

    steps:
      - name: Run
        # Step-level (available only to this step)
        env:
          API_KEY: \${{ secrets.API_KEY }}
        run: npm run deploy
\`\`\`

## matrix strategy

Run the same job with multiple configurations:

\`\`\`yaml
strategy:
  fail-fast: false              # don't cancel other jobs if one fails
  matrix:
    os: [ubuntu-latest, macos-latest]
    node: [18, 20, 22]

runs-on: \${{ matrix.os }}
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: \${{ matrix.node }}
\`\`\`

## Permissions

Restrict what the workflow token can do:

\`\`\`yaml
permissions:
  contents: read
  packages: write
  pull-requests: write
\`\`\`

## Outputs between jobs

\`\`\`yaml
jobs:
  build:
    outputs:
      image-tag: \${{ steps.tag.outputs.value }}
    steps:
      - id: tag
        run: echo "value=sha-\${{ github.sha }}" >> \$GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: echo "Deploying \${{ needs.build.outputs.image-tag }}"
\`\`\`

## Summary

GitHub Actions workflow files are powerful but follow a consistent structure. The \`on\` block defines triggers, \`jobs\` defines what runs, and \`steps\` defines each task within a job. Expressions (\`\${{ }}\`) and the \`env\` hierarchy give you fine-grained control over configuration.`,
      },
      {
        title: "Understanding GitHub Actions Runners",
        summary:
          "Learn what runners are, the difference between GitHub-hosted and self-hosted runners, and how to choose the right one.",
        readingMinutes: 5,
        tags: ["github-actions", "runners", "infrastructure"],
        content: `## What is a runner?

A runner is a server that executes your GitHub Actions jobs. When a workflow is triggered, GitHub looks for an available runner that matches your \`runs-on\` specification, allocates it, and sends the job to it. The runner executes each step in sequence, then reports the result back to GitHub.

## GitHub-hosted runners

GitHub provides managed runners at no extra cost within the free tier limits.

| Label | OS | Notes |
|---|---|---|
| \`ubuntu-latest\` | Ubuntu 24.04 | Most popular; best price/performance |
| \`ubuntu-22.04\` | Ubuntu 22.04 | Use for specific OS version requirements |
| \`macos-latest\` | macOS 14 | Required for iOS/macOS builds; 10x more expensive |
| \`windows-latest\` | Windows Server 2022 | Required for Windows-specific builds |

GitHub-hosted runners come pre-installed with a large suite of tools: Node.js, Python, Java, Docker, AWS CLI, kubectl, and more.

Each job gets a **fresh virtual machine** — no state carries over from previous runs. This guarantees a clean, reproducible environment.

## Free tier limits

GitHub provides free minutes for public repositories (unlimited) and private repositories (2,000 minutes/month on the Free plan). Ubuntu runners consume minutes at 1x rate; macOS runners at 10x; Windows at 2x.

## Self-hosted runners

You can register your own machine as a runner. Reasons to do this:

- **Cost** — you want to run many minutes without paying GitHub's rates
- **Hardware** — you need a GPU, specific CPU, or large RAM
- **Network access** — your CI needs to reach internal services on a private network
- **Compliance** — your code cannot leave your infrastructure

Setting up a self-hosted runner:
1. Go to your repository or organisation settings → Actions → Runners → New self-hosted runner
2. Follow the instructions to download and configure the runner agent
3. Start the agent — it registers with GitHub and begins polling for jobs

Use self-hosted runners in workflows with:

\`\`\`yaml
runs-on: self-hosted
# or with labels:
runs-on: [self-hosted, linux, gpu]
\`\`\`

## Security considerations

- **Never use self-hosted runners with public repositories** unless you fully understand the risk. A malicious pull request could run arbitrary code on your machine.
- Use separate runner pools for production deployments. A compromised CI runner should not be able to deploy to production.
- Regularly update the runner agent and the host OS.

## Large runners (GitHub-hosted)

For teams that need more power, GitHub offers **larger runners** with more CPUs and RAM on paid plans. These can significantly speed up long test suites or heavy build jobs.

## Summary

GitHub-hosted runners are managed VMs that provide a clean environment for each job. They are the right choice for most teams. Self-hosted runners give you control over the hardware, network, and cost — at the expense of setup and maintenance overhead.`,
      },
    ],
  },

  // ───────────────────────────────────────────────────────── GitLab CI ──────
  {
    slug: "gitlab-ci",
    title: "GitLab CI",
    description:
      "Write pipelines that automatically build, test, and deploy your code using GitLab's built-in CI/CD system.",
    icon: "workflow",
    category: "ci_cd",
    estimatedHours: 5,
    isUnlocked: false,
    sortOrder: 4,
    challenges: [
      {
        title: "Write Your First GitLab Pipeline",
        description:
          "Create a .gitlab-ci.yml file that defines a simple pipeline with multiple stages.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["gitlab-ci", "pipeline", "yaml"],
        content: `## Overview

GitLab CI/CD is built directly into GitLab. When you push code, GitLab reads a file called \`.gitlab-ci.yml\` in the root of your repository and executes the pipeline you defined there.

## Prerequisites

- A GitLab account (gitlab.com is free)
- A GitLab repository

## Your task

**1. Create the pipeline file**

In the root of your GitLab repository, create \`.gitlab-ci.yml\`:

\`\`\`yaml
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  script:
    - echo "Building the application..."
    - echo "Build complete."

test-job:
  stage: test
  script:
    - echo "Running tests..."
    - echo "All tests passed."

deploy-job:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - echo "Deployment complete."
  only:
    - main
\`\`\`

**2. Push to GitLab**

\`\`\`bash
git add .gitlab-ci.yml
git commit -m "Add first GitLab CI pipeline"
git push origin main
\`\`\`

**3. View the pipeline**

In your GitLab project, click **CI/CD** → **Pipelines** in the left sidebar. You should see your pipeline running.

Click on the pipeline to see the three stages. Click a job to see its log output.

**4. Add a job with a script failure**

Add this job to your pipeline:

\`\`\`yaml
fail-gracefully:
  stage: test
  script:
    - echo "This will fail"
    - exit 1
  allow_failure: true
\`\`\`

Push again. The job fails (shown with an orange warning) but the pipeline continues because of \`allow_failure: true\`.

## Verification

The pipeline runs three stages in sequence. The \`deploy-job\` only runs on the \`main\` branch.

## Key concepts

- \`.gitlab-ci.yml\` — the pipeline configuration file; must be in the repository root
- \`stages\` — defines the order of execution; jobs in the same stage run in parallel
- \`script\` — a list of shell commands to run
- \`only\` — restrict a job to specific branches or events
- \`allow_failure: true\` — mark a job as optional; the pipeline passes even if this job fails`,
        hints: [
          {
            hint: "Unlike GitHub Actions which has a \`.github/workflows/\` directory, GitLab CI uses a single file at the root of the repository: \`.gitlab-ci.yml\` (note the leading dot).",
          },
          {
            hint: "Jobs in the same stage run in parallel by default. GitLab assigns them to available runners simultaneously. If you need jobs within a stage to run sequentially, use the \`needs\` keyword.",
          },
          {
            hint: "If you don't see your pipeline in the CI/CD tab, check that your file is named exactly \`.gitlab-ci.yml\` and is at the root of the repository (not in a subdirectory).",
          },
        ],
      },
      {
        title: "Run a Job in a Docker Container",
        description:
          "Configure a GitLab CI job to run inside a specific Docker image, giving the job the exact tools it needs.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["gitlab-ci", "docker", "image", "runner"],
        content: `## Overview

By default, GitLab CI runs jobs on a shared runner with a basic environment. But most real CI tasks need specific tools: a particular version of Node.js, Python, or the AWS CLI. The \`image\` keyword tells GitLab to run your job inside a specific Docker container.

## Your task

**1. Create a simple Python script to test**

Create \`greet.py\`:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("DevOps"))
\`\`\`

Create \`test_greet.py\`:

\`\`\`python
from greet import greet

def test_greet():
    assert greet("Alice") == "Hello, Alice!"
    assert greet("World") == "Hello, World!"
\`\`\`

**2. Write a pipeline that runs in a Python Docker image**

\`\`\`yaml
stages:
  - test
  - lint

variables:
  PYTHON_VERSION: "3.12"

test:
  stage: test
  image: python:3.12-slim
  before_script:
    - pip install pytest
  script:
    - pytest test_greet.py -v

lint:
  stage: lint
  image: python:3.12-slim
  before_script:
    - pip install ruff
  script:
    - ruff check greet.py

node-demo:
  stage: test
  image: node:20-alpine
  script:
    - node --version
    - echo "Node is available in this job"
\`\`\`

**3. Push and observe**

\`\`\`bash
git add .
git commit -m "Run jobs in Docker images"
git push origin main
\`\`\`

Notice that the \`test\` and \`node-demo\` jobs run in parallel (same stage) in their respective Docker images.

**4. Use a global image with a per-job override**

Update the pipeline:

\`\`\`yaml
image: python:3.12-slim

stages:
  - test

unit-tests:
  stage: test
  script:
    - pip install pytest && pytest test_greet.py -v

special-job:
  stage: test
  image: alpine:3.19
  script:
    - echo "This job overrides the global image"
    - python --version || echo "Python not available in alpine"
\`\`\`

## Verification

The \`test\` job runs pytest successfully inside the \`python:3.12-slim\` container. The \`node-demo\` job shows the Node version from inside its container.

## Key concepts

- \`image\` — specify the Docker image for a job to run in; applies globally or per-job
- \`before_script\` — commands run before the \`script\`; commonly used to install tools
- \`variables\` — define reusable variables at pipeline, job, or global level
- Jobs use the image as a throw-away container — no state persists between jobs`,
        hints: [
          {
            hint: "A global \`image\` applies to all jobs unless a job specifies its own \`image\`. Job-level \`image\` always overrides the global one.",
          },
          {
            hint: "\`before_script\` runs before the \`script\` and after the repository is cloned. Use it to install dependencies so the installation steps are separated from your actual test commands in the logs.",
          },
          {
            hint: "Use slim or Alpine variants of official Docker images (\`python:3.12-slim\`, \`node:20-alpine\`) to reduce job startup time — smaller images are faster to pull.",
          },
        ],
      },
      {
        title: "Cache Dependencies Between Pipeline Runs",
        description:
          "Configure GitLab CI caching to avoid reinstalling dependencies on every pipeline run, dramatically speeding up your pipelines.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["gitlab-ci", "caching", "performance", "node"],
        content: `## Overview

Without caching, every pipeline run starts from scratch: pulling the Docker image, installing all dependencies, and then finally running tests. For a large Node.js or Python project, installing dependencies can take 2-5 minutes. Caching stores the result and reuses it on the next run.

## Your task

**1. Create a Node.js project**

\`package.json\`:

\`\`\`json
{
  "name": "gitlab-cache-demo",
  "scripts": {
    "test": "jest --coverage",
    "build": "echo 'Build complete'"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
\`\`\`

\`sum.test.js\`:

\`\`\`js
test('addition works', () => expect(1 + 1).toBe(2));
\`\`\`

**2. Pipeline without caching (baseline)**

\`\`\`yaml
stages:
  - install
  - test

install:
  stage: install
  image: node:20-alpine
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

test:
  stage: test
  image: node:20-alpine
  needs: [install]
  script:
    - npm test
\`\`\`

Push this and note how long the install step takes.

**3. Add proper caching**

\`\`\`yaml
stages:
  - test

variables:
  NPM_CACHE_DIR: "\${CI_PROJECT_DIR}/.npm"

.node-defaults: &node-defaults
  image: node:20-alpine
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - .npm/
    policy: pull-push

test:
  <<: *node-defaults
  stage: test
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm test
  coverage: '/Statements\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: clover
        path: coverage/clover.xml
\`\`\`

Push again and compare the install time on the second run.

**4. Understand the cache key**

The cache \`key.files: [package-lock.json]\` means:
- GitLab computes a hash of \`package-lock.json\`
- The cache is identified by that hash
- When you change your dependencies, \`package-lock.json\` changes, the hash changes, and GitLab creates a fresh cache

## Verification

The second and subsequent pipeline runs are noticeably faster because \`node_modules\` is restored from cache. The coverage report appears in the pipeline's coverage widget.

## Key concepts

- \`cache.key.files\` — compute the cache key from file content (invalidates when dependencies change)
- \`cache.policy: pull-push\` — download cache at start, upload updated cache at end
- \`cache.policy: pull\` — download only; use for jobs that should not update the cache
- \`artifacts\` — files passed between jobs; unlike cache, they are guaranteed to be there
- YAML anchors (\`&node-defaults\`, \`<<: *node-defaults\`) — reuse configuration blocks`,
        hints: [
          {
            hint: "Cache and artifacts are different: **cache** is a performance optimisation that may or may not be present; **artifacts** are guaranteed to be passed between jobs. Never use cache as a substitute for artifacts.",
          },
          {
            hint: "Use \`cache.policy: pull\` on jobs that only read from the cache (test, lint) and \`pull-push\` only on the job that installs dependencies. This avoids multiple jobs racing to write the same cache.",
          },
          {
            hint: "YAML anchors (\`&name\` and \`<<: *name\`) are a standard YAML feature that GitLab CI supports for reducing repetition. Define common job properties once and include them in multiple jobs with \`<<: *anchor-name\`.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to GitLab CI/CD",
        summary:
          "Understand what GitLab CI/CD is, how pipelines work, and how they compare to other CI systems.",
        readingMinutes: 6,
        tags: ["gitlab-ci", "ci-cd", "pipelines", "basics"],
        content: `## What is GitLab CI/CD?

GitLab CI/CD is the continuous integration and continuous delivery system built into GitLab. Unlike external CI tools (Jenkins, CircleCI, Travis CI), GitLab CI is not a separate service — it is a first-class feature of the GitLab platform, tightly integrated with merge requests, deployments, environments, and security scanning.

## The pipeline file

Everything in GitLab CI starts with \`.gitlab-ci.yml\` in the root of your repository. When you push code, GitLab reads this file and creates a **pipeline** — a graph of jobs to run.

## Pipeline anatomy

\`\`\`
Pipeline
└── Stage: build
│   ├── Job: compile-backend
│   └── Job: compile-frontend
└── Stage: test
│   ├── Job: unit-tests
│   └── Job: integration-tests
└── Stage: deploy
    └── Job: deploy-production
\`\`\`

- Jobs in the same **stage** run in parallel
- Stages run in sequence — the next stage begins only when all jobs in the current stage pass
- If any job fails, subsequent stages do not run (unless \`allow_failure: true\`)

## Key terms

**Pipeline** — the full set of stages and jobs triggered by a Git event (push, merge request, tag, schedule).

**Stage** — a logical phase of the pipeline (build, test, deploy). Defined with the \`stages:\` key.

**Job** — the basic unit of work. A job runs a \`script\` on a **runner**. Jobs have a name, a stage, and a script.

**Runner** — the agent that executes jobs. GitLab.com provides shared runners. You can also register your own.

**Artifact** — a file produced by a job that is passed to later jobs or downloadable from the UI.

**Cache** — a directory preserved between pipeline runs to avoid reinstalling dependencies.

**Environment** — a deployment target (staging, production) with history, rollback, and approval controls.

## GitLab CI vs GitHub Actions

| Feature | GitLab CI | GitHub Actions |
|---|---|---|
| Config file | \`.gitlab-ci.yml\` (single file) | Multiple files in \`.github/workflows/\` |
| Parallel jobs | Same stage runs in parallel | Explicit \`matrix\` or parallel jobs |
| Reusable components | \`include:\` and YAML anchors | Reusable workflows and composite actions |
| Environments | Built-in with history | Via \`environment:\` keyword |
| Container registry | Built-in GitLab Container Registry | GitHub Container Registry (ghcr.io) |

## When to use GitLab CI

- Your code is hosted on GitLab
- You want CI/CD tightly integrated with merge requests and code review
- You need built-in security scanning (SAST, DAST, dependency scanning) — GitLab includes these
- You run your own GitLab instance on-premise

## Summary

GitLab CI/CD turns your \`.gitlab-ci.yml\` file into an automated pipeline. Stages run in sequence; jobs within a stage run in parallel. Runners execute the jobs in Docker containers or directly on the host. The result is visible in the GitLab UI alongside your code, merge requests, and deployments.`,
      },
      {
        title: "Pipeline Stages and Jobs",
        summary:
          "A deep dive into how GitLab CI stages and jobs work, including parallel execution, dependencies, and conditional logic.",
        readingMinutes: 7,
        tags: ["gitlab-ci", "stages", "jobs", "pipeline"],
        content: `## Stages control the sequence

The \`stages\` list at the top of your \`.gitlab-ci.yml\` defines the pipeline's phases and their order:

\`\`\`yaml
stages:
  - build
  - test
  - security
  - deploy
\`\`\`

Every job must declare which stage it belongs to with \`stage: build\`. If you do not specify a stage for a job, it defaults to \`test\`.

## Jobs in the same stage run in parallel

\`\`\`yaml
stages:
  - test

unit-tests:
  stage: test
  script: npm run test:unit

integration-tests:
  stage: test
  script: npm run test:integration

lint:
  stage: test
  script: npm run lint
\`\`\`

All three jobs start simultaneously. GitLab waits for all of them to complete before moving to the next stage.

## Fine-grained dependencies with needs

The \`needs\` keyword lets you create a DAG (directed acyclic graph) — jobs that depend on specific other jobs rather than entire stages:

\`\`\`yaml
compile:
  stage: build
  script: make build
  artifacts:
    paths: [build/]

test-unit:
  stage: test
  needs: [compile]
  script: make test-unit

test-integration:
  stage: test
  needs: [compile]
  script: make test-integration

deploy:
  stage: deploy
  needs: [test-unit, test-integration]
  script: make deploy
\`\`\`

With \`needs\`, a job starts as soon as its dependencies finish — not when the entire stage finishes. This can dramatically speed up pipelines.

## Conditional execution

**only/except (older syntax):**

\`\`\`yaml
deploy:
  stage: deploy
  script: ./deploy.sh
  only:
    - main
\`\`\`

**rules (recommended):**

\`\`\`yaml
deploy:
  stage: deploy
  script: ./deploy.sh
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: on_success
    - when: never
\`\`\`

Rules are evaluated in order — the first matching rule applies.

## Common rule patterns

\`\`\`yaml
rules:
  # Run only on merge requests
  - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

  # Run on main branch push
  - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'

  # Run on schedule
  - if: '$CI_PIPELINE_SOURCE == "schedule"'

  # Run when specific files change
  - changes:
      - src/**/*
      - tests/**/*
\`\`\`

## Manual jobs

Require a human to click "Play" before a job runs:

\`\`\`yaml
deploy-production:
  stage: deploy
  script: ./deploy.sh production
  when: manual
  environment: production
\`\`\`

## Job templates with extends

Avoid repetition using \`extends\`:

\`\`\`yaml
.base-test:
  image: node:20-alpine
  before_script:
    - npm ci

unit-tests:
  extends: .base-test
  script: npm run test:unit

e2e-tests:
  extends: .base-test
  script: npm run test:e2e
\`\`\`

Job names starting with \`.\` are templates — they are not executed as jobs.

## Summary

Stages define sequence; jobs within a stage run in parallel. Use \`needs\` for fine-grained dependency control. Use \`rules\` to conditionally include or exclude jobs. Use \`when: manual\` for deployment gates that require human approval.`,
      },
      {
        title: "GitLab Runner Types and Configuration",
        summary:
          "Learn the different types of GitLab Runners, how to choose between them, and how to register your own.",
        readingMinutes: 6,
        tags: ["gitlab-ci", "runners", "docker", "infrastructure"],
        content: `## What is a GitLab Runner?

A GitLab Runner is an agent that runs your CI/CD jobs. When GitLab creates a pipeline, it broadcasts the available jobs to connected runners. A runner picks up a job, executes it, and reports the result back to GitLab.

## Executor types

Each runner uses an **executor** — the mechanism it uses to run jobs.

### Shell executor

Runs commands directly on the host machine. Fast but has no isolation — every job can affect the host and see the same files.

\`\`\`toml
[[runners]]
  executor = "shell"
\`\`\`

Use for: simple scripts on a machine you fully control.

### Docker executor

Runs each job inside a fresh Docker container. Provides isolation — no state leaks between jobs. The most popular executor.

\`\`\`toml
[[runners]]
  executor = "docker"
  [runners.docker]
    image = "ubuntu:22.04"
\`\`\`

Use for: almost everything. Supports the \`image:\` keyword in \`.gitlab-ci.yml\`.

### Kubernetes executor

Spins up a new Kubernetes pod for each job. Jobs are isolated at the pod level and can scale horizontally.

Use for: teams already running Kubernetes; high-concurrency CI workloads.

## Shared vs specific runners

**Shared runners** — provided by GitLab.com, available to all projects on the platform. You use these automatically without any setup. GitLab.com shared runners use the Docker executor on Linux (and also on macOS and Windows for an extra cost).

**Specific (project) runners** — you register a runner for a specific project. It only picks up jobs from that project.

**Group runners** — available to all projects in a group. Useful when you want consistent CI infrastructure across a team.

## Registering your own runner

1. Install the GitLab Runner agent on your machine:

\`\`\`bash
# Debian/Ubuntu
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner
\`\`\`

2. Get the registration token from: Your Project → Settings → CI/CD → Runners

3. Register the runner:

\`\`\`bash
sudo gitlab-runner register \\
  --url https://gitlab.com \\
  --token YOUR_TOKEN \\
  --executor docker \\
  --docker-image alpine:latest \\
  --description "My Runner"
\`\`\`

4. Start the runner:

\`\`\`bash
sudo gitlab-runner start
\`\`\`

## Tags

Runners can have **tags**, and jobs can require specific tags:

\`\`\`yaml
deploy-job:
  tags:
    - deploy
    - linux
\`\`\`

Only runners with both the \`deploy\` and \`linux\` tags will pick up this job. Use tags to route jobs to runners with specific capabilities (GPUs, large RAM, specific OS).

## Concurrent jobs

A runner can run multiple jobs simultaneously:

\`\`\`toml
concurrent = 4  # run up to 4 jobs at the same time
\`\`\`

## Security note

Self-hosted runners run code from your repositories. For public repositories, anyone who can open a merge request can run code on your runner. Restrict self-hosted runners to protected branches or use them only for trusted projects.

## Summary

Runners are agents that execute jobs. GitLab.com's shared runners work immediately — no setup needed. Register your own runner when you need specific hardware, network access, or to reduce costs. The Docker executor is the most common choice because it provides job isolation.`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── AWS ──────────
  {
    slug: "aws",
    title: "Amazon Web Services",
    description:
      "Learn to provision and manage cloud infrastructure on AWS — the world's leading cloud platform.",
    icon: "cloud",
    category: "cloud",
    estimatedHours: 10,
    isUnlocked: false,
    sortOrder: 5,
    challenges: [
      {
        title: "Launch an EC2 Instance",
        description:
          "Use the AWS Management Console to launch a virtual machine on EC2 and understand the core configuration options.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["aws", "ec2", "compute", "console"],
        content: `## Overview

Amazon EC2 (Elastic Compute Cloud) is AWS's virtual machine service. You create an EC2 instance by choosing an operating system (AMI), a hardware configuration (instance type), and network settings. Within minutes you have a running virtual server in the cloud.

## Prerequisites

- An AWS account (free tier is sufficient)
- Logged into the AWS Management Console at console.aws.amazon.com

## Your task

**1. Navigate to EC2**

In the AWS Console, search for "EC2" in the top search bar and click the EC2 service.

**2. Launch an instance**

Click **Launch instance** (the orange button).

Fill in the configuration:

- **Name**: \`my-first-server\`
- **AMI**: Amazon Linux 2023 (free tier eligible)
- **Instance type**: t2.micro or t3.micro (free tier eligible)
- **Key pair**: Click "Create new key pair", name it \`my-key\`, and download the \`.pem\` file. Store it safely — you cannot download it again.
- **Network settings**: Allow SSH traffic from "My IP" (not 0.0.0.0/0 — that exposes SSH to the whole internet)
- **Storage**: Keep the default 8 GiB gp3 volume

Click **Launch instance**.

**3. Monitor the instance**

In the EC2 console, click **Instances** in the left sidebar. Find your instance — it will show **Initializing** then change to **Running** within about 60 seconds.

Note the **Public IPv4 address** shown in the instance details.

**4. Understand what was created**

Your EC2 instance is associated with several AWS resources created automatically:

- **Security group** — a firewall that controls inbound/outbound traffic
- **VPC** — the virtual network your instance lives in
- **Subnet** — a segment of the VPC in a specific Availability Zone
- **Elastic IP** (not assigned) — a permanent IP address you can optionally attach

**5. Stop the instance (important — saves money)**

Select your instance → **Instance state** → **Stop instance**. A stopped instance does not charge for compute time (but does charge for the attached storage).

## Verification

The instance appears in the EC2 console with status **Running** and has a public IPv4 address.

## Key concepts

- **AMI (Amazon Machine Image)** — a template containing the OS and software for the instance
- **Instance type** — determines the CPU, memory, and network capacity (t2.micro = 1 vCPU, 1 GB RAM)
- **Key pair** — an SSH key pair; you keep the private \`.pem\` file, AWS stores the public key
- **Security group** — a stateful firewall attached to an instance; controls allowed traffic
- **Stop vs Terminate** — stopping saves the disk but you can restart; terminating deletes everything`,
        hints: [
          {
            hint: "Choose the region closest to you (shown in the top-right corner of the console). All resources you create exist in the selected region — make sure you're consistent.",
          },
          {
            hint: "t2.micro is free tier eligible for the first 750 hours per month. If you leave an instance running and forget about it, it will start incurring charges after the free tier expires. Always stop or terminate instances when not in use.",
          },
          {
            hint: "Store your \`.pem\` key file in a secure location like \`~/.ssh/\`. Set the correct permissions: \`chmod 400 my-key.pem\`. SSH will refuse to use a key file with too-open permissions.",
          },
        ],
      },
      {
        title: "Connect to EC2 via SSH",
        description:
          "Use your key pair to connect to a running EC2 instance over SSH and explore the server environment.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["aws", "ec2", "ssh", "terminal"],
        content: `## Overview

Once an EC2 instance is running, you connect to it using SSH — the same secure shell protocol used to connect to any Linux server. AWS uses key pairs instead of passwords for authentication.

## Prerequisites

- A running EC2 instance (from the previous challenge)
- Your \`.pem\` private key file
- The instance's public IP address

## Your task

**1. Find your instance's public IP**

In the EC2 console → Instances → click your instance → copy the **Public IPv4 address**.

**2. Ensure SSH is allowed in the security group**

Click **Security** tab on your instance → click the security group name → check that there is an inbound rule for port 22 (SSH) from your IP.

If not, add it:
- Click **Edit inbound rules**
- Add rule: Type = SSH, Source = My IP
- Save

**3. Set the key file permissions**

On Mac/Linux:

\`\`\`bash
chmod 400 ~/Downloads/my-key.pem
\`\`\`

On Windows (PowerShell):

\`\`\`powershell
icacls my-key.pem /inheritance:r /grant:r "\${env:USERNAME}:(R)"
\`\`\`

**4. Connect via SSH**

\`\`\`bash
ssh -i ~/Downloads/my-key.pem ec2-user@YOUR_PUBLIC_IP
\`\`\`

Replace \`YOUR_PUBLIC_IP\` with your instance's public IP. The default username for Amazon Linux is \`ec2-user\`. For Ubuntu AMIs it is \`ubuntu\`.

Type \`yes\` when asked to confirm the host fingerprint.

**5. Explore the server**

Once connected:

\`\`\`bash
whoami
uname -a
df -h
free -h
curl http://169.254.169.254/latest/meta-data/instance-type
curl http://169.254.169.254/latest/meta-data/public-ipv4
\`\`\`

The \`169.254.169.254\` IP is the **instance metadata service** — a special endpoint available from inside any EC2 instance that returns information about the instance itself.

**6. Install a package**

\`\`\`bash
sudo dnf update -y
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl status nginx
\`\`\`

**7. Disconnect**

\`\`\`bash
exit
\`\`\`

Stop the instance in the console when you are done.

## Verification

You successfully SSH into the instance, run commands, and see the server's metadata. Nginx is installed and running.

## Key concepts

- \`ssh -i key.pem user@ip\` — connect using a private key file
- Default usernames: \`ec2-user\` (Amazon Linux), \`ubuntu\` (Ubuntu), \`admin\` (Debian)
- **Instance metadata service** — \`http://169.254.169.254/latest/meta-data/\` — accessible only from inside the instance
- \`chmod 400\` — read-only for the owner; SSH requires this to be set on your key file`,
        hints: [
          {
            hint: "If you get \`Connection timed out\` when trying to SSH, the most common causes are: (1) the instance is not running, (2) port 22 is not open in the security group, or (3) you're connecting to the wrong IP address.",
          },
          {
            hint: "If you get \`WARNING: UNPROTECTED PRIVATE KEY FILE!\`, run \`chmod 400 my-key.pem\` to fix the file permissions. SSH requires that private keys are not readable by other users.",
          },
          {
            hint: "The instance metadata service at \`169.254.169.254\` is a link-local address only accessible from inside the instance. It is extremely useful in scripts to discover the instance's own configuration without hardcoding it.",
          },
        ],
      },
      {
        title: "Create and Configure an S3 Bucket",
        description:
          "Create an S3 bucket, upload files to it, and configure access control and lifecycle policies.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["aws", "s3", "storage", "object-storage"],
        content: `## Overview

Amazon S3 (Simple Storage Service) is object storage — store any file (object) in a flat namespace (bucket). S3 is infinitely scalable, highly durable (99.999999999% — eleven 9s), and the foundation of many AWS architectures: backups, static websites, data lakes, CI/CD artifact storage.

## Your task

**1. Create a bucket**

In the AWS Console, search for S3 → click **Create bucket**.

Configuration:
- **Bucket name**: \`yourname-devops-demo-2024\` (bucket names must be globally unique across all AWS accounts)
- **Region**: same as your EC2 instance
- **Block Public Access**: keep all options enabled (default — do not change unless you need a public website)
- **Versioning**: Enable (so you can recover deleted or overwritten files)

Click **Create bucket**.

**2. Upload a file via the console**

Click your bucket → **Upload** → **Add files** → select any file from your machine → **Upload**.

**3. Upload via the AWS CLI**

If you have the AWS CLI installed and configured:

\`\`\`bash
# Create a test file
echo "Hello from S3" > hello.txt

# Upload it
aws s3 cp hello.txt s3://yourname-devops-demo-2024/hello.txt

# List bucket contents
aws s3 ls s3://yourname-devops-demo-2024/

# Download it back
aws s3 cp s3://yourname-devops-demo-2024/hello.txt downloaded.txt
cat downloaded.txt
\`\`\`

**4. Explore versioning**

In the console, upload \`hello.txt\` again with different content. Click the file → **Versions** tab. You should see two versions.

**5. Set a lifecycle rule**

In your bucket → **Management** → **Lifecycle rules** → **Create lifecycle rule**:

- Name: \`expire-old-versions\`
- Scope: Apply to all objects
- Lifecycle rule actions: **Permanently delete noncurrent versions of objects**
- Days after objects become noncurrent: 30

This automatically cleans up old file versions after 30 days, saving storage costs.

## Verification

Your bucket exists, files are uploaded, versioning shows multiple file versions, and a lifecycle rule is configured.

## Key concepts

- **Bucket** — a container for objects; globally unique name required
- **Object** — any file stored in S3, identified by a key (the "path")
- **Versioning** — keeps all versions of every object; protects against accidental deletion
- **Lifecycle rules** — automatically transition or delete objects based on age
- **Block Public Access** — account/bucket-level setting to prevent accidental public exposure`,
        hints: [
          {
            hint: "Bucket names must be globally unique across all 300+ million AWS accounts. Use a pattern like \`yourname-project-date\` to avoid conflicts.",
          },
          {
            hint: "S3 is not a filesystem — objects do not have real directories. Slashes in object keys (\`logs/2024/jan/file.txt\`) create a visual folder structure in the console, but they are just part of the key name.",
          },
          {
            hint: "Enabling versioning does not affect existing objects — it only applies to objects uploaded after versioning is enabled. Once enabled, versioning can be suspended but not fully disabled.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to AWS Cloud",
        summary:
          "Understand what AWS is, its global infrastructure, core service categories, and how to get started.",
        readingMinutes: 7,
        tags: ["aws", "cloud", "basics", "infrastructure"],
        content: `## What is AWS?

Amazon Web Services (AWS) is the world's most widely adopted cloud platform, offering over 200 services from data centres across the globe. Instead of buying and maintaining your own servers, you rent computing resources from AWS and pay only for what you use.

## Why cloud infrastructure?

**Traditional approach**: You buy physical servers, rack them in a data centre, configure networking, and manage hardware failures. This takes weeks to months and requires a large upfront investment.

**Cloud approach**: You provision a virtual server in minutes via an API or web console, scale it up or down on demand, and pay by the hour. When a server fails, you replace it with another in seconds.

This is the core value proposition: **speed, scale, and economics**.

## AWS global infrastructure

**Regions** — separate geographic areas (us-east-1, eu-west-2, ap-southeast-1). Each region is independent — a failure in one does not affect others. Choose a region close to your users for lower latency.

**Availability Zones (AZs)** — isolated data centres within a region. Most regions have 3-6 AZs. By spreading resources across AZs, you achieve high availability: if one data centre has a power failure, your application stays up.

**Edge Locations** — 400+ points of presence worldwide used by CloudFront (CDN) to serve content close to users.

## Core service categories

**Compute**
- EC2 — virtual machines
- Lambda — serverless functions (run code without managing servers)
- ECS/EKS — container orchestration

**Storage**
- S3 — object storage (files, backups, static assets)
- EBS — block storage attached to EC2 instances (like a hard drive)
- EFS — shared file system for multiple instances

**Databases**
- RDS — managed relational databases (Postgres, MySQL, Aurora)
- DynamoDB — managed NoSQL database
- ElastiCache — managed Redis/Memcached

**Networking**
- VPC — virtual private cloud (your isolated network)
- Route 53 — DNS and domain management
- CloudFront — content delivery network
- ELB — load balancers

**Identity and Security**
- IAM — identity and access management (users, roles, permissions)
- Secrets Manager — secure storage for secrets and credentials

**DevOps**
- CodePipeline — CI/CD pipelines
- CodeBuild — managed build service
- CloudFormation — infrastructure as code

## The free tier

AWS offers a free tier for new accounts, including 750 hours/month of t2.micro EC2, 5 GB of S3 storage, and many other services — sufficient to complete this curriculum without paying anything.

## The AWS CLI

The AWS CLI lets you interact with all AWS services from your terminal:

\`\`\`bash
# Install
pip install awscli

# Configure with your credentials
aws configure

# Example: list S3 buckets
aws s3 ls

# Example: describe EC2 instances
aws ec2 describe-instances
\`\`\`

## Summary

AWS provides compute, storage, networking, and databases as a service in data centres worldwide. You pay for what you use, provision resources in minutes, and scale on demand. Learning AWS starts with the web console and the CLI — both of which are used throughout this module.`,
      },
      {
        title: "IAM: Identity and Access Management",
        summary:
          "Learn how AWS IAM controls who can do what in your account — the foundation of AWS security.",
        readingMinutes: 8,
        tags: ["aws", "iam", "security", "permissions"],
        content: `## What is IAM?

AWS Identity and Access Management (IAM) controls authentication (who you are) and authorisation (what you can do) for every action in your AWS account. Every API call to AWS — whether from the console, CLI, or SDK — is evaluated against IAM policies.

## The root account

When you create an AWS account, you have a **root user** with unlimited access to everything. This is dangerous for day-to-day use. Best practice: create an IAM admin user immediately, enable MFA on the root account, and lock the root credentials away. Never use root for routine tasks.

## IAM principals

**Users** — represent individual people or applications. A user has credentials (password for console, access keys for API/CLI).

**Groups** — collections of users that share the same permissions. Assign permissions to groups, not individual users. When an employee joins a team, add them to the appropriate group.

**Roles** — an identity with permissions that can be assumed by AWS services, applications, or users from other accounts. Unlike users, roles have no long-term credentials — they issue temporary security tokens. EC2 instances, Lambda functions, and CI/CD pipelines should use roles.

## Policies

A **policy** is a JSON document that defines what actions are allowed or denied on which resources.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
\`\`\`

- \`Effect\`: Allow or Deny
- \`Action\`: the API calls permitted (e.g. \`s3:GetObject\`, \`ec2:*\`)
- \`Resource\`: the specific AWS resource (using ARN format)

**Managed policies** — prebuilt policies maintained by AWS (e.g. \`AmazonS3ReadOnlyAccess\`). Attach these to users, groups, or roles.

**Inline policies** — custom JSON attached directly to a single user, group, or role.

## The principle of least privilege

Grant only the permissions needed for the specific task. If an application only reads from S3, give it \`s3:GetObject\` on the specific bucket — not \`s3:*\` on all buckets.

## Instance roles for EC2

Never put AWS access keys inside an EC2 instance. Instead, create an IAM role with the necessary permissions and attach it to the instance. The instance can then call AWS APIs without any credentials hardcoded:

\`\`\`bash
# From inside an EC2 instance with an attached role:
aws s3 ls  # works, using the role's temporary credentials automatically
\`\`\`

## IAM best practices

1. Enable MFA for the root account and all IAM users
2. Never use root for daily tasks
3. Use roles for EC2, Lambda, and ECS — not access keys
4. Apply least privilege — start restrictive, expand as needed
5. Rotate access keys regularly
6. Use AWS CloudTrail to audit all IAM actions
7. Never commit access keys to version control

## Summary

IAM is the gatekeeper for every AWS API call. Users represent people; roles represent services. Policies define what is allowed. Apply the principle of least privilege: start with no permissions and add only what is needed. Use roles for applications — never hardcode access keys.`,
      },
      {
        title: "VPC and Networking Basics",
        summary:
          "Understand how Virtual Private Clouds, subnets, and routing work to give you a private network in AWS.",
        readingMinutes: 8,
        tags: ["aws", "vpc", "networking", "subnets"],
        content: `## What is a VPC?

A Virtual Private Cloud (VPC) is your own private network within AWS. It is logically isolated from all other AWS customers' networks. You define the IP address range, create subnets, configure routing, and control what can enter and leave.

When you create an AWS account, AWS creates a default VPC in each region with sensible defaults. Most tutorials use the default VPC, but for production you should create your own.

## CIDR blocks

A VPC's IP address range is defined using CIDR notation:

- \`10.0.0.0/16\` — provides 65,536 IP addresses (10.0.0.0 through 10.0.255.255)
- \`10.0.0.0/24\` — provides 256 IP addresses (10.0.0.0 through 10.0.0.255)

The \`/N\` suffix is the prefix length — the larger it is, the fewer addresses.

## Subnets

A subnet is a segment of a VPC's IP range tied to a specific Availability Zone.

**Public subnet** — has a route to the internet via an Internet Gateway. Resources here (like a web server) can be reached from the internet and can reach the internet.

**Private subnet** — no direct route to the internet. Resources here (like a database) are not reachable from outside. They can still reach the internet through a NAT Gateway if needed (for software updates, for example).

A typical three-tier architecture:

\`\`\`
VPC: 10.0.0.0/16
├── Public Subnet A  (10.0.1.0/24)  — Load balancer, bastion host
├── Public Subnet B  (10.0.2.0/24)  — Load balancer (HA)
├── Private Subnet A (10.0.3.0/24)  — App servers
├── Private Subnet B (10.0.4.0/24)  — App servers (HA)
├── Private Subnet C (10.0.5.0/24)  — Database
└── Private Subnet D (10.0.6.0/24)  — Database (HA)
\`\`\`

## Route tables

A route table tells the subnet where to send traffic for each destination:

| Destination | Target |
|---|---|
| 10.0.0.0/16 | local |
| 0.0.0.0/0 | igw-xxx (Internet Gateway) |

The first rule routes traffic within the VPC locally. The second routes all other traffic to the Internet Gateway (making this a public subnet).

## Internet Gateway

An Internet Gateway (IGW) is attached to a VPC and enables communication between resources in the VPC and the internet. A subnet whose route table points to an IGW is called a public subnet.

## NAT Gateway

A NAT Gateway lets resources in a private subnet reach the internet (for downloading packages, calling external APIs) without being reachable from the internet. The NAT Gateway lives in a public subnet and is referenced in the private subnet's route table.

## Security groups vs network ACLs

**Security groups** — stateful firewall attached to individual instances. Rules are evaluated for all traffic to/from the instance. Stateful means return traffic is automatically allowed.

**Network ACLs** — stateless firewall at the subnet level. Rules are evaluated in order. Because they are stateless, you need explicit rules for both inbound and outbound traffic (including return traffic on ephemeral ports).

For most use cases, security groups are sufficient. Network ACLs add an extra layer for compliance requirements.

## Summary

A VPC is your isolated network in AWS. Subnets divide the VPC into public and private segments. Route tables direct traffic. Security groups control what reaches each instance. The combination gives you a secure, scalable network that mirrors what you would build in a physical data centre — but provisioned in minutes.`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────── Terraform ────────
  {
    slug: "terraform",
    title: "Terraform",
    description:
      "Define your infrastructure as code using HashiCorp Terraform and manage it with the same tools you use for software.",
    icon: "server",
    category: "infrastructure",
    estimatedHours: 8,
    isUnlocked: false,
    sortOrder: 6,
    challenges: [
      {
        title: "Write Your First Terraform Configuration",
        description:
          "Install Terraform, write a configuration file, and use it to create a local file — learning the core workflow without needing cloud credentials.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["terraform", "hcl", "basics", "infrastructure-as-code"],
        content: `## Overview

Terraform is an infrastructure-as-code tool that lets you define cloud resources in a declarative language (HCL) and manage their lifecycle — create, update, destroy — through commands. In this challenge you will learn the core Terraform workflow using the \`local\` provider, which creates files on your filesystem — no cloud account needed.

## Prerequisites

- Terraform installed: download from developer.hashicorp.com/terraform/install

## Your task

**1. Verify Terraform is installed**

\`\`\`bash
terraform version
\`\`\`

**2. Create a project directory**

\`\`\`bash
mkdir terraform-demo && cd terraform-demo
\`\`\`

**3. Write your first configuration**

Create \`main.tf\`:

\`\`\`hcl
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "greeting" {
  filename = "\${path.module}/hello.txt"
  content  = "Hello from Terraform!"
}

resource "local_file" "info" {
  filename = "\${path.module}/info.txt"
  content  = "Created by Terraform on this machine."
}
\`\`\`

**4. Initialise the project**

\`\`\`bash
terraform init
\`\`\`

This downloads the \`local\` provider plugin. You will see a \`.terraform\` directory and \`.terraform.lock.hcl\` file created.

**5. Preview the changes**

\`\`\`bash
terraform plan
\`\`\`

Terraform shows what it will do — two files will be created. Nothing has happened yet.

**6. Apply the changes**

\`\`\`bash
terraform apply
\`\`\`

Type \`yes\` when prompted. Terraform creates the files. Check that they exist:

\`\`\`bash
cat hello.txt
cat info.txt
\`\`\`

**7. Inspect the state file**

\`\`\`bash
cat terraform.tfstate
\`\`\`

Terraform tracks what it created in this JSON file. Every subsequent \`plan\` and \`apply\` compares the real world against this state.

**8. Modify and re-apply**

Edit \`main.tf\` — change the \`content\` of \`greeting\` to \`"Updated by Terraform!"\`. Then:

\`\`\`bash
terraform plan
terraform apply
cat hello.txt
\`\`\`

**9. Destroy everything**

\`\`\`bash
terraform destroy
\`\`\`

The files are deleted. The state file is updated to show no resources.

## Verification

After \`apply\`, both files exist on disk. After modifying the content and re-applying, \`hello.txt\` shows the updated text. After \`destroy\`, both files are gone.

## Key concepts

- **HCL (HashiCorp Configuration Language)** — the language used in \`.tf\` files; declarative, not procedural
- \`terraform init\` — download providers and set up the working directory
- \`terraform plan\` — preview changes without applying them
- \`terraform apply\` — make the changes to reach the desired state
- \`terraform destroy\` — remove all resources managed by the configuration
- **State file** — \`terraform.tfstate\` tracks what Terraform has created`,
        hints: [
          {
            hint: "Always run \`terraform plan\` before \`terraform apply\`. The plan shows exactly what will be created, changed, or destroyed — review it carefully before confirming.",
          },
          {
            hint: "The \`terraform.tfstate\` file is critical — it is Terraform's record of what it has created. Never delete or edit it manually. If it is lost, Terraform loses track of existing resources.",
          },
          {
            hint: "Terraform is **declarative**: you describe what you want (two files with specific content), not how to create them. Terraform figures out the steps. This is different from imperative scripting where you write every command.",
          },
        ],
      },
      {
        title: "Use Variables and Outputs",
        description:
          "Make your Terraform configuration reusable by replacing hardcoded values with input variables and expose useful information with outputs.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["terraform", "variables", "outputs", "hcl"],
        content: `## Overview

Hardcoding values in Terraform configurations (server sizes, region names, project names) makes them inflexible and difficult to reuse. Variables let you parameterise configurations so the same code can create different environments with different settings.

## Your task

**1. Define input variables**

Create \`variables.tf\`:

\`\`\`hcl
variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "myapp"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "file_count" {
  description = "Number of files to create"
  type        = number
  default     = 3
}
\`\`\`

**2. Update main.tf to use variables**

\`\`\`hcl
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "config" {
  count    = var.file_count
  filename = "\${path.module}/\${var.project_name}-\${var.environment}-\${count.index}.txt"
  content  = "Project: \${var.project_name}\\nEnvironment: \${var.environment}\\nFile: \${count.index}"
}
\`\`\`

**3. Define outputs**

Create \`outputs.tf\`:

\`\`\`hcl
output "created_files" {
  description = "List of files created by Terraform"
  value       = local_file.config[*].filename
}

output "file_count" {
  description = "Number of files created"
  value       = length(local_file.config)
}
\`\`\`

**4. Apply with defaults**

\`\`\`bash
terraform init
terraform apply
\`\`\`

Three files are created: \`myapp-dev-0.txt\`, \`myapp-dev-1.txt\`, \`myapp-dev-2.txt\`. The outputs print the file list.

**5. Override variables on the command line**

\`\`\`bash
terraform apply -var="environment=production" -var="project_name=payments" -var="file_count=2"
\`\`\`

**6. Use a var file**

Create \`staging.tfvars\`:

\`\`\`hcl
project_name = "platform"
environment  = "staging"
file_count   = 5
\`\`\`

\`\`\`bash
terraform apply -var-file="staging.tfvars"
\`\`\`

**7. View outputs without applying**

\`\`\`bash
terraform output
terraform output created_files
\`\`\`

\`\`\`bash
terraform destroy
\`\`\`

## Verification

Files are created with names derived from variables. Changing variables with \`-var\` or \`-var-file\` produces different file names. \`terraform output\` shows the outputs.

## Key concepts

- \`variable\` block — defines an input with optional type, default, description, and validation
- \`var.name\` — reference a variable's value in configuration
- \`output\` block — exposes values after \`apply\` for use in scripts or by other Terraform modules
- \`count\` — create multiple instances of a resource; \`count.index\` gives the index (0, 1, 2, ...)
- \`.tfvars\` files — store variable values for a specific environment`,
        hints: [
          {
            hint: "Variable values are resolved in this priority order (highest first): command-line \`-var\` flags, \`.auto.tfvars\` files, \`terraform.tfvars\`, environment variables (\`TF_VAR_name\`), defaults in \`variable\` blocks. Understanding this order prevents confusing overrides.",
          },
          {
            hint: "The \`validation\` block in a variable definition lets you enforce constraints at plan time — before any resources are created. Use it to catch configuration errors early.",
          },
          {
            hint: "Never put secrets (database passwords, API keys) in \`.tfvars\` files that are committed to version control. Use environment variables (\`TF_VAR_db_password\`) or a secret manager integration instead.",
          },
        ],
      },
      {
        title: "Store State Remotely in S3",
        description:
          "Move Terraform state from a local file to an S3 backend so your team can collaborate and state is never lost.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["terraform", "state", "s3", "backend", "collaboration"],
        content: `## Overview

Local state (\`terraform.tfstate\`) works fine when you work alone, but breaks down for teams: two people running \`terraform apply\` simultaneously can corrupt state. The solution is a **remote backend** — state stored in a shared location with locking to prevent concurrent modifications. S3 + DynamoDB is the most common setup for AWS users.

## Prerequisites

- AWS CLI configured (\`aws configure\`)
- An AWS account with S3 and DynamoDB permissions

## Your task

**1. Create an S3 bucket for state**

\`\`\`bash
# Replace yourname with something unique
aws s3api create-bucket \\
  --bucket yourname-terraform-state \\
  --region us-east-1

# Enable versioning so you can recover corrupted state
aws s3api put-bucket-versioning \\
  --bucket yourname-terraform-state \\
  --versioning-configuration Status=Enabled

# Block all public access
aws s3api put-public-access-block \\
  --bucket yourname-terraform-state \\
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
\`\`\`

**2. Create a DynamoDB table for state locking**

\`\`\`bash
aws dynamodb create-table \\
  --table-name terraform-state-lock \\
  --attribute-definitions AttributeName=LockID,AttributeType=S \\
  --key-schema AttributeName=LockID,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --region us-east-1
\`\`\`

**3. Configure the backend**

Create a Terraform project with \`backend.tf\`:

\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "yourname-terraform-state"
    key            = "demo/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
\`\`\`

**4. Migrate local state to remote**

If you have existing local state, Terraform can migrate it:

\`\`\`bash
terraform init -migrate-state
\`\`\`

Type \`yes\` when asked to copy existing state to the backend.

**5. Verify state is in S3**

\`\`\`bash
aws s3 ls s3://yourname-terraform-state/demo/
\`\`\`

You should see \`terraform.tfstate\`.

**6. Test locking**

\`\`\`bash
terraform apply
\`\`\`

While apply is running, open a second terminal and try: \`terraform plan\`. It will wait or fail with a lock error — this is the DynamoDB lock working correctly.

\`\`\`bash
terraform destroy
\`\`\`

## Verification

\`aws s3 ls s3://yourname-terraform-state/demo/\` shows the state file. The local \`terraform.tfstate\` file is empty or absent.

## Key concepts

- **Remote backend** — stores state in a shared location (S3, Terraform Cloud, GCS)
- **State locking** — DynamoDB prevents two \`apply\` operations from running simultaneously
- **Encryption** — \`encrypt: true\` uses S3 server-side encryption (SSE)
- **Versioning** on the S3 bucket allows recovery from corrupted state
- \`terraform init -migrate-state\` — migrates existing local state to the new backend`,
        hints: [
          {
            hint: "The DynamoDB table must have a primary key named \`LockID\` of type String (S). This exact name is required — Terraform looks for it specifically.",
          },
          {
            hint: "State bucket names must be globally unique. If the bucket creation fails with a name conflict, add more unique characters. A good pattern: \`yourname-terraform-state-YYYY\`.",
          },
          {
            hint: "After configuring a remote backend, the local \`terraform.tfstate\` file becomes unused. You can delete it — but always verify the state was successfully migrated to S3 first with \`terraform state list\`.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to Terraform",
        summary:
          "Learn what Terraform is, why infrastructure as code matters, and how Terraform's core concepts fit together.",
        readingMinutes: 7,
        tags: ["terraform", "infrastructure-as-code", "hcl", "basics"],
        content: `## What is Terraform?

Terraform is an open-source infrastructure-as-code (IaC) tool created by HashiCorp. It lets you define cloud infrastructure — virtual machines, databases, networks, DNS records, and more — in configuration files, and then manage the full lifecycle of that infrastructure through commands.

## Why infrastructure as code?

Before IaC, infrastructure was configured by clicking through web consoles or running manual shell commands. This approach has several problems:

- **Not reproducible** — it is hard to recreate an environment exactly
- **Not auditable** — you cannot easily see what changed and when
- **Error-prone** — manual steps lead to drift between environments (dev looks different from production)
- **Not collaborative** — two people cannot safely modify the same infrastructure simultaneously

IaC treats your infrastructure like software: the configuration is a text file that lives in version control, can be reviewed in pull requests, and can be applied automatically in a CI/CD pipeline.

## The Terraform model

Terraform uses a **declarative** approach: you describe what you want (a VPC, two EC2 instances, an RDS database), and Terraform figures out how to create, update, or delete resources to match that description.

This is different from **imperative** approaches (like Ansible or shell scripts) where you write every step.

## Core concepts

**Configuration** — one or more \`.tf\` files that describe your desired infrastructure using HCL.

**Provider** — a plugin that knows how to talk to a specific platform (AWS, GCP, Azure, Kubernetes, Cloudflare). Providers expose **resources** and **data sources**.

**Resource** — a single piece of infrastructure (an EC2 instance, an S3 bucket, a DNS record). Defined with the \`resource\` block.

**Data source** — reads existing infrastructure without managing it. Useful for referencing resources created outside of Terraform.

**State** — Terraform's record of what infrastructure it has created. Stored in \`terraform.tfstate\`. This is how Terraform knows what to change when your configuration changes.

**Module** — a reusable package of Terraform configuration. Modules reduce repetition and promote best practices.

## The core workflow

\`\`\`
Write          Plan           Apply
(.tf files) → (preview) → (execute)
\`\`\`

1. **Write** — define resources in \`.tf\` files
2. **\`terraform init\`** — download providers for the configuration
3. **\`terraform plan\`** — compare configuration to current state, show what will change
4. **\`terraform apply\`** — execute the changes
5. **\`terraform destroy\`** — remove all managed resources

## HCL syntax basics

\`\`\`hcl
# Block types: resource, variable, output, data, module, terraform
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = var.environment
  }
}
\`\`\`

Block structure: \`block_type "type" "name" { ... }\`
References: \`resource_type.resource_name.attribute\` (e.g. \`aws_instance.web.public_ip\`)

## Summary

Terraform manages infrastructure as code using a declarative HCL syntax. Providers connect it to cloud platforms. State tracks what exists. The plan/apply workflow gives you a preview before making changes. Infrastructure defined in Terraform is reproducible, reviewable, and safe to automate.`,
      },
      {
        title: "State Management in Terraform",
        summary:
          "Understand what Terraform state is, why it matters, and how to manage it safely for solo and team workflows.",
        readingMinutes: 7,
        tags: ["terraform", "state", "backend", "collaboration"],
        content: `## What is Terraform state?

Terraform state is a record of everything Terraform has created. It is stored in a JSON file called \`terraform.tfstate\`. Every \`terraform apply\` reads this file to understand the current state of your infrastructure, compares it to your configuration, and determines what needs to change.

## Why state is necessary

Without state, Terraform would have no way to know:

- Whether a resource already exists or needs to be created
- Which real-world resource corresponds to which resource in your configuration
- What the current attribute values are (IP address, ARN, ID) of existing resources

State bridges the gap between your configuration (what you want) and reality (what exists).

## What state contains

For each resource, state stores:

- The resource type and name from your configuration
- The provider-assigned ID (e.g. EC2 instance ID: \`i-0123456789abcdef0\`)
- Every attribute of the resource (public IP, tags, security groups, etc.)
- Dependencies between resources

## Sensitive data in state

State often contains sensitive information: database passwords, private keys, connection strings. Treat \`terraform.tfstate\` as a secret:

- Never commit it to version control (add \`*.tfstate\` and \`*.tfstate.backup\` to \`.gitignore\`)
- Enable encryption on your remote backend (S3 SSE, or Terraform Cloud's built-in encryption)

## Local vs remote state

**Local state** — the default. \`terraform.tfstate\` lives on your machine. Problems:
- Lost if the machine fails
- Cannot be shared with teammates
- No locking — two concurrent applies can corrupt state

**Remote state** — stored on a shared backend. Common options:

| Backend | Locking | Notes |
|---|---|---|
| S3 + DynamoDB | Yes (DynamoDB) | Most popular for AWS |
| Terraform Cloud | Yes (built-in) | Managed service with UI |
| GCS | Yes (built-in) | Best for GCP |
| Azure Blob Storage | Yes (built-in) | Best for Azure |

## State locking

When you run \`terraform apply\`, Terraform acquires a **lock** on the state. This prevents another team member from running \`terraform apply\` simultaneously, which would cause state corruption.

With S3 backend, DynamoDB handles the lock: Terraform writes a lock entry to DynamoDB before modifying state and deletes it after. If a process crashes mid-apply, you may need to manually release the lock:

\`\`\`bash
terraform force-unlock LOCK_ID
\`\`\`

## Working with state

\`\`\`bash
# List all resources in state
terraform state list

# Show details of a specific resource
terraform state show aws_instance.web

# Move a resource to a different name (for refactoring)
terraform state mv aws_instance.web aws_instance.api

# Remove a resource from state (but not from reality)
terraform state rm aws_instance.web

# Import existing infrastructure into state
terraform import aws_instance.web i-0123456789abcdef0
\`\`\`

## Workspaces

Workspaces allow multiple state files in the same backend, useful for managing dev/staging/production from the same configuration:

\`\`\`bash
terraform workspace new staging
terraform workspace select staging
terraform apply -var-file="staging.tfvars"
\`\`\`

Each workspace has its own isolated state.

## Summary

Terraform state is the source of truth for what infrastructure exists. Protect it like a secret. Use a remote backend with locking for any team-based workflow. Never edit state manually — use \`terraform state\` subcommands for safe operations.`,
      },
      {
        title: "Providers and Resources",
        summary:
          "Learn how Terraform providers work, how to configure them, and how to write resource blocks to manage real infrastructure.",
        readingMinutes: 7,
        tags: ["terraform", "providers", "resources", "hcl"],
        content: `## Providers

A provider is a plugin that gives Terraform the ability to interact with a specific platform or service. Providers expose two building blocks: **resources** (things you manage) and **data sources** (things you read).

The most common providers:

| Provider | What it manages |
|---|---|
| \`hashicorp/aws\` | All AWS services |
| \`hashicorp/google\` | Google Cloud |
| \`hashicorp/azurerm\` | Microsoft Azure |
| \`hashicorp/kubernetes\` | Kubernetes resources |
| \`hashicorp/helm\` | Helm releases |
| \`cloudflare/cloudflare\` | DNS, WAF, workers |
| \`hashicorp/local\` | Local files and directories |

## Declaring providers

\`\`\`hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"      # >= 5.0.0, < 6.0.0
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
\`\`\`

The \`~>\` operator (pessimistic constraint) means "accept patch and minor updates but not major". This protects against breaking changes.

## Configuring the AWS provider

\`\`\`hcl
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile   # use a named CLI profile

  # Or use environment variables (recommended for CI):
  # AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION
}
\`\`\`

## Resources

A resource block defines a piece of infrastructure to create and manage:

\`\`\`hcl
resource "TYPE" "NAME" {
  # arguments
}
\`\`\`

- **TYPE** — provider_resourcetype (e.g. \`aws_instance\`, \`aws_s3_bucket\`, \`google_compute_instance\`)
- **NAME** — a local label for this resource (only used within Terraform, not the real resource name)

## Referencing resources

Resources expose **attributes** that other resources can reference:

\`\`\`hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id      # reference the VPC's id attribute
  cidr_block = "10.0.1.0/24"
}
\`\`\`

Terraform builds a **dependency graph** from these references. Resources are created in the order required by their dependencies.

## Data sources

Data sources read existing infrastructure (created outside Terraform or by another Terraform configuration):

\`\`\`hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id   # reference data source
  instance_type = "t3.micro"
}
\`\`\`

## Meta-arguments

Every resource supports these regardless of provider:

- \`count\` — create N copies of the resource
- \`for_each\` — create one resource per map key/set item
- \`depends_on\` — explicit dependency when the reference-based graph is insufficient
- \`lifecycle\` — control creation/deletion behaviour

\`\`\`hcl
resource "aws_instance" "workers" {
  count         = 3
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = "worker-\${count.index}"
  }
}
\`\`\`

## Summary

Providers are plugins that connect Terraform to cloud platforms. Declare providers in the \`terraform.required_providers\` block. Resources describe infrastructure to create; data sources read existing infrastructure. References between resources build a dependency graph that Terraform uses to determine creation order.`,
      },
    ],
  },

  // ────────────────────────────────────────────────────── Kubernetes ────────
  {
    slug: "kubernetes",
    title: "Kubernetes",
    description:
      "Learn to deploy, scale, and manage containerised applications across a cluster of machines using the industry-standard orchestration platform.",
    icon: "database",
    category: "orchestration",
    estimatedHours: 12,
    isUnlocked: false,
    sortOrder: 7,
    challenges: [
      {
        title: "Deploy Your First Pod",
        description:
          "Use kubectl to create a Pod in a local Kubernetes cluster and understand the fundamental unit of deployment.",
        difficulty: "beginner",
        xpReward: 75,
        tags: ["kubernetes", "pods", "kubectl", "basics"],
        content: `## Overview

In Kubernetes, a **Pod** is the smallest deployable unit — one or more containers that share a network and storage. In this challenge you will run a local Kubernetes cluster and deploy your first Pod using both a command and a YAML manifest.

## Prerequisites

- Docker Desktop installed (includes Kubernetes) — enable it in Preferences → Kubernetes → Enable Kubernetes
- OR install \`minikube\`: \`brew install minikube && minikube start\`
- \`kubectl\` installed: \`brew install kubectl\` or bundled with Docker Desktop

## Your task

**1. Verify kubectl is connected to your cluster**

\`\`\`bash
kubectl cluster-info
kubectl get nodes
\`\`\`

You should see one or more nodes in \`Ready\` status.

**2. Run a Pod imperatively**

\`\`\`bash
kubectl run nginx-pod --image=nginx:alpine
kubectl get pods
\`\`\`

Watch the pod go from \`ContainerCreating\` to \`Running\`:

\`\`\`bash
kubectl get pods -w
\`\`\`

Press \`Ctrl+C\` to stop watching.

**3. Describe the Pod**

\`\`\`bash
kubectl describe pod nginx-pod
\`\`\`

This shows: the node it is running on, the container image, environment variables, events (useful for debugging).

**4. Get the Pod logs**

\`\`\`bash
kubectl logs nginx-pod
\`\`\`

**5. Execute a command inside the Pod**

\`\`\`bash
kubectl exec -it nginx-pod -- sh
# Inside the pod:
hostname
wget -qO- http://localhost
exit
\`\`\`

**6. Delete the Pod**

\`\`\`bash
kubectl delete pod nginx-pod
kubectl get pods
\`\`\`

**7. Create a Pod using a YAML manifest**

Create \`pod.yaml\`:

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
  labels:
    app: nginx
    version: "1.0"
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      resources:
        requests:
          cpu: "100m"
          memory: "64Mi"
        limits:
          cpu: "200m"
          memory: "128Mi"
\`\`\`

\`\`\`bash
kubectl apply -f pod.yaml
kubectl get pods -l app=nginx
\`\`\`

**8. Clean up**

\`\`\`bash
kubectl delete -f pod.yaml
\`\`\`

## Verification

\`kubectl get pods\` shows the pod in \`Running\` status. You can exec into it and run commands. The YAML-based pod is created successfully.

## Key concepts

- **Pod** — the smallest unit in Kubernetes; one or more containers sharing a network namespace
- \`kubectl run\` — create a pod imperatively (good for testing; not for production)
- \`kubectl apply -f\` — apply a YAML manifest (declarative; the right way for production)
- \`kubectl describe\` — detailed information and event history
- \`kubectl exec -it\` — open a shell inside a running container
- **Resource requests/limits** — tells the scheduler how much CPU/memory the container needs`,
        hints: [
          {
            hint: "If \`kubectl get nodes\` shows no nodes or the node is NotReady, make sure Docker Desktop is running and Kubernetes is enabled in its settings. For Minikube, run \`minikube start\`.",
          },
          {
            hint: "Pods are ephemeral by design — if a pod is killed, it is gone. In real applications, you never create bare pods directly; you use Deployments which ensure the desired number of pods is always running.",
          },
          {
            hint: "The \`-l app=nginx\` flag in \`kubectl get pods -l app=nginx\` filters by label. Labels are key/value pairs attached to resources — they are how Kubernetes connects services, deployments, and pods together.",
          },
        ],
      },
      {
        title: "Create a Deployment and Scale It",
        description:
          "Create a Deployment that manages multiple Pod replicas, scale it up and down, and observe how Kubernetes maintains the desired state.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["kubernetes", "deployment", "scaling", "replicas"],
        content: `## Overview

You should never run bare Pods in production. If a bare Pod crashes, it is gone. A **Deployment** is a higher-level object that manages a set of identical Pods (replicas). If a Pod crashes, the Deployment controller creates a replacement. If you scale down and then scale up, it adjusts the number of Pods to match. This is Kubernetes' core value proposition: **desired state management**.

## Your task

**1. Create a Deployment**

Create \`deployment.yaml\`:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "50m"
              memory: "32Mi"
            limits:
              cpu: "100m"
              memory: "64Mi"
\`\`\`

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get pods
\`\`\`

You should see 3 pods, all in \`Running\` status.

**2. Watch Kubernetes heal a crashed Pod**

Delete one pod (Kubernetes will immediately create a replacement):

\`\`\`bash
POD_NAME=$(kubectl get pods -l app=web-app -o name | head -1)
kubectl delete $POD_NAME
kubectl get pods -w
\`\`\`

Watch as the pod count drops to 2 and then immediately rises back to 3 as Kubernetes creates a replacement.

Press \`Ctrl+C\` when all 3 pods are running again.

**3. Scale the Deployment**

\`\`\`bash
# Scale up to 5 replicas
kubectl scale deployment web-app --replicas=5
kubectl get pods

# Scale down to 1 replica
kubectl scale deployment web-app --replicas=1
kubectl get pods
\`\`\`

**4. Update the image**

Edit \`deployment.yaml\` and change \`image: nginx:alpine\` to \`image: nginx:1.25-alpine\`. Then:

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment web-app
\`\`\`

Kubernetes performs a **rolling update** — gradually replacing old pods with new ones, ensuring the application stays available throughout.

**5. Roll back the update**

\`\`\`bash
kubectl rollout undo deployment web-app
kubectl rollout status deployment web-app
kubectl rollout history deployment web-app
\`\`\`

**6. Clean up**

\`\`\`bash
kubectl delete -f deployment.yaml
\`\`\`

## Verification

Deleting a pod results in immediate replacement. Scaling changes the number of running pods. The rolling update replaces pods gradually. Rollback reverts to the previous version.

## Key concepts

- **Deployment** — manages a set of identical pods; maintains desired replica count; handles rolling updates
- **ReplicaSet** — the Deployment creates a ReplicaSet which directly manages the pods
- **Rolling update** — replaces pods gradually (configurable with \`maxSurge\` and \`maxUnavailable\`)
- \`kubectl rollout\` — manage deployment rollouts and rollbacks
- **Self-healing** — Kubernetes continuously reconciles actual state with desired state`,
        hints: [
          {
            hint: "The \`selector.matchLabels\` in the Deployment and the \`template.metadata.labels\` must match exactly. The selector is how the Deployment finds its pods — if they don't match, the Deployment will create pods but not manage them.",
          },
          {
            hint: "\`kubectl scale\` is imperative — it works immediately but the change is not reflected in your YAML file. For production, always update the \`replicas\` field in your manifest and \`kubectl apply\` — so your configuration file matches reality.",
          },
          {
            hint: "Check a Deployment's events with \`kubectl describe deployment web-app\`. Events are chronological and show exactly what the controller did — scaling events, pod replacements, and image update steps all appear here.",
          },
        ],
      },
      {
        title: "Expose a Deployment with a Service",
        description:
          "Create a Kubernetes Service to provide a stable network endpoint for a Deployment, enabling pods to be reached by name rather than by IP.",
        difficulty: "intermediate",
        xpReward: 100,
        tags: ["kubernetes", "services", "networking", "load-balancing"],
        content: `## Overview

Pods have IP addresses, but those IPs change every time a pod is recreated. A **Service** provides a stable DNS name and IP address that routes traffic to the currently-running pods. It also acts as a load balancer, distributing requests across all pods in the deployment.

## Your task

**1. Create the Deployment (from the previous challenge)**

\`\`\`bash
kubectl apply -f deployment.yaml   # your web-app deployment
\`\`\`

**2. Create a ClusterIP Service**

Create \`service.yaml\`:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  selector:
    app: web-app          # matches pods with this label
  ports:
    - protocol: TCP
      port: 80            # port the service listens on
      targetPort: 80      # port the pods listen on
  type: ClusterIP         # internal only; not reachable from outside the cluster
\`\`\`

\`\`\`bash
kubectl apply -f service.yaml
kubectl get services
\`\`\`

**3. Verify service routes to pods**

\`\`\`bash
# Run a temporary pod and curl the service
kubectl run curl-test --image=alpine/curl --rm -it --restart=Never -- \\
  curl -s http://web-app-service
\`\`\`

You should see the Nginx HTML response. The service resolved the name \`web-app-service\` to one of your running pods.

**4. Change to a NodePort Service**

Update \`service.yaml\`:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  selector:
    app: web-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080     # must be 30000-32767
  type: NodePort
\`\`\`

\`\`\`bash
kubectl apply -f service.yaml
\`\`\`

For Docker Desktop or Minikube:

\`\`\`bash
# Docker Desktop:
curl http://localhost:30080

# Minikube:
minikube service web-app-service --url
\`\`\`

**5. Observe load balancing**

Scale the deployment to 5 replicas and make repeated requests:

\`\`\`bash
kubectl scale deployment web-app --replicas=5
for i in {1..10}; do curl -s http://localhost:30080 | grep -o "Welcome to nginx"; done
\`\`\`

All 10 requests succeed — traffic is distributed across all 5 pods.

**6. Clean up**

\`\`\`bash
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
\`\`\`

## Verification

The ClusterIP service is reachable by name from inside the cluster. The NodePort service is reachable from your machine. All requests succeed even as replicas scale up.

## Key concepts

- **Service** — a stable network endpoint that routes to a set of pods matching a label selector
- **ClusterIP** — the default type; only reachable within the cluster
- **NodePort** — exposes the service on a static port on every cluster node; reachable from outside
- **LoadBalancer** — provisions a cloud load balancer (used in cloud environments like EKS, GKE, AKS)
- **DNS** — Kubernetes creates DNS entries for services (\`service-name.namespace.svc.cluster.local\`)`,
        hints: [
          {
            hint: "The Service's \`selector\` must match the labels on the pods, not on the Deployment itself. Check with \`kubectl get pods --show-labels\` — the labels shown there are what the service uses to find its targets.",
          },
          {
            hint: "NodePort values must be in the range 30000-32767. Values outside this range will be rejected. If you don't specify a \`nodePort\`, Kubernetes assigns one automatically.",
          },
          {
            hint: "For production on cloud providers (AWS, GCP, Azure), use type \`LoadBalancer\`. The cloud provider automatically creates an external load balancer and assigns a public IP. On local clusters (Docker Desktop, Minikube), \`LoadBalancer\` services may not get an external IP without extra configuration.",
          },
        ],
      },
    ],
    docTopics: [
      {
        title: "Introduction to Kubernetes",
        summary:
          "Understand what Kubernetes is, why container orchestration is needed, and the key concepts that make it work.",
        readingMinutes: 8,
        tags: ["kubernetes", "orchestration", "containers", "basics"],
        content: `## What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform originally built by Google, now maintained by the Cloud Native Computing Foundation (CNCF). It automates the deployment, scaling, and management of containerised applications across clusters of machines.

## Why do you need orchestration?

Running a single Docker container on one machine is simple. Running a production application is not:

- What happens when a container crashes at 3am?
- How do you roll out a new version without downtime?
- How do you scale from 2 to 200 containers when traffic spikes?
- How do you distribute containers across 10 servers efficiently?

Doing this manually with shell scripts is brittle and error-prone. Kubernetes handles all of it automatically.

## The core promise: desired state

You tell Kubernetes what you want:

> "Run 5 copies of my API container, always. If any crash, replace them. When I release a new version, update them gradually without downtime."

Kubernetes continuously monitors the actual state of the cluster and reconciles any differences with the desired state. This is called the **control loop** or **reconciliation loop**.

## Cluster architecture

**Control plane** — the brain of the cluster. Runs on dedicated nodes:
- **API server** — the front door; all kubectl commands talk to it
- **etcd** — the database that stores all cluster state
- **Controller manager** — runs the control loops (Deployment controller, ReplicaSet controller, etc.)
- **Scheduler** — decides which node a new pod should run on

**Worker nodes** — where your application containers run:
- **kubelet** — an agent that receives instructions from the API server and manages pods on the node
- **kube-proxy** — handles network routing and load balancing on the node
- **Container runtime** — Docker, containerd, or CRI-O — actually runs the containers

## Core objects

| Object | What it is |
|---|---|
| **Pod** | One or more containers sharing network and storage |
| **Deployment** | Manages a set of identical pods; handles scaling and rolling updates |
| **Service** | Stable network endpoint that routes traffic to pods |
| **ConfigMap** | Non-sensitive configuration data |
| **Secret** | Sensitive data (passwords, tokens) |
| **Namespace** | Logical partition for organising resources |
| **Ingress** | HTTP routing rules for external access |
| **PersistentVolume** | Storage that outlives a pod |

## kubectl basics

\`\`\`bash
# List resources
kubectl get pods
kubectl get deployments
kubectl get services

# Describe a resource
kubectl describe pod my-pod

# Apply a manifest
kubectl apply -f deployment.yaml

# Delete resources
kubectl delete -f deployment.yaml
kubectl delete pod my-pod

# View logs
kubectl logs my-pod
kubectl logs -f my-pod    # follow

# Execute commands
kubectl exec -it my-pod -- bash
\`\`\`

## The Kubernetes object model

Every Kubernetes object has four fields:

\`\`\`yaml
apiVersion: apps/v1   # API group and version
kind: Deployment      # object type
metadata:             # name, namespace, labels, annotations
  name: my-app
spec:                 # desired state (what you want)
  replicas: 3
\`\`\`

Kubernetes stores the object and works to make reality match the \`spec\`.

## Summary

Kubernetes is the standard platform for running containerised applications in production. It provides self-healing, scaling, rolling updates, and service discovery. The fundamental pattern is declarative: you describe the desired state in YAML files, and Kubernetes continuously works to achieve and maintain that state.`,
      },
      {
        title: "The Kubernetes Control Plane",
        summary:
          "Understand the components that make up the Kubernetes control plane and how they work together to manage a cluster.",
        readingMinutes: 7,
        tags: ["kubernetes", "control-plane", "architecture", "etcd"],
        content: `## Overview

The control plane is the set of components that make global decisions about the cluster — scheduling, scaling, and responding to cluster events. Understanding the control plane helps you diagnose problems, reason about how Kubernetes works under the hood, and appreciate why certain operations behave the way they do.

## Control plane components

### API Server (kube-apiserver)

The API server is the single entry point for all cluster operations. Every kubectl command, every controller, every node agent — they all talk to the API server.

The API server:
- Validates requests (is this valid YAML? Do you have permission?)
- Persists resource definitions to etcd
- Serves the current cluster state to any component that asks

\`\`\`bash
# This kubectl command talks to the API server:
kubectl get pods
\`\`\`

### etcd

etcd is a distributed key-value store that holds all Kubernetes cluster state. When you create a Deployment, the API server writes the Deployment definition to etcd. Controllers read from etcd (via the API server) to discover what needs to be reconciled.

etcd is the single source of truth. If etcd data is lost and you have no backup, you lose all knowledge of what the cluster was running. Backing up etcd is critical for production clusters.

### Controller Manager (kube-controller-manager)

The controller manager runs many control loops — each responsible for reconciling one type of resource:

- **Deployment controller** — ensures the correct number of ReplicaSets exist for each Deployment
- **ReplicaSet controller** — ensures the correct number of Pods exist for each ReplicaSet
- **Node controller** — marks nodes as unhealthy if they stop responding
- **Job controller** — tracks completion of batch jobs

Each controller watches for changes in etcd (via the API server) and takes action to move actual state toward desired state.

### Scheduler (kube-scheduler)

When a new pod needs to run, the scheduler decides which node to place it on. The scheduler:

1. Filters nodes that cannot run the pod (insufficient CPU, memory, or missing node affinity)
2. Scores remaining nodes based on resource availability, pod spread, and other factors
3. Assigns the pod to the highest-scoring node by writing the node name into the pod's spec

The scheduler does not start containers — it just assigns pods to nodes. The kubelet on the chosen node then starts the actual container.

## Worker node components

### kubelet

The kubelet runs on every worker node. It watches for pods assigned to its node (via the API server) and ensures the containers described in those pods are running and healthy. It reports pod status back to the API server.

### kube-proxy

kube-proxy runs on every node and maintains network routing rules. When you create a Service, kube-proxy updates the routing tables on every node so traffic destined for the Service IP is forwarded to the correct pod IPs.

### Container runtime

The actual software that runs containers: containerd (the standard), Docker (via the CRI shim), or CRI-O. The kubelet talks to the container runtime via the Container Runtime Interface (CRI).

## How a kubectl apply works end to end

1. You run \`kubectl apply -f deployment.yaml\`
2. kubectl sends the manifest to the **API server**
3. API server validates and writes the Deployment to **etcd**
4. The **Deployment controller** sees the new Deployment and creates a ReplicaSet
5. The **ReplicaSet controller** sees the ReplicaSet needs 3 pods; creates 3 pod objects
6. The **Scheduler** assigns each pod to a node
7. The **kubelet** on each node sees its assigned pods and tells the **container runtime** to start the containers
8. Containers start; kubelet reports Running status back to the API server

## Summary

The control plane is the brain of Kubernetes. The API server is the hub everything connects to. etcd stores all state. Controllers run reconciliation loops. The scheduler places pods on nodes. Worker nodes run the kubelet (pod management) and kube-proxy (networking). Understanding this flow makes every Kubernetes behaviour predictable.`,
      },
      {
        title: "Pods, ReplicaSets, and Deployments",
        summary:
          "Understand the relationship between these three core Kubernetes objects and why you should almost always use Deployments.",
        readingMinutes: 7,
        tags: ["kubernetes", "pods", "replicasets", "deployments"],
        content: `## The three levels of abstraction

Kubernetes provides three layers of abstraction for running containers, each building on the one below:

\`\`\`
Deployment
  └── ReplicaSet
        └── Pod
              └── Container
\`\`\`

You almost always work with Deployments. But understanding all three layers explains why Kubernetes behaves the way it does.

## Pods

A Pod is one or more containers that share:
- **Network namespace** — they share an IP address and can communicate via localhost
- **Storage** — they can share mounted volumes

The typical use case is a single-container pod. Multi-container pods are used for tightly coupled processes — for example, an application container paired with a sidecar that ships logs.

**Pods are ephemeral.** They are not rescheduled if they fail — they simply cease to exist. A pod never moves; if a node fails, the pod is declared dead and a new pod is created on a healthy node.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: app
      image: nginx:alpine
\`\`\`

Use bare pods only for debugging and experimentation. Never in production.

## ReplicaSets

A ReplicaSet ensures that a specified number of pod replicas are running at any given time. If a pod crashes, the ReplicaSet creates a replacement. If a node fails, the ReplicaSet creates pods on healthy nodes to bring the count back up.

\`\`\`yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: my-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: nginx:alpine
\`\`\`

**The problem with bare ReplicaSets:** if you change the image, the ReplicaSet does not update running pods — it only creates new pods with the new template. You would need to delete the old pods manually. This is not how you want to deploy updates.

## Deployments

A Deployment manages ReplicaSets to provide:
- **Rolling updates** — gradually replace old pods with new ones
- **Rollback** — revert to a previous version if something goes wrong
- **Revision history** — track what was deployed and when

When you update a Deployment (change the image tag, for example), it creates a **new ReplicaSet** with the new template and gradually scales it up while scaling down the old ReplicaSet. Both ReplicaSets exist briefly during the transition.

\`\`\`bash
kubectl rollout history deployment my-app
# REVISION  CHANGE-CAUSE
# 1         Initial deployment
# 2         Update to v2.0.1

kubectl rollout undo deployment my-app          # undo the last update
kubectl rollout undo deployment my-app --to-revision=1  # undo to a specific revision
\`\`\`

## Choosing the right object

| Situation | Use |
|---|---|
| Quick debugging or testing | Bare Pod |
| Run N identical pods, simple | ReplicaSet |
| All production workloads | **Deployment** |
| Stateful applications (databases) | StatefulSet |
| Run once on every node (logging agent) | DaemonSet |
| Batch jobs | Job or CronJob |

## Update strategies

Deployments support two update strategies:

**RollingUpdate (default)** — replace pods gradually. Configure with \`maxSurge\` (extra pods during update) and \`maxUnavailable\` (pods that can be down):

\`\`\`yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
\`\`\`

**Recreate** — terminate all old pods, then create new ones. Causes downtime; use only when you cannot run two versions simultaneously.

## Summary

Pods are the basic unit but are ephemeral and unmanaged. ReplicaSets maintain a count of running pods. Deployments manage ReplicaSets to provide rolling updates and rollbacks. Use Deployments for all production workloads — they give you the safety of self-healing plus the ability to deploy and roll back without downtime.`,
      },
    ],
  },
];

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedModules(): Promise<Record<string, number>> {
  const moduleIds: Record<string, number> = {};

  for (const mod of MODULES) {
    const [inserted] = await db
      .insert(modulesTable)
      .values({
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        icon: mod.icon,
        category: mod.category,
        estimatedHours: mod.estimatedHours,
        isUnlocked: mod.isUnlocked,
        sortOrder: mod.sortOrder,
      })
      .returning();
    moduleIds[mod.slug] = inserted.id;
    console.log(`  + Module: ${mod.title} (id=${inserted.id})`);
  }

  return moduleIds;
}

async function seedChallengesWithHints(moduleIds: Record<string, number>) {
  for (const mod of MODULES) {
    const moduleId = moduleIds[mod.slug];
    for (let i = 0; i < mod.challenges.length; i++) {
      const ch = mod.challenges[i];
      const [inserted] = await db
        .insert(challengesTable)
        .values({
          moduleId,
          title: ch.title,
          description: ch.description,
          difficulty: ch.difficulty,
          xpReward: ch.xpReward,
          content: ch.content,
          tags: ch.tags,
          sortOrder: i + 1,
        })
        .returning();

      for (let j = 0; j < ch.hints.length; j++) {
        await db.insert(challengeHintsTable).values({
          challengeId: inserted.id,
          hint: ch.hints[j].hint,
          sortOrder: j + 1,
        });
      }

      console.log(`  + Challenge: ${ch.title} (${ch.hints.length} hints)`);
    }
  }
}

async function seedDocTopics(moduleIds: Record<string, number>) {
  for (const mod of MODULES) {
    const moduleId = moduleIds[mod.slug];
    for (let i = 0; i < mod.docTopics.length; i++) {
      const dt = mod.docTopics[i];
      await db.insert(docTopicsTable).values({
        moduleId,
        title: dt.title,
        summary: dt.summary,
        content: dt.content,
        readingMinutes: dt.readingMinutes,
        tags: dt.tags,
        sortOrder: i + 1,
      });
      console.log(`  + Doc topic: ${dt.title}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("DevOps Forge — Seed Script");
  console.log("=".repeat(60));

  console.log("\nClearing existing content...");
  await clearAll();
  console.log("  Done.");

  console.log("\nSeeding modules...");
  const moduleIds = await seedModules();

  console.log("\nSeeding challenges and hints...");
  await seedChallengesWithHints(moduleIds);

  console.log("\nSeeding documentation topics...");
  await seedDocTopics(moduleIds);

  const challengeCount = MODULES.reduce((sum, m) => sum + m.challenges.length, 0);
  const hintCount = MODULES.reduce(
    (sum, m) => sum + m.challenges.reduce((s, c) => s + c.hints.length, 0),
    0
  );
  const docCount = MODULES.reduce((sum, m) => sum + m.docTopics.length, 0);

  console.log("\n" + "=".repeat(60));
  console.log("Seed complete!");
  console.log(`  Modules:         ${MODULES.length}`);
  console.log(`  Challenges:      ${challengeCount}`);
  console.log(`  Hints:           ${hintCount}`);
  console.log(`  Doc topics:      ${docCount}`);
  console.log("=".repeat(60));

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
