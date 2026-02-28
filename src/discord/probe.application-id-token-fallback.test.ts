import { describe, expect, it } from "vitest";
import { fetchDiscordApplicationId } from "./probe.js";

describe("fetchDiscordApplicationId token fallback", () => {
  it("falls back to token decoding when /oauth2/applications/@me is unavailable (#29608)", async () => {
    const token = "MTQ3NzE3OTYxMDMyMjk2NDU0MQ.GhIiP9.vU1xEpJ6NjFm-a7Ra_9pEZzdxQ7GQOLpiM0PzI";
    const fetcher = async () => new Response("nope", { status: 500 });
    const result = await fetchDiscordApplicationId(token, 25, fetcher as typeof fetch);
    expect(result).toBe("1477179610322964541");
  });
});
