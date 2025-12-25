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
        await pool.query(`
            INSERT INTO posts(user_id, caption, media_url) 
            VALUES ($1, $2, $3)    
        `, [
            (req as any).user.id, req.body.caption, paths
        ])
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