import { useEffect } from "react";

const SITE_NAME = "Elysium Academy";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Set per-page document title, meta description, canonical URL, OG/Twitter
 * tags and an optional JSON-LD block. Dependency-free (updates <head> directly).
 *
 * @param {object} opts
 * @param {string} [opts.title]        Document + OG title.
 * @param {string} [opts.description]  Meta + OG description.
 * @param {string} [opts.image]        Absolute or root-relative OG/Twitter image.
 * @param {string} [opts.canonical]    Canonical path (e.g. "/about") or full URL.
 * @param {object} [opts.jsonLd]       Structured data object.
 */
export function useSeo({ title, description, image, canonical, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : null;
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = canonical
      ? (canonical.startsWith("http") ? canonical : origin + canonical)
      : (typeof window !== "undefined" ? window.location.href : "");
    const img = image
      ? (image.startsWith("http") ? image : origin + image)
      : null;

    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    // Sitewide OG/Twitter defaults + per-page values.
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", img ? "summary_large_image" : "summary");
    setMeta("property", "og:url", url);
    if (img) {
      setMeta("property", "og:image", img);
      setMeta("name", "twitter:image", img);
    }
    setLink("canonical", url);

    let script;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.text = ld;
      document.head.appendChild(script);
    }
    return () => {
      if (script) script.remove();
    };
  }, [title, description, image, canonical, ld]);
}
