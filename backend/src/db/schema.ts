import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  image: varchar('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const session = pgTable('session', {
  id: varchar('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: varchar('ip_address'),
  userAgent: varchar('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope'),
  password: varchar('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier').notNull(),
  value: varchar('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
