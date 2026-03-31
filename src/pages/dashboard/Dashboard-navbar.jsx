import { useLocation, Link } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ChevronRight } from "lucide-react";
import { useMaterialTailwindController, setOpenSidenav } from "../../context/navContext.jsx";

export function DashboardNavbar() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { openSidenav } = controller;
    const { pathname } = useLocation();
    
    const pathParts = pathname.split("/").filter((el) => el !== "" && el !== "dashboard");

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
            <button
                onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                className="xl:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
            >
                <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex flex-1 items-center space-x-1 text-sm font-medium text-slate-500 overflow-hidden">
                <Link to="/dashboard" className="hover:text-slate-900 transition-colors truncate">
                    Command
                </Link>
                {pathParts.map((part, index) => (
                    <div key={index} className="flex items-center space-x-1 overflow-hidden">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className={`truncate capitalize ${index === pathParts.length - 1 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900 transition-colors'}`}>
                            {part.replace(/-/g, ' ')}
                        </span>
                    </div>
                ))}
            </nav>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium text-slate-600 hidden sm:block">System Online</span>
                </div>
            </div>
        </header>
    );
}

export default DashboardNavbar;