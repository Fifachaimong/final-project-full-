import mysql from 'mysql2/promise.js'

const db = mysql.createPool({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    port : process.env.DATABASE_PORT,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_NAME
})

export default db