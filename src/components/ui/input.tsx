import * as React from "react"

import { cn } from "~/utils/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border px-3 py-2 text-base shadow-sm transition-colors md:text-sm",
          "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
          "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-stone-700 dark:placeholder:text-stone-400",
          "dark:border-stone-800 dark:bg-stone-800 dark:text-stone-200 dark:focus-visible:border-stone-700 dark:focus-visible:bg-stone-800/75 dark:hover:bg-stone-800/75",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
