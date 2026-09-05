import db from "../lib/db.js"

export const GetUserByAdminModel = async(setoff, limit, filter) => {    
    let query = 'SELECT id, firstname, lastname, email, role, created_at FROM users'

    const value = []

    if (filter) {
        query += 'WHERE role = ?'
        value.push(filter)
    }

    query += ' LIMIT ? OFFSET ?'
    value.push(limit, setoff)

    const [result] = await db.query(query, value)
    
    return result
}

export const CreateUserByAdminModel = async(data) => {
    const { firstname, lastname, email, password, role } = data
    const [result] = await db.query('INSERT INTO users(firstname, lastname, email, password, role) VALUES(?, ?, ?, ?, ?)', [firstname, lastname, email, password, role])
    return result
}

export const DeleteUserByID = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id])
    return result
}

export const EditUserByIDModel = async (data) => {
    const { id, firstname, lastname, password, phone, role } = data
    const [result] = await db.query(
        'UPDATE users SET firstname = COALESCE(?, firstname), lastname = COALESCE(?, lastname), password = COALESCE(?, password), phone = COALESCE(?, phone), role = COALESCE(?, role) WHERE id = ?',
        [ firstname, lastname, password, phone, role, id]
    )
    return result
}

export const GetUserFileUrlsByUserID = async (id) => {
    const [profileResult] = await db.query(`
        SELECT icon AS profile
        FROM users
        WHERE id = ?
    `, [id])

    const [postsResult] = await db.query(`
        SELECT icon AS logo_company
        FROM posts
        WHERE owner_id = ?
    `, [id])

    const [applicationsResult] = await db.query(`
        SELECT r.resume_url AS resume, r.transcript_url AS transcript
        FROM members m
        JOIN resume r ON r.member_id = m.id
        WHERE m.user_id = ?
    `, [id])

    const [applicantsOfOwnedPostsResult] = await db.query(`
        SELECT r.resume_url AS resume, r.transcript_url AS transcript
        FROM posts p
        JOIN members m ON m.post_id = p.id
        JOIN resume r ON r.member_id = m.id
        WHERE p.owner_id = ?
    `, [id])

    return [
        ...profileResult,
        ...postsResult,
        ...applicationsResult,
        ...applicantsOfOwnedPostsResult,
    ]
}