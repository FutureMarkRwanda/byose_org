import { CursorArrowRaysIcon, TvIcon } from "@heroicons/react/24/outline";

const DashboardOverview = () => {
    const projects = [
        {
            title: "Digital Buttons (Presence Eye)",
            desc: "Emphasis on enhancing remote connectivity of devices. Managing smart triggers and hardware communication layers.",
            icon: <CursorArrowRaysIcon className="w-8 h-8 text-white" />,
            color: "bg-[#195C51]",
            link: "/dashboard/presence-eye"
        },
        {
            title: "Byose TV",
            desc: "The core multimedia streaming engine. Managing movie libraries, series, and versioning for global distribution.",
            icon: <TvIcon className="w-8 h-8 text-white" />,
            color: "bg-blue-600",
            link: "/dashboard/movies"
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
                    <div key={idx} className="google-card p-8 group hover:border-[#195C51]/30">
                        <div className={`w-16 h-16 ${project.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                            {project.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-[#333333] mb-4">{project.title}</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            {project.desc}
                        </p>
                        <a 
                            href={project.link}
                            className="inline-flex items-center font-bold text-sm uppercase tracking-widest text-[#195C51] hover:underline"
                        >
                            Open Project Control →
                        </a>
                    </div>
                ))}
            </div>

            {/* Quick Stats Placeholder */}
            <div className="bg-[#F5F5F5] p-8 rounded-[2.5rem] border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 text-center">Global System Health</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {['Users', 'Active Devices', 'Movies', 'Feedbacks'].map((stat) => (
                        <div key={stat} className="text-center">
                            <p className="text-2xl font-bold text-[#333333]">--</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{stat}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;