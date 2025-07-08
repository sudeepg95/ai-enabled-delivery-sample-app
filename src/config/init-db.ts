import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import config from './index';

/**
 * Initialize the database with the schema
 */
const initializeDatabase = async (): Promise<void> => {
  let connection;
  
  try {
    // Create connection to the database
    connection = await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
    });
    // eslint-disable-next-line no-console
    console.log('Connected to MySQL server');
    
    
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL statements
    const statements = schemaSql
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement + ';');
    }
    
    // eslint-disable-next-line no-console
    console.log('Database initialized successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      // eslint-disable-next-line no-console
      console.log('Database connection closed');
    }
  }
};

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;