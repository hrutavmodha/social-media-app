import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import register from './src/controllers/register.ts'
import login from './src/controllers/login.ts'
import logout from './src/controllers/logout.ts'
import validate from './src/utils/validate.ts'
import post from './src/controllers/post.ts'
import getPosts from './src/controllers/getPosts.ts'
import getProfile from './src/controllers/getProfile.ts'
import updateProfile from './src/controllers/updateProfile.ts'
import forgotPassword from './src/controllers/forgotPassword.ts'
import setNewPassword from './src/controllers/setNewPassword.ts'
import comment from './src/controllers/comment.ts'
import getComments from './src/controllers/getComments.ts'
import getUser from './src/controllers/getUser.ts'
import search from './src/controllers/search.ts'
import getTrending from './src/controllers/getTrending.ts'
import getWhoToFollow from './src/controllers/getWhoToFollow.ts'
import followUser from './src/controllers/followUser.ts'
import likePost from './src/controllers/likePost.ts'
import unfollowUser from './src/controllers/unfollowUser.ts'
import getNotifications from './src/controllers/getNotifications.ts'
import updatePost from './src/controllers/updatePost.ts'
import deletePost from './src/controllers/deletePost.ts'
import { env } from './config/env.ts'
import { initDb } from './config/db.ts'
import { pool } from './config/db.ts'
import { upload } from './src/utils/upload.ts'

const app = express() 

app.use(express.json())
app.use(cors({
    origin: `http://${env.HOST}:${env.FRONTEND_PORT}`,
    credentials: true
}))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

initDb(pool)
.then(() => {
    console.log('Connected to PostGreSQL successfully')    
})
.catch((error: any) => {
    console.log(error)    
})

app.post('/auth/register', register)
app.post('/auth/login', login)
app.post('/auth/logout', logout)
app.post('/auth/forgot-password', forgotPassword)
app.post('/auth/reset-password', setNewPassword)
app.get('/posts/:id?', getPosts)
app.post('/posts', validate, upload.array('media', 5), post)
app.put('/posts/:id', validate, upload.array('media', 5), updatePost)
app.delete('/posts/:id', validate, deletePost)
app.get('/profile', validate, getProfile)
app.post('/profile', validate, upload.single('profile'), updateProfile)
app.get('/notifications', validate, getNotifications)
app.post('/comment', validate, comment)
app.get('/comments/:id', getComments)
app.get('/users/:id', getUser)
app.get('/search', search)
app.get('/trending', getTrending)
app.get('/who-to-follow', validate, getWhoToFollow)
app.post('/users/:id/follow', validate, followUser)
app.post('/users/:id/unfollow', validate, unfollowUser)
app.post('/posts/:id/like', validate, likePost)

app.listen(
    Number(env.PORT as string),
    env.HOST as string,
    () => {    
        console.log(`Server is running at http://${env.HOST}:${env.PORT} `)
    }
)