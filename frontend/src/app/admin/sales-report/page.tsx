'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface SalesReportData {
  revenue: number;
  orderCount: number;
  topProducts: TopProduct[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SalesReportPage() {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const query = `?startDate=${startDate}&endDate=${endDate}`;
      const res = await api.get(`/admin/sales-report${query}`);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    
    // Create CSV content for top products
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product Name,Units Sold,Revenue Generated\n";
    
    data.topProducts.forEach(product => {
      const row = `"${product.name}",${product.qty},${product.revenue.toFixed(2)}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground mt-1">Analyze revenue and product performance.</p>
        </div>
        <Button onClick={handleExportCSV} disabled={!data || data.topProducts.length === 0} className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Date Filter */}
      <div className="bg-background border rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Start Date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">End Date</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <Button onClick={fetchReport} variant="secondary">Generate Report</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 animate-pulse">Computing analytics...</div>
      ) : !data ? (
        <div className="text-center py-12 text-destructive">Failed to load data.</div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl p-6 border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Period Revenue</p>
                <h3 className="text-3xl font-bold">${data.revenue.toFixed(2)}</h3>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-6 border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders Placed</p>
                <h3 className="text-3xl font-bold">{data.orderCount}</h3>
              </div>
            </div>

            <div className="bg-background rounded-xl p-6 border shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <h3 className="text-3xl font-bold">
                  ${data.orderCount > 0 ? (data.revenue / data.orderCount).toFixed(2) : '0.00'}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Bar Chart */}
            <div className="bg-background rounded-xl p-6 border shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Top Products by Revenue</h2>
              <div className="h-[300px] w-full">
                {data.topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                      <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No sales data for this period.</div>
                )}
              </div>
            </div>

            {/* Top Products Pie Chart (Qty) */}
            <div className="bg-background rounded-xl p-6 border shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Units Sold Breakdown</h2>
              <div className="h-[300px] w-full flex items-center justify-center relative">
                {data.topProducts.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="qty"
                        >
                          {data.topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Custom Legend */}
                    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center space-y-2 max-w-[150px]">
                      {data.topProducts.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="truncate" title={entry.name}>{entry.name} ({entry.qty})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-sm">No sales data for this period.</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
