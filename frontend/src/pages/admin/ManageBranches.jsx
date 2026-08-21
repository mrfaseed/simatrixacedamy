import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import { Header, RowActions } from "./ManageCategories";

const EMPTY = {
  name: "", city: "", address: "", phone: "", email: "", hours: "",
  map_embed: "", is_primary: false, order: 0,
};

export default function ManageBranches() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("branches").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name, city: row.city, address: row.address || "", phone: row.phone || "",
      email: row.email || "", hours: row.hours || "", map_embed: row.map_embed || "",
      is_primary: row.is_primary, order: row.order,
    });
    setOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.city.trim()) return toast.error("Name and city are required");
    setSaving(true);
    try {
      if (editing) await api.adminUpdate("branches", editing.id, form);
      else await api.adminCreate("branches", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete branch "${row.name}"?`)) return;
    try { await api.adminDelete("branches", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.name, r.city, r.address, r.phone, r.email, r.hours].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Branches" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search branches..." />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 align-middle">Name</th><th className="px-5 py-3 align-middle">City</th>
              <th className="px-5 py-3 align-middle">Phone</th><th className="px-5 py-3 text-right align-middle">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 align-middle font-medium text-slate-800">
                  {r.name}
                  {r.is_primary && <span className="ml-2 rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-600">HQ</span>}
                </td>
                <td className="px-5 py-3 align-middle text-slate-500">{r.city}</td>
                <td className="px-5 py-3 align-middle text-slate-500">{r.phone}</td>
                <td className="px-5 py-3 align-middle"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No branches found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Branch" : "New Branch"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required><input className={inputClass} value={form.name} onChange={set("name")} /></Field>
            <Field label="City" required><input className={inputClass} value={form.city} onChange={set("city")} /></Field>
          </div>
          <Field label="Address"><textarea className={inputClass} rows={2} value={form.address} onChange={set("address")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><input className={inputClass} value={form.phone} onChange={set("phone")} /></Field>
            <Field label="Email"><input className={inputClass} value={form.email} onChange={set("email")} /></Field>
          </div>
          <Field label="Working Hours"><input className={inputClass} value={form.hours} onChange={set("hours")} placeholder="Mon-Sat: 9 AM - 7 PM" /></Field>
          <Field label="Custom Google Map embed URL (optional)">
            <input className={inputClass} value={form.map_embed} onChange={set("map_embed")}
              placeholder="Leave blank to auto-map from the address" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
            <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_primary} onChange={set("is_primary")} className="h-4 w-4 rounded" /> Head Office
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
