import { useEffect, useState } from "react";
import { Building2, Mail, Upload, Save, X, Phone, MapPin, IdCard } from "lucide-react";
import { api } from "../ApiService/ApiService";

interface Company {
  id: string;
  name: string;
  address: string | null;
  gstin: string | null;
  contact_email: string;
  contact_phone: string | null;
  logo: string | object | null;
  created_at: string;
  updated_at: string;
}

export const CompanyInfo: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const companyid = userData?.user?.company_id;
  const token = localStorage.getItem("token") || "";

  const [formData, setFormData] = useState<Company>({
    id: "",
    name: "",
    address: "",
    gstin: "",
    contact_email: "",
    contact_phone: "",
    logo: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      console.log("Company get API called");
      const response = await api.get<Company>(`/api/companies/${companyid}`, token);

      if (response.success && response.company) {
        console.log("Company data found:", response.company);
        setFormData(response.company);
        if (response.company.logo) {
          setLogoPreview(response.company.logo);
        }
      } else {
        console.warn("No company data found");
      }
    } catch (error) {
      console.error("Error occurred when fetching company info:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        //console.log("Logo data:", reader.result as string);
        setLogoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting company data:", formData);

    try {
      const companyBody = {
        company_id:companyid,
        name: formData.name,
        address: formData.address,
        gstin: formData.gstin,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        logo: formData.logo
      }

      console.log('Company body ', companyBody);
      const response = await api.put(`/api/companies/update`, companyBody, token);
      if (response.success) {
        console.log("Company info updated successfully");
        fetchCompanyData(); // refresh data
      } else {
        console.warn("Failed to update company info");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100">
            <Building2 size={24} className="text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Company Information</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your company details and settings
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Logo</h2>
          <div className="flex items-center space-x-6">
            {/* Logo Preview */}
            <div className="relative">
              {logoPreview ? (
                <div className="relative w-32 h-32 rounded-xl border-2 border-slate-200 overflow-hidden bg-white">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <Building2 size={40} className="text-slate-400" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <label htmlFor="logo-upload" className="block">
                <div className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 transition-colors">
                  <Upload size={18} strokeWidth={2} />
                  <span className="text-sm font-medium">Upload Logo</span>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Recommended: Square image, at least 200x200px. PNG or JPG format.
              </p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building2 size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label
                htmlFor="contact_email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Contact Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                  placeholder="company@example.com"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label
                htmlFor="contact_phone"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone || ""}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <MapPin size={18} strokeWidth={2} />
                </div>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                  placeholder="Enter company address"
                />
              </div>
            </div>

            {/* GSTIN */}
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-700 mb-2">
                GSTIN
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IdCard size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  value={formData.gstin || ""}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                  placeholder="Enter GSTIN number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 bg-white rounded-xl border border-slate-200 p-6">
          <button
            type="button"
            onClick={fetchCompanyData}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Save size={18} strokeWidth={2} />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
