const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const tournamentRoutes = require('./routes/tournamentRoutes')
const queueRoutes = require('./routes/queueRoutes')
const adminRoutes = require('./routes/adminRoutes')
const authMiddleware = require('./middleware/authMiddleware')
const userRoutes = require('./routes/userRoutes')

const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin:'http://localhost:5173',
        methods:['GET','POST','PUT','DELETE']
    }
})

// ✅ FIXED CORS (IMPORTANT)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options(/.*/, cors())

app.use(express.json())

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads')
    )
)

// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/queue', queueRoutes)
app.use('/api/admin', adminRoutes)

const notificationRoutes = require('./routes/notificationRoutes')

app.use(
    '/api/notifications',
    notificationRoutes
)

app.use('/api/users', userRoutes)



// DB
mongoose.connect(process.env.MONGO_URI, {
    family: 4
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))


app.set('io', io)

io.on('connection', (socket) => {

    console.log('Socket connected:', socket.id)


    // ==========================
    // USER ROOM
    // Notifications
    // ==========================

    socket.on('joinUser', (userId) => {

        if (!userId) return

        socket.join(userId)

    })


    // ==========================
    // QUICK PLAY ROOM
    // ==========================

    socket.on('joinQueueSession', (sessionId) => {

        if (!sessionId) return

        socket.join(
            `queue-${sessionId}`
        )

        console.log(
            `Socket ${socket.id} joined queue-${sessionId}`
        )

    })


    // ==========================
    // LEAVE QUICK PLAY ROOM
    // ==========================

    socket.on('leaveQueueSession', (sessionId) => {

        if (!sessionId) return

        socket.leave(
            `queue-${sessionId}`
        )

    })


    // ==========================
    // DISCONNECT
    // ==========================

    socket.on('disconnect', () => {

        console.log(
            'Socket disconnected:',
            socket.id
        )

    })

})



// TEST ROUTE
app.get('/', (req, res) => {
    res.send('ShuttleHub API Running')
})

// PROTECTED TEST
app.get('/dashboard', authMiddleware, (req, res) => {
    res.json({
        message: 'Dashboard OK',
        user: req.user
    })
})

server.listen(5000, () => {
    console.log('Server running on port 5000')
})