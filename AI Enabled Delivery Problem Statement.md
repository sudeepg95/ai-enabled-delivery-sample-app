# AI Enabled Delivery Problem Statement

## **PRIMARY RULE**

## **CODE SHOULD BE GENERATED VIA AI TOOL WITH USER PROVIDED PROMPTS, EVEN SMALLEST THINGS LIKE COMMA, DOT SHOULD BE MODIFIED VIA PROMPTS (AS MUCH AS POSSIBLE)**

## **ROLE-WISE SCOPE**

| Full-stack Dev | Implement one or both backend services |
| :---- | :---- |
| **Backend Dev** |  |
| **Frontend Dev** | **Implement the app with hosted in-memory services** |
| **Mobile Dev** |  |
| **QA** | **Implement the QA requirement with hosted in-memory services** |
| **DevOps** | **Implement the operability requirement** |
| **Data Engineer** | **Implement the data requirement [here](https://docs.google.com/document/d/1QhWnLtMiq0CuXcIspzxo3NEBFTL7fxFE-YE5FDghGLg/edit?usp=sharing)** |
| **BA** | **Planned** |

**[Backend	3](#backend)**

[Services Overview	3](#services-overview)

[Identity Service	3](#identity-service)

[Task Service	4](#task-service)

[Architecture Standards	5](#architecture-standards)

[Development Requirements	5](#development-requirements)

[Testing Requirements	5](#testing-requirements)

[Deployment Requirements	5](#deployment-requirements)

[Deliverables	6](#deliverables)

[Example Suggested Folder Structure	6](#example-suggested-folder-structure)

[**Frontend	7**](#frontend)

[Functional Requirements	7](#functional-requirements)

[Authentication Features	7](#authentication-features)

[Task Management Features	7](#task-management-features)

[Technical Requirements	7](#technical-requirements)

[Testing Requirements	8](#testing-requirements-1)

[Suggested Folder Structure	8](#suggested-folder-structure)

[Deployment Requirements	9](#deployment-requirements-1)

[Deliverables	9](#deliverables-1)

[**Operability	10**](#operability)

[Scenario	10](#scenario)

[Objective	10](#objective)

[Tasks	10](#tasks)

[1\. Cluster Setup	10](#1.-cluster-setup)

[2\. Terraform Project Structure	10](#2.-terraform-project-structure)

[3\. Deployment via Terraform	10](#3.-deployment-via-terraform)

[Validation Criteria	11](#validation-criteria)

[Deliverables	11](#deliverables-2)

[**QA	12**](#qa)

[Scenario	12](#scenario-1)

[Objective	12](#objective-1)

[Context	12](#context)

[Workshop Deliverables	12](#workshop-deliverables)

[Constraints	12](#constraints)

[Deliverables	13](#deliverables-3)

[**Mobile	14**](#mobile)

[Functional Requirements	14](#functional-requirements-1)

[Authentication	14](#authentication)

[Task Management	14](#task-management)

[Technical Requirements	14](#technical-requirements-1)

[Testing Requirements	15](#testing-requirements-2)

[Unit Tests	15](#unit-tests)

[Integration Tests	15](#integration-tests)

[Deployment Requirements	15](#deployment-requirements-2)

[Deliverables	15](#deliverables-4)

##  

# 

# 

# Backend {#backend}

Design two cleanly separated microservices:

* **Identity Service**: Handles user authentication and issues JWT tokens.

* **Task Service**: Provides task management features, protected by JWT-based authentication.

Each service must:

* Be independently deployable.

* Follow **hexagonal architecture** (ports and adapters).

* Include unit and integration tests.

* Be containerized (Docker).

### **Services Overview** {#services-overview}

#### **Identity Service** {#identity-service}

**Purpose**:  
 Manage users and authenticate via JSON Web Tokens (JWT).

**Functional Requirements**:

* **Register User**: Accepts email & password, stores securely.

* **Login**: Validates credentials and returns signed JWT.

* **Get Authenticated User Info**: Verifies JWT and returns user metadata.

**Endpoints**:

| Method | Path | Description |
| ----- | ----- | ----- |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate and return JWT |
| GET | `/me` | Return current authenticated user |

**Security**:

* Passwords must be securely hashed (e.g., using Argon2, Bcrypt).

* JWT must be signed and have configurable expiration.

* Secrets/keys must be injected via environment/config file.

**User Data Model**:

```
User {
  id: UUID,
  email: string,
  password_hash: string,
  created_at: datetime,
  updated_at: datetime
}
```

---

#### **Task Service** {#task-service}

**Purpose**:  
 Authenticated users can manage their personal tasks.

**Functional Requirements**:

* **Create Task**: Add a task for the current user.

* **Get Tasks**: Fetch all tasks for the user.

* **Update Task**: Modify existing task.

* **Delete Task**: Remove existing task.

**Endpoints**:

| Method | Path | Description |
| ----- | ----- | ----- |
| POST | `/tasks` | Create a new task |
| GET | `/tasks` | List all tasks for user |
| PUT | `/tasks/{id}` | Update an existing task |
| DELETE | `/tasks/{id}` | Delete an existing task |

**Security**:

* JWT validation middleware to extract and verify user ID.

* Multi-tenancy: ensure tasks are owned by authenticated users.

* Reject unauthorized/expired token requests.

**Task Data Model**:

```
Task {
  id: UUID,
  user_id: UUID,
  title: string,
  description: string,
  due_date: datetime,
  is_completed: boolean,
  created_at: datetime,
  updated_at: datetime
}
```

### 

### **Architecture Standards** {#architecture-standards}

Each service must be built using **hexagonal architecture**, structured as follows:

* **Domain Layer**: Business entities and logic

* **Application Layer**: Use case orchestration

* **Ports (Interfaces)**: Abstractions for external dependencies (e.g., DB, HTTP)

* **Adapters**: Implementations of ports (e.g., REST controllers, repositories)

* **Infrastructure Layer**: Frameworks, libraries, and configurations

### **Development Requirements** {#development-requirements}

* Must support modular design

* JWT token signing/validation should follow industry standards (e.g., RS256/HS256)

* Passwords must never be stored in plain text

* Services must be documented with an OpenAPI/Swagger spec

* Use `.env` or equivalent for environment-specific config

* All external service calls should be retryable and timeout-controlled

### 

### **Testing Requirements** {#testing-requirements}

* **Unit Tests**:

  * Domain logic (business rules)

  * Authentication logic

* **Integration Tests**:

  * HTTP endpoints

  * JWT validation in Task Service

* **Test Data**:

  * Use mocks or test containers

  * Must be automatable in CI pipelines

### **Deployment Requirements** {#deployment-requirements}

* Each service must include:

  * `Dockerfile`

  * `.env.example` for environment variables

* Shared `docker-compose.yml` to orchestrate Identity and Task services for local development

* PostgreSQL or similar relational database can be used for persistence (must be pluggable)

* HTTP services must run on configurable ports

### 

### **Deliverables** {#deliverables}

Each microservice must provide:

* 📁 Clean folder structure (suggested structure for any language)

* 🔐 Secure auth flows and JWT handling

* 🧪 Unit & integration tests

* 🐳 Dockerfile

* ⚙️ `.env.example`

* 📄 API documentation via OpenAPI or Postman collection

* 🧰 README with setup and usage instructions

### 

### **Example Suggested Folder Structure** {#example-suggested-folder-structure}

```
service-name/
├── domain/
│   ├── models/
│   └── services/
├── application/
│   └── use_cases/
├── adapters/
│   ├── http/
│   └── persistence/
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── .env.example
└── README.md
```

# 

# Frontend {#frontend}

Build a **standalone frontend application** that integrates with two backend microservices:

* **Identity Service**: For user authentication and session management.

* **Task Service**: For managing user-specific tasks.

The frontend must:

* Be implemented as a **separate app**, versioned and deployable independently.

* Be developed using only **OpenAPI specifications** provided for each backend service.

* Be **testable and functional without a live backend**, using mock responses aligned with the specifications.

### **Functional Requirements** {#functional-requirements}

#### 

#### **Authentication Features** {#authentication-features}

* Allow users to register using their credentials.

* Allow users to log in and establish an authenticated session.

* Securely manage and store the authentication token.

* Maintain user session across app navigation.

* Support logout and session expiration.

#### **Task Management Features** {#task-management-features}

* Display a list of tasks associated with the logged-in user.

* Allow users to create a new task.

* Allow users to edit or update an existing task.

* Allow users to delete a task.

### **Technical Requirements** {#technical-requirements}

* Assume backend as in-memory cloud-hosted services

  * [Identity Service](https://identity-service-365603594789.europe-west1.run.app/api/v1/openapi.json)

  * [Task Service](https://task-service-365603594789.europe-west1.run.app/api/v1/openapi.json)

* Use only OpenAPI specs to understand API structure, operations, and schema.

* Adhere to best practices in application layering:

  * Separate concerns: UI, business logic, API handling, and state management.

  * Ensure each feature (e.g., auth, tasks) is modular and testable.

* JWT tokens should be handled securely and attached to API requests when required.

* Configuration (e.g., API base URL, token storage strategy) should be environment-dependent.

### 

### 

### **Testing Requirements** {#testing-requirements-1}

* Include **unit tests** for:

  * Authentication logic

  * Task form validations

  * UI component behavior

* Include **integration tests** for:

  * Authenticated user flows

  * Full task lifecycle (create, read, update, delete)

* Tests must simulate backend behavior in alignment with OpenAPI-defined responses (but without requiring actual backend services).

### **Suggested Folder Structure** {#suggested-folder-structure}

```
frontend/
├── public/              # Static assets 
├── src/
│   ├── api/             # API clients
│   ├── components/      # UI components
│   ├── features/
│   │   ├── auth/       # Login/Register/Session management
│   │   └── tasks/      # Task listing and interactions
│   ├── context/         # Global app state (e.g., auth)
│   ├── services/        # API wrappers and business logic
│   ├── utils/           # Helper functions/utilities
│   └── main.ts|js       # Application entry
├── openapi/
│   ├── identity.yaml
│   └── tasks.yaml
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example            # Environment config
├── Dockerfile              # For containerization
└── README.md               # Developer instructions
```

### 

### 

### **Deployment Requirements** {#deployment-requirements-1}

* Must be deployable as a standalone container (Docker).

* Should support environment-based configuration for API URLs and other settings.

* Must be hosted as docker container

* The OpenAPI files should be version-controlled and updated with backend contract changes.

### 

### **Deliverables** {#deliverables-1}

* 📦 Fully functional frontend codebase

* 📚 README with setup, build, and deployment instructions

* 📄 OpenAPI specification files included and referenced

* 🧪 Unit and integration tests

* 🐳 Dockerfile for deployment

* 🧰 Example environment configuration file

# 

# Operability {#operability}

### 

### **Scenario** {#scenario}

As part of a platform engineering team, you're setting up isolated service environments with controlled inter-service communication. You are tasked with preparing a secure local development setup for testing this architecture.

The workshop simulates this by deploying Flagr (an open-source feature flag system) and its MySQL backend into separate namespaces. You'll ensure that access is tightly controlled using network policies.

### 

### **Objective** {#objective}

Set up a secure local Kubernetes environment on participants' laptops where:

* [Flagr](https://openflagr.github.io/flagr/#/) (a feature flag service) runs in its own namespace

* MySQL runs in a separate namespace

* Only Flagr is allowed to communicate with MySQL

* All Kubernetes resources are managed **exclusively using Terraform** 

* No direct use of `kubectl` is allowed

### 

### **Tasks** {#tasks}

#### **1\. Cluster Setup** {#1.-cluster-setup}

Provide a shell script or Makefile or anything to:

* Install Minikube (if not already present)

* Start the Minikube cluster with Calico as the CNI

* Ensure the cluster is ready for Terraform interaction

#### **2\. Terraform Project Structure** {#2.-terraform-project-structure}

Structure your Terraform code using modules, with each of the following as separate modules:

* **Namespace module**: Creates Kubernetes namespaces for `flagr` and `mysql`

* **MySQL module**: Deploys a MySQL instance and associated Kubernetes resources in the `mysql` namespace. Use mysql docker image available.

* **Flagr module**: Deploys the Flagr service in the `flagr` namespace, configured to connect to the MySQL service. Inject configuration into pods via environment variables or config maps. Use flagr docker image available.

* **NetworkPolicy module**: Creates a Calico-compatible network policy in the `mysql` namespace that only allows ingress from the `flagr` namespace

#### **3\. Deployment via Terraform** {#3.-deployment-via-terraform}

All the following must be defined and deployed through Terraform only:

* Namespaces

* Deployments

* Services

* Secrets (e.g., MySQL credentials)

* Network policies

Participants must not use `kubectl` or apply any manual YAMLs.

### 

### **Validation Criteria** {#validation-criteria}

* Flagr must be able to successfully connect to MySQL

* Any other pod (from a different namespace or the default namespace) should be unable to connect to MySQL

* All infrastructure must be managed via Terraform

* No use of `kubectl` or manual changes allowed during the process

### **Deliverables** {#deliverables-2}

Participants must submit a Git-based project directory containing:

* `install.sh` or `Makefile` to install and start Minikube with Calico

* Terraform code structured with modules:

  * Namespace creation

  * Flagr and MySQL deployments

  * Network policy definition

## 

# QA {#qa}

### 

### **Scenario** {#scenario-1}

End-to-end API automation for Identity and Task Management microservices

### 

### **Objective** {#objective-1}

Participants will develop a suite of automated tests to validate the functionality, security, and data integrity of two microservices \- an **Identity Service** and a **Task Service** \- using JWT-based authentication.

### 

### **Context** {#context}

Your organization is building a modular, microservices-based task management platform. The development team has implemented two core services:

* **Identity Service**: Handles user registration, login, and authentication.

* **Task Service**: Manages CRUD operations for authenticated users’ tasks.

As a QA engineer, you are responsible for creating automated tests that ensure:

* Functional correctness of each endpoint

* Proper handling of authentication and authorization

* Secure multi-user data access

* Accurate error handling and edge case response

* Token lifecycle behaviors such as expiration and invalidation

### **Workshop Deliverables** {#workshop-deliverables}

Participants should

* Set up a test automation framework of their choice

* Create a **test suite** covering critical behaviors of both services

* Use **configurable environment files** for base URLs, credentials, and secrets

* Implement **data-driven tests** where applicable

* Generate **test reports** summarizing test results

### 

### **Constraints** {#constraints}

* Assume backend as in-memory cloud-hosted services

  * [Identity Service](https://identity-service-365603594789.europe-west1.run.app/api/v1/openapi.json)

  * [Task Service](https://task-service-365603594789.europe-west1.run.app/api/v1/openapi.json)

* User registration/login may be scripted or reused as setup steps

* UUIDs are used as IDs \- extract them dynamically in your tests

### 

### 

### **Deliverables** {#deliverables-3}

✅ Reproducible and maintainable test suite  
✅ Functional and security aspects are covered  
✅ Environment and data are well-separated  
✅ Code is committed to a version-controlled repository (Git)

# 

# Mobile {#mobile}

**Objective**  
Build a mobile application that integrates with two backend microservices using OpenAPI specifications:

* **Identity Service** – Handles user authentication and session lifecycle via JWT.

* **Task Service** – Manages personal task data for authenticated users.

The mobile app should:

* Be developed independently of backend implementations.

* Use only OpenAPI specification documents to define API behavior.

* Be testable and fully functional with mock responses (no backend dependency).

### **Functional Requirements** {#functional-requirements-1}

#### 

#### **Authentication** {#authentication}

* User Registration with email/password.

* Login to initiate authenticated session.

* Secure storage and handling of JWT tokens.

* Persist session across app restarts and navigation.

* Logout and automatic session expiration handling.

#### **Task Management** {#task-management}

* Display a list of tasks belonging to the logged-in user.

* Create new tasks with user input.

* Edit/update existing tasks.

* Delete tasks.

* Support empty states, error states, and loading indicators.

### 

### **Technical Requirements** {#technical-requirements-1}

* The app must rely exclusively on **OpenAPI specs** to implement all backend interactions.

* JWT tokens should be securely stored using platform-appropriate secure storage mechanisms.

* Separate concerns clearly:

  * UI Components

  * Business Logic

  * API Layer

  * Session/State Management

* Environment-based configuration support (e.g., base API URL).

* Offline-safe architecture encouraged (e.g., caching, optimistic updates – optional).

### **Testing Requirements** {#testing-requirements-2}

#### 

#### **Unit Tests** {#unit-tests}

* Authentication logic and token management.

* Task form input and validation.

* Key UI components.

#### 

#### **Integration Tests** {#integration-tests}

* End-to-end user session: register → login → logout.

* Task lifecycle: create → read → update → delete.

* Simulate API behavior using mock responses derived from OpenAPI specifications.

### **Deployment Requirements** {#deployment-requirements-2}

* App must support environment-based configuration for backend API endpoints.

* Can be run locally via simulator/emulator or built into production binaries.

* Should **not require a live backend** for development or testing (mocked via OpenAPI).

### 

### **Deliverables** {#deliverables-4}

* ✅ Full mobile application codebase

* 🔧 Environment configuration template (`.env.example`)

* 📚 README with clear setup and run instructions

* 📄 Version-controlled OpenAPI specification files

* 🧪 Unit and integration tests using mocks aligned with specs

