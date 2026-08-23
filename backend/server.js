import "./config/env.js"
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes/auth.js'
import route from "./routes/hr.js"
import ErrorMiddleware from './middleware/ErrorMiddleware.js'
import routess from "./routes/admin.js"
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./docs/swaggerConfig.js"
import cookieParser from "cookie-parser"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(morgan('dev'))
app.use('/auth', routes)
app.use('/hr', route)
app.use('/admin', routess)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(ErrorMiddleware)

app.listen(5000, () => {
    console.log('Server running on port 5000')
})