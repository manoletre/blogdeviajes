import path from "path";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Rewrites relative image URLs in markdown so they point under `/` (public folder),
 * resolved relative to the source `.md` file path.
 */
export function remarkResolveRelativeImages(mdFilePath: string) {
  const mdDir = path.dirname(mdFilePath);
  const publicDir = path.join(process.cwd(), "public");
  return () => (tree: Root) => {
    visit(tree, "image", (node) => {
      const url = node.url;
      if (
        !url ||
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/")
      ) {
        return;
      }
      const resolved = path.resolve(mdDir, url);
      const rel = path.relative(publicDir, resolved);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return;
      }
      node.url = `/${rel.split(path.sep).join("/")}`;
    });
  };
}
