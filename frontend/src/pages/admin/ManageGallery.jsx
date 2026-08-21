import { useEffect, useState } from "react";
import { api, mediaUrl } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import { Header } from "./ManageCategories";

const EMPTY = { title: "", image: "", category: "", order: 0 };

export default function ManageGallery() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => api.adminList("gallery").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ title: row.title || "", image: row.image, category: row.category || "", order: row.order });
    setOpen(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.image) return toast.error("Please upload an image first");
    setSaving(true);
    try {
      if (editing) await api.adminUpdate("gallery", editing.id, form);
      else await api.adminCreate("gallery", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm("Delete this image?")) return;
    try { await api.adminDelete("gallery", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>;

  return (
    <div>
      <Header title="Gallery" onAdd={openNew} />
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          <i className="ti ti-photo text-4xl" />
          <p className="mt-2">No images yet. Click "Add New" to upload.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={mediaUrl(r.image)} alt={r.title || ""} className="aspect-square w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100">
                <button onClick={() => openEdit(r)} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-700 hover:text-brand-600"><i className="ti ti-edit" /></button>
                <button onClick={() => remove(r)} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-700 hover:text-rose-600"><i className="ti ti-trash" /></button>
              </div>
              {r.title && <div className="truncate px-3 py-2 text-xs text-slate-600">{r.title}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Image" : "Add Image"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <ImageUpload label="Image" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          <Field label="Title (optional)"><input className={inputClass} value={form.title} onChange={set("title")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><input className={inputClass} value={form.category} onChange={set("category")} placeholder="events, classroom..." /></Field>
            <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
