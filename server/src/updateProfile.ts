import type {
    Request,
    Response
} from 'express'
import { pool } from '../config/db.ts'
import { env } from '../config/env.ts'

export default async function updateProfile(req: Request, res: Response) {
    try {
        await pool.query(`
            UPDATE users
            SET 
                name = $1,
                email = $2,
                profile_url = $3
            WHERE id = $4
        `, [
            req.body.name, req.body.email, `http://${env.HOST}:${env.PORT}/${req.file?.path}`, (req as any).user.id
        ])
        res.status(200).json({
            message: 'Updated profile'
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            message: 'Some internal server error occured. Please try again later'
        })
    }
}