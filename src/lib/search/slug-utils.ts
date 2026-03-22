// Convert between display names and URL slugs
// e.g. "Latin Catholic" → "latin-catholic-brides"
//      "latin-catholic-brides" → "Latin Catholic"

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-brides";
}

export function fromSlug(slug: string): string {
  // Remove trailing "-brides" and convert back to title case
  const withoutSuffix = slug.replace(/-brides$/, "");
  return withoutSuffix
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toSlugNoSuffix(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
