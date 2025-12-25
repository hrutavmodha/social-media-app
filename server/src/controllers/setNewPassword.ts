import type {
    Request,
    Response
} from 'express'
import mail from '../utils/mail.ts'

export default function setNewPassword(req: Request, res: Response) {
    mail(req.body.email, {
        subject: 'Test Mail',
        body: 'Hello, World!'
    })
    res.status(200).json({
        message: 'Hello World'
    })
}