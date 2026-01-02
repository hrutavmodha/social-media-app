import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function likePost(req: Request, res: Response) {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    try {
        const postOwnerResult = await pool.query(`
            SELECT user_id FROM posts WHERE id = $1;
        `, [postId]);

        if (postOwnerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        const postOwnerId = postOwnerResult.rows[0].user_id;

        const likeCheck = await pool.query(`
            SELECT * FROM likes WHERE user_id = $1 AND post_id = $2;
        `, [userId, postId]);

        if (likeCheck.rows.length > 0) {
            await pool.query(`
                DELETE FROM likes WHERE user_id = $1 AND post_id = $2;
            `, [userId, postId]);

            await pool.query(`
                UPDATE posts SET likes = likes - 1 WHERE id = $1;
            `, [postId]);

            res.status(200).json({ message: 'Post unliked successfully.', is_liked: false });
        } else {
            await pool.query(`
                INSERT INTO likes (user_id, post_id) VALUES ($1, $2);
            `, [userId, postId]);

            await pool.query(`
                UPDATE posts SET likes = likes + 1 WHERE id = $1;
            `, [postId]);

            if (String(userId) !== String(postOwnerId)) {
                await pool.query(`
                    INSERT INTO notifications(recipient_id, sender_id, type, post_id)
                    VALUES ($1, $2, 'like', $3);
                `, [postOwnerId, userId, postId]);
            }

            res.status(200).json({ message: 'Post liked successfully.', is_liked: true });
        }

    } catch (error: any) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}