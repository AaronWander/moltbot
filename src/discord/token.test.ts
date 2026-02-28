import { afterEach, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveDiscordApplicationIdFromToken, resolveDiscordToken } from "./token.js";

describe("resolveDiscordToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers config token over env", () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "env-token");
    const cfg = {
      channels: { discord: { token: "cfg-token" } },
    } as OpenClawConfig;
    const res = resolveDiscordToken(cfg);
    expect(res.token).toBe("cfg-token");
    expect(res.source).toBe("config");
  });

  it("uses env token when config is missing", () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "env-token");
    const cfg = {
      channels: { discord: {} },
    } as OpenClawConfig;
    const res = resolveDiscordToken(cfg);
    expect(res.token).toBe("env-token");
    expect(res.source).toBe("env");
  });

  it("prefers account token for non-default accounts", () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "env-token");
    const cfg = {
      channels: {
        discord: {
          token: "base-token",
          accounts: {
            work: { token: "acct-token" },
          },
        },
      },
    } as OpenClawConfig;
    const res = resolveDiscordToken(cfg, { accountId: "work" });
    expect(res.token).toBe("acct-token");
    expect(res.source).toBe("config");
  });
});

describe("resolveDiscordApplicationIdFromToken", () => {
  it("extracts 64-bit ids as strings without precision loss (#29608)", () => {
    const token = "MTQ3NzE3OTYxMDMyMjk2NDU0MQ.GhIiP9.vU1xEpJ6NjFm-a7Ra_9pEZzdxQ7GQOLpiM0PzI";
    expect(resolveDiscordApplicationIdFromToken(token)).toBe("1477179610322964541");
  });

  it("returns undefined when token is missing or malformed", () => {
    expect(resolveDiscordApplicationIdFromToken("")).toBeUndefined();
    expect(resolveDiscordApplicationIdFromToken("not-a-token")).toBeUndefined();
    expect(resolveDiscordApplicationIdFromToken("....")).toBeUndefined();
  });
});
