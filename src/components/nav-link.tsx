"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ComponentProps } from "react"

type Props = ComponentProps<typeof Link>

export const NavLink = ({ className, ...props }: Props) => {
  const pathname = usePathname()
  const isActive = pathname === props.href
  return (
    <Link
      {...props}
      className={cn(
        "transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    />
  )
}
