// @vitest-environment jsdom

import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"

import { SkillDetailFrame } from "./skill-detail-frame"
import { SkillDetailPending } from "./skill-detail-pending"
import { skillCatalog } from "@/lib/skills"

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("Skill-detail frame", () => {
  it("keeps the pending state inside the shared frame", () => {
    render(<SkillDetailPending />)
    expect(screen.getByLabelText("Loading skill")).toBeTruthy()
    expect(screen.getByLabelText("Loading README")).toBeTruthy()
  })

  it("renders the missing state", () => {
    render(<SkillDetailFrame state={{ status: "missing" }} />)
    expect(
      screen.getByRole("heading", { name: "Nothing lives at this slug." })
    ).toBeTruthy()
  })

  it("renders ready facts and the Repository README state", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("# Loaded README", { status: 200 }))
    )
    const skill = skillCatalog.featured()

    render(<SkillDetailFrame state={{ status: "ready", skill }} />)

    expect(screen.getByRole("heading", { name: skill.name })).toBeTruthy()
    expect(screen.getByText("Install from npm")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /View on npm/ }).getAttribute("href")
    ).toBe(skill.packageUrl)
    expect(
      screen.getByRole("link", { name: /View source/ }).getAttribute("href")
    ).toBe(skill.readmeSourceUrl)
    expect(
      await screen.findByRole("heading", { name: "Loaded README" })
    ).toBeTruthy()
    expect(screen.getByText("Compatibility evidence")).toBeTruthy()
    expect(screen.getByText("Agent Skills structure validated")).toBeTruthy()
    expect(screen.getByText("2026-08-30")).toBeTruthy()
  })
})
