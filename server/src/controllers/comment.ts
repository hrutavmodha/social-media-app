import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function comment(req: Request, res: Response) {
    try {
        await pool.query(`
            INSERT INTO comments(post_id, user_id, text)
            VALUES ($1, $2, $3)    
        `, [
            req.body.id, (req as any).user.id, req.body.text
        ])
        res.status(200).json({
            message: 'Commented successfully'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'An internal server error occured. Please try again later'
        })
    }
}