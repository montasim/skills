// @vitest-environment jsdom

import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SUPPORTKORI_WIDGET_SRC, SupportKoriWidget } from "./supportkori-widget"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  document
    .querySelectorAll(
      "#skillfolio-supportkori, .sk-widget-btn, .sk-widget-iframe-container"
    )
    .forEach((element) => element.remove())
})

describe("SupportKori widget", () => {
  it("does not execute the DOM-mutating provider script during SSR", () => {
    expect(renderToString(<SupportKoriWidget />)).toBe("")
  })

  it("mounts one configured provider script after hydration", () => {
    vi.useFakeTimers()

    const view = render(
      <StrictMode>
        <SupportKoriWidget />
      </StrictMode>
    )

    act(() => vi.runAllTimers())

    const scripts = document.querySelectorAll("#skillfolio-supportkori")
    expect(scripts).toHaveLength(1)
    expect(scripts[0]).toMatchObject({
      async: true,
      src: SUPPORTKORI_WIDGET_SRC,
    })
    expect(scripts[0].getAttribute("data-id")).toBe("montasim")
    expect(scripts[0].getAttribute("data-message")).toBe("Support")

    view.rerender(
      <StrictMode>
        <SupportKoriWidget />
      </StrictMode>
    )
    act(() => vi.runAllTimers())

    expect(document.querySelectorAll("#skillfolio-supportkori")).toHaveLength(1)

    view.unmount()
    expect(document.querySelector("#skillfolio-supportkori")).toBeNull()
  })

  it("makes the provider trigger keyboard accessible", async () => {
    vi.useFakeTimers()
    render(<SupportKoriWidget />)
    act(() => vi.runAllTimers())
    vi.useRealTimers()

    const trigger = document.createElement("div")
    trigger.className = "sk-widget-btn"
    trigger.innerHTML = "<svg></svg><span>Support</span>"
    trigger.onclick = vi.fn()

    const panel = document.createElement("div")
    panel.className = "sk-widget-iframe-container"
    panel.innerHTML = '<iframe class="sk-widget-iframe"></iframe>'

    document.body.append(trigger, panel)

    await act(async () => Promise.resolve())

    expect(trigger.getAttribute("role")).toBe("button")
    expect(trigger.tabIndex).toBe(0)
    expect(trigger.getAttribute("aria-label")).toBe("Support")
    expect(panel.id).toBe("skillfolio-supportkori-panel")
    expect(panel.querySelector("iframe")?.getAttribute("title")).toBe(
      "Support with SupportKori"
    )

    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    )
    expect(trigger.onclick).toHaveBeenCalledOnce()
  })
})
