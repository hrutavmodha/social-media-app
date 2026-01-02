import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function search(req: Request, res: Response) {
    const query = req.query.q as string;
    const userId = (req as any).user?.id;

    if (!query) {
        return res.status(400).json({ message: 'Search query cannot be empty.' });
    }

    try {
        const usersResult = await pool.query(`
            SELECT
                id,
                name,
                profile_url,
                email,
                EXISTS (SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = u.id) AS is_following
            FROM users AS u
            WHERE name ILIKE $2 OR email ILIKE $2
            LIMIT 10;
        `, [userId, `%${query}%`]);

        const postsResult = await pool.query(`
            SELECT
                p.id,
                p.user_id,
                p.caption,
                p.has_media,
                p.likes,
                p.created_at,
                u.name AS username,
                u.profile_url AS user_profile_url,
                ARRAY_AGG(m.url ORDER BY m.id) FILTER (WHERE m.url IS NOT NULL) AS media_url,
                EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked
            FROM posts AS p
            JOIN users AS u ON p.user_id = u.id
            LEFT JOIN medias AS m ON p.id = m.post_id
            WHERE p.caption ILIKE $2
            GROUP BY p.id, u.id, p.caption, p.has_media, p.likes, p.created_at, u.name, u.profile_url
            ORDER BY p.created_at DESC
            LIMIT 10;
        `, [userId, `%${query}%`]);

        res.status(200).json({
            users: usersResult.rows,
            posts: postsResult.rows,
        });

    } catch (error: any) {
        console.error('Error during search:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
