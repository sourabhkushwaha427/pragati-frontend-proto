import { useEffect, useState } from "react";
import { Calendar,  BarChart3, TrendingUp, ShoppingCart, Package, X } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../ApiService/ApiService";

interface MonthlyReport {
  month_name: string;
  total_sales: number;
  total_purchases: number;
}

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<MonthlyReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';
  const[totalSales, setTotalSales] = useState(0)
  const [totalPurchases, setTotalPurchases] = useState(0)
  const growth = 12.5; // percent

  useEffect(() => {
    fetchTotalSalePurchase();
  }, []);

  const fetchTotalSalePurchase = async () => {
    try {
      console.log('Report total summary api called');
      setError(null);
      const response = await api.get<MonthlyReport[]>('/api/reports/monthly-summary', token);

      if (response.success && response.data) {
        console.log('Founded data ', response.data);
        let calculatedPurchase = 0;
        let calculatedSales = 0;
        response.data.forEach((item)=>{
           calculatedPurchase = totalPurchases + Number(item.total_purchases);
           calculatedSales = totalSales + Number(item.total_sales);
        })
        console.log(`total purchase : ${calculatedPurchase} total sale : ${calculatedSales}`)
        setTotalPurchases(calculatedPurchase);
        setTotalSales(calculatedSales);
        setReportData(response.data)
      } else {
        setError('Failed to fetch Report data');
        console.error('Failed to fetch report data')
      }

    } catch (error) {
      console.error('Error when fetching monthly report')
    }
  }

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales & Purchase Reports</h1>
          <p className="text-slate-500">
            Gain insights into your business performance and make data-driven decisions.
          </p>
        </div>
        {/* <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Year to Date</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div> */}
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-500 font-medium">Total Sales</h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{totalSales.toLocaleString()}</p>
            <p className="text-sm text-emerald-500 mt-1">+{growth}% compared to last period</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-500 font-medium">Total Purchases</h3>
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                <ShoppingCart size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{totalPurchases.toLocaleString()}</p>
            <p className="text-sm text-cyan-500 mt-1">Steady purchasing activity</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-500 font-medium">Net Profit</h3>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <BarChart3 size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ₹{(totalSales - totalPurchases).toLocaleString()}
            </p>
            <p className="text-sm text-teal-500 mt-1">Profit margin {(growth / 2).toFixed(1)}%</p>
          </div>
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales vs Purchase Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Package className="mr-2 text-emerald-500" size={20} />
            Sales vs Purchases
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="month_name"
                stroke="#94A3B8"
                interval={0} // show all labels
                height={60} // give space for rotated labels
                tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="end"
                      transform={`rotate(-30, ${x}, ${y + 10})`}
                      fontSize={12}
                      fill="#94A3B8"
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="total_sales" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="total_purchases" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-teal-500" size={20} />
            Periodic Growth Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="month_name"
                stroke="#94A3B8"
                interval={0} // show all labels
                height={60} // give space for rotated labels
                tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="end"
                      transform={`rotate(-30, ${x}, ${y + 10})`}
                      fontSize={12}
                      fill="#94A3B8"
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Line type="monotone" dataKey="total_sales" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="purchastotal_purchaseses" stroke="#0EA5E9" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
