# Docker MySQL Setup

This repository includes a Docker Compose configuration to run MySQL 8.0 for the application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## MySQL Version

The Docker Compose file uses MySQL 8.0, which is fully compatible with the mysql2 ^3.14.1 package used in this project. MySQL 8.0 supports all the features used in the schema, including:

- InnoDB engine
- utf8mb4 character set and utf8mb4_unicode_ci collation
- TIMESTAMP with DEFAULT CURRENT_TIMESTAMP and ON UPDATE CURRENT_TIMESTAMP
- INDEX for performance optimization
- ENUM data types

## Configuration

The Docker Compose setup will:

1. Create a MySQL 8.0 container
2. Initialize the database using the schema.sql file
3. Expose MySQL on the default port (3306)
4. Persist data using a Docker volume

## Environment Variables

The Docker Compose file uses environment variables from your .env file. Make sure to create a .env file based on the .env.example template:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=user_tasks_db
```

## Usage

### Starting the MySQL Container

```bash
docker-compose up -d
```

This will start the MySQL container in detached mode.

### Checking Container Status

```bash
docker-compose ps
```

### Viewing Logs

```bash
docker-compose logs -f mysql
```

### Stopping the Container

```bash
docker-compose down
```

### Stopping and Removing Data Volume

```bash
docker-compose down -v
```

## Connecting to MySQL

### From the Application

The application is already configured to connect to MySQL using the environment variables in your .env file. Make sure your .env file has the correct values:

- DB_HOST=localhost (or the Docker host IP if running on a different machine)
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=your_password_here
- DB_NAME=user_tasks_db

### Using MySQL CLI

```bash
docker exec -it user_tasks_mysql mysql -u root -p
```

Then enter your password when prompted.

## Initializing the Database

The database will be automatically initialized with the schema.sql file when the container starts for the first time. If you need to manually initialize or reset the database, you can run:

```bash
npm run db:init
```

This will execute the initialization script defined in src/config/init-db.ts.