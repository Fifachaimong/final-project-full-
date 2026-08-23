const ErrorMiddleware = (err, req, res, next) => {
    console.error(err)
    const statusError = err.status || 500
    res.status(statusError).json({
        message : err.message || 'Internal Server Error',
        field : err.field || null
    })
}

export default ErrorMiddleware