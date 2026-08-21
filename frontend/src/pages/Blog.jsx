import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { Section, Spinner, PageHero, Reveal } from "../components/ui";
import { useSeo } from "../lib/useSeo";

export default function Blog() {
  const [posts, setPosts] = useState(null);

  useSeo({
    title: "Blog · Elysium Academy",
    description: "Insights, guides and career tips from the Elysium Academy team — full stack development, cloud, data science, interviews and more.",
    canonical: "/blog",
  });

  useEffect(() => {
    api.getBlog().then((res) => setPosts(res.data)).catch(() => setPosts([]));
  }, []);

  return (
    <>
      <PageHero title="Blog" subtitle="Insights, guides and career tips from the Elysium Academy team." />

      <Section className="py-14">
        {!posts ? (
          <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>
        ) : posts.length === 0 ? (
          <p className="py-20 text-center text-slate-500">No articles published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <Link to={`/blog/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/10">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {p.image ? (
                      <img src={mediaUrl(p.image)} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-slate-50 to-slate-100 text-4xl text-slate-200 transition-transform duration-500 group-hover:scale-105"><i className="ti ti-news" /></div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {p.tag && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-600">{p.tag}</span>}
                      <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-900 group-hover:text-brand-700">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-3">{p.excerpt}</p>
                    <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600">
                      Read more <i className="ti ti-arrow-right transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
