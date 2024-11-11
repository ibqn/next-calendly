import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ComponentProps } from "react"

type Props = ComponentProps<"div">

export default async function AuthLayout({ children }: Props) {
  const { userId } = await auth()

  if (userId !== null) {
    redirect("/events")
  }

  return <div className="flex min-h-screen items-center justify-center">{children}</div>
}
