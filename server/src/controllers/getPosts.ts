import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function getPosts(_: Request, res: Response) {
    let response: any = {}
    try {
        const posts = await pool.query(`
            SELECT
                p.id,
                p.user_id,
                p.caption,
                p.has_media,
                p.likes,
                p.created_at,
                p.updated_at,
                u.name AS username,
                u.profile_url AS user_profile_url,
                ARRAY_AGG(m.url ORDER BY m.id) FILTER (WHERE m.url IS NOT NULL) AS media_url -- Collect all media URLs into an array, filtering out nulls for posts without media
            FROM posts AS p
            JOIN users AS u ON p.user_id = u.id
            LEFT JOIN medias AS m ON p.id = m.post_id
            GROUP BY p.id, u.id, p.caption, p.has_media, p.likes, p.created_at, p.updated_at, u.name, u.profile_url
            ORDER BY p.created_at DESC;
        `)
        console.log(JSON.stringify(posts.rows, null, 4))
        res.status(200).json(posts.rows)
        
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
    }
}