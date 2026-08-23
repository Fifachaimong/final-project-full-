import db from "../lib/db.js";

export const CreateUser = async(data) => {
    const { firstname, lastname, email, password, role } = data
    const [result] = await db.query('INSERT INTO users(firstname, lastname, email, password, role) VALUES(?, ?, ?, ?, ?)', [firstname, lastname, email, password, role])
    return result
}

export const GetUserByEmail = async(email) => {
    const [result] = await db.query('SELECT id, role, password FROM users WHERE email = ?', [email])
    return result[0]
}

export const GetUserByID = async(id) => {
    const [result] = await db.query('SELECT id FROM users WHERE id = ?', [id])
    return result
}

export const GetPostModel = async(setoff, limit, search, filter) => {
    let query = `
        SELECT posts.title, posts.owner_id, posts.faculty, posts.description, posts.deadline, 
        users.firstname as owner_firstname, users.lastname as owner_lastname, posts.posts_status
        FROM posts
        JOIN users ON posts.owner_id = users.id
    `
    let value = []
    let condition = []

    if (search !== null) {
        condition.push('posts.title LIKE ?')
        value.push(`%${search}%`)
    }

    if (filter !== null) {
        condition.push('posts.status = ?')
        value.push(filter)
    }

    if (condition.length > 0) {
        query += ' WHERE ' + condition.join(' AND ')
    }

    query += ' LIMIT ? OFFSET ?'
    value.push(limit, setoff)
    
    const [result] = await db.query(query, value)

    return result
}

export const GetMemberByUserAndPost = async (userId, postId) => {
    const [result] = await db.query(
        'SELECT id FROM members WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    )

    return result[0];
}


export const CreateMember = async (userId, postId) => {
    const [result] = await db.query(
        "INSERT INTO members(user_id, post_id, status) VALUES(?, ?, 'pending')",
        [userId, Number(postId)]
    )
    
    return result;
}


export const CreateResume = async (memberId, resumeUrl, transcriptUrl, aiScore, skills, storytelling_score, ai_reason, overall_confidence)=>{
    const [result] = await db.query(`
        INSERT INTO resume
        (member_id, resume_url, transcript_url, ai_score, storytelling_score, overall_confidence, skills, ai_reason)
        VALUES(? ,? ,? ,? ,? ,? ,? ,?)   
        `,
        [ memberId, resumeUrl, transcriptUrl, aiScore,  storytelling_score, overall_confidence, skills, ai_reason]
    );

    return result;
}

export const EditMyProfileModel = async (id, data, icon) => {
    const { firstname, lastname, phone } = data
    const [result] = await db.query(`
        UPDATE users 
        SET firstname = COALESCE(?, firstname), lastname = COALESCE(?, lastname), 
            phone = COALESCE(?, phone), icon = COALESCE(?, icon)
        WHERE id = ?
        `,[ firstname, lastname, phone, icon, id ]
    )

    return result
}

export const GetMyProfileModel = async (id) => {
    const [result] = await db.query(
        `SELECT id, firstname, lastname, icon, email, phone, role FROM users WHERE id = ?`,
        [id]
    )

    return result[0]
}

export const GetPostByIDModel = async (post_id) => {
    const [result] = await db.query(`
        SELECT description FROM posts WHERE id = ?
    `,[ post_id ])

    return result[0]
}

export const GetMyApplicationResultModel = async (id) => {
    const [result] = await db.query(`
        SELECT m.post_id, p.title, m.status, r.ai_score, r.ai_analysis
        FROM members m
        JOIN posts p ON p.id = m.post_id
        JOIN resume r ON r.member_id = m.id
        WHERE m.user_id = ?
    `,[ id ])

    return result
}