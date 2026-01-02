import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function comment(req: Request, res: Response) {
    const postId = parseInt(req.body.id);
    const userId = (req as any).user.id;
    const commentText = req.body.text;

    if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid Post ID.' });
    }

    if (!commentText || commentText.trim().length === 0) {
        return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    if (commentText.length > 500) {
        return res.status(400).json({ message: 'Comment text is too long (max 500 characters).' });
    }

    try {
        const postOwnerResult = await pool.query(`
            SELECT user_id FROM posts WHERE id = $1;
        `, [postId]);

        if (postOwnerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        const postOwnerId = postOwnerResult.rows[0].user_id;

        const commentResult = await pool.query(`
            INSERT INTO comments(post_id, user_id, text)
            VALUES ($1, $2, $3)
            RETURNING id;
        `, [postId, userId, commentText]);

        const newCommentId = commentResult.rows[0].id;

        if (String(userId) !== String(postOwnerId)) {
            await pool.query(`
                INSERT INTO notifications(recipient_id, sender_id, type, post_id, comment_id)
                VALUES ($1, $2, 'comment', $3, $4);
            `, [postOwnerId, userId, postId, newCommentId]);
        }

        res.status(200).json({
            message: 'Commented successfully'
        });
    } catch (error: any) {
        console.error(error)
        res.status(500).json({
            message: 'An internal server error occurred. Please try again later'
        })
    }
}