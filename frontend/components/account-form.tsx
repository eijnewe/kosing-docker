"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { apiURL, useBankData } from "@/hooks/use-bank-data"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item"

export function AccountForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { data, setData, error } = useBankData<{ amount: number | string }>("/me/accounts", "POST")
  const [depositError, setDepositError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const amount = Number(new FormData(form).get("amount"))
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }

    setPending(true)
    setDepositError("")
    try {
      const response = await fetch(`${apiURL}/me/accounts/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, amount }),
      })

      if (response.status === 401) {
        sessionStorage.removeItem("token")
        router.replace("/login")
        return
      }
      const result = await response.json()
      if (!response.ok) {
        setDepositError(result.message)
        return
      }

      setData(result)
      form.reset()
    } catch {
      setDepositError("Kunde inte bekräfta insättningen. Kontrollera saldo och historik.")
    } finally {
      setPending(false)
    }
  }

  if (error) return <p role="alert">{error}</p>
  if (!data) return <p role="status">Laddar…</p>

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle><h1>Mitt konto</h1></CardTitle>
          <CardDescription>
            Ditt saldo och dina kontouppgifter. Du kan även sätta in pengar här.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Item variant="muted" size="sm">
            <ItemContent>
              <ItemTitle>Saldo</ItemTitle>
            </ItemContent>
            <ItemActions>
              {new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(Number(data.amount))}
            </ItemActions>
          </Item>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="amount">Belopp</FieldLabel>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0,00kr"
                  required
                  step="0.01"
                  min="0.01"
                />
                <FieldDescription>
                  Ange beloppet du vill sätta in på ditt konto.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>Sätt in pengar</Button>
                {depositError && <p role="alert">{depositError}</p>}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4">
          <Link href="/transactions" className="underline">Transaktioner</Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "w-full sm:w-auto"
            )}
            onClick={() => {
              sessionStorage.removeItem("token")
            }}
          >
            Logga ut
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
