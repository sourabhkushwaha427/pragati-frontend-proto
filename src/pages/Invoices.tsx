import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, X, FileText, Calendar, DollarSign, TrendingUp, AlertCircle, Eye } from "lucide-react";
import { api } from "../ApiService/ApiService";

interface Invoice {
  id?: string;
  invoice_number: string;
  due_date: string;
  total_amount?: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  party_name?: string;
  items?: Item[];
  party_id?: string
}
interface Item {
  item_id: string;
  quantity: number;
}

interface ItemDropDown {
  id?: string;
  company_id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

interface PartyDropDown {
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


export const Invoices: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<ItemDropDown[]>([]);
  const [parties, setParties] = useState<PartyDropDown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Invoice["status"]>("all");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_number: "",
    party_id: "",
    party_name: "",
    due_date: "",
    total_amount: "",
    status: "draft" as Invoice["status"],
    items: [] as Item[]
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.party_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchInvoices();
    fetchItems();
    fetchParties();
  }, []);

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices')
      const response = await api.get<Invoice[]>('/api/invoices', token)

      if (Array.isArray(response)) {
        console.log('Response founded sucessfully');
        setInvoices(response);
      } else {
        setInvoices([])
        console.log('No data found')
      }
    } catch (error) {
      console.error('Error occured when fetching invoices')
    }
  }

  const fetchItems = async () => {
    try {

      const response = await api.get<ItemDropDown[]>('/api/items', token);
      if (response.success && response.items) {
        setItems(response.items);
      } else {
        setError(response.error || 'Failed to fetch items');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching items');
      console.error('Error fetching items:', err);
    }
  };

  const fetchParties = async () => {
    try {
      setError(null);
      const response = await api.get<PartyDropDown[]>('/api/parties', token);
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
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700",
      sent: "bg-blue-100 text-blue-700",
      paid: "bg-emerald-100 text-emerald-700",
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-orange-100 text-orange-700"
    };
    return colors[status];
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "✓";
      case "overdue":
        return "!";
      case "sent":
        return "→";
      case "draft":
        return "○";
      case "cancelled":
        return "✕";
      default:
        return "";
    }
  };

  const handleOpenModal = async (selectedInvoice?: Invoice) => {
    if (selectedInvoice) {
      await fetchInvoiceById(selectedInvoice.id);
      setEditingInvoice(selectedInvoice);

    } else {
      setEditingInvoice(null);
      const nextNumber = `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`;
      setFormData({
        invoice_number: nextNumber,
        party_id: "",
        party_name: "",
        due_date: "",
        total_amount: "",
        status: "draft",
        items: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    fetchInvoices();
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    await fetchInvoiceById(invoice.id, true);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingInvoice(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.id === partyId);
    setFormData(prev => ({
      ...prev,
      party_id: partyId,
      party_name: selectedParty ? selectedParty.name : ""
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: "", quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemData = items.find(i => i.id === item.item_id);
      return sum + (itemData ? itemData.price * item.quantity : 0);
    }, 0);
  };

  const fetchInvoiceById = async (id?: string, isview?: boolean) => {
    if (!id) {
      console.warn('id not found');
      return;
    }
    try {
      console.log('Get invoice by id ');
      const response = await api.get<Invoice>(`/api/invoices/${id}`, token);

      if (typeof response === 'object' && response) {
        console.log('Invoice founded', response);
        const inv = response as Invoice;
        if (isview) {
          setViewingInvoice(inv)
        } else {
          setFormData({
            invoice_number: inv.invoice_number,
            party_id: inv.party_id || "",
            party_name: inv.party_name || '',
            due_date: inv.due_date,
            total_amount: inv?.total_amount?.toString() || '',
            status: inv.status,
            items: inv.items || []
          });
        }

      } else {
        console.warn('No invoice found');
      }
    } catch (error) {
      console.error('Erorr occured when fetching single record', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debugger
    //const totalFromItems = calculateTotal();
    //const finalTotal = totalFromItems > 0 ? totalFromItems : parseFloat(formData.total_amount);

    if (editingInvoice) {
      const updateInvoice = {
        party_id: formData.party_id,
        due_date: formData.due_date,
        status: formData.status,
        items: formData.items,       
      }

      const response = await api.put<Invoice>(`/api/invoices/${editingInvoice.id}`, updateInvoice, token); 

      if(response.invoice){
        console.log('invoice updated')
        const inv = response.invoice as Invoice;
        setInvoices([...invoices, inv]);
      }else{
        console.warn('Invoice not updated')
      }
    } else {
      const newInvoice: Invoice = {
        invoice_number: formData.invoice_number,
        party_id: formData.party_id,
        due_date: formData.due_date,
        status: formData.status,
        items: formData.items
      };

      const response = await api.post<Invoice>('/api/invoices', newInvoice, token);

      if (response.invoice_id) {
        console.log('Invoice created');
        setInvoices([...invoices, newInvoice]);
      } else {
        console.error('Invoice not created')
        setError('Invoice not created');
      }
    }

    handleCloseModal();
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!invoice.id) {
      console.warn('id not found ')
      setError('Invoices Id not found at a time of deletion')
      return;
    }
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const response = await api.delete(`/api/invoices/${invoice.id}`, token);

        if (response) {
          setInvoices(invoices.filter(invoice => invoice.id !== invoice.id));
          console.log('Invoice deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const paidAmount = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const overdueCount = invoices.filter(inv => inv.status === "overdue").length;

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your billing and payments</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Plus size={20} strokeWidth={2} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Invoices</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText size={24} className="text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign size={24} className="text-emerald-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Paid</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{paidAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{overdueCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle size={24} className="text-red-600" strokeWidth={2} />
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
              placeholder="Search by invoice number or party name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "draft", "sent", "paid", "overdue", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as typeof filterStatus)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filterStatus === status
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Party</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm mt-1">Try adjusting your search or create a new invoice</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{invoice.party_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{invoice?.total_amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(invoice)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingInvoice ? "Edit Invoice" : "Create Invoice"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Invoice Number */}
                <div>
                  <label htmlFor="invoice_number" className="block text-sm font-medium text-slate-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    id="invoice_number"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="INV-2024-001"
                    required
                  />
                </div>

                {/* Party Name */}
                <div>
                  <label htmlFor="party_id" className="block text-sm font-medium text-slate-700 mb-2">
                    Party Name *
                  </label>
                  <select
                    id="party_id"
                    name="party_id"
                    value={formData.party_id}
                    onChange={handlePartyChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    required
                  >
                    <option value="">Select a party</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Invoice Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-500">No items added yet. Click "Add Item" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => {
                      const selectedItem = items.find(i => i.id === item.item_id);
                      const itemTotal = selectedItem ? selectedItem.price * item.quantity : 0;

                      return (
                        <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Item Dropdown */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Item
                              </label>
                              <select
                                value={item.item_id}
                                onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
                                required
                              >
                                <option value="">Select an item</option>
                                {items.map((availItem) => (
                                  <option key={availItem.id} value={availItem.id}>
                                    {availItem.name} - ₹{availItem.price}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50"
                                required
                              />
                            </div>

                            {/* Item Total */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Total
                              </label>
                              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700">
                                ₹{itemTotal.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="mt-6 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Total Amount Display */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-semibold text-slate-700">Total Invoice Amount</span>
                      <span className="text-2xl font-bold text-emerald-700">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all"
                >
                  {editingInvoice ? "Update Invoice" : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Invoice Details</h2>
                <p className="text-sm text-slate-600 mt-1">{viewingInvoice.invoice_number}</p>
              </div>
              <button
                onClick={handleCloseViewModal}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice Number</label>
                    <p className="text-lg font-bold text-slate-900 mt-1">{viewingInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Party Name</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{viewingInvoice.party_name}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar size={18} className="text-slate-400" />
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(viewingInvoice.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(viewingInvoice.status)}`}>
                        <span className="mr-1.5 text-base">{getStatusIcon(viewingInvoice.status)}</span>
                        {viewingInvoice.status.charAt(0).toUpperCase() + viewingInvoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              {viewingInvoice.items && viewingInvoice.items.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice Items</h3>
                  <div className="bg-slate-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Item</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {viewingInvoice.items.map((item, index) => {
                          const itemData = items.find(i => i.id === item.item_id);
                          const itemTotal = itemData ? itemData.price * item.quantity : 0;
                          return (
                            <tr key={index} className="bg-white">
                              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                {itemData?.name || 'Unknown Item'}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-slate-600">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-slate-600">
                                ₹{itemData?.price.toLocaleString() || '0'}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                ₹{itemTotal.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="border-t border-slate-200 pt-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border-2 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Amount</p>
                      <p className="text-4xl font-bold text-emerald-700 mt-2">
                        ₹{viewingInvoice?.total_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <DollarSign size={40} className="text-emerald-600" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseViewModal();
                    handleOpenModal(viewingInvoice);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all"
                >
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}