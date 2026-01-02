import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function unfollowUser(req: Request, res: Response) {
    const userToUnfollowId = req.params.id;
    const followerId = (req as any).user.id;

    if (String(followerId) === userToUnfollowId) {
        return res.status(400).json({ message: 'You cannot unfollow yourself.' });
    }

    try {
        const checkFollow = await pool.query(`
            SELECT * FROM followers
            WHERE follower_id = $1 AND following_id = $2;
        `, [followerId, userToUnfollowId]);

        if (checkFollow.rows.length === 0) {
            return res.status(400).json({ message: 'You are not following this user.' });
        }

        await pool.query(`
            DELETE FROM followers
            WHERE follower_id = $1 AND following_id = $2;
        `, [followerId, userToUnfollowId]);

        await pool.query(`
            UPDATE users SET following_count = following_count - 1 WHERE id = $1;
        `, [followerId]);

        await pool.query(`
            UPDATE users SET followers_count = followers_count - 1 WHERE id = $1;
        `, [userToUnfollowId]);

        res.status(200).json({ message: 'User unfollowed successfully.' });

    } catch (error: any) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}