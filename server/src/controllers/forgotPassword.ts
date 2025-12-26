import type { Request, Response } from 'express'
import { pool } from '../../config/db.ts'
import { randomBytes } from 'crypto'
import mail from '../utils/mail.ts'
import { env } from '../../config/env.ts'

export default async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body
        const userResult = await pool.query(`
            SELECT id 
            FROM users 
            WHERE email = $1
        `, [email])

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'User with that email does not exist.'
            })
        }

        const userId = userResult.rows[0].id
        const resetToken = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 3600000) 

        await pool.query(`
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE
            SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, created_at = NOW()
        `, [
            userId, resetToken, expiresAt
        ])
        
        const resetLink = `http://${env.HOST}:${env.FRONTEND_PORT}/reset-password?token=${resetToken}`

        await mail(email, {
            subject: 'Password Reset Request',
            body: `You requested a password reset. Please use the following link to reset your password: <a href="${resetLink}">Reset Password</a>. This link will expire in 1 hour.`
        })

        res.status(200).json({
            message: 'Password reset link sent to your email.'
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' })
    }
}
