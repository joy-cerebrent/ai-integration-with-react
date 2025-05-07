import { useEffect } from "react"

export const useTitle = (title: string | undefined) => {
  useEffect(() => {
    if (!title) return;

    document.title = `${title} | AI Integration`;
  }, [title]);
}