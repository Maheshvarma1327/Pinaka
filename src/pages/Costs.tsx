import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, TrendingUp, TrendingDown, DollarSign, Calendar, Pencil, Trash2, PieChart } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, CartesianGrid } from "recharts";

// Dummy Data
const initialDailyCosts = [
  { id: 1, date: "2026-03-01", labour: 800, transport: 300, ice: 150, misc: 50, notes: "" },
  { id: 2, date: "2026-03-02", labour: 800, transport: 400, ice: 150, misc: 100, notes: "Extra trip" },
  { id: 3, date: "2026-03-03", labour: 800, transport: 300, ice: 200, misc: 0, notes: "Warm day" },
  { id: 4, date: "2026-03-04", labour: 1000, transport: 350, ice: 150, misc: 200, notes: "Extra helper" },
  { id: 5, date: "2026-03-05", labour: 800, transport: 300, ice: 150, misc: 50, notes: "" },
  { id: 6, date: "2026-03-06", labour: 800, transport: 500, ice: 150, misc: 0, notes: "" },
  { id: 7, date: "2026-03-07", labour: 800, transport: 300, ice: 200, misc: 100, notes: "" },
  { id: 8, date: "2026-03-08", labour: 900, transport: 300, ice: 150, misc: 50, notes: "Sunday" },
  { id: 9, date: "2026-03-09", labour: 800, transport: 350, ice: 150, misc: 0, notes: "" },
  { id: 10, date: "2026-03-10", labour: 800, transport: 300, ice: 150, misc: 20, notes: "" },
].map(c => ({ ...c, total: c.labour + c.transport + c.ice + c.misc }));

const initialMonthlyBills = [
  { id: 1, month: "2025-10", electricity: 3200, rent: 15000, water: 800, other: 500 },
  { id: 2, month: "2025-11", electricity: 3100, rent: 15000, water: 850, other: 300 },
  { id: 3, month: "2025-12", electricity: 3500, rent: 15000, water: 800, other: 1200 },
  { id: 4, month: "2026-01", electricity: 3400, rent: 15000, water: 750, other: 400 },
  { id: 5, month: "2026-02", electricity: 3600, rent: 15000, water: 900, other: 600 },
  { id: 6, month: "2026-03", electricity: 3300, rent: 15000, water: 850, other: 200 },
].map(c => ({ ...c, total: c.electricity + c.rent + c.water + c.other }));

const initialSlaughterCosts = [
  { id: 1, date: "2026-03-02", batch: "BAT-101", slaughterhouse: 1500, packaging: 450, other: 100 },
  { id: 2, date: "2026-03-05", batch: "BAT-102", slaughterhouse: 1500, packaging: 400, other: 50 },
  { id: 3, date: "2026-03-08", batch: "BAT-103", slaughterhouse: 1500, packaging: 480, other: 200 },
  { id: 4, date: "2026-03-12", batch: "BAT-104", slaughterhouse: 1500, packaging: 420, other: 0 },
  { id: 5, date: "2026-03-15", batch: "BAT-105", slaughterhouse: 1500, packaging: 500, other: 150 },
].map(c => ({ ...c, total: c.slaughterhouse + c.packaging + c.other }));

const summaryChartData = [
  { month: "Oct 25", revenue: 145000, dailyCosts: 42000, monthlyBills: 19500, slaughterCosts: 11000 },
  { month: "Nov 25", revenue: 152000, dailyCosts: 40500, monthlyBills: 19250, slaughterCosts: 10500 },
  { month: "Dec 25", revenue: 168000, dailyCosts: 45000, monthlyBills: 20500, slaughterCosts: 12500 },
  { month: "Jan 26", revenue: 155000, dailyCosts: 41000, monthlyBills: 19550, slaughterCosts: 11200 },
  { month: "Feb 26", revenue: 148000, dailyCosts: 39500, monthlyBills: 20100, slaughterCosts: 10800 },
  { month: "Mar 26", revenue: 160000, dailyCosts: 43000, monthlyBills: 19350, slaughterCosts: 11500 },
];

export default function Costs() {
  const { toast } = useToast();
  
  const [dailyCosts, setDailyCosts] = useState(initialDailyCosts);
  const [monthlyBills, setMonthlyBills] = useState(initialMonthlyBills);
  const [slaughterCosts, setSlaughterCosts] = useState(initialSlaughterCosts);

  // Daily Cost Form
  const [dcDate, setDcDate] = useState(new Date().toISOString().split("T")[0]);
  const [dcLabour, setDcLabour] = useState("");
  const [dcTransport, setDcTransport] = useState("");
  const [dcIce, setDcIce] = useState("");
  const [dcMisc, setDcMisc] = useState("");
  const [dcNotes, setDcNotes] = useState("");

  const handleSaveDailyCost = () => {
    if (!dcDate || (!dcLabour && !dcTransport && !dcIce && !dcMisc)) {
      toast({ title: "Validation Error", description: "Please fill date and at least one cost field.", variant: "destructive" });
      return;
    }
    const total = (Number(dcLabour) || 0) + (Number(dcTransport) || 0) + (Number(dcIce) || 0) + (Number(dcMisc) || 0);
    const newRecord = {
      id: Date.now(),
      date: dcDate,
      labour: Number(dcLabour) || 0,
      transport: Number(dcTransport) || 0,
      ice: Number(dcIce) || 0,
      misc: Number(dcMisc) || 0,
      notes: dcNotes,
      total
    };
    setDailyCosts([newRecord, ...dailyCosts]);
    toast({ title: "Saved", description: "Daily cost recorded successfully." });
    setDcLabour(""); setDcTransport(""); setDcIce(""); setDcMisc(""); setDcNotes("");
  };

  // Monthly Bill Form
  const [mbMonth, setMbMonth] = useState("");
  const [mbElectricity, setMbElectricity] = useState("");
  const [mbRent, setMbRent] = useState("");
  const [mbWater, setMbWater] = useState("");
  const [mbOther, setMbOther] = useState("");

  const handleSaveMonthlyBill = () => {
    if (!mbMonth) {
      toast({ title: "Validation Error", description: "Please select a month.", variant: "destructive" });
      return;
    }
    const total = (Number(mbElectricity) || 0) + (Number(mbRent) || 0) + (Number(mbWater) || 0) + (Number(mbOther) || 0);
    const newRecord = {
      id: Date.now(),
      month: mbMonth,
      electricity: Number(mbElectricity) || 0,
      rent: Number(mbRent) || 0,
      water: Number(mbWater) || 0,
      other: Number(mbOther) || 0,
      total
    };
    setMonthlyBills([newRecord, ...monthlyBills]);
    toast({ title: "Saved", description: "Monthly bills recorded successfully." });
    setMbMonth(""); setMbElectricity(""); setMbRent(""); setMbWater(""); setMbOther("");
  };

  // Slaughter Cost Form
  const [scDate, setScDate] = useState(new Date().toISOString().split("T")[0]);
  const [scBatch, setScBatch] = useState("");
  const [scSlaughterhouse, setScSlaughterhouse] = useState("");
  const [scPackaging, setScPackaging] = useState("");
  const [scOther, setScOther] = useState("");

  const handleSaveSlaughterCost = () => {
    if (!scDate || !scBatch) {
      toast({ title: "Validation Error", description: "Please provide Date and Batch Number.", variant: "destructive" });
      return;
    }
    const total = (Number(scSlaughterhouse) || 0) + (Number(scPackaging) || 0) + (Number(scOther) || 0);
    const newRecord = {
      id: Date.now(),
      date: scDate,
      batch: scBatch,
      slaughterhouse: Number(scSlaughterhouse) || 0,
      packaging: Number(scPackaging) || 0,
      other: Number(scOther) || 0,
      total
    };
    setSlaughterCosts([newRecord, ...slaughterCosts]);
    toast({ title: "Saved", description: "Slaughter cost recorded successfully." });
    setScBatch(""); setScSlaughterhouse(""); setScPackaging(""); setScOther("");
  };

  const deleteDailyCost = (id: number) => {
    setDailyCosts(dailyCosts.filter(d => d.id !== id));
    toast({ title: "Deleted", description: "Cost record deleted." });
  };
  const deleteMonthlyBill = (id: number) => {
    setMonthlyBills(monthlyBills.filter(d => d.id !== id));
    toast({ title: "Deleted", description: "Bill record deleted." });
  };
  const deleteSlaughterCost = (id: number) => {
    setSlaughterCosts(slaughterCosts.filter(d => d.id !== id));
    toast({ title: "Deleted", description: "Slaughter cost deleted." });
  };

  // Summary Metrics (March 2026 Dummy Values + Some dynamic)
  const totalCostsMonth = 73850; // Dummy value for current month
  const dailyAvgCost = 2382;
  const revenueMonth = 160000;
  const netProfitMonth = revenueMonth - totalCostsMonth;

  return (
    <div className="animate-fade-in pb-12">
      <Breadcrumb items={[{ label: "Costs" }]} />
      <h1 className="text-2xl font-bold mb-6">Operational Costs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Costs This Month" 
          value={`₹${totalCostsMonth.toLocaleString("en-IN")}`} 
          icon={<DollarSign className="h-5 w-5 text-[#B71C1C]" />} 
          className="border-l-4 border-l-[#B71C1C]"
        />
        <StatCard 
          title="Daily Avg Cost" 
          value={`₹${dailyAvgCost.toLocaleString("en-IN")}`} 
          icon={<TrendingDown className="h-5 w-5 text-orange-500" />} 
          className="border-l-4 border-l-orange-500"
        />
        <StatCard 
          title="Revenue This Month" 
          value={`₹${revenueMonth.toLocaleString("en-IN")}`} 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />} 
          className="border-l-4 border-l-green-600"
        />
        <StatCard 
          title="Net Profit This Month" 
          value={`₹${netProfitMonth.toLocaleString("en-IN")}`} 
          icon={<PieChart className="h-5 w-5 text-blue-600" />} 
          color="info"
          className="border-l-4 border-l-blue-600"
        />
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="daily">Daily Costs</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
          <TabsTrigger value="slaughter">Slaughter Costs</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add Daily Cost</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div><Label>Date</Label><Input type="date" value={dcDate} onChange={e => setDcDate(e.target.value)} /></div>
              <div><Label>Labour Cost (₹)</Label><Input type="number" value={dcLabour} onChange={e => setDcLabour(e.target.value)} placeholder="0" /></div>
              <div><Label>Transport Cost (₹)</Label><Input type="number" value={dcTransport} onChange={e => setDcTransport(e.target.value)} placeholder="0" /></div>
              <div><Label>Ice Cost (₹)</Label><Input type="number" value={dcIce} onChange={e => setDcIce(e.target.value)} placeholder="0" /></div>
              <div><Label>Miscellaneous (₹)</Label><Input type="number" value={dcMisc} onChange={e => setDcMisc(e.target.value)} placeholder="0" /></div>
              <div><Label>Notes (Optional)</Label><Input value={dcNotes} onChange={e => setDcNotes(e.target.value)} placeholder="..." /></div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm border px-3 py-1.5 rounded-md bg-secondary/50 font-medium">
                Total: ₹{((Number(dcLabour) || 0) + (Number(dcTransport) || 0) + (Number(dcIce) || 0) + (Number(dcMisc) || 0)).toLocaleString("en-IN")}
              </div>
              <Button onClick={handleSaveDailyCost} className="bg-[#B71C1C] hover:bg-[#8e1616] text-white">Save Cost</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Daily Costs Log</h2>
            <DataTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Labour (₹)", accessor: (r) => `₹${r.labour}` },
                { header: "Transport (₹)", accessor: (r) => `₹${r.transport}` },
                { header: "Ice (₹)", accessor: (r) => `₹${r.ice}` },
                { header: "Misc (₹)", accessor: (r) => `₹${r.misc}` },
                { header: "Total (₹)", accessor: (r) => <strong className="text-primary">₹{r.total.toLocaleString()}</strong> },
                { header: "Notes", accessor: "notes" },
                { header: "Actions", accessor: (r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDailyCost(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )},
              ]}
              data={dailyCosts}
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add Monthly Bill</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div><Label>Month</Label><Input type="month" value={mbMonth} onChange={e => setMbMonth(e.target.value)} /></div>
              <div><Label>Electricity Bill (₹)</Label><Input type="number" value={mbElectricity} onChange={e => setMbElectricity(e.target.value)} placeholder="0" /></div>
              <div><Label>Rent (₹)</Label><Input type="number" value={mbRent} onChange={e => setMbRent(e.target.value)} placeholder="0" /></div>
              <div><Label>Water Bill (₹)</Label><Input type="number" value={mbWater} onChange={e => setMbWater(e.target.value)} placeholder="0" /></div>
              <div><Label>Other Bills (₹)</Label><Input type="number" value={mbOther} onChange={e => setMbOther(e.target.value)} placeholder="0" /></div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm border px-3 py-1.5 rounded-md bg-secondary/50 font-medium">
                Total: ₹{((Number(mbElectricity) || 0) + (Number(mbRent) || 0) + (Number(mbWater) || 0) + (Number(mbOther) || 0)).toLocaleString("en-IN")}
              </div>
              <Button onClick={handleSaveMonthlyBill} className="bg-[#B71C1C] hover:bg-[#8e1616] text-white">Save Bills</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Monthly Bills Log</h2>
            <DataTable
              columns={[
                { header: "Month", accessor: "month" },
                { header: "Electricity (₹)", accessor: (r) => `₹${r.electricity}` },
                { header: "Rent (₹)", accessor: (r) => `₹${r.rent}` },
                { header: "Water (₹)", accessor: (r) => `₹${r.water}` },
                { header: "Other (₹)", accessor: (r) => `₹${r.other}` },
                { header: "Total (₹)", accessor: (r) => <strong className="text-primary">₹{r.total.toLocaleString()}</strong> },
                { header: "Actions", accessor: (r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMonthlyBill(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )},
              ]}
              data={monthlyBills}
            />
          </div>
        </TabsContent>

        <TabsContent value="slaughter" className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add Slaughter Cost</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div><Label>Date</Label><Input type="date" value={scDate} onChange={e => setScDate(e.target.value)} /></div>
              <div><Label>Batch Number</Label><Input value={scBatch} onChange={e => setScBatch(e.target.value)} placeholder="BAT-XXX" /></div>
              <div><Label>Slaughterhouse Fee (₹)</Label><Input type="number" value={scSlaughterhouse} onChange={e => setScSlaughterhouse(e.target.value)} placeholder="0" /></div>
              <div><Label>Packaging Material (₹)</Label><Input type="number" value={scPackaging} onChange={e => setScPackaging(e.target.value)} placeholder="0" /></div>
              <div><Label>Other Costs (₹)</Label><Input type="number" value={scOther} onChange={e => setScOther(e.target.value)} placeholder="0" /></div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm border px-3 py-1.5 rounded-md bg-secondary/50 font-medium">
                Total: ₹{((Number(scSlaughterhouse) || 0) + (Number(scPackaging) || 0) + (Number(scOther) || 0)).toLocaleString("en-IN")}
              </div>
              <Button onClick={handleSaveSlaughterCost} className="bg-[#B71C1C] hover:bg-[#8e1616] text-white">Save Cost</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Slaughter Costs Log</h2>
            <DataTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Batch", accessor: "batch" },
                { header: "Slaughterhouse (₹)", accessor: (r) => `₹${r.slaughterhouse}` },
                { header: "Packaging (₹)", accessor: (r) => `₹${r.packaging}` },
                { header: "Other (₹)", accessor: (r) => `₹${r.other}` },
                { header: "Total (₹)", accessor: (r) => <strong className="text-primary">₹{r.total.toLocaleString()}</strong> },
                { header: "Actions", accessor: (r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSlaughterCost(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )},
              ]}
              data={slaughterCosts}
            />
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm flex items-center justify-between">
            <h2 className="text-lg font-semibold">Costs vs Revenue Summary</h2>
            <div className="flex items-center gap-2">
              <Label>Filter:</Label>
              <Input type="month" defaultValue="2026-03" className="w-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-md font-semibold mb-4">Full Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/3">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">This Month (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Month (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3">Daily Costs</td>
                    <td className="px-4 py-3">₹43,000</td>
                    <td className="px-4 py-3">₹39,500</td>
                    <td className="px-4 py-3 text-red-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> +8.8%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Monthly Bills</td>
                    <td className="px-4 py-3">₹19,350</td>
                    <td className="px-4 py-3">₹20,100</td>
                    <td className="px-4 py-3 text-green-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> -3.7%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Slaughter Costs</td>
                    <td className="px-4 py-3">₹11,500</td>
                    <td className="px-4 py-3">₹10,800</td>
                    <td className="px-4 py-3 text-red-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> +6.4%</td>
                  </tr>
                  <tr className="border-b-2 font-bold bg-secondary/10">
                    <td className="px-4 py-3">Total Costs</td>
                    <td className="px-4 py-3">₹73,850</td>
                    <td className="px-4 py-3">₹70,400</td>
                    <td className="px-4 py-3 text-red-500">—</td>
                  </tr>
                  <tr className="border-b font-bold bg-secondary/10">
                    <td className="px-4 py-3">Total Revenue</td>
                    <td className="px-4 py-3 text-green-600">₹160,000</td>
                    <td className="px-4 py-3 text-green-600">₹148,000</td>
                    <td className="px-4 py-3 text-green-500">—</td>
                  </tr>
                  <tr className="border-t-[3px] font-black text-base bg-secondary/20 bg-blue-50/50">
                    <td className="px-4 py-4 text-blue-800">NET PROFIT</td>
                    <td className="px-4 py-4 text-blue-800">₹86,150</td>
                    <td className="px-4 py-4 text-blue-800">₹77,600</td>
                    <td className="px-4 py-4 text-green-600 flex items-center gap-1"><TrendingUp className="h-4 w-4" /> +11.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col">
              <h3 className="text-md font-semibold mb-6">Revenue vs Total Costs (6 Months)</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} cursor={{ fill: '#f5f5f5' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="dailyCosts" name="Daily Costs" stackId="costs" fill="#B71C1C" maxBarSize={40} />
                    <Bar dataKey="monthlyBills" name="Monthly Bills" stackId="costs" fill="#f97316" maxBarSize={40} />
                    <Bar dataKey="slaughterCosts" name="Slaughter Costs" stackId="costs" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
