"use client"
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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const username = formData.get("username")
    const password = formData.get("password")
    /*   const confirmPassword = formData.get("confirm-password")

    if (password !== confirmPassword) {
      alert("Lösenorden matchar inte.")
      return
    } */

    console.log("username:", username)
    console.log("password:", password)

    console.log("skickar POST /users")


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`,  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })

    console.log("response:", response.status)

    if (!response.ok) {
      alert("Något gick fel när kontot skulle skapas.")
      return
    }

    router.push("/login")
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Skapa ditt konto</CardTitle>
        <CardDescription>
          Fyll i dina uppgifter för att komma igång.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Användarnamn</FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="JohnDoe01"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
              />
              <FieldDescription>
                Lösenordet måste innehålla minst 8 tecken.
              </FieldDescription>
            </Field>
            {/*  <Field>
              <FieldLabel htmlFor="confirm-password">
                Bekräfta lösenord
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>
                Ange ditt lösenord igen för att bekräfta.
              </FieldDescription>
            </Field> */}
            <FieldGroup>
              <Field>
                <Button type="submit">Skapa konto</Button>

                <FieldDescription className="px-6 text-center">
                  Har du redan ett konto? <Link href="/login">Logga in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
