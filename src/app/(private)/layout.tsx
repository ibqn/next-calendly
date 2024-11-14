import { NavLink } from "@/components/nav-link"
import { UserButton } from "@clerk/nextjs"
import { CalendarRange } from "lucide-react"
import { ReactNode } from "react"

type Props = Readonly<{
  children: ReactNode
}>

export default function Layout({ children }: Props) {
  return (
    <div className="container mx-auto p-8">
      <header className="flex border-b bg-card py-2">
        <nav className="flex flex-1 items-center justify-between gap-6 text-sm font-medium">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarRange className="size-10" />
            <span className="sr-only md:not-sr-only">Next Calendly</span>
          </div>

          <div className="flex flex-row gap-4">
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/schedule">Schedule</NavLink>
          </div>

          <div className="size-10">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "size-full" } }} />
          </div>
        </nav>
      </header>
      <main className="my-6">{children}</main>
    </div>
  )
}
