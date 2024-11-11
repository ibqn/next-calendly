import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton } from "@clerk/nextjs"

export default function HomePage() {
  return (
    <div className="container mx-auto my-4 text-center">
      <h1 className="mb-4 text-3xl">Home Page</h1>

      <div className="flex justify-center gap-2">
        <Button asChild>
          <SignInButton />
        </Button>
        <Button asChild>
          <SignUpButton />
        </Button>
      </div>
    </div>
  )
}
