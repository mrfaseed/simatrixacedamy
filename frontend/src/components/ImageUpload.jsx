import { useRef, useState } from "react";
import { api, mediaUrl } from "../api/client";
import { useToast, Spinner } from "./ui";

/**
 * Image upload field. `value` is the stored path (e.g. /src/assets/x.jpg);
 * `onChange(path)` is called with the new path after a successful upload.
 */
export default function ImageUpload({ value, onChange, label = "Image" }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {value ? (
            <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <i className="ti ti-photo text-2xl text-slate-300" />
          )}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
          <button type="button" onClick={pick} disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {uploading ? <><Spinner /> Uploading...</> : <><i className="ti ti-upload" /> {value ? "Replace" : "Upload"}</>}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")}
              className="ml-2 text-sm font-medium text-rose-600 hover:underline">
              Remove
            </button>
          )}
          <p className="text-xs text-slate-400">PNG, JPG, WEBP or SVG · max 5 MB</p>
        </div>
      </div>
    </div>
  );
}
