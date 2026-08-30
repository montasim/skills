import { useEffect } from "react"

const SCRIPT_ID = "skillfolio-supportkori"
const PANEL_ID = "skillfolio-supportkori-panel"
const OWNER_ATTRIBUTE = "data-skillfolio-supportkori"
const ENHANCED_ATTRIBUTE = "data-skillfolio-supportkori-enhanced"
export const SUPPORTKORI_WIDGET_SRC = "https://www.supportkori.com/widget.js"
const PROVIDER_ARTIFACT_SELECTOR = ".sk-widget-btn, .sk-widget-iframe-container"

function enhanceProviderArtifact(element: Element) {
  if (
    element instanceof HTMLStyleElement &&
    element.textContent.includes(".sk-widget-btn")
  ) {
    element.setAttribute(OWNER_ATTRIBUTE, "")
    return
  }

  if (element.matches(".sk-widget-iframe-container")) {
    element.id = PANEL_ID
    element.setAttribute(OWNER_ATTRIBUTE, "")
    element
      .querySelector("iframe")
      ?.setAttribute("title", "Support with SupportKori")
    return
  }

  if (
    !element.matches(".sk-widget-btn") ||
    element.hasAttribute(ENHANCED_ATTRIBUTE)
  ) {
    return
  }

  const trigger = element as HTMLElement
  trigger.setAttribute(OWNER_ATTRIBUTE, "")
  trigger.setAttribute(ENHANCED_ATTRIBUTE, "")
  trigger.setAttribute("role", "button")
  trigger.setAttribute("tabindex", "0")
  trigger.setAttribute("aria-label", "Support")
  trigger.setAttribute("aria-controls", PANEL_ID)
  trigger.setAttribute("aria-expanded", "false")

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    trigger.click()
  })

  trigger.addEventListener("click", () => {
    queueMicrotask(() => {
      const panel = document.getElementById(PANEL_ID)
      trigger.setAttribute(
        "aria-expanded",
        String(panel?.classList.contains("open") ?? false)
      )
    })
  })
}

function enhanceAddedTree(node: Node) {
  if (!(node instanceof Element)) return

  enhanceProviderArtifact(node)
  node
    .querySelectorAll(`${PROVIDER_ARTIFACT_SELECTOR}, style`)
    .forEach(enhanceProviderArtifact)
}

export function SupportKoriWidget() {
  useEffect(() => {
    let observer: MutationObserver | undefined
    let ownsIntegration = false

    const mountTimer = window.setTimeout(() => {
      if (document.getElementById(SCRIPT_ID)) return

      document
        .querySelectorAll(PROVIDER_ARTIFACT_SELECTOR)
        .forEach((element) => element.remove())

      observer = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach(enhanceAddedTree))
      })
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })

      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.async = true
      script.src = SUPPORTKORI_WIDGET_SRC
      script.dataset.id = "montasim"
      script.dataset.message = "Support"
      script.dataset.color = "#c04a16"
      script.dataset.position = "right"
      script.setAttribute(OWNER_ATTRIBUTE, "")

      ownsIntegration = true
      document.body.appendChild(script)
    }, 0)

    return () => {
      window.clearTimeout(mountTimer)
      observer?.disconnect()

      if (!ownsIntegration) return

      document
        .querySelectorAll(`[${OWNER_ATTRIBUTE}]`)
        .forEach((element) => element.remove())
    }
  }, [])

  return null
}
