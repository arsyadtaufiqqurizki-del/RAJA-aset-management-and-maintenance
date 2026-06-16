import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  assetId: text('asset_id').notNull().unique(),
  name: text('name'),
  subsidiary: text('subsidiary'),
  category: text('category'),
  date: text('date'),
  val: text('val'),
  condition: text('condition'),
  conditionLevel: text('condition_level'),
  status: text('status'),
  statusLevel: text('status_level'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const maintenance = pgTable('maintenance', {
  id: serial('id').primaryKey(),
  maintenanceId: text('maintenance_id').notNull().unique(), // Firestore document ID
  assetId: text('asset_id'),
  sub: text('sub'),
  type: text('type'),
  date: text('date'),
  cost: text('cost'),
  estimatedCost: text('estimated_cost'),
  actualCost: text('actual_cost'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
});
