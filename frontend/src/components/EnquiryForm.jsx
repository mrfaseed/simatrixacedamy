import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "./ui";
import { Button, Field } from "./ui";

const EMPTY = { name: "", phone: "", email: "", course_id: "", message: "" };

// Classic refined palette
const NAVY = "#0A0A1F";
const SLATE_GRAY = "#4A4A6F";
const LIGHT_GRAY = "#ECECF1";
const PURE_WHITE = "#FFFFFF";
const ACCENT_PURPLE = "#9800E8";

export default function EnquiryForm({ courses = [], compact = false, type = "contact" }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    course_id: courses.length === 1 ? String(courses[0]?.id || "") : "",
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courses.length === 1 && !form.course_id) {
      setForm((f) => ({ ...f, course_id: String(courses[0].id) }));
    }
  }, [courses, form.course_id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createEnquiry({
        ...form,
        course_id: form.course_id || null,
        type,
      });
      toast.success(res.message || "Enquiry submitted!");
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <FormField label="Full Name" required>
          <input
            name="name"
            autoComplete="name"
            required
            className="form-input"
            value={form.name}
            onChange={set("name")}
            placeholder="Your full name"
            style={{
              borderColor: "rgba(10,10,31,0.15)",
              color: NAVY,
              "--focus-color": ACCENT_PURPLE,
            }}
          />
        </FormField>

        <FormField label="Phone" required>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="form-input"
            value={form.phone}
            onChange={set("phone")}
            placeholder="Mobile number"
            style={{
              borderColor: "rgba(10,10,31,0.15)",
              color: NAVY,
              "--focus-color": ACCENT_PURPLE,
            }}
          />
        </FormField>

        <FormField label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="form-input"
            value={form.email}
            onChange={set("email")}
            placeholder="you@email.com"
            style={{
              borderColor: "rgba(10,10,31,0.15)",
              color: NAVY,
              "--focus-color": ACCENT_PURPLE,
            }}
          />
        </FormField>

        {courses.length > 1 ? (
          <FormField label="Interested Course">
            <select
              name="course_id"
              className="form-input"
              value={form.course_id}
              onChange={set("course_id")}
              style={{
                borderColor: "rgba(10,10,31,0.15)",
                color: NAVY,
                "--focus-color": ACCENT_PURPLE,
              }}
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </FormField>
        ) : courses.length === 1 ? (
          <FormField label="Interested Course">
            <input
              className="form-input"
              type="text"
              value={courses[0].title}
              readOnly
              style={{
                borderColor: "rgba(10,10,31,0.15)",
                color: NAVY,
                background: LIGHT_GRAY,
              }}
            />
            <input type="hidden" name="course_id" value={form.course_id} />
          </FormField>
        ) : null}
      </div>

      <FormField label="Message">
        <textarea
          name="message"
          className="form-input resize-none"
          rows={compact ? 2 : 3}
          value={form.message}
          onChange={set("message")}
          placeholder="Tell us what you'd like to learn..."
          style={{
            borderColor: "rgba(10,10,31,0.15)",
            color: NAVY,
            "--focus-color": ACCENT_PURPLE,
          }}
        />
      </FormField>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{
          background: NAVY,
          boxShadow: `0 8px 20px rgba(10,10,31,0.2)`,
        }}
        onMouseEnter={(e) => {
          if (!submitting) e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = NAVY;
        }}
      >
        {submitting ? (
          <>
            <i className="ti ti-loader-2 animate-spin mr-2" />
            Submitting…
          </>
        ) : (
          <>
            Submit Enquiry
            <i className="ti ti-send ml-2" style={{ color: "#00A0F8" }} />
          </>
        )}
      </button>

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1.5px solid;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          background: ${PURE_WHITE};
          outline: none;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .form-input:hover {
          border-color: rgba(10,10,31,0.25);
        }
        .form-input:focus {
          border-color: ${ACCENT_PURPLE};
          background: rgba(152, 0, 232, 0.08);
          box-shadow: 0 0 0 3px rgba(152, 0, 232, 0.1);
        }
      `}</style>
    </form>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: SLATE_GRAY }}>
        {label} {required && <span style={{ color: ACCENT_PURPLE }}>*</span>}
      </span>
      {children}
    </label>
  );
}
