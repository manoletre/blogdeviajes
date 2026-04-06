import fs from "fs";
import path from "path";

const REFLECTIONS_DIR = path.join(process.cwd(), "public", "reflections");

/** NFC so URLs, generateStaticParams, and filenames on disk (macOS NFD) stay in sync. */
export function canonicalSlug(slug: string): string {
  return slug.normalize("NFC");
}

/**
 * Resolves the real filename stem on disk (e.g. NFD on macOS) for a slug from the URL.
 */
export function resolveReflectionBasename(slug: string): string | null {
  const want = canonicalSlug(slug);
  if (!fs.existsSync(REFLECTIONS_DIR)) return null;
  for (const f of fs.readdirSync(REFLECTIONS_DIR)) {
    if (!f.endsWith(".md")) continue;
    const base = f.slice(0, -".md".length);
    if (canonicalSlug(base) === want) {
      return base;
    }
  }
  return null;
}

export function getReflectionMdPath(slug: string): string {
  const base = resolveReflectionBasename(slug);
  if (!base) {
    return path.join(REFLECTIONS_DIR, `${canonicalSlug(slug)}.md`);
  }
  return path.join(REFLECTIONS_DIR, `${base}.md`);
}

export function getReflectionSlugs(): string[] {
  if (!fs.existsSync(REFLECTIONS_DIR)) return [];
  return fs
    .readdirSync(REFLECTIONS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => canonicalSlug(f.slice(0, -".md".length)));
}

export function extractTitleFromMarkdown(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** Plain-text excerpt for metadata (drops leading # title). */
export function excerptFromMarkdown(content: string, maxLen = 160): string {
  const withoutTitle = content.replace(/^#\s+.+\n+/, "").trim();
  if (withoutTitle.length <= maxLen) return withoutTitle;
  return `${withoutTitle.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Resolves a markdown image URL (relative to the .md file) to a public URL path. */
export function resolveMarkdownImageToPublicUrl(
  mdFilePath: string,
  rawUrl: string,
): string | null {
  const url = rawUrl.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return url;
  }
  const mdDir = path.dirname(mdFilePath);
  const publicDir = path.join(process.cwd(), "public");
  const resolved = path.resolve(mdDir, url);
  const rel = path.relative(publicDir, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return `/${rel.split(path.sep).join("/")}`;
}

/** First `![...](url)` image in the document, as a browser-ready `src`. */
export function extractFirstImagePublicUrl(
  content: string,
  mdFilePath: string,
): string | null {
  const re = /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const resolved = resolveMarkdownImageToPublicUrl(mdFilePath, m[1]);
    if (resolved) {
      return resolved;
    }
  }
  return null;
}

const MONTHS_ES = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sep.",
  "oct.",
  "nov.",
  "dic.",
] as const;

/** Fecha legible tipo "30 mar. 2026" (mtime del fichero). */
export function formatReflectionDate(mtimeMs: number): string {
  const d = new Date(mtimeMs);
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export type ReflectionListItem = {
  slug: string;
  title: string;
  mtime: number;
  /** Primera imagen del markdown, lista para `img` / `Image` `src`. */
  coverImage: string | null;
};

export function getReflectionList(): ReflectionListItem[] {
  const slugs = getReflectionSlugs();
  const items: ReflectionListItem[] = [];
  for (const slug of slugs) {
    const filePath = getReflectionMdPath(slug);
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const title = extractTitleFromMarkdown(content) ?? slug;
    const coverImage = extractFirstImagePublicUrl(content, filePath);
    items.push({ slug, title, mtime: stat.mtimeMs, coverImage });
  }
  items.sort((a, b) => b.mtime - a.mtime);
  return items;
}

export function getReflectionContent(slug: string): string | null {
  const base = resolveReflectionBasename(slug);
  if (!base) return null;
  return fs.readFileSync(path.join(REFLECTIONS_DIR, `${base}.md`), "utf8");
}
