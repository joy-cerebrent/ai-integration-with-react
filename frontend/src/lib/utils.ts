import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateColorRange({
  startColor,
  endColor,
  steps,
}: {
  startColor: [number, number, number];
  endColor: [number, number, number];
  steps: number;
}): string[] {
  const colors: string[] = [];

  for (var i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);

    colors.push(`rgb(${r},${g},${b})`);
  }

  return colors;
}

export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
};