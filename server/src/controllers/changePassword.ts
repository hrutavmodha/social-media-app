import type { Request, Response } from 'express'
import { compare, hash } from 'bcrypt'
import { pool } from '../../config/db.ts'

export default async function changePassword(req: Request, res: Response) {
    try {
        const { oldPassword, newPassword } = req.body
        const userId = (req as any).user.id 

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        const userResult = await pool.query(`
            SELECT password
            FROM users
            WHERE id = $1
        `, [
            userId
        ])
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        const storedHashedPassword = userResult.rows[0].password

        const passwordMatch = await compare(oldPassword, storedHashedPassword)
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Incorrect old password'
            })
        }

        if (await compare(newPassword, storedHashedPassword)) {
            return res.status(400).json({ message: 'New password cannot be the same as old password.' });
        }

        const hashedNewPassword = await hash(newPassword, 10)
        await pool.query(`
            UPDATE users
            SET password = $1
            WHERE id = $2
        `, [
            hashedNewPassword, userId
        ])
        res.status(200).json({
            message: 'Password changed successfully'
        })

    } catch (error: any) {
        console.error(error)
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later.'
        })
    }
}
