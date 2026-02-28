import type { BaseTokenResolution } from "../channels/plugins/types.js";
import type { OpenClawConfig } from "../config/config.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";

export type DiscordTokenSource = "env" | "config" | "none";

export type DiscordTokenResolution = BaseTokenResolution & {
  source: DiscordTokenSource;
};

export function normalizeDiscordToken(raw?: string | null): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^Bot\s+/i, "");
}

function decodeDiscordTokenIdPart(part: string): string | undefined {
  const raw = part.trim();
  if (!raw) {
    return undefined;
  }
  const tryDecode = (encoding: "base64url" | "base64") => {
    try {
      const decoded = Buffer.from(raw, encoding).toString("utf8").trim();
      return decoded ? decoded : undefined;
    } catch {
      return undefined;
    }
  };
  return tryDecode("base64url") ?? tryDecode("base64");
}

/**
 * Extract the Discord application/bot id from a bot token.
 *
 * Discord bot tokens are typically of the form "<base64(id)>.<...>.<...>".
 * The decoded id can exceed Number.MAX_SAFE_INTEGER; keep it as a string.
 */
export function resolveDiscordApplicationIdFromToken(raw?: string | null): string | undefined {
  const token = normalizeDiscordToken(raw);
  if (!token) {
    return undefined;
  }
  const idPart = token.split(".")[0]?.trim() ?? "";
  if (!idPart) {
    return undefined;
  }
  const decoded = decodeDiscordTokenIdPart(idPart);
  if (!decoded) {
    return undefined;
  }
  const normalized = decoded.trim();
  return /^\d+$/.test(normalized) ? normalized : undefined;
}

export function resolveDiscordToken(
  cfg?: OpenClawConfig,
  opts: { accountId?: string | null; envToken?: string | null } = {},
): DiscordTokenResolution {
  const accountId = normalizeAccountId(opts.accountId);
  const discordCfg = cfg?.channels?.discord;
  const accountCfg =
    accountId !== DEFAULT_ACCOUNT_ID
      ? discordCfg?.accounts?.[accountId]
      : discordCfg?.accounts?.[DEFAULT_ACCOUNT_ID];
  const accountToken = normalizeDiscordToken(accountCfg?.token ?? undefined);
  if (accountToken) {
    return { token: accountToken, source: "config" };
  }

  const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
  const configToken = allowEnv ? normalizeDiscordToken(discordCfg?.token ?? undefined) : undefined;
  if (configToken) {
    return { token: configToken, source: "config" };
  }

  const envToken = allowEnv
    ? normalizeDiscordToken(opts.envToken ?? process.env.DISCORD_BOT_TOKEN)
    : undefined;
  if (envToken) {
    return { token: envToken, source: "env" };
  }

  return { token: "", source: "none" };
}
