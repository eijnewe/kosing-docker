"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const username = formData.get("username")
    const password = formData.get("password")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    )

    if (!response.ok) {
      alert("Fel användarnamn eller lösenord.")
      return
    }

    const data = await response.json()

    sessionStorage.setItem("token", data.token)

    router.push("/account")
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Logga in på ditt konto</CardTitle>
          <CardDescription>
            Ange ditt användarnamn och lösenord nedan för att logga in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/*  <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exempel.se"
                  required
                />
              </Field> */}
              <Field>
                <FieldLabel htmlFor="username">Användarnamn</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="användarnamn"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Lösenord</FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Glömt ditt lösenord?
                  </a> */}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <Button type="submit">Logga in</Button>
                {/*  <Button variant="outline" type="button">
                  Logga in med Google
                </Button> */}
                <FieldDescription className="text-center">
                  Har du inget konto?{" "}
                  <Link href="/register">Skapa ett konto</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
