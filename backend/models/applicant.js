import db from "../lib/db.js";

export const GetPostModel = async(setoff, limit, search, filter) => {
    let query = ` 
    SELECT posts.id, posts.owner_id, posts.company_name, posts.title, posts.faculty, posts.deadline,
        posts.icon, posts.posts_status,
        CASE
            WHEN posts.posts_status = 'open' THEN true
            ELSE false
        END AS is_open,
        CONCAT(users.firstname, ' ', users.lastname) AS owner_name
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
        condition.push('posts.posts_status = ?')
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


export const CreateResume = async (memberId, resumeUrl, transcriptUrl, aiScore, skills, storytelling_score, ai_reason, overall_confidence, specific_strengths, faculty_match)=>{
    const [result] = await db.query(`
        INSERT INTO resume
        (member_id, resume_url, transcript_url, ai_score, storytelling_score, overall_confidence, skills, ai_reason, specific_strengths, faculty_match)
        VALUES(? ,? ,? ,? ,? ,? ,? ,? ,? ,?)   
        `,
        [ memberId, resumeUrl, transcriptUrl, aiScore,  storytelling_score, overall_confidence, skills, ai_reason, specific_strengths, faculty_match]
    );

    return result;
}

export const GetDataPostById = async (post_id) => {
    const [result] = await db.query(`
        SELECT description, faculty, model_provider FROM posts WHERE id = ?
    `,[ post_id ])

    return result[0]
}

export const GetMyApplicationResultModel = async (id) => {
    const [result] = await db.query(`
        SELECT p.icon, p.title, p.company_name, m.status, r.ai_score, r.ai_reason, r.specific_strengths, r.faculty_match
        FROM members m
        JOIN posts p ON p.id = m.post_id
        JOIN resume r ON r.member_id = m.id
        WHERE m.user_id = ?
    `,[ id ])

    return result[0]
}