import db from "../lib/db.js"

export const CreatePostModel = async(id, data, icon) => {
    const { company_name, title, faculty, description, model_provider, deadline } = data

    const [result] = await db.query(
        'INSERT INTO posts (owner_id, company_name, title, icon, faculty, description, model_provider, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ id, company_name, title, icon, faculty, description, model_provider, deadline ]
    )

    return result
}

export const EditPostModel = async(data, owner_id, post_id, icon, role) => {
    let query = `
        UPDATE posts 
        SET company_name = COALESCE(?, company_name), title = COALESCE(?, title), faculty = COALESCE(?, faculty), 
            description = COALESCE(?, description), model_provider = COALESCE(?, model_provider), 
            deadline = COALESCE(?, deadline), icon = COALESCE(?, icon), posts_status = COALESCE(?, posts_status)
        WHERE id = ?`

    const { company_name, title, faculty, description, model_provider, deadline, posts_status } = data

    let value = [company_name, title, faculty, description, model_provider, deadline, icon, posts_status, post_id]

    if (role !== 'admin') {
        query += ' AND owner_id = ?'
        value.push(owner_id)
    }

    const [result] = await db.query(query , value )

    return result
}

export const DeletePostModel = async(owner_id, post_id, role) => {
    let query = 'DELETE FROM posts WHERE id = ?'
    let value = [post_id]

    if (role !== 'admin') {
        query += ' AND owner_id = ?'
        value.push(owner_id)
    }

    const [result] = await db.query(query, value)
    
    return result
}

export const GetMemberModel = async(owner_id, post_id, setoff, limit) => {
    const [result] = await db.query(`
        SELECT u.id AS user_id, u.firstname AS user_firstname, u.lastname AS user_lastname, r.ai_score, m.status
        FROM posts p 
        JOIN members m ON m.post_id = p.id
        JOIN users u ON m.user_id = u.id
        JOIN resume r ON m.id = r.member_id
        WHERE p.owner_id = ? AND p.id = ?
        LIMIT ? OFFSET ?
    `, 
    [Number(owner_id), post_id, limit, setoff])

    return result
}

export const GetMemberTotalCount = async(owner_id, post_id) => {
    const [result] = await db.query(`
        SELECT COUNT(*) AS total
        FROM posts p 
        JOIN members m ON m.post_id = p.id
        JOIN users u ON m.user_id = u.id
        JOIN resume r ON m.id = r.member_id
        WHERE p.owner_id = ? AND p.id = ?
    `,
    [Number(owner_id), post_id])

    return result[0]
}

export const GetProfileByMemberModel = async(member_id, owner_id) => {
    const [result] = await db.query(`
        SELECT u.id AS user_id , u.firstname AS user_firstname, u.lastname AS user_lastname, u.email AS user_email, u.phone AS user_phone
        FROM posts p 
        JOIN members m ON m.post_id = p.id
        JOIN users u ON m.user_id = u.id
        WHERE u.id = ? AND p.owner_id = ?
        `,
        [member_id, owner_id]
    )

    return result[0]
}

export const GetMemberResumeResultModel = async (member_id, owner_id, post_id) => {
    const [result] = await db.query(`
        SELECT r.resume_url, r.transcript_url, r.ai_score, r.storytelling_score, r.overall_confidence, r.skills, r.ai_reason, m.status
        FROM posts p
        JOIN members m ON m.post_id = p.id
        JOIN resume r ON r.member_id = m.id
        WHERE m.user_id = ? AND p.owner_id = ? AND p.id = ?
        `,[member_id, owner_id, post_id]
    )

    return result[0]
}

export const UpdateCandidateStatusModel = async (member_status, member_id, owner_id, post_id) => {
    const [result] = await db.query(`
        UPDATE members m
        JOIN posts p ON p.id = m.post_id
        SET m.status = COALESCE(?, m.status)
        WHERE m.user_id = ? AND p.owner_id = ? AND p.id = ?
    `,[member_status, member_id, owner_id, post_id])

    return result
}

export const DeleteMemberInPostModel = async (member_id, owner_id, post_id) => {
    const [result] = await db.query(`
        DELETE m 
        FROM members AS m
        JOIN posts AS p ON p.id = m.post_id
        WHERE m.user_id = ? AND p.owner_id = ? AND p.id = ?
    `, [member_id, Number(owner_id), post_id])

    return result
}