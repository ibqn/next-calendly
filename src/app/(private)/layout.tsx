import { ReactNode } from "react"

type Props = Readonly<{
  children: ReactNode
}>

export default function Layout({ children }: Props) {
  return (
    <>
      <header></header>
      <main>{children}</main>
    </>
  )
}
