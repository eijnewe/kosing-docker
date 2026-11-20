"use client"

import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useBankData } from "@/hooks/use-bank-data"

type Transaction = {
  id: number
  amount: string
  createdAt: string
}

const currency = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" })
const dateTime = new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" })

export default function TransactionsPage() {
  const { data, error } = useBankData<{ transactions: Transaction[] }>("/me/accounts/transactions", "GET")
  if (error) return <p role="alert" className="p-6">{error}</p>
  if (!data) return <p role="status" className="p-6">Laddar…</p>

  return (
    <main className="flex min-h-svh justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md self-start">
        <CardHeader>
          <h1 className="text-xl font-semibold">Transaktioner</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.transactions.length === 0 ? (
            <p>Du har inga transaktioner ännu.</p>
          ) : (
            <ul className="divide-y" aria-label="Insättningar">
              {data.transactions.map(({ id, amount, createdAt }) => (
                <li key={id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p>Insättning</p>
                    <time dateTime={createdAt} className="text-sm text-muted-foreground">
                      {dateTime.format(new Date(createdAt))}
                    </time>
                  </div>
                  <span className="font-medium">{currency.format(Number(amount))}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/account" className="inline-block underline">Tillbaka till mitt konto</Link>
        </CardContent>
      </Card>
    </main>
  )
}
