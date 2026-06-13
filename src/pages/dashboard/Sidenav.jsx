import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDownIcon, ArrowLeftOnRectangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { handleLogout } from "../../utils/helper.js";
import { useMaterialTailwindController, setOpenSidenav } from "../../context/navContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function Sidenav({ routes }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;
  const { pathname } = useLocation();
  const { currentProduct } = useAuth();

  useEffect(() => {
    routes.forEach((group) => {
      group.pages.forEach((page) => {
        if (page.isDropdown && page.subPages.some((sub) => pathname.includes(sub.path))) {
          setOpenDropdown(page.name);
        }
      });
    });
  }, [pathname, routes]);

  useEffect(() => {
    setOpenSidenav(dispatch, false);
  }, [pathname, dispatch]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Filter pages based on current product
  const getFilteredPages = (pages) => {
    if (!currentProduct) return pages;
    
    return pages.filter((page) => {
      if (page.isDropdown) {
        // Check if any subPages belong to the current product
        const hasRelevantSubPages = page.subPages.some((sub) => {
          if (currentProduct === 'presence_eye') {
            return sub.path.startsWith('presence-eye-buttons');
          } else if (currentProduct === 'byose_tv') {
            return sub.path.startsWith('byose-tv');
          }
          return false;
        });
        return hasRelevantSubPages;
      }
      // For non-dropdown pages, check the path directly
      if (currentProduct === 'presence_eye') {
        return page.path.startsWith('presence-eye-buttons');
      } else if (currentProduct === 'byose_tv') {
        return page.path.startsWith('byose-tv');
      }
      return true;
    }).map((page) => {
      if (page.isDropdown) {
        // Filter subPages as well
        return {
          ...page,
          subPages: page.subPages.filter((sub) => {
            if (currentProduct === 'presence_eye') {
              return sub.path.startsWith('presence-eye-buttons');
            } else if (currentProduct === 'byose_tv') {
              return sub.path.startsWith('byose-tv');
            }
            return true;
          })
        };
      }
      return page;
    });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          openSidenav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpenSidenav(dispatch, false)}
      />

      {/* THE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          openSidenav ? "translate-x-0" : "-translate-x-full"
        } xl:translate-x-0`}
      >
        {/* Header Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 relative shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 font-semibold text-slate-900 tracking-tight"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <img src="/assets/icons/Logo03.svg" className="h-6 w-6" alt="BYOSE" />
            BYOSE Admin
          </Link>
          <button
            onClick={() => setOpenSidenav(dispatch, false)}
            className="absolute right-4 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md xl:hidden transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-6">
          {routes
            .filter(({ layout }) => layout === "dashboard")
            .map(({ title, pages }, key) => {
              const filteredPages = getFilteredPages(pages);
              if (filteredPages.length === 0) return null;
              
              return (
                <div key={key}>
                  {title && (
                    <h4 className="px-2 mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {title}
                    </h4>
                  )}
                  <ul className="space-y-1">
                    {filteredPages.map((page) => (
                    <li key={page.name}>
                      {page.isDropdown ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => toggleDropdown(page.name)}
                            className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              openDropdown === page.name
                                ? "text-slate-900 bg-slate-100"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {React.cloneElement(page.icon, { className: "w-4 h-4" })}
                              {page.name}
                            </div>
                            <ChevronDownIcon
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                openDropdown === page.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          
                          <div className={`grid transition-all duration-200 ease-in-out ${openDropdown === page.name ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}>
                            <ul className="overflow-hidden flex flex-col gap-1 ml-5 pl-4 border-l border-slate-200">
                              {page.subPages.map((sub) => {
                                if (sub.hidden) return null;
                                return (
                                  <li key={sub.path}>
                                    <NavLink
                                      to={`/dashboard/${sub.path}`}
                                      onClick={() => setOpenSidenav(dispatch, false)}
                                      className={({ isActive }) =>
                                        `block relative px-4 py-2 text-sm transition-colors rounded-md ${
                                          isActive
                                            ? "text-[#195C51] font-semibold bg-[#195C51]/5 before:absolute before:left-[-1px] before:top-0 before:bottom-0 before:w-[2px] before:bg-[#195C51]"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`
                                      }
                                    >
                                      {sub.name}
                                    </NavLink>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <NavLink
                          to={`/dashboard/${page.path}`}
                          end
                          onClick={() => setOpenSidenav(dispatch, false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-[#195C51]/5 text-[#195C51] font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`
                          }
                        >
                          {React.cloneElement(page.icon, { className: "w-4 h-4" })}
                          {page.name}
                        </NavLink>
                      )}
                    </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => handleLogout("", "/auth")}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidenav;