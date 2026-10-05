"use client"

import { useEffect, useState } from "react"

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

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export function AccountForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    async function getBalance() {
      const token = sessionStorage.getItem("token")

      if (!token) {
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me/accounts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setBalance(data.amount)
    }

    getBalance()
  }, [])

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const amount = formData.get("amount")
    const token = sessionStorage.getItem("token")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/accounts/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          amount: Number(amount),
        }),
      }
    )
    if (!response.ok) {
      alert("Något gick fel.")
      return
    }

    const data = await response.json()

    setBalance(data.amount)
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Mitt konto</CardTitle>
          <CardDescription>
            Ditt saldo och dina kontouppgifter. Du kan även sätta in pengar här.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Item variant="muted" size="sm">
            <ItemContent>
              <ItemTitle>Saldo</ItemTitle>
              {/*    <ItemDescription>
                A simple item with title and description.
              </ItemDescription> */}
            </ItemContent>
            <ItemActions>
              {balance !== null ? `${balance} kr` : "Laddar..."}
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
                  step="0.05"
                  min="0.05"
                />
                <FieldDescription>
                  Ange beloppet du vill sätta in på ditt konto.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit">Sätt in pengar</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
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
