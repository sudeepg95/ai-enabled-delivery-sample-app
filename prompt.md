Create a new nodejs application as per below: 
Tech Stack:
- Nodejs v20.x.x
- Typescript 5
- Express
- ESLint integration with Typescript plugin
- Libraries/Integrations
  - BCrypt
  - dotenv
  - MySQL
  - Jest
  - OpenAPI


Goal: REST API endpoints that manage users and authenticate via JSON Web Tokens (JWT) that lets users manage tasks 

Implementation v0: Manage users and authenticate via JSON Web Tokens (JWT).

Functional Requirements:
Register User: Accepts email & password, stores securely.
Login: Validates credentials and returns signed JWT.
Get Authenticated User Info: Verifies JWT and returns user metadata.

Endpoints:
Method
Path
Description
POST
/register
Register a new user
POST
/login
Authenticate and return JWT
GET
/me
Return current authenticated user


Security:
Passwords must be securely hashed (e.g., using Argon2, Bcrypt).
JWT must be signed and have configurable expiration.
Secrets/keys must be injected via environment/config file.

User Data Model:
User {
  id: UUID,
  email: string,
  password_hash: string,
  created_at: datetime,
  updated_at: datetime
}


======
Purpose: Authenticated users can manage their personal tasks.

Functional Requirements:
Create Task: Add a task for the current user.
Get Tasks: Fetch all tasks for the user.
Update Task: Modify existing task.
Delete Task: Remove existing task.

Endpoints:
Method
Path
Description
POST
/tasks
Create a new task
GET
/tasks
List all tasks for user
PUT
/tasks/{id}
Update an existing task
DELETE
/tasks/{id}
Delete an existing task


Security:
JWT validation middleware to extract and verify user ID.
Multi-tenancy: ensure tasks are owned by authenticated users.
Reject unauthorized/expired token requests.

Task Data Model:
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

