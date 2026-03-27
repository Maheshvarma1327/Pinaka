import { useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Bone, AlertTriangle, Package, Pencil, Trash2 } from "lucide-react";

interface InventoryRecord {
  id?: string;
  date: string;
  batch: string;
  transport: string;
  bone: number;
  boneless: number;
  mixed: number;
  rate: number;
  total: number;
}

const initialRecords: InventoryRecord[] = [
  { date: "2026-03-12", batch: "BAT-101", transport: "Manoj Logistics", bone: 20, boneless: 15, mixed: 10, rate: 250, total: 11250 },
  { date: "2026-03-13", batch: "BAT-102", transport: "Self Pickup", bone: 15, boneless: 12, mixed: 8, rate: 260, total: 9100 },
  { date: "2026-03-14", batch: "BAT-103", transport: "Manoj Logistics", bone: 25, boneless: 18, mixed: 12, rate: 250, total: 13750 },
  { date: "2026-03-15", batch: "BAT-104", transport: "Green Carriers", bone: 10, boneless: 8, mixed: 5, rate: 270, total: 6210 },
  { date: "2026-03-16", batch: "BAT-105", transport: "Manoj Logistics", bone: 18, boneless: 14, mixed: 9, rate: 250, total: 10250 },
  { date: "2026-03-17", batch: "BAT-106", transport: "Self Pickup", bone: 22, boneless: 16, mixed: 11, rate: 260, total: 12740 },
  { date: "2026-03-18", batch: "BAT-107", transport: "Manoj Logistics", bone: 12, boneless: 10, mixed: 7, rate: 250, total: 7250 },
  { date: "2026-03-19", batch: "BAT-108", transport: "Green Carriers", bone: 16, boneless: 13, mixed: 8, rate: 270, total: 9990 },
];

export default function InventoryIn() {
  const { toast } = useToast();
  const { id } = useParams();
  const storageKey = id ? `pinaka_shop_inventory_in_${id}` : "pinaka_shop_inventory_in";

  const [records, setRecords] = useState<InventoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return initialRecords;
  });

  const saveToStorage = (newRecords: InventoryRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(storageKey, JSON.stringify(newRecords));
  };
  
  // Form State
  const [batch, setBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
  
  const isLowStock = totalBone + totalBoneless + records.reduce((s, r) => s + r.mixed, 0) < 5;

  const handleSave = () => {
    if (!batch || !rate || (!bone && !boneless && !mixed)) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill Batch Number, Rate, and at least one weight field.", 
        variant: "destructive" 
      });
      return;
    }

    const newRecord: InventoryRecord = {
      date,
      batch,
      transport,
      bone: Number(bone) || 0,
      boneless: Number(boneless) || 0,
      mixed: Number(mixed) || 0,
      rate: Number(rate) || 0,
      total: totalAmt,
    };

    saveToStorage([newRecord, ...records]);
    toast({ 
      title: "Success", 
      description: "Inventory stock entry saved successfully." 
    });

    // Reset Form
    setBatch("");
    setTransport("");
    setBone("");
    setBoneless("");
    setMixed("");
    setRate("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleDelete = (index: number) => {
    const updated = [...records];
    updated.splice(index, 1);
    saveToStorage(updated);
    toast({ title: "Deleted", description: "Entry removed from records" });
  };

  // Editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEditClick = (index: number, record: InventoryRecord) => {
    setEditingIndex(index);
    setBatch(record.batch);
    setDate(record.date);
    setTransport(record.transport);
    setBone(record.bone.toString());
    setBoneless(record.boneless.toString());
    setMixed(record.mixed.toString());
    setRate(record.rate.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    const updated = [...records];
    updated[editingIndex] = {
      ...updated[editingIndex],
      batch,
      date,
      transport,
      bone: Number(bone) || 0,
      boneless: Number(boneless) || 0,
      mixed: Number(mixed) || 0,
      rate: Number(rate) || 0,
      total: totalAmt
    };
    saveToStorage(updated);
    toast({ title: "Updated", description: "Entry updated" });
    setEditingIndex(null);
    setBatch(""); setTransport(""); setBone(""); setBoneless(""); setMixed(""); setRate("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setBatch(""); setTransport(""); setBone(""); setBoneless(""); setMixed(""); setRate("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: "Inventory", path: "/inventory/in" }, { label: "Inventory In" }]} />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory In</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Stock Value" 
          value={`₹${totalValue.toLocaleString("en-IN")}`} 
          icon={<IndianRupee className="h-5 w-5 text-info" />} 
          color="info" 
        />
        <StatCard 
          title="Total Bone Stock" 
          value={`${totalBone} kg`} 
          icon={<Bone className="h-5 w-5 text-foreground" />} 
        />
        <StatCard 
          title="Total Boneless Stock" 
          value={`${totalBoneless} kg`} 
          icon={<Package className="h-5 w-5 text-foreground" />} 
        />
        <StatCard 
          title="Low Stock Warning" 
          value={isLowStock ? "Below 5kg!" : "Stock OK"} 
          icon={<AlertTriangle className="h-5 w-5" />} 
          color={isLowStock ? "destructive" : "success"}
          className={isLowStock ? "animate-pulse border-destructive bg-destructive/5" : ""}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Add Stock Form</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="batch">Batch Number</Label>
            <Input id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. BAT-202" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transport">Transport Details</Label>
            <Input id="transport" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="e.g. Vehicle Number / Name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">Rate per kg (₹)</Label>
            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bone">Bone (kg)</Label>
            <Input id="bone" type="number" value={bone} onChange={(e) => setBone(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="boneless">Boneless (kg)</Label>
            <Input id="boneless" type="number" value={boneless} onChange={(e) => setBoneless(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mixed">Mixed (kg)</Label>
            <Input id="mixed" type="number" value={mixed} onChange={(e) => setMixed(e.target.value)} placeholder="0" />
          </div>
          <div className="flex flex-col justify-end gap-2">
            {/* Skin and Meat calculated fields have been removed per requirement */}
            <div className="bg-secondary/30 p-2 rounded-md flex justify-between items-center px-3 border border-dashed text-sm">
              <span className="text-muted-foreground font-medium">Total Amount:</span>
              <span className="font-bold text-primary">₹{totalAmt.toLocaleString("en-IN")}</span>
            </div>
            {editingIndex !== null ? (
              <div className="flex gap-2 w-full">
                <Button onClick={handleUpdate} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Update Entry
                </Button>
                <Button onClick={cancelEdit} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/80 text-white w-full">
                Save Stock Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Inventory In Table</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Batch", accessor: "batch" },
            { header: "Transport", accessor: "transport" },
            { header: "Bone (kg)", accessor: (r: InventoryRecord) => `${r.bone}` },
            { header: "Boneless (kg)", accessor: (r: InventoryRecord) => `${r.boneless}` },
            { header: "Mixed (kg)", accessor: (r: InventoryRecord) => `${r.mixed}` },
            { header: "Rate (₹)", accessor: (r: InventoryRecord) => `₹${r.rate}` },
            { header: "Total (₹)", accessor: (r: InventoryRecord) => `₹${Number(r.total).toLocaleString("en-IN")}` },
            { 
              header: "Actions", 
              accessor: (r: InventoryRecord, ri?: number) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(ri ?? 0, r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                    onClick={() => handleDelete(ri ?? 0)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
          ]}
          data={records}
          pageSize={8}
        />
      </div>
    </div>
  );
}

