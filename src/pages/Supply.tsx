import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

const initialRecords = [
  { date: "2026-03-15", shopNo: "S-01", batch: "BAT-001", mixed: 10, bone: 15, boneless: 12, total: 37 },
  { date: "2026-03-16", shopNo: "S-02", batch: "BAT-002", mixed: 8, bone: 20, boneless: 10, total: 38 },
  { date: "2026-03-17", shopNo: "S-01", batch: "BAT-003", mixed: 12, bone: 18, boneless: 14, total: 44 },
  { date: "2026-03-18", shopNo: "S-03", batch: "BAT-004", mixed: 6, bone: 10, boneless: 8, total: 24 },
  { date: "2026-03-19", shopNo: "S-01", batch: "BAT-005", mixed: 15, bone: 22, boneless: 18, total: 55 },
];

export default function Supply() {
  const { toast } = useToast();
  const [records, setRecords] = useState(initialRecords);
  const [shopNo, setShopNo] = useState("");
  const [batch, setBatch] = useState("");
  const [mixed, setMixed] = useState("");
  const [bone, setBone] = useState("");
  const [boneless, setBoneless] = useState("");

  const total = (Number(mixed) || 0) + (Number(bone) || 0) + (Number(boneless) || 0);

  const handleSave = () => {
    if (!shopNo || !batch) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    setRecords([
      { date: new Date().toISOString().split("T")[0], shopNo, batch, mixed: Number(mixed), bone: Number(bone), boneless: Number(boneless), total },
      ...records,
    ]);
    toast({ title: "Saved", description: "Supply record added" });
    setShopNo(""); setBatch(""); setMixed(""); setBone(""); setBoneless("");
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Supply" }]} />
      <h1 className="text-2xl font-bold mb-6">Supply Management</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Record Supply</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><Label>Shop Number</Label><Input value={shopNo} onChange={(e) => setShopNo(e.target.value)} placeholder="S-01" /></div>
          <div>
            <Label>Batch Number</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">Select Batch</option>
              {["BAT-001","BAT-002","BAT-003","BAT-004","BAT-005"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
          <div><Label>Mixed (kg)</Label><Input type="number" value={mixed} onChange={(e) => setMixed(e.target.value)} /></div>
          <div><Label>Bone (kg)</Label><Input type="number" value={bone} onChange={(e) => setBone(e.target.value)} /></div>
          <div><Label>Boneless (kg)</Label><Input type="number" value={boneless} onChange={(e) => setBoneless(e.target.value)} /></div>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">Total: <strong>{total} kg</strong></div>
        <Button className="mt-4" onClick={handleSave}>Save</Button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Supply Records</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Shop No", accessor: "shopNo" },
            { header: "Batch", accessor: "batch" },
            { header: "Mixed (kg)", accessor: (r) => `${r.mixed}` },
            { header: "Bone (kg)", accessor: (r) => `${r.bone}` },
            { header: "Boneless (kg)", accessor: (r) => `${r.boneless}` },
            { header: "Total (kg)", accessor: (r) => `${r.total}` },
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setRecords(records.filter(x => x !== r)); toast({ title: "Deleted" }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={records}
        />
      </div>
    </div>
  );
}
