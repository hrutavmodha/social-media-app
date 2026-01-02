import type { Request, Response } from 'express'
import { pool } from '../../config/db.ts'
import { hash } from 'bcrypt'

export default async function register(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        const existingUser = await pool.query(`
            SELECT id FROM users WHERE email = $1 OR name = $2;
        `, [email, username]);

        if (existingUser.rows.length > 0) {
            if (existingUser.rows[0].email === email) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
            if (existingUser.rows[0].name === username) {
                return res.status(409).json({ message: 'Username already taken.' });
            }
        }

        const hashedPassword = await hash(password, 10)
        await pool.query(`
            INSERT INTO users(name, email, password)
            VALUES ($1, $2, $3)
        `, [
            username, email, hashedPassword
        ])
        res.status(200).json({
            message: 'Registered successfully'
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later'
        })
    }
}