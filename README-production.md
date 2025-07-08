# Production Deployment Guide

This guide explains how to deploy the User Tasks API application to production using Docker.

## Prerequisites

- Docker and Docker Compose installed on your production server
- Git to clone the repository (or download the source code)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your production settings:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=dbuser
DB_PASSWORD=your_secure_password_here
DB_NAME=user_tasks_db
DB_ROOT_PASSWORD=your_secure_root_password_here

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Optional: Override the exposed port (default: 3000)
APP_PORT=3000
```

Make sure to use strong, unique passwords and a secure JWT secret for production.

### 3. Build and Start the Application

```bash
# Build and start the containers in detached mode
docker-compose -f docker-compose.prod.yml up -d
```

This will:
- Build the application image using the Dockerfile
- Start the MySQL database
- Start the application container
- Set up the network between containers

### 4. Verify Deployment

Check if the containers are running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

Check the application logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

Access the API at `http://your-server-ip:3000` and the Swagger documentation at `http://your-server-ip:3000/api-docs`.

### 5. Stopping the Application

```bash
docker-compose -f docker-compose.prod.yml down
```

To remove volumes (this will delete all data):

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Database Connection Issues

If the application can't connect to the database:

1. Check if the MySQL container is running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps mysql
   ```

2. Check MySQL logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs mysql
   ```

3. Verify environment variables are correctly set in the `.env` file.

### Application Not Starting

1. Check application logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. Ensure the database is healthy before the application starts.

## Backup and Restore

### Backup Database

```bash
docker exec user_tasks_mysql_prod mysqldump -u root -p<your_root_password> user_tasks_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i user_tasks_mysql_prod mysql -u root -p<your_root_password> user_tasks_db
```

## Security Considerations

- Always use strong passwords for database users
- Generate a secure random string for JWT_SECRET
- Consider using Docker secrets for sensitive information in a swarm deployment
- Set up SSL/TLS for production using a reverse proxy like Nginx
- Implement proper network security rules to restrict access to your server