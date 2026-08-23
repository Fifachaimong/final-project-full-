import db from "../lib/db.js"

export const GetUserByAdminModel = async(data) => {
    const [result] = await db.query(`
        SELECT id, firstname, lastname, email, role, created_at
        FROM users
    `)

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