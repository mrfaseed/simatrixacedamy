import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";

const EMPTY = { name: "", description: "", icon: "", order: 0 };

export default function ManageCategories() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("categories").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, description: row.description || "", icon: row.icon || "", order: row.order });
    setOpen(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editing) await api.adminUpdate("categories", editing.id, form);
      else await api.adminCreate("categories", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete category "${row.name}" and all its courses?`)) return;
    try { await api.adminDelete("categories", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.name, r.description, r.icon, String(r.order)].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Categories" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search categories..." />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1B1240]/80 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr><th className="px-5 py-3 align-middle">Name</th><th className="px-5 py-3 align-middle">Icon</th><th className="px-5 py-3 align-middle">Order</th><th className="px-5 py-3 text-right align-middle">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 align-middle font-medium text-white/90">{r.name}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.icon}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.order}</td>
                <td className="px-5 py-3 align-middle"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-white/35">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Category" : "New Category"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <Field label="Name" required><input className={inputClass} value={form.name} onChange={set("name")} /></Field>
          <Field label="Icon" ><input className={inputClass} value={form.icon} onChange={set("icon")} placeholder="code, cloud, shield..." /></Field>
          <Field label="Description"><textarea className={inputClass} rows={2} value={form.description} onChange={set("description")} /></Field>
          <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
        </div>
      </Modal>
    </div>
  );
}

export function Header({ title, onAdd, searchValue, onSearchChange, searchPlaceholder = "Search..." }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue || ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-56 rounded-full border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>
        )}
        {onAdd && <Button onClick={onAdd}><i className="ti ti-plus" /> Add New</Button>}
      </div>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition-colors duration-150 hover:bg-white/10 hover:text-fuchsia-300">
        <i className="ti ti-edit" />
      </button>
      <button onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition-colors duration-150 hover:bg-rose-400/10 hover:text-rose-300">
        <i className="ti ti-trash" />
      </button>
    </div>
  );
}