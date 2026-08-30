// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Badge } from "./badge"

afterEach(cleanup)

describe("Badge", () => {
  it("uses the shared badge padding and height token", () => {
    render(<Badge>Stable</Badge>)

    const badge = screen.getByText("Stable")

    expect(badge.className).toContain("min-h-6")
    expect(badge.className).toContain("px-2.5")
    expect(badge.className).toContain("py-1")
  })
})
