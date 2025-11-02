import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "./AppRouter";
import { Header } from "./component/Header";
import { Sidebar } from "./component/Sidebar";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="min-h-screen bg-slate-100 relative">
          {/* Mobile toggle - visible only on small screens */}
          <button
            className="absolute top-4 left-4 z-60 md:hidden bg-white shadow p-2 rounded-lg"
            onClick={() => setIsSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Sidebar:
              - fixed on desktop (md:fixed) so it stays in viewport
              - slides in on mobile using translate-x
              - width is fixed (w-72) and main content will be offset by same width on md+
          */}
          <aside
            className={`
              fixed md:fixed top-0 left-0 h-screen w-72
              bg-white border-r border-slate-200 shadow-md md:shadow-none
              z-50 transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              md:translate-x-0
            `}
          >
            <Sidebar />
          </aside>

          {/* Mobile overlay (under sidebar) */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 md:hidden z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main area:
              - offset on md+ by the exact sidebar width (md:ml-72)
              - uses its own scrolling (main element overflow-auto)
              - ensures no double-scrolling or sidebar movement
          */}
          <div className="flex flex-col min-h-screen md:ml-72">
            <Header />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
              <AppRouter />
            </main>
          </div>
        </div>
      ) : (
        <AppRouter />
      )}
    </Router>
  );
};
