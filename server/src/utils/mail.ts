import { createTransport } from 'nodemailer'
import { env } from '../../config/env.ts'

export default async function mail(email: string, {
    subject,
    body
}: {
    subject: string,
    body: string
}) {
    if (!email) {
        throw new Error('Recepient Email is missing')
    } if (!subject || !body) {
        throw new Error('Mail subject/body is missing')
    }

    const transport = createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD
        }
    })

    transport.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject: subject,
        text: body
    })
}