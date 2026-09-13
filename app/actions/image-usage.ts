"use server";

import { getSessionIdentity } from "@/lib/session-auth";
import { getUserImageUsageForUser, type UserImageUsageData } from "@/lib/image-usage";

export type { UserImageUsageData };

export async function getUserImageUsage(): Promise<{
  success: boolean;
  data?: UserImageUsageData;
  error?: string;
}> {
  const identity = await getSessionIdentity();
  if (!identity) {
    return { success: false, error: "Authentification requise." };
  }
  return getUserImageUsageForUser(identity.userId);
}
