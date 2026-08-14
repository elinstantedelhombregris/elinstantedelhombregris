import type { BlogPost } from '~/lib/blog-registry';

interface PortadaCronicaProps {
  post: BlogPost;
}

/** Portada editorial opcional. Mantiene dimensiones fijas para evitar saltos al cargar. */
export function PortadaCronica({ post }: PortadaCronicaProps) {
  if (post.coverImageUrl === '') return null;

  return (
    <figure className="border-tinta bg-papel-sombra mb-9 border-2 shadow-[7px_7px_0_var(--color-tinta)]">
      <img
        src={post.coverImageUrl}
        alt={post.coverImageAlt}
        width={1672}
        height={941}
        loading="eager"
        className="aspect-[1672/941] w-full object-cover"
      />
      {post.coverImageCaption !== '' || post.coverImageCredit !== '' ? (
        <figcaption className="font-space text-tinta-75 border-tinta flex flex-wrap justify-between gap-x-4 gap-y-1 border-t px-4 py-3 text-[10px] uppercase tracking-[0.08em] sm:px-5">
          <span>{post.coverImageCaption}</span>
          {post.coverImageCredit !== '' ? (
            <span className="text-tinta-50">{post.coverImageCredit}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
