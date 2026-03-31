import { Outlet } from "react-router-dom";
import { useMaterialTailwindController } from "../../context/navContext.jsx";
import Sidenav from "./Sidenav.jsx";
import routes from "../../routes.jsx";
import DashboardNavbar from "./Dashboard-navbar.jsx"; 

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { openSidenav } = controller;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#195C51]/10 selection:text-[#195C51]">
      {/* Sidebar */}
      <Sidenav routes={routes} />
      
      {/* Main Content Area */}
      <div className="xl:ml-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        
        {/* Sticky Header */}
        <DashboardNavbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Minimalist Dashboard Footer */}
        <footer className="py-6 border-t border-slate-200 bg-transparent">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-medium text-slate-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} BYOSE Infrastructure v2.4.0
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Support</a>
              <a href="#" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">API Docs</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;