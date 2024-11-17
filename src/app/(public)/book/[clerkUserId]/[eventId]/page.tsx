type Params = Promise<{
  clerkUserId: string
  eventId: string
}>

type Props = Readonly<{
  params: Params
}>

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function BookEventPage({ params }: Props) {
  const { clerkUserId, eventId } = await params

  await delay(2000)

  return (
    <div>
      <h1>
        BookEventPage {clerkUserId} and {eventId}
      </h1>
    </div>
  )
}
