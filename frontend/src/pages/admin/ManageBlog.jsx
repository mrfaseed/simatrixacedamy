import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import { Header, RowActions } from "./ManageCategories";

const EMPTY = { title: "", tag: "", excerpt: "", content: "", image: "", author: "Elysium Academy", is_published: true };

export default function ManageBlog() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("blog").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, tag: row.tag || "", excerpt: row.excerpt || "", content: row.content || "",
      image: row.image || "", author: row.author || "Elysium Academy", is_published: row.is_published,
    });
    setOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      if (editing) await api.adminUpdate("blog", editing.id, form);
      else await api.adminCreate("blog", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete article "${row.title}"?`)) return;
    try { await api.adminDelete("blog", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.title, r.tag, r.excerpt, r.author, r.content].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Blog" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search blog..." />
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1B1240]/80 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        <table className="w-full min-w-[560px] table-fixed text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr><th className="px-5 py-3 align-middle">Title</th><th className="px-5 py-3 align-middle">Tag</th><th className="px-5 py-3 align-middle">Published</th><th className="px-5 py-3 text-right align-middle">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 align-middle font-medium text-white/90">{r.title}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.tag}</td>
                <td className="px-5 py-3 align-middle">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.is_published ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>
                    {r.is_published ? "Yes" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-white/35">No blog posts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Article" : "New Article"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <Field label="Title" required><input className={inputClass} value={form.title} onChange={set("title")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tag"><input className={inputClass} value={form.tag} onChange={set("tag")} placeholder="Career, Cloud..." /></Field>
            <Field label="Author"><input className={inputClass} value={form.author} onChange={set("author")} /></Field>
          </div>
          <Field label="Excerpt"><textarea className={inputClass} rows={2} value={form.excerpt} onChange={set("excerpt")} /></Field>
          <Field label="Content"><textarea className={inputClass} rows={6} value={form.content} onChange={set("content")} placeholder="Write paragraphs separated by blank lines..." /></Field>
          <ImageUpload label="Cover image (optional)" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.is_published} onChange={set("is_published")} className="h-4 w-4 rounded" /> Published
          </label>
        </div>
      </Modal>
    </div>
  );
}