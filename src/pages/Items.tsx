import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  DollarSign,
  Boxes,
  Tag,
  AlertTriangle, 
} from "lucide-react";
import { api } from "../ApiService/ApiService";

interface Item {
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

export const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const token = localStorage.getItem('token') || '';
  const categories = ["Electronics", "Services", "Accessories", "Furniture", "Food & Beverage"];

  // Fetch all items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setFetchingItems(true);
      const response = await api.get<Item[]>('/api/items', token);
      if (response.success && response.items) {
        setItems(response.items);
      } else {
        setError(response.error || 'Failed to fetch items');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching items');
      console.error('Error fetching items:', err);
    } finally {
      setFetchingItems(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price.toString(),
        quantity: item.quantity.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", description: "", category: "", price: "", quantity: "" });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "", description: "", category: "", price: "", quantity: "" });
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
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingItem && editingItem.id) {
        // UPDATE - PUT request
        const response = await api.put<Item>(`/api/items/${editingItem.id}`, itemData, token);

        console.log(response)
        if (response.success && response.item) {
          setItems(items.map(item =>
            item.id === editingItem.id ? response.item! : item
          ));
        } else {
          setError(response.error || 'Failed to update item');
          return;
        }
      } else {
        // CREATE - POST request
        const response = await api.post<Item>('/api/items', itemData, token);
        console.log(response)
        if (response.success && response.item) {
          setItems([...items, response.item]);
        } else {
          setError(response.error || 'Failed to create item');
          return;
        }
      }
      
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (id?: string) => {
    if (id) {
      setItemToDelete(id);
      setShowDeleteModal(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async() => {
    if (itemToDelete !== null) {
      try {
        setLoading(true);
        
        // DELETE request
        const response = await api.delete(`/api/items/${itemToDelete}`, token);
        
        if (response.success) {
          setItems(items.filter(item => item.id !== itemToDelete));
        } else {
          setError(response.error || 'Failed to delete item');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting');
        console.error('Error deleting item:', err);
      } finally {
        setLoading(false);
        handleCloseDeleteModal();
      }
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Items Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your product catalog and inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchItems}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
              disabled={fetchingItems}
            >
              {fetchingItems ? (
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
              <span>Add New Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Items</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{items.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package size={24} className="text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Stock</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Boxes size={24} className="text-purple-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Tag size={24} className="text-orange-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{items.filter(i => i.quantity < 50).length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <DollarSign size={24} className="text-red-600" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>                
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fetchingItems ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-lg font-medium">Loading items...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-lg font-medium">No items found</p>
                    <p className="text-sm mt-1">Try adjusting your search or add a new item</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{item.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        item.quantity === 0 ? "bg-red-100 text-red-700" :
                        item.quantity < 50 ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item.id)}
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
                {editingItem ? "Edit Item" : "Add New Item"}
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
                {/* Item Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="Enter item name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all resize-none"
                    placeholder="Enter item description"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    required
                    disabled={loading}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder="0"
                    min="0"
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
                      <span>{editingItem ? "Updating..." : "Adding..."}</span>
                    </span>
                  ) : (
                    <span>{editingItem ? "Update Item" : "Add Item"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                Do you really want to delete this item? This action cannot be undone.
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