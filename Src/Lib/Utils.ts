import { type ClassValue, clsx } from "clsx"
import { SkinnyTailwindMerge, twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
