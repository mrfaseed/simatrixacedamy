// Maps a course to an official technology logo (Devicon CDN, true multicolor).
// Matching is keyword-based on the course title, ordered most-specific first.
// Courses with no matching tech logo return null and fall back to their
// category icon in the card.

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const logo = (path) => `${DEVICON}/${path}.svg`;

// [test(titleLower), src, label] — first match wins.
const RULES = [
  [(t) => t.includes("typescript"), logo("typescript/typescript-original"), "TypeScript"],
  [(t) => t.includes("javascript"), logo("javascript/javascript-original"), "JavaScript"],
  [(t) => t.includes("react native"), logo("react/react-original"), "React Native"],
  [(t) => t.includes("mern"), logo("react/react-original"), "MERN"],
  [(t) => t.includes("mean"), logo("angularjs/angularjs-original"), "MEAN"],
  [(t) => t.includes("spring"), logo("spring/spring-original"), "Spring"],
  [(t) => t.includes("django"), logo("django/django-plain"), "Django"],
  [(t) => t.includes("node"), logo("nodejs/nodejs-original"), "Node.js"],
  [(t) => t.includes("react"), logo("react/react-original"), "React"],
  [(t) => t.includes("angular"), logo("angularjs/angularjs-original"), "Angular"],

  [(t) => t.includes("java full stack") || t.includes("java"), logo("java/java-original"), "Java"],
  [(t) => t.includes("python"), logo("python/python-original"), "Python"],
  [(t) => t.includes("c++") || t.includes("c & c++") || t.includes("cpp"), logo("cplusplus/cplusplus-original"), "C++"],
  [(t) => t.includes(".net") || t.includes("dotnet"), logo("dot-net/dot-net-original"), ".NET"],
  [(t) => t.includes("php"), logo("php/php-original"), "PHP"],

  [(t) => t.includes("android"), logo("android/android-original"), "Android"],
  [(t) => t.includes("ios"), logo("apple/apple-original"), "iOS"],
  [(t) => t.includes("flutter"), logo("flutter/flutter-original"), "Flutter"],
  [(t) => t.includes("kotlin"), logo("kotlin/kotlin-original"), "Kotlin"],
  [(t) => t.includes("swift"), logo("swift/swift-original"), "Swift"],

  [(t) => t.includes("ethical hacking"), logo("kalilinux/kalilinux-original"), "Ethical Hacking"],

  [(t) => t.includes("machine learning"), logo("tensorflow/tensorflow-original"), "Machine Learning"],
  [(t) => t.includes("data analy") || t.includes("analytics") || t.includes("power bi"), "/logos/powerbi.svg", "Power BI"],
  [(t) => t.includes("data science"), logo("python/python-original"), "Data Science"],

  [(t) => t.includes("sql server") || t.includes("microsoft sql"), logo("microsoftsqlserver/microsoftsqlserver-plain"), "SQL Server"],
  [(t) => t.includes("mysql"), logo("mysql/mysql-original"), "MySQL"],
  [(t) => t.includes("oracle"), logo("oracle/oracle-original"), "Oracle"],

  [(t) => t.includes("aws") || t.includes("amazon web"), logo("amazonwebservices/amazonwebservices-plain-wordmark"), "AWS"],
  [(t) => t.includes("azure"), logo("azure/azure-original"), "Azure"],
  [(t) => t.includes("google cloud") || t.includes("gcp"), logo("googlecloud/googlecloud-original"), "Google Cloud"],
  [(t) => t.includes("devops"), logo("docker/docker-original"), "DevOps"],
  [(t) => t.includes("ccna") || t.includes("ccnp") || t.includes("cisco") || t.includes("network"), "/logos/cisco-network.svg", "Cisco Networking"],
  [(t) => t.includes("security+") || t.includes("comp\u00b7tia") || t.includes("compTIA") || t.includes("comp tia") || (t.includes("security") && t.includes("+")), "/logos/security-plus.svg", "Security+"],
  [(t) => t.includes("manual testing"), "/logos/manual-testing.svg", "Manual Testing"],
  [(t) => t.includes("digital marketing") || t.includes("social media") || t.includes("seo"), "/logos/digital-marketing.svg", "Digital Marketing"],
  [(t) => t.includes("sap fico") || t.includes("fico"), "/logos/sap-fico.svg", "SAP FICO"],
  [(t) => t.includes("sap mm"), "/logos/sap-mm.svg", "SAP MM"],
  [(t) => t.includes("abap"), "/logos/sap-abap.svg", "SAP ABAP"],
  [(t) => t.includes("sap") && !t.includes("sap mm") && !t.includes("abap"), "/logos/sap.svg", "SAP"],

  [(t) => t.includes("selenium"), logo("selenium/selenium-original"), "Selenium"],
  [(t) => t.includes("api testing"), logo("postman/postman-original"), "API Testing"],

  [(t) => t.includes("c programming") || t.startsWith("c "), logo("c/c-original"), "C"],
];

/**
 * @returns {{ src: string, label: string } | null}
 */
export function courseLogo(course) {
  if (!course) return null;
  const t = `${course.title || ""}`.toLowerCase();
  for (const [test, src, label] of RULES) {
    if (test(t)) return { src, label };
  }
  return null;
}

// Tabler icon fallback for courses with no official tech logo, so every
// course shows a relevant icon. Ordered most-specific first; always resolves.
const ICON_RULES = [
  [(t) => t.includes("ccnp") || t.includes("ccna") || t.includes("cisco") || t.includes("network"), "ti-router"],
  [(t) => t.includes("security") || t.includes("comptia") || t.includes("cyber"), "ti-shield-lock"],
  [(t) => t.includes("ethical") || t.includes("hacking") || t.includes("penetration"), "ti-bug"],
  [(t) => t.includes("analytics") || t.includes("power bi") || t.includes("data analy"), "ti-chart-bar"],
  [(t) => t.includes("machine learning") || t.includes(" ai") || t.includes("artificial"), "ti-brain"],
  [(t) => t.includes("data science") || t.includes("data "), "ti-chart-dots"],
  [(t) => t.includes("fico") || t.includes("finance") || t.includes("accounting"), "ti-businessplan"],
  [(t) => t.includes("sap mm") || t.includes("material"), "ti-package"],
  [(t) => t.includes("abap"), "ti-code"],
  [(t) => t.includes("sap"), "ti-box"],
  [(t) => t.includes("digital marketing") || t.includes("seo") || t.includes("marketing"), "ti-speakerphone"],
  [(t) => t.includes("api testing") || t.includes("api"), "ti-api"],
  [(t) => t.includes("selenium") || t.includes("automation"), "ti-test-pipe"],
  [(t) => t.includes("manual testing") || t.includes("manual"), "ti-clipboard-check"],
  [(t) => t.includes("testing") || t.includes("qa") || t.includes("quality"), "ti-checklist"],
  [(t) => t.includes("database") || t.includes("sql"), "ti-database"],
  [(t) => t.includes("cloud") || t.includes("devops"), "ti-cloud"],
  [(t) => t.includes("android") || t.includes("ios") || t.includes("mobile") || t.includes("flutter") || t.includes("react native"), "ti-device-mobile"],
  [(t) => t.includes("full stack") || t.includes("web") || t.includes("mern") || t.includes("mean"), "ti-stack-2"],
];

/**
 * Always returns a Tabler icon class (e.g. "ti ti-router") for a course.
 * @returns {string}
 */
export function courseIcon(course) {
  const t = `${course?.title || ""}`.toLowerCase();
  for (const [test, ic] of ICON_RULES) {
    if (test(t)) return `ti ${ic}`;
  }
  return "ti ti-code";
}
