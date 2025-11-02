import {
  User,
  Building2,
  Package,
  Users,
  FileText,
  Boxes,
  BarChart3,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Header: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { logout } = useAuth(); // ✅ Hook moved here
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;

  console.log('storedUser data : ',userData);



  const pageInfo: Record<string, { title: string; subtitle: string; icon: any }> = {
    "/dashboard": { title: "Dashboard", subtitle: "Overview of your business", icon: Activity },
    "/company-info": { title: "Company Info", subtitle: "Manage company details", icon: Building2 },
    "/items": { title: "Items", subtitle: "Product & service catalog", icon: Package },
    "/parties": { title: "Parties", subtitle: "Customer & supplier directory", icon: Users },
    "/invoices": { title: "Invoices", subtitle: "Billing & payment records", icon: FileText },
    "/stock": { title: "Stock", subtitle: "Inventory tracking", icon: Boxes },
    "/reports": { title: "Reports", subtitle: "Sales & purchase analytics", icon: BarChart3 },
  };

  const currentPage =
    pageInfo[location.pathname] || {
      title: "Welcome",
      subtitle: "Get started with Pragati",
      icon: Activity,
    };
  const PageIcon = currentPage.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100">
            <PageIcon size={18} className="text-emerald-600" strokeWidth={2} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{currentPage.title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Divider */}
          <div className="h-10 w-px bg-slate-200"></div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                <User size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-slate-900">{userData?.user?.email}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">John Doe</p>
                      <p className="text-xs text-slate-500">{userData?.user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => { navigate('/my-profile') }}
                  >
                    My Profile
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={logout} // ✅ Call logout directly
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
