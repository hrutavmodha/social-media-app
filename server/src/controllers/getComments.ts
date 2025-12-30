import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function getComments(req: Request, res: Response) {
    try {
        const comments = await pool.query(`
        SELECT 
            comments.*, 
            users.name AS username, 
            users.profile_url AS user_profile_url 
        FROM comments, users
        WHERE post_id = $1 AND comments.user_id = users.id
        `, [
            req.params.id
        ])
        res.status(200).json(comments.rows)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'An internal server error occured. Please try again later'
        })
    }
}