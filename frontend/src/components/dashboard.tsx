import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  Clock,
  Star,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const kpiData = [
  {
    title: "Total Students",
    value: "12,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Active Courses",
    value: "284",
    change: "+8.2%",
    trend: "up" as const,
    icon: BookOpen,
    description: "vs last month",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Revenue",
    value: "₹48.2L",
    change: "+23.1%",
    trend: "up" as const,
    icon: DollarSign,
    description: "vs last month",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "New Enrollments",
    value: "1,429",
    change: "-3.4%",
    trend: "down" as const,
    icon: UserPlus,
    description: "vs last month",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const enrollmentData = [
  { month: "Jan", students: 820, target: 900 },
  { month: "Feb", students: 932, target: 920 },
  { month: "Mar", students: 1101, target: 950 },
  { month: "Apr", students: 1034, target: 980 },
  { month: "May", students: 1290, target: 1010 },
  { month: "Jun", students: 1429, target: 1050 },
];

const revenueByCategory = [
  { category: "Web Dev", revenue: 14200, students: 3420 },
  { category: "Data Science", revenue: 11800, students: 2890 },
  { category: "Design", revenue: 8600, students: 2100 },
  { category: "Marketing", revenue: 6400, students: 1580 },
  { category: "Mobile", revenue: 5200, students: 1340 },
  { category: "Cloud", revenue: 4800, students: 1120 },
];

const engagementData = [
  { week: "W1", active: 8200, completed: 1200 },
  { week: "W2", active: 8800, completed: 1400 },
  { week: "W3", active: 9100, completed: 1350 },
  { week: "W4", active: 8600, completed: 1550 },
  { week: "W5", active: 9400, completed: 1680 },
  { week: "W6", active: 9800, completed: 1720 },
  { week: "W7", active: 10200, completed: 1890 },
  { week: "W8", active: 10600, completed: 1950 },
];

const recentActivity = [
  {
    user: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
    action: "enrolled in",
    target: "Advanced React Patterns",
    time: "2 min ago",
  },
  {
    user: "Arjun Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    action: "completed",
    target: "Python for Data Science",
    time: "15 min ago",
  },
  {
    user: "Meera Krishnan",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    action: "left a review on",
    target: "UI/UX Masterclass",
    time: "42 min ago",
  },
  {
    user: "Rahul Desai",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    action: "enrolled in",
    target: "Cloud Architecture Fundamentals",
    time: "1 hr ago",
  },
  {
    user: "Ananya Reddy",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    action: "completed",
    target: "Digital Marketing Pro",
    time: "2 hr ago",
  },
];

const topCourses = [
  {
    name: "Full-Stack Web Development",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=80&h=80&fit=crop",
    students: 2847,
    rating: 4.9,
    revenue: "₹12.4L",
  },
  {
    name: "Data Science & ML Bootcamp",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop",
    students: 2312,
    rating: 4.8,
    revenue: "₹10.8L",
  },
  {
    name: "UI/UX Design Masterclass",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=80&h=80&fit=crop",
    students: 1856,
    rating: 4.8,
    revenue: "₹8.2L",
  },
  {
    name: "Mobile App Development",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=80&h=80&fit=crop",
    students: 1534,
    rating: 4.7,
    revenue: "₹6.8L",
  },
  {
    name: "Cloud & DevOps Engineering",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&h=80&fit=crop",
    students: 1298,
    rating: 4.7,
    revenue: "₹5.6L",
  },
];

/* ───────── Custom tooltip ───────── */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

/* ───────── Dashboard component ───────── */

export function Dashboard() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Welcome back! Here's an overview of your academy.
        </p>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {kpi.title}
              </CardDescription>
              <div className={`rounded-lg p-2 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                )}
                <span
                  className={
                    kpi.trend === "up" ? "text-emerald-600" : "text-rose-600"
                  }
                >
                  {kpi.change}
                </span>
                <span className="text-slate-400">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Charts row ─── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Enrollment Trends */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Enrollment Trends</CardTitle>
                <CardDescription>
                  Monthly new enrollments vs target
                </CardDescription>
              </div>
              <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                    name="Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue by Category</CardTitle>
                <CardDescription>Revenue in ₹ thousands</CardDescription>
              </div>
              <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCategory} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    radius={[0, 6, 6, 0]}
                    name="Revenue (₹K)"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Engagement chart + Recent Activity ─── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Student Engagement */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Student Engagement</CardTitle>
                <CardDescription>Weekly active users & completions</CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                +18.2%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#activeGrad)"
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#completedGrad)"
                    name="Completions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <a
                href="#"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback>
                        {item.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">
                          {item.user}
                        </span>{" "}
                        {item.action}{" "}
                        <span className="font-medium text-slate-900">
                          {item.target}
                        </span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                  {i < recentActivity.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Top Courses Table ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Courses</CardTitle>
              <CardDescription>
                Best performing courses by enrollment
              </CardDescription>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              All Courses
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Students</th>
                  <th className="pb-3 pr-4">Rating</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCourses.map((course) => (
                  <tr
                    key={course.name}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.image}
                          alt={course.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-slate-900">
                          {course.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-600">
                      {course.students.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {course.rating}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-slate-900">
                      {course.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
