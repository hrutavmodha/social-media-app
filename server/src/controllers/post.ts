import type {
    Request,
    Response
} from 'express'
import { pool } from '../../config/db.ts'
import { env } from '../../config/env.ts'

export default async function post(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const caption = req.body.caption;
        const mediaFiles = req.files as Express.Multer.File[];

        if (!caption && (!mediaFiles || mediaFiles.length === 0)) {
            return res.status(400).json({ message: 'A post must have either a caption or media.' });
        }

        let paths: Array<string> = [];
        if (mediaFiles && mediaFiles.length > 0) {
            paths = mediaFiles.map((file: any) => {
                return `http://${env.HOST}:${env.PORT}/${file.path}`
            });
        }
        
        const postResult = await pool.query(`
            INSERT INTO posts(user_id, caption, has_media)
            VALUES ($1, $2, $3)
            RETURNING id;
        `, [
            userId, caption, paths.length > 0
        ]);
        const postId = postResult.rows[0].id;

        if (paths.length !== 0) {
            for (const path of paths) {
                await pool.query(`
                    INSERT INTO medias(post_id, url)    
                    VALUES ($1, $2);
                `, [
                    postId, path
                ]);
            }
        }
        res.status(200).json({
            message: 'Post created successfully'
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({
            message: 'An Internal Server Error occurred. Please try again later'
        })
    }
}