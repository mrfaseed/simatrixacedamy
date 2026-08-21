import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import { Header, RowActions } from "./ManageCategories";

const EMPTY = { title: "", issuer: "", year: "", description: "", image: "", order: 0 };

export default function ManageAwards() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("awards").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, issuer: row.issuer || "", year: row.year || "",
      description: row.description || "", image: row.image || "", order: row.order,
    });
    setOpen(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      if (editing) await api.adminUpdate("awards", editing.id, form);
      else await api.adminCreate("awards", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete award "${row.title}"?`)) return;
    try { await api.adminDelete("awards", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.title, r.issuer, r.year, r.description].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Awards" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search awards..." />
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1B1240]/80 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        <table className="w-full min-w-[560px] table-fixed text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr><th className="px-5 py-3 align-middle">Title</th><th className="px-5 py-3 align-middle">Issuer</th><th className="px-5 py-3 align-middle">Year</th><th className="px-5 py-3 text-right align-middle">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 align-middle font-medium text-white/90">{r.title}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.issuer}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.year}</td>
                <td className="px-5 py-3 align-middle"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-white/35">No awards found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Award" : "New Award"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <Field label="Title" required><input className={inputClass} value={form.title} onChange={set("title")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issuer"><input className={inputClass} value={form.issuer} onChange={set("issuer")} /></Field>
            <Field label="Year"><input className={inputClass} value={form.year} onChange={set("year")} placeholder="2024" /></Field>
          </div>
          <Field label="Description"><textarea className={inputClass} rows={3} value={form.description} onChange={set("description")} /></Field>
          <ImageUpload label="Image (optional)" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
        </div>
      </Modal>
    </div>
  );
}