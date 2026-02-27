import { useLocation, Link } from "react-router-dom";
import { Navbar, IconButton, Breadcrumbs, Typography } from "@material-tailwind/react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "../../context/navContext.jsx";

export function DashboardNavbar() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { openSidenav } = controller;
    const { pathname } = useLocation();
    
    // Split path and remove the "dashboard" part for breadcrumbs
    const pathParts = pathname.split("/").filter((el) => el !== "" && el !== "dashboard");

    return (
        <Navbar 
            fullWidth 
            className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm px-3 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-3xl"
        >
            <div className="flex items-center justify-between gap-2">
                {/* Breadcrumbs Section */}
                <div className="capitalize min-w-0 flex-1">
                    <Breadcrumbs className="bg-transparent p-0 transition-all flex-wrap">
                        <Link to="/dashboard" className="opacity-50 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:opacity-100 whitespace-nowrap">
                            Command
                        </Link>
                        {pathParts.map((part, index) => (
                            <Typography 
                                key={index} 
                                variant="small" 
                                className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#333333] truncate max-w-[100px] sm:max-w-none"
                            >
                                {part.replace(/-/g, ' ')}
                            </Typography>
                        ))}
                    </Breadcrumbs>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* User Profile / Status Indicator - hidden on small screens */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#F5F5F5] rounded-2xl border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">System Online</span>
                    </div>

                    {/* Mobile status dot - visible only on small screens */}
                    <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 bg-[#F5F5F5] rounded-xl border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        className="xl:hidden hover:bg-[#F5F5F5] rounded-xl h-9 w-9 sm:h-10 sm:w-10"
                        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                    >
                        <Bars3Icon strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-[#195C51]" />
                    </IconButton>
                </div>
            </div>
        </Navbar>
    );
}

export default DashboardNavbar;