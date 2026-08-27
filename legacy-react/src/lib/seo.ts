import { useEffect } from "react";

type PageMeta = { title: string; description: string; image?: string };

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function usePageMeta(meta?: PageMeta) {
  useEffect(() => {
    if (!meta) return;
    document.title = meta.title;
    setMeta('meta[name="description"]', "name", "description", meta.description);
    setMeta('meta[property="og:title"]', "property", "og:title", meta.title);
    setMeta('meta[property="og:description"]', "property", "og:description", meta.description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
    if (meta.image && /^https:\/\//.test(meta.image)) {
      setMeta('meta[property="og:image"]', "property", "og:image", meta.image);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", meta.image);
    }
  }, [meta?.description, meta?.image, meta?.title]);
}
