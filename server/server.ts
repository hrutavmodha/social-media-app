import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import register from './src/register.ts'
import login from './src/login.ts'
import logout from './src/logout.ts'
import validate from './src/validate.ts'
import post from './src/post.ts'
import getPosts from './src/getPosts.ts'
import getProfile from './src/getProfile.ts'
import { env } from './config/env.ts'
import { initDb } from './config/db.ts'
import { pool } from './config/db.ts'
import { upload } from './src/upload.ts'


const app = express() 

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

initDb(pool)

app.post('/auth/register', register)
app.post('/auth/login', login)
app.post('/auth/logout', logout)
app.get('/posts', validate, getPosts)
app.post('/posts', validate, upload.array('media'), post)
app.get('/profile', validate, getProfile)

app.listen(
    parseInt(env.PORT as string),
    env.HOST as string,
    () => {    
        console.log(`Server is running at http://${env.HOST}:${env.PORT} `)
    }
)