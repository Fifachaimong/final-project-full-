class AppError extends Error {
    constructor(message, status, field = null) {
        super(message)
        this.status = status
        this.field = field
    }
}

export default AppError