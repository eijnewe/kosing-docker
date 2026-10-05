import { cowHead } from "@lucide/lab"
import { Icon } from "lucide-react"
import { cn } from "@/lib/utils"

type LogoProps = React.ComponentProps<"div"> & {
  text?: string
  iconBackground?: string
}

export function Logo({
  text = "Ko$ing AB.",
  iconBackground = "bg-primary",
  className,
  ...props
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-primary-foreground",
          iconBackground
        )}
      >
        <Icon iconNode={cowHead} className="size-4" />
      </div>
      {text}
    </div>
  )
}
