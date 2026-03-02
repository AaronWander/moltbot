import { describe, expect, it } from "vitest";
import { normalizeDiscordHardBreakNewlines } from "./send.shared.js";

describe("normalizeDiscordHardBreakNewlines", () => {
  it("converts single newlines into Markdown hard breaks", () => {
    expect(normalizeDiscordHardBreakNewlines("Line 1\nLine 2\nLine 3")).toBe(
      "Line 1  \nLine 2  \nLine 3",
    );
  });

  it("preserves paragraph breaks (double newline)", () => {
    expect(normalizeDiscordHardBreakNewlines("Line 1\n\nLine 2")).toBe("Line 1\n\nLine 2");
  });

  it("does not add extra spaces when a hard break is already present", () => {
    expect(normalizeDiscordHardBreakNewlines("Line 1  \nLine 2")).toBe("Line 1  \nLine 2");
  });

  it("does not alter fenced code blocks, but still formats surrounding text", () => {
    expect(normalizeDiscordHardBreakNewlines("Intro\n```js\nconst x = 1;\n```\nOutro\nNext")).toBe(
      "Intro  \n```js\nconst x = 1;\n```\nOutro  \nNext",
    );
  });
});
