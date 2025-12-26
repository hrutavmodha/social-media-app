import type { Request, Response } from 'express'
import { pool } from '../../config/db.ts'
import { hash } from 'bcrypt'

export default async function setNewPassword(req: Request, res: Response) {
    try {
        const { token, password } = req.body
        const tokenResult = await pool.query(`
            SELECT user_id, expires_at FROM password_reset_tokens
            WHERE token = $1
        `, [token])

        if (tokenResult.rows.length === 0) {
            res.status(400).json({
                message: 'Invalid or expired password reset token.'
            })
        }

        const { user_id, expires_at } = tokenResult.rows[0]

        if (new Date() > new Date(expires_at)) {    
            await pool.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [token])
            res.status(400).json({
                message: 'Invalid or expired password reset token.'
            })
        }

        const hashedNewPassword = await hash(password, 10)
        
        await pool.query(`
            UPDATE users
            SET password = $1
            WHERE id = $2
        `, [
            hashedNewPassword, user_id
        ])
        await pool.query(`
            DELETE FROM password_reset_tokens
            WHERE token = $1
        `, [
            token
        ])

        res.status(200).json({
            message: 'Password updated successfully.'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later.'
        })
    }
}
