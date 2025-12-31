import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function getUser(req: Request, res: Response) {
    try {
        const user = await pool.query(`
            SELECT * FROM users 
            WHERE id = $1
        `, [
            req.params.id
        ])
        res.status(200).json(user.rows[0])
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later`'
        })
    }
}