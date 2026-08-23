import AppError from '../utils/AppError.js'

const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user.role || !roles.includes(req.user.role)) {
            return next(new AppError('Forbidden', 403))
        }

        next()
    }
}

export default roleMiddleware
