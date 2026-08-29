const createPostSchema = {
    company_name : {
        type : 'string',
        required : true
    },
    title : {
        type : 'string',
        required : true
    },
    faculty : {
        type : 'string',
        required : true
    },
    description : {
        type : 'string',
        required : true
    },
    model_provider : {
        type : 'string',
        required : true
    },
    deadline : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) =>
                    /^[2-9][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$/.test(value),
                message : 'กำหนดการต้องอยู่ในรูปแบบ YYYY-MM-DD'
            }
        ]
    },
    posts_status : {
        type : ['open', 'closed'],
        required : false
    }
}

const editPostSchema = {
    company_name : {
        type : 'string',
        required : false
    },
    title : {
        type : 'string',
        required : false
    },
    faculty : {
        type : 'string',
        required : false
    },
    description : {
        type : 'string',
        required : false
    },
    model_provider : {
        type : 'string',
        required : false
    },
    deadline : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) =>
                    /^[2-9][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$/.test(value),
                message : 'กำหนดการต้องอยู่ในรูปแบบ YYYY-MM-DD'
            }
        ]
    },
    posts_status : {
        type : ['open', 'closed'],
        required : false
    }
}

const updateCandidateStatusSchema = {
    status : {
        type : ['pending', 'approved', 'rejected'],
        required : false,
        default : 'pending'
    }
}

export {createPostSchema, editPostSchema, updateCandidateStatusSchema}