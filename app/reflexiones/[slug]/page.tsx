import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  excerptFromMarkdown,
  extractTitleFromMarkdown,
  getReflectionContent,
  getReflectionMdPath,
  getReflectionSlugs,
} from "@/lib/reflections";
import { remarkResolveRelativeImages } from "@/lib/remark-resolve-relative-images";

export const dynamicParams = false;

export function generateStaticParams() {
  return getReflectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = getReflectionContent(slug);
  if (!content) {
    return { title: "Reflexión" };
  }
  const title = extractTitleFromMarkdown(content) ?? slug;
  return {
    title,
    description: excerptFromMarkdown(content),
  };
}

export default async function ReflexionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getReflectionContent(slug);
  if (!content) {
    notFound();
  }
  const mdPath = getReflectionMdPath(slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Inicio
        </Link>
      </p>
      <article className="prose prose-lg prose-zinc max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkResolveRelativeImages(mdPath)]}
          components={{
            img: ({ alt, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="max-w-full rounded-lg"
                alt={alt ?? ""}
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
