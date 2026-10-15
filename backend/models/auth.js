import db from "../lib/db.js";

export const CreateUser = async(data) => {
    const { firstname, lastname, email, password, role, approve } = data
    const [result] = await db.query('INSERT INTO users(firstname, lastname, email, password, role, approve) VALUES(?, ?, ?, ?, ?, ?)', [firstname, lastname, email, password, role, approve])
    return result
}

export const GetUserByEmail = async(email) => {
    const [result] = await db.query('SELECT id, role, password, approve FROM users WHERE email = ?', [email])
    return result[0]
}

export const GetPostByIDModel = async (post_id) => {
    const [result] = await db.query(`
        SELECT posts.id, posts.owner_id, posts.title, posts.company_name, posts.faculty,
            posts.description, posts.deadline, posts.icon, posts.posts_status, users.firstname AS owner_name,
            users.lastname AS owner_lastname, users.phone AS owner_phone, posts.model_provider
        FROM posts
        LEFT JOIN users
            ON posts.owner_id = users.id
        WHERE posts.id = ?
    `,[ post_id ])

    return result[0]
}

export const GetTotalPage = async(fromTable) => {
    let query = 'SELECT COUNT(*) AS total FROM '

    if (fromTable === 'posts') {
        query += 'posts'
    }

    if (fromTable === 'users') {
        query += 'users WHERE approve = 1'
    }

    const [result] = await db.query(query)

    return result[0]
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