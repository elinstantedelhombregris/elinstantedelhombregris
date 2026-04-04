import { useEffect } from "react";
import type { SeoMetadata } from "@shared/course-seo";

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
};

const upsertLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
};

const upsertJsonLd = (jsonLd: Array<Record<string, unknown>>) => {
  document
    .head
    .querySelectorAll('script[data-seo-jsonld="true"]')
    .forEach((node) => node.remove());

  jsonLd.forEach((entry) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonld = "true";
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  });
};

export function useSeoMetadata(metadata: SeoMetadata | null | undefined) {
  useEffect(() => {
    if (!metadata) return;

    document.documentElement.lang = "es-AR";
    document.title = metadata.title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: metadata.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: metadata.robots,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: metadata.ogTitle,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: metadata.ogDescription,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: metadata.ogType,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: metadata.canonicalUrl,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: metadata.locale,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: metadata.ogTitle,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: metadata.ogDescription,
    });

    if (metadata.ogImageUrl) {
      upsertMeta('meta[property="og:image"]', {
        property: "og:image",
        content: metadata.ogImageUrl,
      });
      upsertMeta('meta[name="twitter:image"]', {
        name: "twitter:image",
        content: metadata.ogImageUrl,
      });
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: metadata.canonicalUrl,
    });

    upsertJsonLd(metadata.jsonLd);
  }, [metadata]);
}
