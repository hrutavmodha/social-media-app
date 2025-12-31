import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'
import { env } from '../../config/env.ts'

export default async function post(req: Request, res: Response) {
    try {
        let paths: Array<any> = (req.files as any).map((file: any) => {
            return `http://${env.HOST}:${env.PORT}/${file.path}`
        })
        console.log(JSON.stringify(paths, null, 4))
        const post = await pool.query(`
            INSERT INTO posts(user_id, caption) 
            VALUES ($1, $2)
            RETURNING id;    
        `, [
            (req as any).user.id, req.body.caption
        ])
        if (paths.length !== 0) {
            paths.forEach(async (path: string) => {
                await pool.query(`
                    INSERT INTO medias(post_id, url)    
                    VALUES ($1, $2);
                `, [
                    post.rows[0].id, path
                ])
            })
            await pool.query(`
                UPDATE posts
                SET has_media = TRUE
                WHERE id = $1
           `, [
                post.rows[0].id
            ])
        }
        res.status(200).json({
            message: 'Uploaded successfully'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'An Internal Server Error occured. Please try again later'
        })
    }
}