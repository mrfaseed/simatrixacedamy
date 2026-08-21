import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import { Header, RowActions } from "./ManageCategories";

const EMPTY = { name: "", email: "", password: "", role: "staff" };

export default function ManageStaff() {
  const toast = useToast();
  const { admin } = useAuth();
  const isSuper = (admin?.role || "admin") === "admin";

  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("admins").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, email: row.email, password: "", role: row.role || "staff" });
    setOpen(true);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and email are required");
    if (!editing && !form.password) return toast.error("Password is required for a new account");
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, role: form.role };
        if (form.password) payload.password = form.password;
        await api.adminUpdate("admins", editing.id, payload);
      } else {
        await api.adminCreate("admins", form);
      }
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (row.id === admin.id) return toast.error("You can't remove your own account");
    if (!confirm(`Remove ${row.name}?`)) return;
    try { await api.adminDelete("admins", row.id); toast.success("Removed"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.name, r.email, r.role].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Staff" onAdd={isSuper ? openNew : undefined} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search staff..." />
      {!isSuper && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
          You have staff access — only an admin can add or edit accounts.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 align-middle">Name</th><th className="px-5 py-3 align-middle">Email</th>
              <th className="px-5 py-3 align-middle">Role</th><th className="px-5 py-3 text-right align-middle">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 align-middle font-medium text-slate-800">
                  {r.name}{r.id === admin.id && <span className="ml-2 text-xs text-brand-500">(you)</span>}
                </td>
                <td className="px-5 py-3 align-middle text-slate-500">{r.email}</td>
                <td className="px-5 py-3 align-middle">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    (r.role || "admin") === "admin" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
                  }`}>{r.role || "admin"}</span>
                </td>
                <td className="px-5 py-3 align-middle">
                  {isSuper ? <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
                           : <span className="text-xs text-slate-300">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Account" : "New Staff Account"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <Field label="Name" required><input className={inputClass} value={form.name} onChange={set("name")} /></Field>
          <Field label="Email" required>
            <input className={inputClass} type="email" value={form.email} onChange={set("email")} disabled={!!editing} />
          </Field>
          <Field label={editing ? "New Password (leave blank to keep)" : "Password"} required={!editing}>
            <input className={inputClass} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={form.role} onChange={set("role")}>
              <option value="staff">Staff (limited)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
