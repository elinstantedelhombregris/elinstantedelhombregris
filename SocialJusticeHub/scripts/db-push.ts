import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

async function main() {
  console.log('Creating database schema...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Users table created or already exists');

    // Create dreams table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dreams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        dream TEXT NOT NULL,
        value TEXT,
        need TEXT,
        location TEXT,
        latitude TEXT,
        longitude TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Dreams table created or already exists');

    // Create community_posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        participants INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Community posts table created or already exists');

    // Create resources table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Resources table created or already exists');

    // Create stories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        story TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Stories table created or already exists');

    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  }
}

// Run the main function
main().finally(async () => {
  console.log('Closing database connection...');
  await pool.end();
  console.log('Database connection closed.');
});