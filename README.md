# A3S University Portal Demo

This repository contains a demonstration of the Auth-as-a-Service (A3S) platform integrated with a university portal application. The demo showcases authentication and authorization capabilities using A3S.

---

## What is A3S?

> NOTE: This is a work in progress.

A3S (Auth As A Service) is an authentication and ABAC (Attribute-Based Access Control) authorization server. It enables normalization of diverse authentication sources (OIDC, AWS/Azure/GCP tokens, LDAP, etc.) into a generic identity token composed of claims instead of scopes. These claims are evaluated through authorization policies to determine user access across a hierarchical namespace model.

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/a3s-university-demo.git
cd a3s-university-demo
```

### 2. Install Tools for A3S Development

Install the required development tools:

```bash
go install go.aporeto.io/tg@master
go install go.aporeto.io/elemental/cmd/elegen@master
go install go.aporeto.io/regolithe/cmd/rego@master
go install github.com/aporeto-inc/go-bindata/go-bindata@master
```

### 3. Generate Certificates

```bash
dev/certs-init
```

This generates the necessary certificates into `dev/.data/certificates`, which will be mounted by the A3S container.

### 4. Build Docker Container

```bash
make docker
```

### 5. Start A3S with Docker Compose

```bash
cd ./dev
docker compose up
```

---

## Using the System

### Install `a3sctl` CLI

```bash
make cli
```

This installs `a3sctl` into your `$GOBIN` folder. Make sure `$GOBIN` is in your `$PATH` for easy CLI access.

---

## University Portal Demo Setup

### 1. Make Scripts Executable

```bash
chmod +x init-main.sh setup-namespaces.sh setup-policies.sh gencerts.sh setenv.sh
```

### 2. Initialize the A3S Configuration

```bash
./init-main.sh
```

This script will:

-   Set up environment variables
-   Generate necessary certificates
-   Create namespaces for the university portal
-   Configure OIDC authentication sources
-   Set up authorization policies

### 3. Start the Application

#### Start the Modifier Server

```bash
cd ProjectFiles/modifier-server
npm install
npm run dev
```

#### Start the Backend Server

```bash
cd ProjectFiles/backend
npm install
npm run dev
```

#### Start the Frontend Application

```bash
cd ProjectFiles/frontend
npm install
npm run dev
```

### Troubleshooting

If you encounter any issues with Node.js dependencies, try the following:

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

---

## Application Structure

-   **Frontend**: React application demonstrating the university portal UI
-   **Backend**: Express server handling API requests with authorization checks
-   **Modifier Server**: Server that modifies identity tokens for demonstration

---

## Features

-   Authentication using A3S OIDC integration
-   Role-based access control (Admin vs Student)
-   Token inspection and visualization
-   API authorization demonstrations
-   Token cloaking capabilities

---

## Documentation

For more details on A3S, visit the [A3S GitHub repository](https://github.com/PaloAltoNetworks/a3s).

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
