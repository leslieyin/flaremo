import type { FlareMoDb } from "@flaremo/db";
import { readVoiceService } from "@flaremo/domain";
import { z } from "zod";
import type { FlareMoEnv } from "../env";
import { getConfiguredAsr } from "./provider";

export const voiceCredentialsSchema = z
  .object({
    provider: z.enum(["tencent", "dashscope"]),
    model: z.string().trim().max(128).default(""),
    appId: z.string().trim().max(128).default(""),
    secretId: z.string().trim().max(256).default(""),
    secretKey: z.string().trim().max(1024).default(""),
    apiKey: z.string().trim().max(1024).default(""),
  })
  .strict();
export type VoiceCredentials = z.infer<typeof voiceCredentialsSchema>;
const aad = new TextEncoder().encode("flaremo:voice-service:v1");

function hasEncryptionKey(secret: string | undefined) {
  return Boolean(secret && secret.length >= 32);
}

/** UI hint: whether saved credentials can be encrypted at rest. */
export function canEncryptVoiceCredentials(secret: string | undefined) {
  return hasEncryptionKey(secret);
}

async function encryptionKey(secret: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

// Envelope v0 stores the credentials as JSON (D1 is encrypted at rest);
// v1 is AES-GCM ciphertext bound to the static AAD. A v1 envelope without
// the matching key fails closed on open.
export async function sealVoiceCredentials(
  secret: string | undefined,
  value: VoiceCredentials,
) {
  if (!secret || !hasEncryptionKey(secret)) {
    return JSON.stringify({ v: 0, data: value });
  }
  const key = await encryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return JSON.stringify({
    v: 1,
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  });
}

export async function openVoiceCredentials(
  secret: string | undefined,
  envelope: string,
) {
  const value = JSON.parse(envelope);
  if (value.v === 0) return voiceCredentialsSchema.parse(value.data);
  if (value.v !== 1) throw new Error("Invalid credential version");
  if (!secret || !hasEncryptionKey(secret))
    throw new Error("Voice encryption key unavailable");
  const key = await encryptionKey(secret);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(value.iv), additionalData: aad },
    key,
    new Uint8Array(value.data),
  );
  return voiceCredentialsSchema.parse(
    JSON.parse(new TextDecoder().decode(plaintext)),
  );
}

export function configuredVoice(value: VoiceCredentials) {
  return getConfiguredAsr({
    FLAREMO_ASR_PROVIDER: value.provider,
    FLAREMO_ASR_MODEL: value.model,
    FLAREMO_ASR_TENCENT_APP_ID: value.appId,
    FLAREMO_ASR_TENCENT_SECRET_ID: value.secretId,
    FLAREMO_ASR_TENCENT_SECRET_KEY: value.secretKey,
    FLAREMO_ASR_DASHSCOPE_API_KEY: value.apiKey,
  });
}

// Deployment-level environment credentials win when they fully resolve; the
// database copy (saved from the settings UI) applies otherwise. Callers pass
// the request-scoped database handle.
export async function resolveVoiceService(env: FlareMoEnv, db: FlareMoDb) {
  const fromEnv = getConfiguredAsr(env);
  if (fromEnv) return fromEnv;
  const row = await readVoiceService(db);
  if (!row) return null;
  if (!row.enabled || !row.ciphertext) return null;
  try {
    return configuredVoice(
      await openVoiceCredentials(env.FLAREMO_VOICE_CONFIG_KEY, row.ciphertext),
    );
  } catch {
    return null; // Unreadable stored credentials fail closed.
  }
}
