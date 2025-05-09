import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "../../lib/utils"

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 bg-black rounded-full p-1",
      className
    )}
    {...props}
  />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium transition-all rounded-full min-h-[36px]",
      "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      "data-[state=on]:bg-blue-500 data-[state=on]:text-white",
      "data-[state=off]:text-metal-silver hover:text-white data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }