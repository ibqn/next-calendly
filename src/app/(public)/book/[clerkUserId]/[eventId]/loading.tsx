import { LoaderCircle } from "lucide-react"

export default function Loading() {
  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
      <div className="text-center text-base font-bold text-muted-foreground">Loading...</div>
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
