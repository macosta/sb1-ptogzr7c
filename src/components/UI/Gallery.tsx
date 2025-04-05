import * as React from "react"
import { cn } from "../../lib/utils"
import { Separator } from "./Separator"

interface GalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string
    image: string
  }[]
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
}

export function Gallery({
  items,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: GalleryProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={index} className="group relative">
            <img
              src={item.image}
              alt={item.title}
              className={cn(
                "rounded-lg object-cover",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
              )}
              width={width}
              height={height}
            />
            <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-2">
              <div className="h-full rounded-lg border border-white/30" />
            </div>
            <div className="absolute bottom-2 left-2">
              <div className="rounded-lg bg-white px-2 py-1 text-sm font-medium text-black">
                {item.title}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Separator />
    </div>
  )
}