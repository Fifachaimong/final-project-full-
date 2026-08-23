import AppError from "../utils/AppError.js"

export const ValidateBody = (schema) => {
    return (req, res, next) => {
        const data = req.body
        for (const key in data) {
            if (!(key in schema)) {
                return next(new AppError('You are not allowed to enter this information.', 400, key))
            }
        }
        
        for (const key in schema) {
            const rule = schema[key]
            const value = data[key]
            if (rule.required && value === undefined) {
                return next(new AppError(`Please enter your ${key}`, 400, key))
            }

            if (!rule.required && value === undefined) {
                if (rule.default !== undefined) {
                    data[key] = rule.default
                }

                continue
            }

            if (rule.type === 'string') {
                if (typeof value !== 'string' || !value.trim()) {
                    return next(new AppError(`${key} must be a string`, 400, key))
                }
            }
            
            if (rule.type === 'number') {
                if (typeof value !== 'number') {
                    return next(new AppError(`${key} must be a number`, 400, key))
                }
            }

            if (Array.isArray(rule.type)) {
                if (!rule.type.includes(value)) {
                    return next(new AppError(`${key} must be a ${rule.type}`, 400, key))
                }
            }

            if (rule.validate) {
                for (const item of rule.validate) {
                    if (!item.check(value)) {
                        return next(new AppError(item.message, 400, key))
                    }
                }
            }
            
        }
        next()
    }
}