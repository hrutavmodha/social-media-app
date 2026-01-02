import type { Request, Response } from 'express';
import { pool } from '../../config/db.ts';
import { env } from '../../config/env.ts';

export default async function updatePost(req: Request, res: Response) {
    const postId = parseInt(req.params.id);
    const { caption, clearMedia } = req.body;
    const userId = (req as any).user.id;
    const newMediaFiles = req.files as Express.Multer.File[];

    if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid Post ID.' });
    }

    try {
        const postResult = await pool.query(`
            SELECT user_id, has_media FROM posts WHERE id = $1;
        `, [postId]);

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (postResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this post.' });
        }
        
        const isClearingMedia = clearMedia === 'true';
        if (!caption && newMediaFiles.length === 0 && !isClearingMedia && !postResult.rows[0].has_media) {
            return res.status(400).json({ message: 'Post must have either a caption or media after update.' });
        }

        let newMediaPaths: Array<string> = [];
        if (newMediaFiles && newMediaFiles.length > 0) {
            newMediaPaths = newMediaFiles.map((file: any) => {
                return `http://${env.HOST}:${env.PORT}/${file.path}`;
            });

            await pool.query(`
                DELETE FROM medias WHERE post_id = $1;
            `, [postId]);

            for (const path of newMediaPaths) {
                await pool.query(`
                    INSERT INTO medias(post_id, url)    
                    VALUES ($1, $2);
                `, [postId, path]);
            }
            
            await pool.query(`
                UPDATE posts
                SET has_media = TRUE
                WHERE id = $1;
            `, [postId]);

        } else if (isClearingMedia) {
            await pool.query(`
                DELETE FROM medias WHERE post_id = $1;
            `, [postId]);
            await pool.query(`
                UPDATE posts
                SET has_media = FALSE
                WHERE id = $1;
            `, [postId]);
        }

        await pool.query(`
            UPDATE posts
            SET caption = $1
            WHERE id = $2;
        `, [caption, postId]);

        res.status(200).json({
            message: 'Post updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating post:', error);
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later.'
        });
    }
}
