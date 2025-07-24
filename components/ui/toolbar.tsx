// components/ui/toolbar.tsx
import * as React from "react"
import { cn } from "@/lib/utils" // Assuming you have a `cn` utility from shadcn

export const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-1 rounded-md border border-input bg-transparent p-1",
      className
    )}
    {...props}
  />
))
Toolbar.displayName = "Toolbar"