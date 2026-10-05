import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cowHead } from "@lucide/lab"
import { Icon } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <section className="container mx-auto px-4 py-20 text-center md:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Badge med engelska sloganen */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <Icon iconNode={cowHead} className="h-4 w-4 text-primary" />
            <span>Ko$ing AB &bull; Mooo-ving your money</span>
          </div>

          {/* Huvudrubrik med svenska sloganen */}
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Full{" "}
            <span className="text-chart-4 underline decoration-chart-5 underline-offset-8">
              ko-ntroll
            </span>{" "}
            på din ekonomi
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-balance text-muted-foreground sm:text-xl">
            Släpp dina pengar på grönbete. Med ko$ing får du snabb överblick,
            hög sparränta och noll dolda avgifter.
          </p>

          {/* Hero CTA */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/register"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "w-full px-8 font-semibold shadow-lg sm:w-auto",
              })}
            >
              Skapa användare
            </Link>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full px-8 sm:w-auto"
              )}
            >
              Logga in
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
{
  /* <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Din bank, enkelt och smidigt</h1>
          <p>
            Hantera ditt konto och håll koll på ditt saldo på ett enkelt sätt.
          </p>

          <Link
            href="/register"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            Skapa användare
          </Link>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div> */
}
