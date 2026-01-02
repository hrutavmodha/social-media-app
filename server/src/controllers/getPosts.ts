import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'

export default async function getPosts(req: Request, res: Response) {
    const postId = req.params.id;
    const userId = (req as any).user?.id;

    try {
        if (postId) {
            const postResult = await pool.query(`
                SELECT
                    p.id,
                    p.user_id,
                    p.caption,
                    p.has_media,
                    p.likes,
                    p.created_at,
                    p.updated_at,
                    u.name AS username,
                    u.profile_url AS user_profile_url,
                    ARRAY_AGG(m.url ORDER BY m.id) FILTER (WHERE m.url IS NOT NULL) AS media_url,
                    EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked
                FROM posts AS p
                JOIN users AS u ON p.user_id = u.id
                LEFT JOIN medias AS m ON p.id = m.post_id
                WHERE p.id = $2
                GROUP BY p.id, u.id, p.caption, p.has_media, p.likes, p.created_at, p.updated_at, u.name, u.profile_url
            `, [userId, postId]);

            if (postResult.rows.length === 0) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            const post = postResult.rows[0];

            const commentsResult = await pool.query(`
                SELECT
                    c.id,
                    c.user_id,
                    c.post_id,
                    c.text,
                    c.created_at,
                    u.name AS username,
                    u.profile_url AS user_profile_url
                FROM comments AS c
                JOIN users AS u ON c.user_id = u.id
                WHERE c.post_id = $1
                ORDER BY c.created_at ASC;
            `, [postId]);

            post.comments = commentsResult.rows;

            res.status(200).json(post);

        } else {
            const posts = await pool.query(`
                SELECT
                    p.id,
                    p.user_id,
                    p.caption,
                    p.has_media,
                    p.likes,
                    p.created_at,
                    p.updated_at,
                    u.name AS username,
                    u.profile_url AS user_profile_url,
                    ARRAY_AGG(m.url ORDER BY m.id) FILTER (WHERE m.url IS NOT NULL) AS media_url,
                    EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked
                FROM posts AS p
                JOIN users AS u ON p.user_id = u.id
                LEFT JOIN medias AS m ON p.id = m.post_id
                GROUP BY p.id, u.id, p.caption, p.has_media, p.likes, p.created_at, p.updated_at, u.name, u.profile_url
                ORDER BY p.created_at DESC;
            `, [userId]);
            res.status(200).json(posts.rows);
        }
        
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Some internal server error occurred. Please try again later.'
        });
    }
}