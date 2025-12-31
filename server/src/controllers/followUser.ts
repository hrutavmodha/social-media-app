import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function followUser(req: Request, res: Response) {
    try {
        await pool.query(`
            INSERT INTO follows(user_id, follower_id)
            VALUES ($1, $2);
        `, [
            req.params.id, (req as any).user.id
        ])
        await pool.query(`
            UPDATE users 
            SET followers = followers + 1
            WHERE id = $1;
        `, [
            req.params.id
        ])
        await pool.query(`
            UPDATE users
            SET following = following + 1
            WHERE id = $1;    
        `, [
            (req as any).user.id
        ])
        res.status(200).json({
            message: 'Started successfully following a new user'
        })
    } catch (error: any) {
        res.status(500).json({
            message: 'An internal server error occured. Please try again later'
        })
    }
}