import { Link } from "react-router-dom";
import { Users, Cpu, DollarSign, ArrowRight, Tv, Film, MessageSquare, PenSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const presenceEyeCards = [
  {
    title: "Customer Insights",
    description:
      "Understand who your users are — activity, demographics, and retention signals.",
    icon: Users,
    to: "/dashboard/presence-eye-buttons/analytics",
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    title: "Device Insights",
    description:
      "Monitor device health, connectivity, and usage patterns across the fleet.",
    icon: Cpu,
    to: "/dashboard/presence-eye-buttons/insights",
    accent: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    title: "Revenue Insights",
    description:
      "Track subscriptions, MRR, and revenue trends driving the business.",
    icon: DollarSign,
    to: "/dashboard/presence-eye-buttons/revenue",
    accent: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

const byoseTVCards = [
  {
    title: "Manage Movies",
    description:
      "Manage your movie library, update details, and organize content.",
    icon: Tv,
    to: "/dashboard/byose-tv/manage-movies",
    accent: "bg-purple-50 text-purple-700 ring-purple-100",
  },
  {
    title: "Add Movies",
    description:
      "Add new movies to your library with metadata and media files.",
    icon: Film,
    to: "/dashboard/byose-tv/add-movie",
    accent: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    title: "Add Trends",
    description:
      "Create and publish trending content for your audience.",
    icon: PenSquare,
    to: "/dashboard/byose-tv/add-post",
    accent: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  {
    title: "Feedbacks",
    description:
      "View and manage user feedback and ratings.",
    icon: MessageSquare,
    to: "/dashboard/byose-tv/feedbacks",
    accent: "bg-rose-50 text-rose-700 ring-rose-100",
  },
];

export default function DashboardHome() {
  const { currentProduct } = useAuth();
  
  const cards = currentProduct === 'presence_eye' ? presenceEyeCards : byoseTVCards;
  const productName = currentProduct === 'presence_eye' ? 'Presence Eye' : 'BYOSE TV';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick an area to dive into. Each view surfaces the metrics that matter
          for {productName}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, to, accent }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#195C51]/30"
          >
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${accent}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {description}
            </p>

            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
              View insights
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
