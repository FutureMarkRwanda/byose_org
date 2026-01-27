import { Outlet } from "react-router-dom";
import { useMaterialTailwindController } from "../../context/navContext.jsx";
import Sidenav from "./Sidenav.jsx";
import routes from "../../routes.jsx";
import DashboardNavbar from "./Dashboard-navbar.jsx"; 

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { openSidenav } = controller;

  return (
    <div className="min-h-screen bg-[#F5F5F5] selection:bg-[#195C51]/20">
      {/* Sidenav handles its own responsive visibility via context */}
      <Sidenav routes={routes} />
      
      {/* 
         Main Content Area:
         - xl:ml-80 provides space for the fixed 72-unit sidebar (approx 320px) 
         - transition-all ensures smooth movement when sidebar toggles
      */}
      <div className="p-4 xl:ml-80 min-h-screen transition-all duration-500 ease-in-out">
        
        {/* Sticky Header with Backdrop Blur */}
        <div className="sticky top-4 z-40">
            <DashboardNavbar />
        </div>

        {/* Dynamic Page Content */}
        <main className="mt-10 pb-12">
            <div className="container mx-auto">
                <Outlet />
            </div>
        </main>

        {/* Minimalist Dashboard Footer */}
        <footer className="mt-auto py-6 border-t border-gray-200/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    BYOSE Cloud Infrastructure v2.4.0
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#195C51]">Help Desk</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#195C51]">API Docs</a>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;