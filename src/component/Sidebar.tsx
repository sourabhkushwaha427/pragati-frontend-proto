import { Link, useLocation } from "react-router-dom";
import { Building2, Package, Users, FileText,  BarChart3, Activity, } from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard", icon: Activity, label: "Dashboard" },
    { path: "/company-info", icon: Building2, label: "Company Info" },
    { path: "/items", icon: Package, label: "Items" },
    { path: "/parties", icon: Users, label: "Parties" },
    { path: "/invoices", icon: FileText, label: "Invoices" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
  ];

  return (
    <aside className="w-72 bg-white flex flex-col border-r  h-screen border-slate-200 shadow-sm">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-xl blur-md opacity-30"></div>
            <div className="relative w-11 h-11 bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-xl">P</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900">Pragati</span>
            <p className="text-xs text-slate-500">Business Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative group flex items-center space-x-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"></div>
              )}
              <div className={`
                transition-all duration-200
                ${isActive 
                  ? 'text-emerald-600' 
                  : 'text-slate-400 group-hover:text-slate-600'
                }
              `}>
                <Icon 
                  size={20} 
                  strokeWidth={2}
                />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {/* <div className="p-4 border-t border-slate-200 space-y-2">
        
        <Link
          to="/help"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        >
          <HelpCircle size={20} className="text-slate-400" strokeWidth={2} />
          <span>Help & Support</span>
        </Link>

        
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        >
          <Settings size={20} className="text-slate-400" strokeWidth={2} />
          <span>Settings</span>
        </Link>
      </div> */}

      {/* User Card at Bottom */}
      {/* <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-semibold">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200">
            <LogOut size={16} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </div> */}
    </aside>
  );
};