import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import { Header, RowActions } from "./ManageCategories";

const EMPTY = { name: "", role: "", content: "", rating: 5, image: "", order: 0, is_active: true };

export default function ManageTestimonials() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("testimonials").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name, role: row.role || "", content: row.content, rating: row.rating,
      image: row.image || "", order: row.order, is_active: row.is_active,
    });
    setOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.content.trim()) return toast.error("Name and content are required");
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editing) await api.adminUpdate("testimonials", editing.id, payload);
      else await api.adminCreate("testimonials", payload);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete testimonial from "${row.name}"?`)) return;
    try { await api.adminDelete("testimonials", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.name, r.role, r.content, String(r.rating)].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Testimonials" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search testimonials..." />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-5 py-3 align-middle">Name</th><th className="px-5 py-3 align-middle">Role</th><th className="px-5 py-3 align-middle">Rating</th><th className="px-5 py-3 align-middle">Active</th><th className="px-5 py-3 text-right align-middle">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 align-middle font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-3 align-middle text-slate-500">{r.role}</td>
                <td className="px-5 py-3 align-middle text-accent-500">{"★".repeat(r.rating || 0)}</td>
                <td className="px-5 py-3 align-middle">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {r.is_active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3 align-middle"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No testimonials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Testimonial" : "New Testimonial"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required><input className={inputClass} value={form.name} onChange={set("name")} /></Field>
            <Field label="Role"><input className={inputClass} value={form.role} onChange={set("role")} placeholder="MERN Graduate" /></Field>
          </div>
          <Field label="Content" required><textarea className={inputClass} rows={3} value={form.content} onChange={set("content")} /></Field>
          <ImageUpload label="Photo (optional)" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rating"><input className={inputClass} type="number" min={1} max={5} value={form.rating} onChange={set("rating")} /></Field>
            <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
            <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="h-4 w-4 rounded" /> Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
