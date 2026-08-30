import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  className?: string
}

export function BrandMark({ className, ...props }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn("size-9", className)}
      {...props}
    >
      <path
        d="M4.75 5.5h26v9h-26z"
        fill="#C04A16"
        stroke="#20242C"
        strokeWidth="1.5"
      />
      <path
        d="M9.25 15.5h26v9h-26z"
        fill="#20242C"
        stroke="#20242C"
        strokeWidth="1.5"
      />
      <path
        d="M4.75 25.5h26v9h-26z"
        fill="#E76F2E"
        stroke="#20242C"
        strokeWidth="1.5"
      />
      <path
        d="M9 9h3v3H9zM14.5 10.5h12M28 18.5h3v3h-3zM13.5 20h12M9 29h3v3H9zM14.5 30.5h12"
        fill="#F7F7F5"
        stroke="#F7F7F5"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}
