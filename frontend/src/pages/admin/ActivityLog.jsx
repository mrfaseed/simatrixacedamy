import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Spinner } from "../../components/ui";
import { Header } from "./ManageCategories";

const ENTITY_ICON = {
  enquiry: "ti-inbox",
  admin: "ti-user-shield",
  course: "ti-book-2",
};

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityLog() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api.adminList("activity").then((r) => setRows(r.data)).catch(() => setRows([]));
  }, []);

  if (!rows) return <div className="grid place-items-center py-20"><Spinner className="text-3xl text-fuchsia-300/80" /></div>;

  return (
    <div>
      <Header title="Activity Log" />
      <div className="rounded-2xl border border-white/10 bg-[#1B1240]/80 p-2 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(124,58,237,0.35)]">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/35">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-3 px-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25">
                  <i className={`ti ${ENTITY_ICON[r.entity] || "ti-activity"} text-sm`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80">{r.action}</p>
                  <p className="text-xs text-white/40">
                    {r.admin_name || "System"} · {timeAgo(r.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}