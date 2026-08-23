import db from "../lib/db.js"

export const CreatePostModel = async(id, data) => {
    const { title, faculty, description, model_name, deadline } = data
    const [result] = await db.query(
        'INSERT INTO posts(owner_id, title, faculty, description, model_name, deadline) VALUES(?, ?, ?, ?, ?, ?)',
        [id, title, faculty, description, model_name, deadline]
    )
    
    return result
}

export const EditPostModel = async(data, owner_id, post_id) => {
    const { title, faculty, description, model_name, deadline } = data
    const [result] = await db.query(`
        UPDATE posts 
        SET title = COALESCE(?, title), faculty = COALESCE(?, faculty), description = COALESCE(?, description), 
            model_name = COALESCE(?, model_name), deadline = COALESCE(?, deadline) 
        WHERE id = ? AND owner_id = ?`,
        [ title, faculty, description, model_name, deadline, post_id, owner_id ]
    )

    return result
}

export const DeletePostModel = async(id, post_id) => {
    const [result] = await db.query('DELETE FROM posts WHERE owner_id = ? AND id = ?', [id, post_id])
    
    return result
}

export const GetMemberModel = async(owner_id) => {
    const [result] = await db.query(`
        SELECT p.id AS Post_id , u.id AS user_id, u.firstname AS user_firstname, u.lastname AS user_lastname, r.ai_score
        FROM posts p 
        JOIN members m ON m.post_id = p.id
        JOIN users u ON m.user_id = u.id
        JOIN resume r ON m.id = r.member_id
        WHERE p.owner_id = ?
    `, 
    [Number(owner_id)])

    return result
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

export const GetMemberResumeResultModel = async (member_id, owner_id) => {
    const [result] = await db.query(`
        SELECT r.ai_score, r.ai_analysis
        FROM posts p
        JOIN members m ON m.post_id = p.id
        JOIN resume r ON r.member_id = m.id
        WHERE m.user_id = ? AND p.owner_id = ?
        `,[member_id, owner_id]
    )

    return result[0]
}

export const UpdateCandidateStatusModel = async (member_status, member_id, owner_id) => {
    const [result] = await db.query(`
        UPDATE members m
        JOIN posts p ON p.id = m.post_id
        SET m.status = COALESCE(?, m.status)
        WHERE m.user_id = ? AND p.owner_id = ?
    `,[member_status, member_id, owner_id])

    return result
}