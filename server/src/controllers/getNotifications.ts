import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';

export default async function getNotifications(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const markAsRead = req.query.markAsRead === 'true';

    try {
        const notificationsResult = await pool.query(`
            SELECT
                n.id,
                n.sender_id,
                s.name AS sender_username,
                s.profile_url AS sender_profile_url,
                n.type,
                n.post_id,
                n.comment_id,
                n.read,
                n.created_at,
                p.caption AS post_caption
            FROM notifications AS n
            JOIN users AS s ON n.sender_id = s.id
            LEFT JOIN posts AS p ON n.post_id = p.id
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC;
        `, [userId]);

        if (markAsRead && notificationsResult.rows.length > 0) {
            await pool.query(`
                UPDATE notifications
                SET read = TRUE
                WHERE recipient_id = $1 AND read = FALSE;
            `, [userId]);
        }

        res.status(200).json(notificationsResult.rows);

    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
