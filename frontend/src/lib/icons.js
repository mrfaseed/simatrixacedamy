// Maps seed icon names -> Tabler icon classes (ti ti-*)
const MAP = {
  book: "ti-book-2",
  code: "ti-code",
  route: "ti-route",
  refresh: "ti-refresh",
  support: "ti-headset",
  users: "ti-users-group",
  presentation: "ti-presentation",
  briefcase: "ti-briefcase",
  layers: "ti-stack-2",
  smartphone: "ti-device-mobile",
  shield: "ti-shield-check",
  database: "ti-database",
  chart: "ti-chart-histogram",
  cloud: "ti-cloud",
  boxes: "ti-box",
  check: "ti-checkbox",
  megaphone: "ti-speakerphone",
};

export function icon(name) {
  return `ti ${MAP[name] || "ti-point"}`;
}
