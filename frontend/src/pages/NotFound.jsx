import { Link } from "react-router-dom";
import { Section, Button } from "../components/ui";
import { useSeo } from "../lib/useSeo";

export default function NotFound() {
  useSeo({ title: "Page Not Found · Simatrix Academy" });

  return (
    <Section className="grid place-items-center py-32 text-center">
      <div>
        <div className="font-display text-7xl font-extrabold text-brand-600">404</div>
        <p className="mt-3 text-slate-500">Sorry, we couldn't find that page.</p>
        <Button as={Link} to="/" variant="primary" className="mt-6">
          <i className="ti ti-home" /> Back home
        </Button>
      </div>
    </Section>
  );
}
