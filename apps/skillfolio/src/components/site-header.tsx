import { Link } from "@tanstack/react-router"

import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import {
  GithubLogoIcon,
  LibraryIcon,
  MenuIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const nav = [
  { label: "Library", href: "/#library", icon: LibraryIcon },
  { label: "Principles", href: "/#principles", icon: ShieldCheckIcon },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-10"
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          className="group flex items-center gap-3 font-heading text-lg font-bold"
        >
          <BrandMark className="size-9 transition-transform duration-300 group-hover:scale-[1.03]" />
          SKILLFOLIO
        </Link>

        <div className="hidden items-center gap-7 text-sm font-semibold sm:flex">
          {nav.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-brand">
              {item.label}
            </a>
          ))}
          <Button
            asChild
            variant="outline"
            className="rounded-none border-2 border-ink bg-transparent hover:bg-ink hover:text-white"
          >
            <a
              href="https://github.com/montasim/Skillfoliox"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogoIcon /> GitHub
            </a>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-none border-2 border-ink sm:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-l-2 border-ink bg-paper">
            <SheetHeader className="border-b-2 border-ink p-6">
              <SheetTitle className="font-heading text-2xl">
                Skillfolio
              </SheetTitle>
              <SheetDescription>
                Reusable judgment for AI agents.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col p-6">
              {nav.map(({ label, href, icon: Icon }) => (
                <SheetClose key={label} asChild>
                  <a
                    href={href}
                    className="border-b border-ink/15 py-5 font-heading text-2xl font-semibold"
                  >
                    <Icon className="mr-3 inline size-5" /> {label}
                  </a>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
