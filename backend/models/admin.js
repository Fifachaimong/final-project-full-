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
    const [result] = await db.query(`
        SELECT u.icon AS profile, p.icon AS logo_company, r.resume_url AS resume, r.transcript_url AS transcript
        FROM user u
        JOIN members m ON m.user_id = u.id
        JOIN posts p ON p.owner_id = u.id
        JOIN resume r ON r.member_id = m.id
        WHERE u.id = ?
    `,[id])

    return result
}