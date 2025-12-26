import { env } from './env.ts'
import { Pool } from 'pg'

export const pool = new Pool({
    host: env.HOST,
    port: parseInt(env.DB_PORT as string),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
})

export async function initDb(pool: Pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            profile_url TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL
                REFERENCES users(id) 
                ON DELETE CASCADE,
            caption TEXT,
            media_url TEXT[] UNIQUE,
            likes INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
       );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL
                REFERENCES posts(id)
                ON DELETE CASCADE,
            user_id INTEGER NOT NULL
                REFERENCES users(id),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `)
}