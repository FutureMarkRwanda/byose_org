import { Link } from "react-router-dom";
import { CursorArrowRaysIcon, TvIcon } from "@heroicons/react/24/outline";

const DashboardOverview = () => {
    const projects = [
        {
            title: "Digital Buttons (Presence Eye)",
            desc: "Emphasis on enhancing remote connectivity of devices. Managing smart triggers and hardware communication layers.",
            icon: <CursorArrowRaysIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
            color: "bg-[#195C51]",
            link: "/dashboard/presence-eye-buttons/management" 
        },
        {
            title: "Byose TV",
            desc: "The core multimedia streaming engine. Managing movie libraries, series, and versioning for global distribution.",
            icon: <TvIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
            color: "bg-blue-600",
            link: "/dashboard/byose-tv/manage-movies" 
        }
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-slide-entrance">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">Central Command</h1>
                <p className="text-sm text-gray-500 font-medium">Manage your projects in the same place.</p>
            </header>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
                {projects.map((project, idx) => (
                    <Link key={idx} to={project.link} className="google-card p-5 sm:p-8 group hover:border-[#195C51]/30 block">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 ${project.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                            {project.icon}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#333333] mb-2 sm:mb-4">{project.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-5 sm:mb-8">
                            {project.desc}
                        </p>
                        <div className="inline-flex items-center font-bold text-xs sm:text-sm uppercase tracking-widest text-[#195C51] group-hover:underline">
                            Open Project Control →
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardOverview;