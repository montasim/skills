import { useState } from "react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { CheckIcon } from "@/components/ui/icons"

type CopyButtonProps = ComponentProps<typeof Button> & {
  value: string
  label?: string
}

export function CopyButton({
  value,
  label = "Copy",
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const field = document.createElement("textarea")
      field.value = value
      field.style.position = "fixed"
      field.style.opacity = "0"
      document.body.appendChild(field)
      field.select()
      document.execCommand("copy")
      field.remove()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <Button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      aria-live="polite"
      {...props}
    >
      {copied ? (
        <>
          <CheckIcon className="animate-in duration-200 zoom-in motion-reduce:animate-none" />
          {typeof children === "string" ? "Copied" : null}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
