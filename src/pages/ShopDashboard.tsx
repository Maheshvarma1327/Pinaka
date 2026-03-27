import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import InventoryIn from "@/pages/InventoryIn";
import Preparation from "@/pages/Preparation";
import Costs from "@/pages/Costs";
import { 
  Store, Phone, MapPin, LayoutGrid, Plus, UserPlus, 
  Leaf, Package, Users, TrendingUp, CheckCircle2, IndianRupee, DownloadCloud, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Activity, Smartphone, Wallet,
  AlertTriangle, Bone, CookingPot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#B71C1C', '#dc2626', '#18181b', '#52525b', '#a1a1aa'];

const MOCK_DATA = {
  "Today": {
    sales: [ { name: 'Bone', value: 45 }, { name: 'Boneless', value: 30 }, { name: 'Fry', value: 15 }, { name: 'Curry', value: 20 }, { name: 'Mixed', value: 10 } ],
    inventory: [ { name: '6 AM', In: 50, Out: 20 }, { name: '9 AM', In: 20, Out: 40 }, { name: '12 PM', In: 10, Out: 30 }, { name: '3 PM', In: 0, Out: 15 }, { name: '6 PM', In: 0, Out: 10 } ],
    revenue: [ { name: '6 AM', revenue: 4000 }, { name: '9 AM', revenue: 9500 }, { name: '12 PM', revenue: 16000 }, { name: '3 PM', revenue: 19500 }, { name: '6 PM', revenue: 22000 } ]
  },
  "This Week": {
    sales: [ { name: 'Bone', value: 350 }, { name: 'Boneless', value: 240 }, { name: 'Fry', value: 120 }, { name: 'Curry', value: 180 }, { name: 'Mixed', value: 80 } ],
    inventory: [ { name: 'Mon', In: 120, Out: 110 }, { name: 'Tue', In: 150, Out: 140 }, { name: 'Wed', In: 100, Out: 95 }, { name: 'Thu', In: 180, Out: 170 }, { name: 'Fri', In: 200, Out: 195 }, { name: 'Sat', In: 250, Out: 240 }, { name: 'Sun', In: 300, Out: 290 } ],
    revenue: [ { name: 'Mon', revenue: 25000 }, { name: 'Tue', revenue: 28000 }, { name: 'Wed', revenue: 22000 }, { name: 'Thu', revenue: 32000 }, { name: 'Fri', revenue: 38000 }, { name: 'Sat', revenue: 45000 }, { name: 'Sun', revenue: 52000 } ]
  },
  "This Month": {
    sales: [ { name: 'Bone', value: 1400 }, { name: 'Boneless', value: 950 }, { name: 'Fry', value: 480 }, { name: 'Curry', value: 720 }, { name: 'Mixed', value: 300 } ],
    inventory: [ { name: 'Week 1', In: 800, Out: 750 }, { name: 'Week 2', In: 950, Out: 900 }, { name: 'Week 3', In: 850, Out: 820 }, { name: 'Week 4', In: 1100, Out: 1050 } ],
    revenue: [ { name: 'Week 1', revenue: 150000 }, { name: 'Week 2', revenue: 185000 }, { name: 'Week 3', revenue: 170000 }, { name: 'Week 4', revenue: 220000 } ]
  },
  "Custom": {
    sales: [ { name: 'Bone', value: 800 }, { name: 'Boneless', value: 500 }, { name: 'Fry', value: 250 }, { name: 'Curry', value: 340 }, { name: 'Mixed', value: 150 } ],
    inventory: [ { name: 'D-4', In: 180, Out: 170 }, { name: 'D-3', In: 200, Out: 195 }, { name: 'D-2', In: 250, Out: 240 }, { name: 'D-1', In: 300, Out: 290 } ],
    revenue: [ { name: 'D-4', revenue: 32000 }, { name: 'D-3', revenue: 38000 }, { name: 'D-2', revenue: 45000 }, { name: 'D-1', revenue: 52000 } ]
  }
};

const KPI_DATA = {
  "Today": { revenue: "₹8,500", totalStock: "145 kg", alert: "Boneless 3kg", cash: "₹5,200", phonepe: "₹3,300", monthly: "₹1,24,000", bone: "85 kg", boneless: "60 kg", mixed: "15 kg" },
  "This Week": { revenue: "₹65,400", totalStock: "450 kg", alert: "Mixed 2kg", cash: "₹45,000", phonepe: "₹20,400", monthly: "₹1,24,000", bone: "210 kg", boneless: "180 kg", mixed: "60 kg" },
  "This Month": { revenue: "₹1,24,000", totalStock: "1,850 kg", alert: "Curry 5kg", cash: "₹85,000", phonepe: "₹39,000", monthly: "₹1,24,000", bone: "900 kg", boneless: "700 kg", mixed: "250 kg" },
  "Custom": { revenue: "₹42,000", totalStock: "620 kg", alert: "Bone 10kg", cash: "₹28,000", phonepe: "₹14,000", monthly: "₹1,24,000", bone: "350 kg", boneless: "200 kg", mixed: "70 kg" }
};

export default function ShopDashboard() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory-in" | "preparation" | "costs">("overview");

  const [timeframe, setTimeframe] = useState<"Today" | "This Week" | "This Month" | "Custom">("This Week");
  const currentData = MOCK_DATA[timeframe];
  const currentKpi = KPI_DATA[timeframe];

  // Export State
  const todayStr = new Date().toISOString().split("T")[0];
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
  const [exportRange, setExportRange] = useState<"Daily" | "Weekly" | "Monthly" | "Custom">("Daily");
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const handleExportAnalytics = () => {
    alert(`Exporting ${exportRange} Analytics for ${shopName} in ${exportFormat} format!`);
  };

  // Mock fetching shop details for visual purpose
  const shopName = id === "shop1" ? "Palipattu Shop" : id === "shop2" ? "Tirupati Shop" : "New Shop";
  const displayId = id === "shop1" ? "SHP-001" : id === "shop2" ? "SHP-002" : "SHP-NEW";

  return (
    <div className="container w-full max-w-full py-8 space-y-8 min-h-[calc(100vh-4rem)] rounded-none mt-4 border border-border bg-background shadow-md">
      
      {/* Top Banner Card */}
      <Card className="rounded-none border-border shadow-md overflow-hidden bg-card relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none p-12 overflow-hidden">
          <Store className="w-72 h-72 text-foreground" />
        </div>
        
        <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-serif tracking-tight text-foreground">{shopName}</h1>
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-semibold text-zinc-800">
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-muted-foreground" /> {displayId}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-muted-foreground" /> 9959492720
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Palipattu
              </div>
            </div>
            
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/shop">
              <Button className="bg-destructive hover:bg-destructive text-white rounded-xl h-11 px-6 shadow border border-red-700 font-semibold tracking-wide text-sm">
                <LayoutGrid className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Pills */}
      <div className="flex justify-center">
        <div className="bg-secondary p-1.5 rounded-none flex gap-1 shadow-md border border-border">
          <button 
            onClick={() => setActiveTab("overview")} 
            className={cn(
              "flex items-center gap-2 px-8 py-2.5 rounded-none font-bold text-xs tracking-wider transition-colors",
              activeTab === "overview" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> OVERVIEW
          </button>
          <button 
            onClick={() => setActiveTab("inventory-in")} 
            className={cn(
               "flex items-center gap-2 px-8 py-2.5 rounded-none font-bold text-xs tracking-wider transition-colors",
               activeTab === "inventory-in" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Plus className="w-4 h-4" /> INVENTORY IN
          </button>
          <button 
            onClick={() => setActiveTab("preparation")} 
            className={cn(
               "flex items-center gap-2 px-8 py-2.5 rounded-none font-bold text-xs tracking-wider transition-colors",
               activeTab === "preparation" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <CookingPot className="w-4 h-4" /> PREPARATION
          </button>
          <button 
            onClick={() => setActiveTab("costs")} 
            className={cn(
               "flex items-center gap-2 px-8 py-2.5 rounded-none font-bold text-xs tracking-wider transition-colors",
               activeTab === "costs" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <IndianRupee className="w-4 h-4" /> COSTS
          </button>
        </div>
      </div>

      {/* Content Rendering based on Tab */}
      {activeTab === "overview" && (
        <div className="bg-card rounded-none p-8 shadow-md border border-border">
          
          {/* Header Controls */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
                <p className="text-sm text-muted-foreground">Track your inventory flows and daily revenue metrics.</p>
              </div>
              
              {/* Timeframe Filter */}
              <div className="flex gap-4 items-center flex-wrap">
                <div className="bg-secondary p-1.5 rounded-none flex gap-1 items-center shadow-inner border border-border">
                  {["Today", "This Week", "This Month", "Custom"].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTimeframe(t as any)} 
                      className={cn(
                        "px-5 py-2 rounded-none text-xs font-bold transition-all tracking-wide", 
                        timeframe === t ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {timeframe === "Custom" && (
                  <div className="flex items-center gap-2">
                    <Input type="date" className="h-9 w-36 text-xs bg-background text-foreground shadow-md border-border" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                    <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">to</span>
                    <Input type="date" className="h-9 w-36 text-xs bg-background text-foreground shadow-md border-border" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-white shadow font-bold tracking-wide">
                  <DownloadCloud className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Analytics Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label>Format</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={exportFormat === "CSV" ? "default" : "outline"} className={exportFormat === "CSV" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportFormat("CSV")}>CSV Data</Button>
                      <Button variant={exportFormat === "PDF" ? "default" : "outline"} className={exportFormat === "PDF" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportFormat("PDF")}>PDF Report</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <Button variant={exportRange === "Daily" ? "default" : "outline"} className={exportRange === "Daily" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Daily")}>Today</Button>
                      <Button variant={exportRange === "Weekly" ? "default" : "outline"} className={exportRange === "Weekly" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Weekly")}>This Week</Button>
                      <Button variant={exportRange === "Monthly" ? "default" : "outline"} className={exportRange === "Monthly" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Monthly")}>This Month</Button>
                      <Button variant={exportRange === "Custom" ? "default" : "outline"} className={exportRange === "Custom" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Custom")}>Custom Range</Button>
                    </div>
                  </div>
                  {exportRange === "Custom" && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleExportAnalytics} className="bg-primary hover:bg-primary/80">Export Data</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Row 1 */}
            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Total Stock</p>
                  <h3 className="text-2xl font-bold text-success">{currentKpi.totalStock}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center text-success">
                  <Package className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{timeframe === "Today" ? "Today's Sales" : "Total Sales"}</p>
                  <h3 className="text-2xl font-bold text-info">{currentKpi.revenue}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-info/10 flex items-center justify-center text-info">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-destructive/30 shadow-md bg-card hover:border-destructive transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Low Stock Alert</p>
                  <h3 className="text-xl font-bold text-destructive">{currentKpi.alert}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Row 2 */}
            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Cash Received {timeframe === "Today" ? "Today" : ""}</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.cash}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Wallet className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">PhonePe Received {timeframe === "Today" ? "Today" : ""}</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.phonepe}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Smartphone className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Monthly Revenue</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.monthly}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Row 3 */}
            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Bone Stock</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.bone}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Bone className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Boneless Stock</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.boneless}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Bone className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border shadow-md bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Mixed Stock</p>
                  <h3 className="text-xl font-bold text-foreground">{currentKpi.mixed}</h3>
                </div>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Package className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Distribution */}
            <Card className="col-span-1 border-border rounded-none shadow-md bg-card">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Sales Distribution (kg)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center flex-col items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentData.sales}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {currentData.sales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} kg`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Flow */}
            <Card className="col-span-1 lg:col-span-2 border-border rounded-none shadow-md bg-card">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Inventory Flow (In vs Out)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.inventory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <RechartsTooltip cursor={{ fill: '#f4f4f5' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="In" name="Stock In (kg)" fill="#18181b" radius={[4, 4, 0, 0]} barSize={timeframe === "Today" ? 30 : 20} />
                      <Bar dataKey="Out" name="Stock Out (kg)" fill="#B71C1C" radius={[4, 4, 0, 0]} barSize={timeframe === "Today" ? 30 : 20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend Line */}
            <Card className="col-span-1 lg:col-span-3 border-border rounded-none shadow-md bg-card">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Revenue Trend (₹)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData.revenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `₹${value/1000}k`} />
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#B71C1C" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#B71C1C' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {activeTab === "inventory-in" && (
        <div className="bg-card rounded-none border-border border p-6 shadow-md min-h-[400px]">
          <InventoryIn />
        </div>
      )}

      {activeTab === "preparation" && (
        <div className="bg-card rounded-none border-border border p-6 shadow-md min-h-[400px]">
          <Preparation />
        </div>
      )}

      {activeTab === "costs" && (
        <div className="bg-card rounded-none border-border border p-6 shadow-md min-h-[400px]">
          <Costs />
        </div>
      )}

      {/* Footer text */}
      <div className="text-center pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold tracking-widest text-zinc-700 uppercase">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Authorized Access Only • All Data Isolated to {shopName.toUpperCase()}
        </div>
        <div className="flex items-center justify-center gap-5 text-xs font-black tracking-widest text-muted-foreground">
          <span>PINAKA®</span>
          <span>ORCHARD OPS™</span>
        </div>
      </div>
    </div>
  );
}
