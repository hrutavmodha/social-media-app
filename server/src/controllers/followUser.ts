import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function followUser(req: Request, res: Response) {
    const userToFollowId = req.params.id;
    const followerId = (req as any).user.id;

    if (String(followerId) === userToFollowId) {
        return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    try {
        const checkFollow = await pool.query(`
            SELECT * FROM followers
            WHERE follower_id = $1 AND following_id = $2;
        `, [followerId, userToFollowId]);

        if (checkFollow.rows.length > 0) {
            return res.status(400).json({ message: 'You are already following this user.' });
        }

        await pool.query(`
            INSERT INTO followers(follower_id, following_id)
            VALUES ($1, $2);
        `, [followerId, userToFollowId]);

        await pool.query(`
            UPDATE users
            SET followers_count = followers_count + 1
            WHERE id = $1;
        `, [userToFollowId]);

        await pool.query(`
            UPDATE users
            SET following_count = following_count + 1
            WHERE id = $1;
        `, [followerId]);

        await pool.query(`
            INSERT INTO notifications(recipient_id, sender_id, type)
            VALUES ($1, $2, 'follow');
        `, [userToFollowId, followerId]);

        res.status(200).json({
            message: 'Started successfully following a new user'
        });
    } catch (error: any) {
        console.error('Error following user:', error);
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later'
        });
    }
}