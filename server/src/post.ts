import type {
    Request,
    Response
} from 'express'
import { pool } from '../config/db.ts'
import { env } from '../config/env.ts'

export default async function post(req: Request, res: Response) {
    try {
        await pool.query(`
            INSERT INTO posts(user_id, caption, media_url, media_type) 
            VALUES ($1, $2, $3, $4)    
        `, [
            (req as any).user.id, req.body.caption, `http://${env.HOST}:${env.PORT}/${(req.files as any)[0].path}`, (req.files as any)[0].mimetype
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