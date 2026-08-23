const createUserSchema = {
    firstname : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'First name must contain only Thai or English letters.'
            }
        ]
    },
    lastname : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'Last name must contain only Thai or English letters.'
            }
        ]
    },
    email : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Z0-9]{1,20}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message : 'Please enter a valid email format.'
            }
        ]
    },
    password : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^(?=(?:.*[0-9]){5,})(?=.*[a-z])(?=.*[A-Z]).+$/.test(value),
                message : 'Password must contain at least 5 numbers, one uppercase letter, and one lowercase letter.'
            }
        ]
    },
    role : {
        type : ['applicant', 'hr', 'admin'],
        required : false,
        default : 'applicant'
    }
}

const editUserSchema = {
    firstname : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'First name must contain only Thai or English letters.'
            }
        ]
    },
    lastname : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'Last name must contain only Thai or English letters.'
            }
        ]
    },
    password : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^(?=(?:.*[0-9]){5,})(?=.*[a-z])(?=.*[A-Z]).+$/.test(value),
                message : 'Password must contain at least 5 numbers, one uppercase letter, and one lowercase letter.'
            }
        ]
    },
    phone : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[0-9]{10}$/.test(value),
                message : 'Phone number must contain exactly 10 digits.'
            }
        ]
    },
    role : {
        type : ['applicant', 'hr', 'admin'],
        required : false
    }
}

export { createUserSchema, editUserSchema }