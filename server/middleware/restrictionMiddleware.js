const User = require('../models/user')


const restrictionMiddleware =
    async (req, res, next) => {

        try {

            const user =
                await User.findById(req.user.id)


            if (!user) {

                return res.status(401).json({
                    message:
                        'User account not found'
                })

            }


            if (user.isRestricted) {

                return res.status(403).json({

                    message:
                        'Your account is currently restricted from using this feature.',

                    restricted: true

                })

            }


            req.currentUser = user

            next()


        } catch (err) {

            console.error(
                'RESTRICTION CHECK ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to verify account status'
            })

        }

    }


module.exports =
    restrictionMiddleware