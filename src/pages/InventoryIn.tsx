import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Bone, AlertTriangle, Package, Pencil, Trash2 } from "lucide-react";

const initialRecords = [
  { date: "2026-03-12", batch: "BAT-001", transport: "Truck A", bone: 20, boneless: 15, mixed: 10, rate: 250, total: 11250 },
  { date: "2026-03-13", batch: "BAT-002", transport: "Van B", bone: 15, boneless: 12, mixed: 8, rate: 260, total: 9100 },
  { date: "2026-03-14", batch: "BAT-003", transport: "Truck A", bone: 25, boneless: 18, mixed: 12, rate: 250, total: 13750 },
  { date: "2026-03-15", batch: "BAT-004", transport: "Van C", bone: 10, boneless: 8, mixed: 5, rate: 270, total: 6210 },
  { date: "2026-03-16", batch: "BAT-005", transport: "Truck A", bone: 18, boneless: 14, mixed: 9, rate: 250, total: 10250 },
  { date: "2026-03-17", batch: "BAT-001", transport: "Van B", bone: 22, boneless: 16, mixed: 11, rate: 260, total: 12740 },
  { date: "2026-03-18", batch: "BAT-002", transport: "Truck A", bone: 12, boneless: 10, mixed: 7, rate: 250, total: 7250 },
  { date: "2026-03-19", batch: "BAT-003", transport: "Van C", bone: 16, boneless: 13, mixed: 8, rate: 270, total: 9990 },
];

export default function InventoryIn() {
  const { toast } = useToast();
  const [records, setRecords] = useState(initialRecords);
  const [batch, setBatch] = useState("");
  const [transport, setTransport] = useState("");
  const [bone, setBone] = useState("");
  const [boneless, setBoneless] = useState("");
  const [mixed, setMixed] = useState("");
  const [rate, setRate] = useState("");

  const totalKg = (Number(bone) || 0) + (Number(boneless) || 0) + (Number(mixed) || 0);
  const totalAmt = totalKg * (Number(rate) || 0);

  const totalBone = records.reduce((s, r) => s + r.bone, 0);
  const totalBoneless = records.reduce((s, r) => s + r.boneless, 0);
  const totalValue = records.reduce((s, r) => s + r.total, 0);

  const handleSave = () => {
    if (!batch) { toast({ title: "Error", description: "Fill batch", variant: "destructive" }); return; }
    setRecords([{
      date: new Date().toISOString().split("T")[0], batch, transport, bone: Number(bone), boneless: Number(boneless), mixed: Number(mixed), rate: Number(rate), total: totalAmt,
    }, ...records]);
    toast({ title: "Saved", description: "Stock entry added" });
    setBatch(""); setTransport(""); setBone(""); setBoneless(""); setMixed(""); setRate("");
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Inventory", path: "/inventory/in" }, { label: "Inventory In" }]} />
      <h1 className="text-2xl font-bold mb-6">Inventory In</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Stock Value" value={`₹${totalValue.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Total Bone Stock" value={`${totalBone} kg`} icon={<Bone className="h-5 w-5 text-foreground" />} />
        <StatCard title="Total Boneless Stock" value={`${totalBoneless} kg`} icon={<Package className="h-5 w-5 text-foreground" />} />
        <StatCard title="Low Stock Warning" value={totalBoneless < 50 ? "Boneless low!" : "All OK"} icon={<AlertTriangle className="h-5 w-5 text-warning" />} color={totalBoneless < 50 ? "warning" : "success"} />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Add Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label>Batch Number</Label><Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="BAT-001" /></div>
          <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
          <div><Label>Transport</Label><Input value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="Truck A" /></div>
          <div><Label>Rate per kg (₹)</Label><Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
          <div><Label>Bone (kg)</Label><Input type="number" value={bone} onChange={(e) => setBone(e.target.value)} /></div>
          <div><Label>Boneless (kg)</Label><Input type="number" value={boneless} onChange={(e) => setBoneless(e.target.value)} /></div>
          <div><Label>Mixed (kg)</Label><Input type="number" value={mixed} onChange={(e) => setMixed(e.target.value)} /></div>
          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground mb-1">Total: ₹{totalAmt.toLocaleString("en-IN")}</div>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Inventory In Records</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Batch", accessor: "batch" },
            { header: "Transport", accessor: "transport" },
            { header: "Bone (kg)", accessor: (r) => `${r.bone}` },
            { header: "Boneless (kg)", accessor: (r) => `${r.boneless}` },
            { header: "Mixed (kg)", accessor: (r) => `${r.mixed}` },
            { header: "Rate (₹)", accessor: (r) => `₹${r.rate}` },
            { header: "Total (₹)", accessor: (r) => `₹${r.total.toLocaleString("en-IN")}` },
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setRecords(records.filter(x => x !== r)); toast({ title: "Deleted" }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={records}
          pageSize={8}
        />
      </div>
    </div>
  );
}
