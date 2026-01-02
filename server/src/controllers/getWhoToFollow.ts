import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function getWhoToFollow(req: Request, res: Response) {
    const userId = (req as any).user.id; // Authenticated user ID

    try {
        const suggestedUsers = await pool.query(`
            SELECT
                u.id,
                u.name,
                u.profile_url,
                u.followers_count
            FROM users AS u
            WHERE u.id != $1
            AND NOT EXISTS (
                SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = u.id
            )
            ORDER BY RANDOM()
            LIMIT 5;
        `, [userId]);

        res.status(200).json(suggestedUsers.rows);

    } catch (error: any) {
        console.error('Error fetching "Who to Follow" users:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
