import type {
    Request,
    Response
} from 'express'
import { pool } from '../config/db.ts'

export default async function getProfile(req: Request, res: Response) {
    try {
        const user = await pool.query(`
            SELECT * FROM users 
            WHERE id = $1    
        `, [
            (req as any).user.id
        ])
        res.status(200).json(user.rows[0])
    } catch (error: any) {
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
    }

}