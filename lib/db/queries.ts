/**
 * Requêtes de base de données pour mAI
 * 
 * @version 0.0.2
 */
import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/chat/artifact";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { ChatbotError } from "../errors";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  document,
  message,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  vote,
  studioImage,
  userXP,
  xpHistory,
  userBadges,
  userCredits,
} from "./schema";
import { generateHashedPassword } from "./utils";

const client = postgres(process.env.POSTGRES_URL ?? "");
export const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email) as any);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    // Tentative d'insertion de l'utilisateur invité dans la base de données
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    // Log de l'erreur pour faciliter le débogage
    console.error("Erreur lors de la création de l'utilisateur invité :", _error);
    
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id) as any);
    await db.delete(message).where(eq(message.chatId, id) as any);
    await db.delete(stream).where(eq(stream.chatId, id) as any);

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id) as any)
      .returning();
    return chatsDeleted;
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId) as any);

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds) as any);
    await db.delete(message).where(inArray(message.chatId, chatIds) as any);
    await db.delete(stream).where(inArray(stream.chatId, chatIds) as any);

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId) as any)
      .returning();

    return { deletedCount: deletedChats.length };
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<unknown>) =>
      db
        .select()
        .from(chat)
        .where(
          (whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)) as any
        )
        .orderBy(desc(chat.createdAt as any))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter) as any)
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt) as any);
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore) as any)
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt) as any);
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id) as any);
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id) as any);
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id) as any)
      .orderBy(asc(message.createdAt as any));
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)) as any);

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)) as any);
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id) as any);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function updateDocumentContent({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  try {
    const docs = await db
      .select()
      .from(document)
      .where(eq(document.id, id) as any)
      .orderBy(desc(document.createdAt as any))
      .limit(1);

    const latest = docs[0];
    if (!latest) {
      throw new ChatbotError("not_found:database", "Document not found");
    }

    return await db
      .update(document)
      .set({ content })
      .where(and(eq(document.id, id), eq(document.createdAt, latest.createdAt)) as any)
      .returning();
  } catch (_error) {
    if (_error instanceof ChatbotError) {
      throw _error;
    }
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update document content"
    );
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id) as any)
      .orderBy(asc(document.createdAt as any));

    return documents;
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id) as any)
      .orderBy(desc(document.createdAt as any));

    return selectedDocument;
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        ) as any
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)) as any)
      .returning();
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId) as any);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id) as any);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)) as any
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)) as any
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)) as any
        );
    }
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId) as any);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch {
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const cutoffTime = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, cutoffTime),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

export async function createStudioImage(data: {
  prompt: string;
  model: string;
  provider: string;
  url: string;
  ratio?: string;
  userId: string;
  style?: string;
  loras?: any;
  denoisingStrength?: string;
  sourceImageUrl?: string;
}) {
  try {
    return await db.insert(studioImage).values(data).returning();
  } catch (error) {
    console.error("Failed to create studio image:", error);
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create studio image"
    );
  }
}

export async function getStudioImages(userId: string) {
  try {
    return await db
      .select()
      .from(studioImage)
      .where(eq(studioImage.userId, userId))
      .orderBy(desc(studioImage.createdAt))
      .execute();
  } catch (error) {
    console.error("Failed to get studio images:", error);
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get studio images"
    );
  }
}

export async function toggleStudioImageFavorite(id: string, favorite: boolean) {
  try {
    return await db
      .update(studioImage)
      .set({ favorite })
      .where(eq(studioImage.id, id))
      .execute();
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    throw new ChatbotError(
      "bad_request:database",
      "Failed to toggle favorite"
    );
  }
}

export async function deleteStudioImage(id: string) {
  try {
    return await db
      .delete(studioImage)
      .where(eq(studioImage.id, id))
      .execute();
  } catch (error) {
    console.error("Failed to delete studio image:", error);
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete studio image"
    );
  }
}

export async function creditXP({ userId, amount, reason }: { userId: string, amount: number, reason: string }) {
  try {
    // Insérer l'historique
    await db.insert(xpHistory).values({
      userId,
      amount,
      reason,
      createdAt: new Date(),
    }).execute();

    // Mettre à jour ou insérer l'XP de l'utilisateur
    const existingXP = await db.select().from(userXP).where(eq(userXP.userId, userId)).execute();

    if (existingXP.length > 0) {
      const newXP = existingXP[0].xp + amount;
      // Calcul simple du niveau (ex: tous les 150 XP)
      const newLevel = Math.floor(newXP / 150) + 1;

      await db.update(userXP)
        .set({ xp: newXP, level: newLevel, updatedAt: new Date() })
        .where(eq(userXP.userId, userId))
        .execute();
    } else {
      const newLevel = Math.floor(amount / 150) + 1;
      await db.insert(userXP).values({
        userId,
        xp: amount,
        level: newLevel,
        updatedAt: new Date(),
      }).execute();
    }
  } catch (error) {
    console.error("Failed to credit XP:", error);
    throw new ChatbotError(
      "bad_request:database",
      "Failed to credit XP"
    );
  }
}

export async function getUserXP(userId: string) {
  try {
    return await db.select().from(userXP).where(eq(userXP.userId, userId)).execute();
  } catch (error) {
    console.error("Failed to get user XP:", error);
    throw new ChatbotError("bad_request:database", "Failed to get user XP");
  }
}

export async function getUserBadges(userId: string) {
  try {
    return await db.select().from(userBadges).where(eq(userBadges.userId, userId)).execute();
  } catch (error) {
    console.error("Failed to get user badges:", error);
    throw new ChatbotError("bad_request:database", "Failed to get user badges");
  }
}

export async function getXPHistory(userId: string) {
  try {
    return await db.select().from(xpHistory).where(eq(xpHistory.userId, userId)).orderBy(desc(xpHistory.createdAt)).execute();
  } catch (error) {
    console.error("Failed to get XP history:", error);
    throw new ChatbotError("bad_request:database", "Failed to get XP history");
  }
}

export async function checkAndUnlockBadges(userId: string) {
  try {
    const existingBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId)).execute();
    const existingIds = existingBadges.map(b => b.badgeId);

    const messages = await db.select().from(message).innerJoin(chat, eq(message.chatId, chat.id)).where(eq(chat.userId, userId)).execute();
    const msgCount = messages.length;

    const images = await db.select().from(studioImage).where(eq(studioImage.userId, userId)).execute();
    const imgCount = images.length;

    const badgesToUnlock: number[] = [];

    if (msgCount >= 1 && !existingIds.includes(1)) { badgesToUnlock.push(1); }
    if (msgCount >= 100 && !existingIds.includes(2)) { badgesToUnlock.push(2); }
    if (imgCount >= 1 && !existingIds.includes(11)) { badgesToUnlock.push(11); }

    for (const badgeId of badgesToUnlock) {
      await db.insert(userBadges).values({
        userId,
        badgeId,
      }).execute();

      await creditXP({
        userId,
        amount: 100,
        reason: `Badge débloqué : ${badgeId}`,
      });
    }
  } catch (error) {
    console.error("Failed to check badges:", error);
  }
}

export async function getUserCredits(userId: string) {
  try {
    const result = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).execute();
    if (result.length === 0) {
      const [newCredits] = await db.insert(userCredits).values({ userId, credits: 100 }).returning();
      return newCredits;
    }
    return result[0];
  } catch (error) {
    console.error("Failed to get user credits:", error);
    throw new ChatbotError("bad_request:database", "Failed to get user credits");
  }
}

export async function deductCredits(userId: string, amount: number) {
  try {
    const result = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).execute();
    if (result.length === 0) {
      throw new ChatbotError("not_found:database", "User credits not found");
    }
    
    const currentCredits = result[0].credits;
    if (currentCredits < amount) {
      throw new ChatbotError("bad_request:database", "Insufficient credits");
    }
    
    const [updated] = await db.update(userCredits)
      .set({ credits: currentCredits - amount, updatedAt: new Date() })
      .where(eq(userCredits.userId, userId))
      .returning();
      
    return updated;
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    throw new ChatbotError("bad_request:database", error instanceof Error ? error.message : "Failed to deduct credits");
  }
}
