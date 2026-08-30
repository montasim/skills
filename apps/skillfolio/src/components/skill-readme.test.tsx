// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"

import { SkillReadme } from "./skill-readme"
import { skillCatalog } from "@/lib/skills"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("Repository README", () => {
  it("loads content and resolves repository-relative links and images", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          "# Example\n\n[Guide](docs/guide.md)\n\n![Logo](/assets/logo.png)",
          { status: 200 }
        )
      )
    vi.stubGlobal("fetch", fetchMock)
    const skill = skillCatalog.featured()

    render(<SkillReadme skill={skill} />)

    expect(await screen.findByRole("heading", { name: "Example" })).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Guide" }).getAttribute("href")
    ).toBe(`${skill.sourceContentBaseUrl}/docs/guide.md`)
    expect(screen.getByRole("img", { name: "Logo" }).getAttribute("src")).toBe(
      `${skill.rawContentBaseUrl}/assets/logo.png`
    )
    expect(fetchMock).toHaveBeenCalledWith(
      skill.readmeUrl,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it("shows failure context and retries through the same interface", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("# Recovered", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    render(<SkillReadme skill={skillCatalog.featured()} />)

    expect(
      await screen.findByRole("heading", { name: "README unavailable." })
    ).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(
      await screen.findByRole("heading", { name: "Recovered" })
    ).toBeTruthy()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })
})
