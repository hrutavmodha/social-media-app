import type {
    Request,
    Response
} from 'express'
import { pool } from '../config/db.ts'

export default async function getPosts(req: Request, res: Response) {
    try {
        const posts = await pool.query(`
            SELECT posts.*, users.name AS username, users.profile_url as user_profile_url
            FROM posts, users 
            WHERE posts.user_id = users.id;    
        `)
        res.status(200).json(posts.rows)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
    }
}