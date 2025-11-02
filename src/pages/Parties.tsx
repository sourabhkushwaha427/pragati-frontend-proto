import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Users, Mail, Phone, MapPin, Building2, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { api } from "../ApiService/ApiService";

interface Party {
  id?: string;
  company_id?: string;
  name: string;
  type: "customer" | "supplier";
  contact_email: string;
  contact_phone: string;
  billing_address: string;
  created_at?: string;
  updated_at?: string;
}

export const Parties: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customer" | "supplier">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "customer" as "customer" | "supplier",
    contact_email: "",
    contact_phone: "",
    billing_address: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetchingParties, setFetchingParties] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';

  // Fetch all parties on component mount
  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setFetchingParties(true);
      setError(null);
      const response = await api.get<Party[]>('/api/parties', token);
      console.log('Get response', response);
      
      // Response is directly an array
      if (Array.isArray(response)) {
        setParties(response);
      } else {
        setParties([]);
        setError('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching parties');
      console.error('Error fetching parties:', err);
      setParties([]);
    } finally {
      setFetchingParties(false);
    }
  };

  const filteredParties = parties.filter((party) => {
  const matchesSearch =
    (party.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (party.contact_email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (party.contact_phone ?? '').includes(searchTerm) ||
    (party.company_id ?? '').toLowerCase().includes(searchTerm.toLowerCase());

  const matchesType = filterType === 'all' || party.type === filterType;

  return matchesSearch && matchesType;
});


  const handleOpenModal = (party?: Party) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        name: party.name,
        type: party.type,
        contact_email: party.contact_email,
        contact_phone: party.contact_phone,
        billing_address: party.billing_address
      });
    } else {
      setEditingParty(null);
      setFormData({
        name: "",
        type: "customer",
        contact_email: "",
        contact_phone: "",
        billing_address: ""
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingParty(null);
    setFormData({
      name: "",
      type: "customer",
      contact_email: "",
      contact_phone: "",
      billing_address: ""
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const partyData = {
        name: formData.name,
        type: formData.type,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        billing_address: formData.billing_address
      };

      if (editingParty && editingParty.id) {
        // UPDATE - PUT request
        const response = await api.put<Party>(`/api/parties/${editingParty.id}`, partyData, token);
        console.log('Put response', response);

        if (response) {
          // Response is the updated party object directly
          setParties(parties.map(party =>
            party.id === editingParty.id ? response as Party : party
          ));
          handleCloseModal();
        } else {
          setError('Failed to update party');
        }
      } else {
        // CREATE - POST request
        const response = await api.post<Party>('/api/parties', partyData, token);
        console.log('Post response', response);

        if (response) {
          // Response is the new party object directly
          setParties([...parties, response as Party]);
          handleCloseModal();
        } else {
          setError('Failed to create party');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error saving party:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (id?: string) => {
    if (id) {
      setPartyToDelete(id);
      setShowDeleteModal(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setPartyToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async() => {
    if (partyToDelete !== null) {
      try {
        setLoading(true);
        setError(null);
        
        // DELETE request
        await api.delete(`/api/parties/${partyToDelete}`, token);
        
        // If no error thrown, consider it successful
        setParties(parties.filter(party => party.id !== partyToDelete));
        handleCloseDeleteModal();
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting');
        console.error('Error deleting party:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const customerCount = parties.filter(p => p.type === "customer").length;
  const supplierCount = parties.filter(p => p.type === "supplier").length;

  return (
    <div className="space-y-6">
      {/* Global Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Parties Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customers and suppliers</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchParties}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
              disabled={fetchingParties}
            >
              {fetchingParties ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <span>Refresh</span>
              )}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Plus size={20} strokeWidth={2} />
              <span>Add New Party</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Parties</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{parties.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users size={24} className="text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Customers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{customerCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <UserCheck size={24} className="text-emerald-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Suppliers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{supplierCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <UserX size={24} className="text-purple-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{parties.length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Building2 size={24} className="text-orange-600" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterType === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("customer")}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterType === "customer"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setFilterType("supplier")}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterType === "supplier"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Suppliers
            </button>
          </div>
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fetchingParties ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-lg font-medium">Loading parties...</p>
            </div>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-900">No parties found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or add a new party</p>
          </div>
        ) : (
          filteredParties.map((party) => (
            <div key={party.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{party.name}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    party.type === "customer"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {party.type === "customer" ? "Customer" : "Supplier"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenModal(party)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(party.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {party.company_id && (
                  <div className="flex items-start space-x-2 text-sm">
                    <Building2 size={16} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="text-slate-600">{party.company_id}</span>
                  </div>
                )}
                <div className="flex items-start space-x-2 text-sm">
                  <Mail size={16} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span className="text-slate-600 truncate">{party.contact_email}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span className="text-slate-600">{party.contact_phone}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span className="text-slate-600 line-clamp-2">{party.billing_address}</span>
                </div>
              </div>

              {party.updated_at && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Updated {new Date(party.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal - keeping the same from previous code */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingParty ? "Edit Party" : "Add New Party"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Party Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="Enter party name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    required
                    disabled={loading}
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="+91 98765 43210"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="contact@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Billing Address */}
                <div className="md:col-span-2">
                  <label htmlFor="billing_address" className="block text-sm font-medium text-slate-700 mb-2">
                    Billing Address *
                  </label>
                  <textarea
                    id="billing_address"
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all resize-none"
                    placeholder="Enter complete billing address"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingParty ? "Updating..." : "Adding..."}</span>
                    </span>
                  ) : (
                    <span>{editingParty ? "Update Party" : "Add Party"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - keeping the same from previous code */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                Confirm Deletion
              </h2>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} className="text-red-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mt-5">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Do you really want to delete this party? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 bg-slate-50 rounded-b-xl border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};