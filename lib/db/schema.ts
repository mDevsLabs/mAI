import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  isArchived: boolean("isArchived").notNull().default(false),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const studioImage = pgTable("StudioImage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  url: text("url").notNull(),
  ratio: varchar("ratio", { length: 16 }),
  favorite: boolean("favorite").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  style: text("style"),
  loras: json("loras"),
  denoisingStrength: text("denoisingStrength"),
  sourceImageUrl: text("sourceImageUrl"),
});

export type StudioImage = InferSelectModel<typeof studioImage>;

export const userXP = pgTable("UserXP", {
  userId: uuid("userId").primaryKey().notNull().references(() => user.id),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserXP = InferSelectModel<typeof userXP>;

export const userBadges = pgTable("UserBadges", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  badgeId: integer("badgeId").notNull(),
  unlockedAt: timestamp("unlockedAt").notNull().defaultNow(),
});

export type UserBadges = InferSelectModel<typeof userBadges>;

export const xpHistory = pgTable("XPHistory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type XPHistory = InferSelectModel<typeof xpHistory>;

export const userCredits = pgTable("UserCredits", {
  userId: uuid("userId").primaryKey().notNull().references(() => user.id),
  credits: integer("credits").notNull().default(100),
  plan: varchar("plan", { length: 20 }).notNull().default("free"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserCredits = InferSelectModel<typeof userCredits>;
