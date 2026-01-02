import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function getTrending(req: Request, res: Response) {
    try {
        const trendingPosts = await pool.query(`
            SELECT
                p.id,
                p.user_id,
                p.caption,
                p.has_media,
                p.likes,
                p.created_at,
                u.name AS username,
                u.profile_url AS user_profile_url,
                ARRAY_AGG(m.url ORDER BY m.id) FILTER (WHERE m.url IS NOT NULL) AS media_url
            FROM posts AS p
            JOIN users AS u ON p.user_id = u.id
            LEFT JOIN medias AS m ON p.id = m.post_id
            GROUP BY p.id, u.id, p.caption, p.has_media, p.likes, p.created_at, u.name, u.profile_url
            ORDER BY p.likes DESC, p.created_at DESC
            LIMIT 5;
        `);

        res.status(200).json(trendingPosts.rows);

    } catch (error: any) {
        console.error('Error fetching trending posts:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
