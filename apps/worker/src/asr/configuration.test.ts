import { describe, expect, it } from "vitest";
import { openVoiceCredentials, sealVoiceCredentials } from "./configuration";

const key = "test-only-encryption-key-with-at-least-32-characters";
const value = {
  provider: "tencent" as const,
  model: "",
  appId: "1234",
  secretId: "test-id",
  secretKey: "test-sensitive-value",
  apiKey: "",
};
describe("voice credential envelope", () => {
  it("uses fresh nonces, round trips and never stores plaintext with a key", async () => {
    const a = await sealVoiceCredentials(key, value);
    const b = await sealVoiceCredentials(key, value);
    expect(a).not.toEqual(b);
    expect(a).not.toContain(value.secretKey);
    expect(JSON.parse(a).v).toBe(1);
    expect(await openVoiceCredentials(key, a)).toEqual(value);
    await expect(openVoiceCredentials(`${key}-wrong`, a)).rejects.toThrow();
    const tampered = JSON.parse(a);
    tampered.data[0] ^= 1;
    await expect(
      openVoiceCredentials(key, JSON.stringify(tampered)),
    ).rejects.toThrow();
  });
  it("falls back to a plaintext v0 envelope without a key and fails closed on v1 without one", async () => {
    const plain = await sealVoiceCredentials(undefined, value);
    expect(JSON.parse(plain)).toEqual({ v: 0, data: value });
    expect(await openVoiceCredentials(undefined, plain)).toEqual(value);
    const encrypted = await sealVoiceCredentials(key, value);
    await expect(openVoiceCredentials(undefined, encrypted)).rejects.toThrow();
  });
});
