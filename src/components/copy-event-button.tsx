"use client"

import { Button } from "@/components/ui/button"
import { CopyCheckIcon, CopyIcon, CopyXIcon } from "lucide-react"
import { ComponentProps, useState } from "react"

type Props = Omit<ComponentProps<typeof Button>, "children" | "onClick"> & {
  eventId: string
  clerkUserId: string
}

type CopyState = "idle" | "error" | "copied"

export const CopyEventButton = ({ eventId, clerkUserId, ...props }: Props) => {
  const [copyState, setCopyState] = useState<CopyState>("idle")

  const CopyIcon = getCopyIcon(copyState)
  const label = getLabelState(copyState)

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
      setCopyState("copied")
    } catch (error) {
      setCopyState("error")
    } finally {
      setTimeout(() => setCopyState("idle"), 2000)
    }
  }

  return (
    <Button {...props} onClick={handleCopy}>
      <CopyIcon className="size-4" /> {label}
    </Button>
  )
}

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return CopyIcon
    case "error":
      return CopyXIcon
    case "copied":
      return CopyCheckIcon
  }
}

function getLabelState(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy"
    case "error":
      return "Error"
    case "copied":
      return "Copied"
  }
}
