import { TrendingUp, DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { api } from "../ApiService/ApiService";
import { useEffect, useState } from "react";

interface MonthlyMetrics {
  previous_month_total_revenue: number;
  current_month_total_revenue: number;
  previous_month_total_customers: number;
  current_month_total_customers: number;
  previous_month_total_sales: number;
  current_month_total_sales: number;
  previous_month_total_products_sold: number;
  current_month_total_products_sold: number;
}


interface TopProduct {
  rank: number;
  product_name: string;
  units_sold: number;
  total_revenue: number;
}

interface TopProductsData {
  top_products: TopProduct[];
}


interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  color:
  | "emerald"
  | "red"
  | "blue"
  | "yellow"
  | "purple"
  | "gray"
  | "orange"
  | "teal";
}

interface revenueOverview {
  monthName: string,
  value: number
}

interface SalesCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface SalesDistributionData {
  sales_distribution: SalesCategory[];
}

export const Dashboard: React.FC = () => {

  const token = localStorage.getItem('token') || '';
  const [stats, setStats] = useState<StatCard[]>([]);
  const [salesDistribution, setSalesDistribution] = useState<SalesCategory[] | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null);
  const [revenueData, setRevenueData] = useState<revenueOverview[]>([]);

  const recentInvoices = [
    { id: "INV-001", customer: "Acme Corp", amount: "₹45,000", status: "Paid", date: "2024-10-25" },
    { id: "INV-002", customer: "TechStart Inc", amount: "₹32,500", status: "Pending", date: "2024-10-24" },
    { id: "INV-003", customer: "Global Enterprises", amount: "₹67,800", status: "Paid", date: "2024-10-23" },
    { id: "INV-004", customer: "Smart Solutions", amount: "₹28,900", status: "Overdue", date: "2024-10-20" },
    { id: "INV-005", customer: "Digital Wave", amount: "₹51,200", status: "Paid", date: "2024-10-19" }
  ];

  useEffect(() => {
    handleStats();
    handleRevenueOverview();
    handleSalesDistribution();
    handleTopProduct();
  }, [])

  const handleStats = async () => {
    try {
      console.log('Stats api called');

      const response = await api.get<MonthlyMetrics>('/api/dashboard/stats', token);

      if (response) {
        console.log('Response founded', response)
        const calcChange = (current: number, previous: number) => {
          if (previous === 0) return 0;
          return ((current - previous) / previous) * 100;
        };
        const statsData: StatCard[] = [
          {
            title: "Total Revenue",
            value: `₹${response.current_month_total_revenue.toLocaleString()}`,
            change: `${calcChange(
              response.current_month_total_revenue,
              response.previous_month_total_revenue
            ).toFixed(1)}%`,
            trend:
              response.current_month_total_revenue >= response.previous_month_total_revenue
                ? "up"
                : "down",
            icon: DollarSign,
            color: "emerald"
          },
          {
            title: "Total Sales",
            value: response.current_month_total_sales.toLocaleString(),
            change: `${calcChange(
              response.current_month_total_sales,
              response.previous_month_total_sales
            ).toFixed(1)}%`,
            trend:
              response.current_month_total_sales >= response.previous_month_total_sales
                ? "up"
                : "down",
            icon: ShoppingCart,
            color: "blue"
          },
          {
            title: "Total Customers",
            value: response.current_month_total_customers.toLocaleString(),
            change: `${calcChange(
              response.current_month_total_customers,
              response.previous_month_total_customers
            ).toFixed(1)}%`,
            trend:
              response.current_month_total_customers >=
                response.previous_month_total_customers
                ? "up"
                : "down",
            icon: Users,
            color: "purple"
          },
          {
            title: "Products Sold",
            value: response.current_month_total_products_sold.toLocaleString(),
            change: `${calcChange(
              response.current_month_total_products_sold,
              response.previous_month_total_products_sold
            ).toFixed(1)}%`,
            trend:
              response.current_month_total_products_sold >=
                response.previous_month_total_products_sold
                ? "up"
                : "down",
            icon: Package,
            color: "orange"
          }
        ];

        setStats(statsData);
      } else {
        console.error('stats api error : ', response);
      }

    } catch (error) {
      console.log('Error occured form dashboard stats api', error)
    }
  }

  const handleRevenueOverview = async () => {
    try {
      console.log('Revenue Overview API called');

      const response = await api.get<revenueOverview[]>('/api/dashboard/revenue-overview', token);

      if(Array.isArray(response)){
        console.log('revenue response found ',response)
        setRevenueData(response);
      }else{
        console.warn('No data found');
        setRevenueData([])
      }
    } catch (error) {
      console.error('Error occurred while fetching revenue overview:', error);
      setRevenueData([]); // Optionally handle error state in UI
    }
  };

  const handleSalesDistribution = async () => {
    try {

      console.log('Sales distribution api called')

      const response = await api.get<SalesDistributionData>('/api/dashboard/sales-distribution', token)

      if (!response || Object.keys(response).length === 0) {
        console.warn('Sales distribution API returned an empty response');
        setSalesDistribution(null); // Optionally clear or show default state
        return;
      }

      console.log('Response from sales distribution api : ', response);

      if (response.sales_distribution.length == 0) {
        console.warn('Sales Distribution data not found');
        setSalesDistribution(null);
      }

      setSalesDistribution(response.sales_distribution);

    } catch (error) {
      console.error('Error occured from sales distribution api');
    }
  };

  const handleTopProduct = async () => {
    try {

      console.log('Top product api called ');

      const response = await api.get<TopProductsData>('/api/dashboard/top-products', token);

      if (!response || Object.keys(response).length === 0) {
        console.warn('Top product API returned an empty response');
        setTopProducts([]); // Optionally clear or show default state
        return;
      }

      if (response.top_products.length == 0) {
        console.warn('Top product data not found')
        setTopProducts([]);
      }

      console.log('Found top product data : ', response)
      setTopProducts(response.top_products);
    } catch (error) {
      console.error('Error from top product api ', error);
    }
  }
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-500" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-500" }
    };
    return colors[color];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: "bg-emerald-100 text-emerald-700",
      Pending: "bg-orange-100 text-orange-700",
      Overdue: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: StatCard) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);

          return (
            <div key={stat.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                  <div className="flex items-center space-x-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight size={16} className="text-emerald-500" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-slate-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon size={24} className={colors.icon} strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500 mt-1">Monthly revenue for the last 6 months</p>
            </div>
            {revenueData.length > 0 && (
              <div className="flex items-center space-x-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">+18.2%</span>
              </div>
            )}

          </div>
          <div className="space-y-4">
            {revenueData.length > 0 ? (
              revenueData.map((data, index) => {
                const values = [65, 75, 70, 85, 90, 95];
                return (
                  <div key={data.monthName} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-600 w-8">
                      {data.monthName}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${values[index]}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          ₹{data.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No Data Found</div>
            )}
          </div>

        </div>

        {/* Sales Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Sales Distribution</h3>
            <p className="text-sm text-slate-500 mt-1">Breakdown by category</p>
          </div>
          {salesDistribution != null && salesDistribution.length != 0 ? (
            salesDistribution.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-slate-900">{item.amount}</span>
                    <span className="text-sm text-slate-500">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${item.percentage > 25 ? item.percentage > 65 ? "bg-green-500" : "bg-yellow-500" : "bg-red-500"} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div>No Data Found</div>
          )}

        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
            <p className="text-sm text-slate-500 mt-1">Latest billing transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{invoice.customer}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View all invoices →
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Top Products</h3>
            <p className="text-sm text-slate-500 mt-1">Best selling items this month</p>
          </div>

          {topProducts != null && topProducts.length != 0 ? (

            <div className="p-6 space-y-4">
              {topProducts.map((item) => (
                <div key={item.rank} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{item.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-500">{item.units_sold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{item.total_revenue}</p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  View all products →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4" >No data found</div>
          )
          }

        </div>
      </div>
    </div>
  );
};