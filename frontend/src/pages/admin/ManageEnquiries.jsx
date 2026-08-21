import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Spinner, Button } from "../../components/ui";
import { Header, RowActions } from "./ManageCategories";

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const STATUS_PILL = {
  new: "bg-violet-400/15 text-violet-200",
  contacted: "bg-indigo-400/15 text-indigo-200",
  qualified: "bg-fuchsia-400/15 text-fuchsia-200",
  converted: "bg-emerald-400/15 text-emerald-200",
  lost: "bg-rose-400/15 text-rose-200",
};

// contact/appointment = the general enquiry form. govt_intern /
// career_guidance = the hero-carousel program applications, which
// also carry college/address/degree.
const TYPES = ["contact", "appointment", "govt_intern", "career_guidance"];
const TYPE_LABEL = {
  contact: "Contact",
  appointment: "Appointment",
  govt_intern: "Govt Internship",
  career_guidance: "Career Guidance",
};
const TYPE_PILL = {
  contact: "bg-white/10 text-white/60",
  appointment: "bg-sky-400/15 text-sky-200",
  govt_intern: "bg-amber-400/15 text-amber-200",
  career_guidance: "bg-fuchsia-400/15 text-fuchsia-200",
};
const PROGRAM_TYPES = ["govt_intern", "career_guidance"];

export default function ManageEnquiries() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [filter, setFilter] = useState("all");       // status filter
  const [typeFilter, setTypeFilter] = useState("all"); // type filter
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null); // enquiry open in drawer

  const load = () => api.adminList("enquiries").then((r) => setRows(r.data));
  useEffect(() => {
    load();
    api.adminList("admins").then((r) => setAdmins(r.data)).catch(() => {});
  }, []);

  const patch = (updated) => {
    setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
    setActive((a) => (a && a.id === updated.id ? updated : a));
  };

  const remove = async (row) => {
    if (!confirm(`Delete enquiry from "${row.name}"?`)) return;
    try { await api.adminDelete("enquiries", row.id); toast.success("Deleted"); setActive(null); load(); }
    catch (e) { toast.error(e.message); }
  };

  const exportCsv = (data) => {
    if (!data.length) return toast.error("Nothing to export");
    const cols = ["id", "name", "phone", "email", "course_title", "type", "college", "degree", "address", "status", "assigned_name", "follow_up_at", "message", "created_at"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...data.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  const term = q.trim().toLowerCase();
  const filtered = rows
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => (typeFilter === "all" ? true : r.type === typeFilter))
    .filter((r) =>
      !term ? true : [r.name, r.phone, r.email, r.course_title, r.message, r.college, r.degree].some((v) => (v || "").toLowerCase().includes(term))
    );

  return (
    <div>
      <Header title="Enquiries" />

      {/* type filter — separates program applications from the general enquiry form */}
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        {["all", ...TYPES].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              typeFilter === t ? "bg-gradient-to-br from-amber-500 to-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30" : "bg-white/5 text-white/60 ring-1 ring-white/10"
            }`}>
            {t === "all" ? "All types" : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === s ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30" : "bg-white/5 text-white/60 ring-1 ring-white/10"
            }`}>
            {s}
          </button>
        ))}
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, course, college…"
            className="w-64 rounded-full border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20" />
        </div>
        <button onClick={() => exportCsv(filtered)}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-400">
          <i className="ti ti-file-spreadsheet" /> Export CSV
        </button>
      </div>
      <div className="mb-3 text-xs text-white/35">{filtered.length} of {rows.length} enquiries</div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1B1240]/80 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3">Name</th><th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Type</th><th className="px-5 py-3">Course / College</th>
              <th className="px-5 py-3">Assigned</th>
              <th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} onClick={() => setActive(r)} className="cursor-pointer transition hover:bg-white/[0.04]">
                <td className="px-5 py-3 font-medium text-white/90">
                  {r.name}
                  <div className="text-xs font-normal text-white/35">{new Date(r.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-5 py-3 text-white/50"><div>{r.phone}</div>{r.email && <div className="text-xs">{r.email}</div>}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_PILL[r.type] || TYPE_PILL.contact}`}>
                    {TYPE_LABEL[r.type] || r.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50">
                  {PROGRAM_TYPES.includes(r.type)
                    ? <div>{r.college || "—"}{r.degree && <div className="text-xs text-white/35">{r.degree}</div>}</div>
                    : (r.course_title || "—")}
                </td>
                <td className="px-5 py-3 text-white/50">{r.assigned_name || <span className="text-white/25">Unassigned</span>}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_PILL[r.status] || STATUS_PILL.new}`}>{r.status}</span>
                </td>
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                  <RowActions onEdit={() => setActive(r)} onDelete={() => remove(r)} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-white/35">No enquiries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <EnquiryDrawer
          enquiry={active}
          admins={admins}
          onClose={() => setActive(null)}
          onChange={patch}
          onDelete={() => remove(active)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------- CRM drawer */
function EnquiryDrawer({ enquiry, admins, onClose, onChange, onDelete }) {
  const toast = useToast();
  const [notes, setNotes] = useState(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(null);
    api.getEnquiryNotes(enquiry.id).then((r) => setNotes(r.data)).catch(() => setNotes([]));
  }, [enquiry.id]);

  const update = async (fields) => {
    try {
      const r = await api.adminUpdate("enquiries", enquiry.id, fields);
      onChange(r.data);
    } catch (e) { toast.error(e.message); }
  };

  const addNote = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const r = await api.addEnquiryNote(enquiry.id, body.trim());
      setNotes((n) => [r.data, ...(n || [])]);
      setBody("");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const followLocal = enquiry.follow_up_at ? enquiry.follow_up_at.slice(0, 16) : "";
  const isProgram = PROGRAM_TYPES.includes(enquiry.type);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#1B1240] shadow-2xl animate-[slideInRight_.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-start justify-between border-b border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white">
          <div>
            <h3 className="text-lg font-bold">{enquiry.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_PILL[enquiry.type] || TYPE_PILL.contact}`}>
                {TYPE_LABEL[enquiry.type] || enquiry.type}
              </span>
              <p className="text-xs text-fuchsia-100">{new Date(enquiry.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-fuchsia-100 hover:text-white"><i className="ti ti-x text-xl" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* contact actions */}
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-400/10 px-3 py-1.5 text-sm font-medium text-violet-200 hover:bg-violet-400/20">
              <i className="ti ti-phone" /> {enquiry.phone}
            </a>
            <a href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-200 hover:bg-emerald-400/20">
              <i className="ti ti-brand-whatsapp" /> WhatsApp
            </a>
            {enquiry.email && (
              <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/70 hover:bg-white/15">
                <i className="ti ti-mail" /> Email
              </a>
            )}
          </div>

          {enquiry.course_title && (
            <Detail label="Interested course" value={enquiry.course_title} />
          )}

          {/* program-application-only fields */}
          {isProgram && (
            <div className="grid grid-cols-2 gap-3">
              {enquiry.college && <Detail label="College" value={enquiry.college} />}
              {enquiry.degree && <Detail label="Degree" value={enquiry.degree} />}
              {enquiry.address && <div className="col-span-2"><Detail label="Address" value={enquiry.address} /></div>}
            </div>
          )}

          {enquiry.message && <Detail label="Message" value={enquiry.message} />}

          {/* status pipeline */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/35">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => update({ status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                    enquiry.status === s ? `${STATUS_PILL[s]} ring-1 ring-current` : "bg-white/10 text-white/50 hover:bg-white/15"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* assign + follow-up */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/35">Assigned to</p>
              <select value={enquiry.assigned_to || ""} onChange={(e) => update({ assigned_to: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400/50">
                <option value="" className="bg-[#1B1240]">Unassigned</option>
                {admins.map((a) => <option key={a.id} value={a.id} className="bg-[#1B1240]">{a.name}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/35">Follow-up</p>
              <input type="datetime-local" value={followLocal}
                onChange={(e) => update({ follow_up_at: e.target.value || null })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400/50" />
            </div>
          </div>

          {/* notes */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/35">Notes</p>
            <div className="flex gap-2">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Add a note…"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-fuchsia-400/50" />
              <Button size="sm" onClick={addNote} disabled={saving}>Add</Button>
            </div>
            <div className="mt-3 space-y-3">
              {notes === null ? (
                <Spinner />
              ) : notes.length === 0 ? (
                <p className="text-xs text-white/35">No notes yet.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-sm text-white/80">{n.body}</p>
                    <p className="mt-1 text-[11px] text-white/35">
                      {n.admin_name || "Staff"} · {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <button onClick={onDelete} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10">
            <i className="ti ti-trash" /> Delete enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/35">{label}</p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  );
}