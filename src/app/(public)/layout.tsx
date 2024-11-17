import { ReactNode } from "react"

type Props = Readonly<{
  children: ReactNode
}>

export default function PublicLayout({ children }: Props) {
  return <main className="container mx-auto pt-8">{children}</main>
}
