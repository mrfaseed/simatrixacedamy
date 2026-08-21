import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useToast, Button, Field, inputClass, Spinner } from "../../components/ui";

const GROUPS = [
  {
    title: "Contact",
    icon: "ti-phone",
    fields: [
      ["contact_phone", "Primary Phone"],
      ["contact_phone2", "Secondary Phone"],
      ["contact_email", "Email"],
      ["whatsapp", "WhatsApp number (e.g. 919677781155)"],
      ["contact_address", "Address", "textarea"],
    ],
  },
  {
    title: "Social Links",
    icon: "ti-share",
    fields: [
      ["social_facebook", "Facebook URL"],
      ["social_instagram", "Instagram URL"],
      ["social_youtube", "YouTube URL"],
      ["social_linkedin", "LinkedIn URL"],
    ],
  },
  {
    title: "Hero",
    icon: "ti-sparkles",
    fields: [
      ["hero_title", "Hero Title"],
      ["hero_subtitle", "Hero Subtitle", "textarea"],
    ],
  },
];

export default function ManageSettings() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.adminGetSettings().then((r) => setForm(r.data)).catch((e) => toast.error(e.message));
  }, [toast]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await api.adminSaveSettings(form);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Site Settings</h1>
          <p className="mt-1 text-sm text-slate-500">These values appear across the public website.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
          {!saving && <i className="ti ti-device-floppy" />}
        </Button>
      </div>

      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <i className={`ti ${g.icon} text-sm`} />
              </span>
              {g.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.fields.map(([key, label, type]) => (
                <div key={key} className={type === "textarea" ? "sm:col-span-2" : ""}>
                  <Field label={label}>
                    {type === "textarea" ? (
                      <textarea className={inputClass} rows={2} value={form[key] || ""} onChange={set(key)} />
                    ) : (
                      <input className={inputClass} value={form[key] || ""} onChange={set(key)} />
                    )}
                  </Field>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save changes"}
          {!saving && <i className="ti ti-device-floppy" />}
        </Button>
      </div>
    </div>
  );
}
