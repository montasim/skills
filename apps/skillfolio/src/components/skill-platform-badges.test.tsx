// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { SkillPlatformBadges } from "./skill-platform-badges"

afterEach(cleanup)

describe("SkillPlatformBadges", () => {
  it("shows named badges for focused compatibility", () => {
    render(<SkillPlatformBadges platforms={["OpenAI Codex", "Claude Code"]} />)

    expect(screen.getByText("Codex")).toBeTruthy()
    expect(screen.getByText("Claude Code")).toBeTruthy()
    expect(screen.queryByText(/platforms$/)).toBeNull()
    expect(screen.getByText("Documented format")).toBeTruthy()
  })

  it("summarizes broad compatibility without hiding the platform names", () => {
    render(
      <SkillPlatformBadges
        platforms={[
          "OpenAI Codex",
          "Claude Code",
          "Gemini CLI",
          "Cursor",
          "GitHub Copilot",
        ]}
      />
    )

    const overflowBadge = screen.getByText("+3 platforms")
    expect(overflowBadge.getAttribute("title")).toBe(
      "Also documented for Gemini CLI, Cursor, GitHub Copilot"
    )
    expect(overflowBadge.getAttribute("aria-label")).toBe(
      "Also documented for Gemini CLI, Cursor, GitHub Copilot"
    )
  })

  it("can show every platform when the full list is useful", () => {
    render(
      <SkillPlatformBadges
        platforms={["OpenAI Codex", "Claude Code", "Gemini CLI"]}
        showAll
      />
    )

    expect(screen.getByText("Gemini CLI")).toBeTruthy()
    expect(screen.queryByText(/platforms$/)).toBeNull()
  })
})
