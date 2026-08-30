import { forwardRef } from "react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"
import HugeWarningCircleIcon from "@hugeicons/core-free-icons/AlertCircleIcon"
import HugeArrowDownIcon from "@hugeicons/core-free-icons/ArrowDown02Icon"
import HugeArrowLeftIcon from "@hugeicons/core-free-icons/ArrowLeft02Icon"
import HugeArrowRightIcon from "@hugeicons/core-free-icons/ArrowRight02Icon"
import HugeXIcon from "@hugeicons/core-free-icons/Cancel01Icon"
import HugeCheckIcon from "@hugeicons/core-free-icons/CheckIcon"
import HugeCommandIcon from "@hugeicons/core-free-icons/CommandIcon"
import HugeDiamondIcon from "@hugeicons/core-free-icons/Diamond02Icon"
import HugeFileDocIcon from "@hugeicons/core-free-icons/FileTextIcon"
import HugeGithubLogoIcon from "@hugeicons/core-free-icons/Github01Icon"
import HugeLayersIcon from "@hugeicons/core-free-icons/Layers02Icon"
import HugeLibraryIcon from "@hugeicons/core-free-icons/LibraryBigIcon"
import HugeMenuIcon from "@hugeicons/core-free-icons/Menu01Icon"
import HugePackageCheckIcon from "@hugeicons/core-free-icons/PackageCheckIcon"
import HugeRefreshIcon from "@hugeicons/core-free-icons/RefreshCwIcon"
import HugeSearchIcon from "@hugeicons/core-free-icons/Search01Icon"
import HugeSearchXIcon from "@hugeicons/core-free-icons/SearchXIcon"
import HugeShieldCheckIcon from "@hugeicons/core-free-icons/ShieldCheckIcon"
import HugeTrendingUpIcon from "@hugeicons/core-free-icons/TrendingUpIcon"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HugeiconsIconProps, IconSvgElement } from "@hugeicons/react"

export type IconProps = Omit<HugeiconsIconProps, "altIcon" | "icon">
export type Icon = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>

function createIcon(icon: IconSvgElement, displayName: string): Icon {
  const Component = forwardRef<SVGSVGElement, IconProps>(function AppIcon(
    { strokeWidth = 1.5, ...props },
    ref
  ) {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        strokeWidth={strokeWidth}
        focusable="false"
        aria-hidden={props["aria-label"] ? undefined : true}
        {...props}
      />
    )
  })

  Component.displayName = displayName
  return Component
}

export const ArrowDownIcon = createIcon(HugeArrowDownIcon, "ArrowDownIcon")
export const ArrowLeftIcon = createIcon(HugeArrowLeftIcon, "ArrowLeftIcon")
export const ArrowRightIcon = createIcon(HugeArrowRightIcon, "ArrowRightIcon")
export const CheckIcon = createIcon(HugeCheckIcon, "CheckIcon")
export const CommandIcon = createIcon(HugeCommandIcon, "CommandIcon")
export const DiamondIcon = createIcon(HugeDiamondIcon, "DiamondIcon")
export const ExternalLinkIcon = createIcon(
  HugeArrowRightIcon,
  "ExternalLinkIcon"
)
export const FileDocIcon = createIcon(HugeFileDocIcon, "FileDocIcon")
export const GithubLogoIcon = createIcon(HugeGithubLogoIcon, "GithubLogoIcon")
export const LayersIcon = createIcon(HugeLayersIcon, "LayersIcon")
export const LibraryIcon = createIcon(HugeLibraryIcon, "LibraryIcon")
export const MenuIcon = createIcon(HugeMenuIcon, "MenuIcon")
export const PackageCheckIcon = createIcon(
  HugePackageCheckIcon,
  "PackageCheckIcon"
)
export const RefreshIcon = createIcon(HugeRefreshIcon, "RefreshIcon")
export const SearchIcon = createIcon(HugeSearchIcon, "SearchIcon")
export const SearchXIcon = createIcon(HugeSearchXIcon, "SearchXIcon")
export const ShieldCheckIcon = createIcon(
  HugeShieldCheckIcon,
  "ShieldCheckIcon"
)
export const TrendingUpIcon = createIcon(HugeTrendingUpIcon, "TrendingUpIcon")
export const WarningCircleIcon = createIcon(
  HugeWarningCircleIcon,
  "WarningCircleIcon"
)
export const XIcon = createIcon(HugeXIcon, "XIcon")
