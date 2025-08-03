"use client"

import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  icon: LucideIcon
  /** Route or hash. If omitted, we just prevent navigation
   *  and rely on dashboard local state. */
  href?: string
  /** Optional callback when the item is clicked (used by local-state dashboards). */
  onClick?: () => void
}

/**
 * Generic vertical sidebar navigation.
 * Highlights the active route when `href` matches `pathname`.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map(({ name, icon: Icon, href = "#", onClick }) => {
        const isActive = href !== "#" && pathname === href /** simple match, adjust if needed */

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          if (onClick) {
            e.preventDefault()
            onClick()
          } else if (href !== "#") {
            router.push(href)
          }
        }

        return (
          <Button
            key={name}
            variant={isActive ? "default" : "ghost"}
            className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground hover:bg-primary/90")}
            onClick={handleClick}
          >
            <Icon className="mr-3 h-5 w-5" />
            {name}
          </Button>
        )
      })}
    </nav>
  )
}
