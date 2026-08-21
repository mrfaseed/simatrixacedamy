/** Google Maps embed (keyless). `src` comes from branch.map_src. */
export default function MapEmbed({ src, title = "Location map", className = "" }) {
  if (!src) return null;
  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`h-full w-full border-0 ${className}`}
      allowFullScreen
    />
  );
}
