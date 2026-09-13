const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            })
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader

        const verified = jwt.verify(token, process.env.JWT_SECRET)

        // normalize user object
        req.user = {
            id: verified.id || verified._id,
            username: verified.username,
            role: verified.role
        }

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token"
        })

    }
}

module.exports = authMiddleware