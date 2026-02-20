import { Link } from "react-router-dom"; // 1. Use Link for internal routing
import { CursorArrowRaysIcon, TvIcon } from "@heroicons/react/24/outline";

const DashboardOverview = () => {
    const projects = [
        {
            title: "Digital Buttons (Presence Eye)",
            desc: "Emphasis on enhancing remote connectivity of devices. Managing smart triggers and hardware communication layers.",
            icon: <CursorArrowRaysIcon className="w-8 h-8 text-white" />,
            color: "bg-[#195C51]",
            // FIXED: Path must match routes.jsx
            link: "/dashboard/presence-eye-buttons/management" 
        },
        {
            title: "Byose TV",
            desc: "The core multimedia streaming engine. Managing movie libraries, series, and versioning for global distribution.",
            icon: <TvIcon className="w-8 h-8 text-white" />,
            color: "bg-blue-600",
            // FIXED: Path must match routes.jsx
            link: "/dashboard/byose-tv/manage-movies" 
        }
    ];

    return (
        <div className="space-y-8 animate-slide-entrance">
            <header>
                <h1 className="text-3xl font-bold text-[#333333]">Central Command</h1>
                <p className="text-gray-500 font-medium">Manage your projects in the same place.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {projects.map((project, idx) => (
                    // 2. Wrap the whole card or just the button in <Link>
                    <Link key={idx} to={project.link} className="google-card p-8 group hover:border-[#195C51]/30 block">
                        <div className={`w-16 h-16 ${project.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                            {project.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-[#333333] mb-4">{project.title}</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            {project.desc}
                        </p>
                        <div className="inline-flex items-center font-bold text-sm uppercase tracking-widest text-[#195C51] group-hover:underline">
                            Open Project Control →
                        </div>
                    </Link>
                ))}
            </div>


        </div>
    );
};

export default DashboardOverview;