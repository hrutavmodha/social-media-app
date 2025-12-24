import type { Request, Response } from 'express'

export default function logout(_: Request, res: Response) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true
    }).status(200).json({
        message: 'Logged out successfully'
    })
}