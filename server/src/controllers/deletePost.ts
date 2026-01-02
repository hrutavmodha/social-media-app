import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function deletePost(req: Request, res: Response) {
    const postId = req.params.id;
    const userId = (req as any).user.id;

    try {
        const postResult = await pool.query(`
            SELECT user_id FROM posts WHERE id = $1;
        `, [postId]);

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (postResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
        }

        await pool.query(`
            DELETE FROM medias WHERE post_id = $1;
        `, [postId]);

        await pool.query(`
            DELETE FROM posts WHERE id = $1;
        `, [postId]);

        res.status(200).json({ message: 'Post deleted successfully.' });

    } catch (error: any) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
