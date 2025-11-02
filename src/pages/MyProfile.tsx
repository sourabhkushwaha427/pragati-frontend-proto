import React from 'react';
import { Mail, Calendar, Building, MapPin, Hash, Phone, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Interfaces for type safety based on your API response ---
interface Company {
  id: number;
  name: string;
  logo: string;
  address: string;
  gstin: string;
  contact_email: string;
  contact_phone: string;
}

interface UserProfileData {
  id: number;
  email: string;
  created_at: string;
  company: Company;
}

// --- Reusable Detail Item Component for cleaner code ---
const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-4 py-3">
    <Icon className="flex-shrink-0 w-5 h-5 text-slate-500 mt-1" />
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

// --- Main MyProfile Component ---
export const MyProfile: React.FC = () => {

  const navigate = useNavigate();
  // Mock data simulating a fetched API response
  const userProfileData: UserProfileData = {
    id: 1,
    email: "sourabhkushwaha@example.com",
    created_at: "2025-10-30T10:00:00Z",
    company: {
      id: 3,
      name: "Tech Innovations Pvt. Ltd.",
      logo: "https://via.placeholder.com/150/0ea5e9/ffffff?text=TI",
      address: "Plot 45, Sector 18, Gurugram, Haryana",
      gstin: "29ABCDE1234F2Z5",
      contact_email: "info@techinnovations.com",
      contact_phone: "+91-9876543210"
    }
  };

  const { email, created_at, company } = userProfileData;

  // Format the creation date for display
  const memberSince = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Profile Card (Left Side) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center h-full">
          <img
            src={company.logo}
            alt={`${company.name} Logo`}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-emerald-200 p-1"
          />
          <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{email}</p>
          
          <div className="border-t border-slate-200 my-6"></div>

          <div className="space-y-4 text-left">
             <div className="flex items-center space-x-3">
               <UserCircle className="w-5 h-5 text-slate-500" />
               <p className="text-sm font-medium text-slate-700">User Profile</p>
             </div>
             <div className="flex items-center space-x-3">
               <Calendar className="w-5 h-5 text-slate-500" />
               <p className="text-sm text-slate-600">Member since: <span className="font-semibold text-slate-800">{memberSince}</span></p>
             </div>
          </div>
        </div>
      </div>

      {/* Company Details Card (Right Side) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Company Information</h3>
            <p className="text-sm text-slate-500 mt-1">Details about your registered company</p>
          </div>
          <div className="p-6 divide-y divide-slate-200">
            <DetailItem icon={Building} label="Company Name" value={company.name} />
            <DetailItem icon={MapPin} label="Registered Address" value={company.address} />
            <DetailItem icon={Hash} label="GST Identification Number" value={company.gstin} />
            <DetailItem icon={Mail} label="Contact Email" value={company.contact_email} />
            <DetailItem icon={Phone} label="Contact Phone" value={company.contact_phone} />
          </div>
           <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
             <button 
             className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
             onClick={()=>{navigate('/company-info')}}
             >
               Edit Company Details →
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};