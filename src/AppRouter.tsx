import { Routes, Route, Navigate } from "react-router-dom";
import { CompanyInfo } from "./pages/CompanyInfo";
import { Invoices } from "./pages/Invoices";
import { Items } from "./pages/Items";
import { Parties } from "./pages/Parties";
import { Stock } from "./pages/Stocks";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { Reports } from "./pages/Resports";
import { ProtectedRoute } from "./ProtectedRoute";
import {MyProfile} from "./pages/MyProfile"
import { Signup } from "./pages/SignUp";

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signUp" element={<Signup/>}/>
      <Route path="/my-profile" element={<ProtectedRoute><MyProfile/></ProtectedRoute>}/>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/company-info" element={<ProtectedRoute><CompanyInfo /></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/parties" element={<ProtectedRoute><Parties /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};