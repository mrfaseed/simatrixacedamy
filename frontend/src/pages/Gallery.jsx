import { useEffect, useState } from "react";
import { api, mediaUrl } from "../api/client";
import { Section, Spinner, PageHero, Reveal } from "../components/ui";
import { useSeo } from "../lib/useSeo";

export default function Gallery() {
  const [images, setImages] = useState(null);

  useEffect(() => {
    api.getGallery().then((res) => setImages(res.data)).catch(() => setImages([]));
  }, []);

  useSeo({
    title: "Gallery · JK Education",
    description: "Moments from our classrooms, events, workshops and placement drives.",
  });

  return (
    <>
      <PageHero eyebrow="Life at JK" title="Gallery" subtitle="Moments from our classrooms, events, workshops and placement drives." />

      <Section className="py-16">
        {!images ? (
          <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>
        ) : images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
            <i className="ti ti-photo text-4xl" />
            <p className="mt-2">Gallery photos will appear here soon.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {images.map((img, i) => (
              <Reveal key={img.id} delay={(i % 4) * 80} className="mb-4 break-inside-avoid">
                <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
                  <img src={mediaUrl(img.image)} alt={img.title || "Gallery"} loading="lazy"
                    className="w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
                  <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-brand-950/70 via-brand-950/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {img.title && <figcaption className="p-4 text-sm font-medium text-white">{img.title}</figcaption>}
                  </div>
                  <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100">
                    <i className="ti ti-zoom-in" />
                  </span>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
