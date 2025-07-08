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

Dont make assumptions, ask any questions.

========================================================================

Create a docker compose to run mysql. Identify the optimal version that's supported based on the @/package.json


========================================================================

I would like to add tests that are end-to-end. 
Which files do you think we should write additional tests for, to increase confidence of our application's functionality?


========================================================================

Run the tests and help fix issues

========================================================================


i think i have already integrated Swagger, can you help add commands to package.json on how to use it?


========================================================================


The mysql container started using the @/docker-compose.yml  is not running healthily. 
here are the logs: 

```
2025-07-08 06:39:52+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.0.42-1.el9 started.

2025-07-08 06:39:53+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'

2025-07-08 06:39:53+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.0.42-1.el9 started.

2025-07-08 06:39:53+00:00 [ERROR] [Entrypoint]: MYSQL_USER="root", MYSQL_USER and MYSQL_PASSWORD are for configuring a regular user and cannot be used for the root user

    Remove MYSQL_USER="root" and use one of the following to control the root user password:

    - MYSQL_ROOT_PASSWORD

    - MYSQL_ALLOW_EMPTY_PASSWORD

    - MYSQL_RANDOM_ROOT_PASSWORD

```

========================================================================


When i run the app - 
i get the following error: 
``` 
[ERROR] 500 - Table 'test_db.users' doesn't exist
Error: Table 'test_db.users' doesn't exist
    at PromisePool.query 

========================================================================

Now i want to go ahead and plan the implementation for the task management feature of the app.

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

========================================================================

Help create a dockerFile to deploy this app to production

========================================================================


I have updated the eslint rules to trigger error for @typescript-eslint/no-explicit-any
Help fix all the issues

========================================================================

Help fix all lint issues.
There are 29 problems that appear when i run `npm run lint`


