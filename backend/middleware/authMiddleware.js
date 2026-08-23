import AppError from "../utils/AppError.js"
import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token

    if (!token) {
        return next(new AppError("Unauthorization", 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)

        req.user = decoded

        next()
    } catch (error) {
        console.error(error)
        next(new AppError("Invalid token", 401))
    }
}

export default authMiddleware