import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  lastname: varchar('lastname', { length: 255 }),
  email: varchar('email', { length: 255 }),
  password: varchar('password', { length: 255 }),
  roleId: integer('role_id'),
  createdAt: timestamp('created_at'),
})

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  phone: varchar('phone', { length: 20 }),
})