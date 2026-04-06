import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatReflectionDate,
  getReflectionList,
} from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Reflexiones",
  description: "Feed de reflexiones de viaje",
};

function CoverImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div
        className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800"
        aria-hidden
      />
    );
  }
  if (src.startsWith("/")) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 42rem"
        />
      </div>
    );
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function Home() {
  const list = getReflectionList();
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-2xl bg-white px-4 py-10 sm:px-6 sm:py-14 dark:bg-zinc-950">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Mis reflexiones de viaje – {year}
        </h1>
      </header>
      {list.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Aún no hay reflexiones. Añade un archivo{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            .md
          </code>{" "}
          en{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            public/reflections
          </code>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-14">
          {list.map(({ slug, title, mtime, coverImage }) => (
            <li key={slug}>
              <article className="flex flex-col gap-4">
                <h2 className="text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50">
                  {title}
                </h2>
                <CoverImage src={coverImage} alt="" />
                <div className="flex items-center justify-between gap-4 pt-1">
                  <time
                    className="text-sm text-zinc-700 dark:text-zinc-300"
                    dateTime={new Date(mtime).toISOString()}
                  >
                    {formatReflectionDate(mtime)}
                  </time>
                  <Link
                    href={`/reflexiones/${slug}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Leer
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
