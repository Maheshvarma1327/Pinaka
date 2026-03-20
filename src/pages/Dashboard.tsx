import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Ham, IndianRupee, AlertTriangle, Wallet, Smartphone, TrendingUp, Bone, Package, Weight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const dailySales = [
  { day: "Mon", Cash: 1200, PhonePe: 800 },
  { day: "Tue", Cash: 1500, PhonePe: 900 },
  { day: "Wed", Cash: 800, PhonePe: 1100 },
  { day: "Thu", Cash: 1800, PhonePe: 700 },
  { day: "Fri", Cash: 2000, PhonePe: 1200 },
  { day: "Sat", Cash: 2500, PhonePe: 1800 },
  { day: "Sun", Cash: 1400, PhonePe: 600 },
];

const stockMovement = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  "Stock In": Math.floor(Math.random() * 30 + 10),
  "Stock Out": Math.floor(Math.random() * 25 + 5),
}));

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      {/* Welcome card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, Pinaka</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </div>
        <Ham className="h-16 w-16 text-primary opacity-80 hidden sm:block" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Stock" value="145 kg" icon={<Weight className="h-5 w-5 text-success" />} color="success" />
        <StatCard title="Today's Sales" value="₹8,500" icon={<IndianRupee className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Low Stock Alert" value="Boneless 3kg" icon={<AlertTriangle className="h-5 w-5 text-destructive" />} color="destructive" />
        <StatCard title="Cash Received Today" value="₹5,200" icon={<Wallet className="h-5 w-5 text-foreground" />} />
        <StatCard title="PhonePe Received Today" value="₹3,300" icon={<Smartphone className="h-5 w-5 text-foreground" />} />
        <StatCard title="Monthly Revenue" value="₹1,24,000" icon={<TrendingUp className="h-5 w-5 text-foreground" />} />
        <StatCard title="Bone Stock" value="85 kg" icon={<Bone className="h-5 w-5 text-foreground" />} />
        <StatCard title="Boneless Stock" value="60 kg" icon={<Bone className="h-5 w-5 text-foreground" />} />
        <StatCard title="Total Packets" value="48 packets" icon={<Package className="h-5 w-5 text-foreground" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Daily Sales This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(v: number) => `₹${v}`} />
              <Legend />
              <Bar dataKey="Cash" fill="hsl(0, 78%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PhonePe" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Stock Movement (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Stock In" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
              <Line type="monotone" dataKey="Stock Out" stroke="hsl(0, 78%, 40%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
