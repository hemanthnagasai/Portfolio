import { useEffect } from "react";

// Per-route <title> and meta description for a SPA: search engines and
// browser tabs otherwise see the same static title on every route.
export default function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute("content", description);
    }
  }, [title, description]);
}
