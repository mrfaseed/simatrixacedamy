import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { Section, Spinner, Button, Reveal } from "../components/ui";
import { useSeo } from "../lib/useSeo";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPost(null);
    api.getBlogPost(slug).then((res) => setPost(res.data)).catch((e) => setError(e.message));
  }, [slug]);

  useSeo(
    post
      ? {
          title: `${post.title} · Elysium Academy Blog`,
          description: post.excerpt || post.title,
          image: post.image || undefined,
          canonical: `/blog/${slug}`,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Organization", name: post.author || "Elysium Academy" },
            publisher: { "@type": "Organization", name: "Elysium Academy" },
            datePublished: post.created_at,
          },
        }
      : { title: "Article · Elysium Academy Blog" }
  );

  if (error)
    return (
      <Section className="py-24 text-center">
        <p className="text-rose-600">{error}</p>
        <Button as={Link} to="/blog" variant="outline" className="mt-4">Back to blog</Button>
      </Section>
    );

  if (!post)
    return <div className="grid place-items-center py-32"><Spinner className="text-3xl" /></div>;

  return (
    <>
      <section className="animated-gradient relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 text-white">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="blob absolute -left-24 -top-28 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="blob absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent-500/12 blur-3xl" style={{ animationDelay: "-6s" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-300/45 to-transparent" />
        <Section className="relative">
          <Link to="/blog" className="reveal text-sm text-brand-200 transition-colors hover:text-white">← Back to blog</Link>
          <div className="reveal mt-4 flex items-center gap-2 text-sm text-brand-200" style={{ "--d": "80ms" }}>
            {post.tag && <span className="rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/20">{post.tag}</span>}
            <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
            {post.author && <span>· {post.author}</span>}
          </div>
          <h1 className="reveal mt-4 max-w-3xl font-display text-3xl font-extrabold sm:text-4xl" style={{ "--d": "160ms" }}>{post.title}</h1>
        </Section>
      </section>

      <Section className="py-14">
        <article className="mx-auto max-w-3xl">
          {post.image && (
            <Reveal className="group mb-8 overflow-hidden rounded-2xl">
              <img src={mediaUrl(post.image)} alt={post.title} className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </Reveal>
          )}
          {post.excerpt && <Reveal as="p" className="text-lg font-medium text-slate-700">{post.excerpt}</Reveal>}
          <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
            {(post.content || "").split("\n").filter(Boolean).map((para, i) => (
              <Reveal as="p" key={i} delay={i * 60}>{para}</Reveal>
            ))}
          </div>
        </article>
      </Section>
    </>
  );
}
