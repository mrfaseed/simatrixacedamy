import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../pages/admin/AdminLayout";
import { Spinner } from "../components/ui";

// Public pages (code-split per route)
const Home = lazy(() => import("../pages/Home"));
const Courses = lazy(() => import("../pages/Courses"));
const CourseDetail = lazy(() => import("../pages/CourseDetail"));
const Branches = lazy(() => import("../pages/Branches"));
const About = lazy(() => import("../pages/About"));
const Mission = lazy(() => import("../pages/Mission"));
const Pillars = lazy(() => import("../pages/Pillars"));
const Awards = lazy(() => import("../pages/Awards"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Placement = lazy(() => import("../pages/Placement"));
const CareerGuidance = lazy(() => import("../pages/CareerGuidance"));
const Appointment = lazy(() => import("../pages/Appointment"));
const HelpCenter = lazy(() => import("../pages/HelpCenter"));
const InterviewResources = lazy(() => import("../pages/InterviewResources"));
const ResumeBuilding = lazy(() => import("../pages/ResumeBuilding"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogDetail = lazy(() => import("../pages/BlogDetail"));
const Reviews = lazy(() => import("../pages/Reviews"));
const Contact = lazy(() => import("../pages/Contact"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Dashboard v2 (EfferdDashboard2 — standalone shell)
const EfferdDashboard2 = lazy(() => import("../components/ui/efferd-dashboard-2"));

// Admin pages
const Login = lazy(() => import("../pages/admin/Login"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ManageCourses = lazy(() => import("../pages/admin/ManageCourses"));
const ManageCategories = lazy(() => import("../pages/admin/ManageCategories"));
const ManageBranches = lazy(() => import("../pages/admin/ManageBranches"));
const ManageEnquiries = lazy(() => import("../pages/admin/ManageEnquiries"));
const ManageTestimonials = lazy(() => import("../pages/admin/ManageTestimonials"));
const ManageBlog = lazy(() => import("../pages/admin/ManageBlog"));
const ManageGallery = lazy(() => import("../pages/admin/ManageGallery"));
const ManageAwards = lazy(() => import("../pages/admin/ManageAwards"));
const ManageSettings = lazy(() => import("../pages/admin/ManageSettings"));
const ManageStaff = lazy(() => import("../pages/admin/ManageStaff"));
const ActivityLog = lazy(() => import("../pages/admin/ActivityLog"));

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner className="text-3xl" />
    </div>
  );
}


export default function AppRoutes() {
  return (


    
  <Suspense fallback={<PageFallback />}>
    {/* <CustomCursor/>*/}
      <Routes>
        {/* Dashboard v2 (standalone — has its own AppShell) */}
        <Route path="/dashboard-v2" element={<EfferdDashboard2 />} />

        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/mission" element={<Mission />} />
          <Route path="/about/pillars" element={<Pillars />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/interview-resources" element={<InterviewResources />} />
          <Route path="/resume-building" element={<ResumeBuilding />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="branches" element={<ManageBranches />} />
          <Route path="enquiries" element={<ManageEnquiries />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="awards" element={<ManageAwards />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<ManageSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
