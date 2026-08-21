import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Modal, Field, inputClass, Spinner } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import { SAMPLE_QUESTIONS } from "../../components/CourseQuiz";
import { Header, RowActions } from "./ManageCategories";

const sampleQuiz = () => SAMPLE_QUESTIONS.map((item) => ({ ...item, options: [...item.options] }));

const EMPTY = {
  title: "", category_id: "", summary: "", description: "", duration: "",
  level: "", tier: "classic", syllabus: "", quiz: sampleQuiz(), image: "", order: 0, is_active: true,
};

export default function ManageCourses() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.adminList("courses").then((r) => setRows(r.data));
  useEffect(() => {
    load();
    api.adminList("categories").then((r) => setCategories(r.data));
  }, []);

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, quiz: sampleQuiz() }); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, category_id: row.category_id, summary: row.summary || "",
      description: row.description || "", duration: row.duration || "", level: row.level || "",
      tier: row.tier || "classic", syllabus: (row.syllabus || []).join("\n"),
      quiz: row.quiz?.length ? row.quiz : sampleQuiz(),
      image: row.image || "", order: row.order, is_active: row.is_active,
    });
    setOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setForm((current) => ({
      ...current,
      quiz: current.quiz.map((item, index) =>
        index === questionIndex ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm((current) => ({
      ...current,
      quiz: current.quiz.map((item, index) => {
        if (index !== questionIndex) return item;
        const options = [...item.options];
        options[optionIndex] = value;
        return { ...item, options };
      }),
    }));
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.category_id) return toast.error("Please choose a category");
    const invalidQuestion = form.quiz.find(
      (item) => !item.question.trim() || item.options.length !== 4 || item.options.some((option) => !option.trim())
    );
    if (invalidQuestion) return toast.error("Every quiz question needs a question and four choices");
    setSaving(true);
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      syllabus: form.syllabus.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.adminUpdate("courses", editing.id, payload);
      else await api.adminCreate("courses", payload);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete course "${row.title}"?`)) return;
    try { await api.adminDelete("courses", row.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!term) return true;
    return [r.title, r.category?.name, r.tier, r.summary, r.level].some((value) =>
      (value || "").toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header title="Courses" onAdd={openNew} searchValue={search} onSearchChange={(e) => setSearch(e.target.value)} searchPlaceholder="Search courses..." />
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1B1240]/80 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        <table className="w-full min-w-[640px] table-fixed text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3 align-middle">Title</th><th className="px-5 py-3 align-middle">Category</th>
              <th className="px-5 py-3 align-middle">Tier</th><th className="px-5 py-3 align-middle">Active</th>
              <th className="px-5 py-3 text-right align-middle">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 align-middle font-medium text-white/90">{r.title}</td>
                <td className="px-5 py-3 align-middle text-white/50">{r.category?.name}</td>
                <td className="px-5 py-3 align-middle text-white/50 capitalize">{r.tier}</td>
                <td className="px-5 py-3 align-middle">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.is_active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>
                    {r.is_active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3"><RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-white/35">No courses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Course" : "New Course"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}>
        <div className="space-y-4">
          <Field label="Title" required><input className={inputClass} value={form.title} onChange={set("title")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <select className={inputClass} value={form.category_id} onChange={set("category_id")}>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tier">
              <select className={inputClass} value={form.tier} onChange={set("tier")}>
                <option value="classic">Classic</option>
                <option value="premium">Premium</option>
                <option value="budget">Budget</option>
              </select>
            </Field>
            <Field label="Duration"><input className={inputClass} value={form.duration} onChange={set("duration")} placeholder="3 Months" /></Field>
            <Field label="Level"><input className={inputClass} value={form.level} onChange={set("level")} placeholder="Beginner to Advanced" /></Field>
          </div>
          <Field label="Summary"><textarea className={inputClass} rows={2} value={form.summary} onChange={set("summary")} /></Field>
          <Field label="Description"><textarea className={inputClass} rows={3} value={form.description} onChange={set("description")} /></Field>
          <Field label="Syllabus (one module per line)">
            <textarea className={inputClass} rows={5} value={form.syllabus} onChange={set("syllabus")} placeholder={"Module 1\nModule 2"} />
          </Field>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Course quiz</p>
                <p className="text-xs text-white/40">Edit the 10 questions shown on this course page.</p>
              </div>
              <span className="rounded-full bg-fuchsia-400/10 px-2.5 py-1 text-xs text-fuchsia-200">{form.quiz.length} questions</span>
            </div>
            <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1">
              {form.quiz.map((item, questionIndex) => (
                <div key={questionIndex} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <Field label={`Question ${questionIndex + 1}`}>
                    <input
                      className={inputClass}
                      value={item.question}
                      onChange={(event) => updateQuestion(questionIndex, "question", event.target.value)}
                    />
                  </Field>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {item.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        className={inputClass}
                        value={option}
                        aria-label={`Question ${questionIndex + 1}, choice ${optionIndex + 1}`}
                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                        placeholder={`Choice ${optionIndex + 1}`}
                      />
                    ))}
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-xs text-white/60">
                    Correct answer
                    <select
                      className={`${inputClass} max-w-36`}
                      value={item.answer}
                      onChange={(event) => updateQuestion(questionIndex, "answer", Number(event.target.value))}
                    >
                      {item.options.map((_, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>Choice {optionIndex + 1}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <ImageUpload label="Course Image" value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order"><input className={inputClass} type="number" value={form.order} onChange={set("order")} /></Field>
            <label className="flex items-center gap-2 pt-7 text-sm text-white/70">
              <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="h-4 w-4 rounded" /> Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
