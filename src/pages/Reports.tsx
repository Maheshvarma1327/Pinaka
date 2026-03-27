import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { IndianRupee, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyRevenue = months.map((m, i) => ({
  month: m,
  revenue: Math.floor(Math.random() * 80000 + 60000),
}));

const stockInOut = months.map((m) => ({
  month: m,
  "Stock In": Math.floor(Math.random() * 200 + 100),
  "Stock Out": Math.floor(Math.random() * 180 + 80),
}));

const paymentSplit = [
  { name: "Cash", value: 58, color: "hsl(0, 78%, 40%)" },
  { name: "PhonePe", value: 42, color: "hsl(217, 91%, 60%)" },
];

const eodData = Array.from({ length: 15 }, (_, i) => ({
  date: `2026-03-${String(i + 5).padStart(2, "0")}`,
  bone: Math.floor(Math.random() * 15 + 5),
  boneless: Math.floor(Math.random() * 10 + 3),
  fry: Math.floor(Math.random() * 5 + 1),
  curry: Math.floor(Math.random() * 4 + 1),
  cash: Math.floor(Math.random() * 3000 + 1500),
  phonePe: Math.floor(Math.random() * 2000 + 800),
  total: 0,
})).map(r => ({ ...r, total: r.cash + r.phonePe }));

const monthlyBreakdown = months.map((m, i) => ({
  month: m,
  revenue: monthlyRevenue[i].revenue,
  percentOfYear: 0,
  growth: i === 0 ? "—" : `${(Math.random() * 20 - 5).toFixed(1)}%`,
}));
const yearTotal = monthlyBreakdown.reduce((s, m) => s + m.revenue, 0);
monthlyBreakdown.forEach(m => { m.percentOfYear = Number(((m.revenue / yearTotal) * 100).toFixed(1)); });

export default function Reports() {
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalStockIn = stockInOut.reduce((s, m) => s + m["Stock In"], 0);
  const totalStockOut = stockInOut.reduce((s, m) => s + m["Stock Out"], 0);

  return (
    <div>
      <Breadcrumb items={[{ label: "Reports" }]} />
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 rounded-lg border bg-card p-4 shadow-md">
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>
          <option>2026</option>
          <option>2025</option>
        </select>
        <Button>View</Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download Report</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5 text-success" />} color="success" />
        <StatCard title="Total Stock In" value={`${totalStockIn} kg`} icon={<ArrowDownToLine className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Total Stock Out" value={`${totalStockOut} kg`} icon={<ArrowUpFromLine className="h-5 w-5 text-warning" />} color="warning" />
        <StatCard title="Net Profit" value={`₹${Math.floor(totalRevenue * 0.28).toLocaleString("en-IN")}`} icon={<TrendingUp className="h-5 w-5 text-success" />} color="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-5 shadow-md">
          <h3 className="font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Bar dataKey="revenue" fill="hsl(0, 78%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-md">
          <h3 className="font-semibold mb-4">Stock In vs Out</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockInOut}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Stock In" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
              <Line type="monotone" dataKey="Stock Out" stroke="hsl(0, 78%, 40%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-5 shadow-md mb-6">
        <h3 className="font-semibold mb-4">Cash vs PhonePe Split</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}%`}>
                {paymentSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="rounded-lg border bg-card p-6 shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">EOD Sales Summary</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Bone", accessor: (r) => `${r.bone} kg` },
            { header: "Boneless", accessor: (r) => `${r.boneless} kg` },
            { header: "Fry", accessor: (r) => `${r.fry} kg` },
            { header: "Curry", accessor: (r) => `${r.curry} kg` },
            { header: "Cash", accessor: (r) => `₹${r.cash.toLocaleString("en-IN")}` },
            { header: "PhonePe", accessor: (r) => `₹${r.phonePe.toLocaleString("en-IN")}` },
            { header: "Total", accessor: (r) => `₹${r.total.toLocaleString("en-IN")}` },
          ]}
          data={eodData}
          pageSize={8}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Monthly Sales Breakdown</h2>
        <DataTable
          columns={[
            { header: "Month", accessor: "month" },
            { header: "Revenue", accessor: (r) => `₹${r.revenue.toLocaleString("en-IN")}` },
            { header: "% of Year", accessor: (r) => `${r.percentOfYear}%` },
            { header: "Growth", accessor: "growth" },
          ]}
          data={monthlyBreakdown}
          pageSize={12}
        />
      </div>
    </div>
  );
}
