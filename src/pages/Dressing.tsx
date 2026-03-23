import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

const initialRecords = [
  { batch: "BAT-001", animalId: "AN-101", date: "2026-03-15", totalWeight: 80, usableMeat: 58, wastagePercent: 27.5, status: "Packaged" },
  { batch: "BAT-002", animalId: "AN-102", date: "2026-03-16", totalWeight: 95, usableMeat: 70, wastagePercent: 26.3, status: "Packaged" },
  { batch: "BAT-003", animalId: "AN-103", date: "2026-03-17", totalWeight: 72, usableMeat: 52, wastagePercent: 27.8, status: "Slaughtered" },
  { batch: "BAT-004", animalId: "AN-104", date: "2026-03-18", totalWeight: 88, usableMeat: 64, wastagePercent: 27.3, status: "Packaged" },
  { batch: "BAT-005", animalId: "AN-105", date: "2026-03-19", totalWeight: 105, usableMeat: 78, wastagePercent: 25.7, status: "Slaughtered" },
];

const packagingProducts = [
  { name: "Bone 1kg", unitPrice: 350 },
  { name: "Boneless 1kg", unitPrice: 400 },
  { name: "Bone ½kg", unitPrice: 180 },
  { name: "Boneless ½kg", unitPrice: 200 },
  { name: "Only Skin 1kg", unitPrice: 500 },
  { name: "Only Meat 1kg", unitPrice: 500 },
];

export default function Dressing() {
  const { toast } = useToast();
  const [records, setRecords] = useState(initialRecords);

  // Before slaughter form
  const [animalId, setAnimalId] = useState("");
  const [animalWeight, setAnimalWeight] = useState("");
  const [cost, setCost] = useState("");
  const [farmLocation, setFarmLocation] = useState("");

  // After slaughter form
  const [linkedAnimal, setLinkedAnimal] = useState("");
  const [head, setHead] = useState("");
  const [ribs, setRibs] = useState("");
  const [ham, setHam] = useState("");
  const [offals, setOffals] = useState("");
  const [packagingBatch, setPackagingBatch] = useState<string | null>(null);

  // Packaging
  const [pkgQty, setPkgQty] = useState<number[]>(new Array(6).fill(0));

  const totalCarcass = (Number(head) || 0) + (Number(ribs) || 0) + (Number(ham) || 0) + (Number(offals) || 0);
  const wastage = (Number(head) || 0) + (Number(offals) || 0);
  const wastagePercent = totalCarcass > 0 ? ((wastage / totalCarcass) * 100).toFixed(1) : "0";
  const usableMeat = totalCarcass - wastage;

  const nextBatch = `BAT-${String(records.length + 1).padStart(3, "0")}`;

  const handleSaveBefore = () => {
    if (!animalId || !animalWeight) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: `Animal ${animalId} recorded successfully` });
    setAnimalId("");
    setAnimalWeight("");
    setCost("");
    setFarmLocation("");
  };

  const handleSaveAfter = () => {
    if (!linkedAnimal || totalCarcass === 0) {
      toast({ title: "Error", description: "Fill all weight fields", variant: "destructive" });
      return;
    }
    const newRecord = {
      batch: nextBatch,
      animalId: linkedAnimal,
      date: new Date().toISOString().split("T")[0],
      totalWeight: totalCarcass,
      usableMeat,
      wastagePercent: Number(wastagePercent),
      status: "Slaughtered",
    };
    setRecords([newRecord, ...records]);
    setPackagingBatch(nextBatch);
    toast({ title: "Saved", description: `After slaughter data saved for ${nextBatch}` });
  };

  const handleMoveToInventory = () => {
    if (packagingBatch) {
      setRecords(records.map(r => r.batch === packagingBatch ? { ...r, status: "Packaged" } : r));
    }
    toast({ title: "Moved to Inventory", description: "All packets added to inventory successfully!" });
    setPackagingBatch(null);
    setPkgQty(new Array(6).fill(0));
    setLinkedAnimal("");
    setHead("");
    setRibs("");
    setHam("");
    setOffals("");
  };

  const handleSavePackaging = () => {
    if (packagingBatch) {
      toast({ title: "Packaging Saved", description: `Packaging data saved for ${packagingBatch}` });
      setPackagingBatch(null);
      setPkgQty(new Array(6).fill(0));
    }
  };

  const handleDelete = (batch: string) => {
    setRecords(records.filter((r) => r.batch !== batch));
    toast({ title: "Deleted", description: `Record ${batch} deleted` });
  };

  const grandTotal = pkgQty.reduce((sum, qty, i) => sum + qty * packagingProducts[i].unitPrice, 0);

  return (
    <div>
      <Breadcrumb items={[{ label: "Dressing" }]} />
      <h1 className="text-2xl font-bold mb-6">Dressing Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Before Slaughter */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Before Slaughter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Animal ID</Label><Input value={animalId} onChange={(e) => setAnimalId(e.target.value)} placeholder="AN-106" /></div>
            <div><Label>Animal Weight (kg)</Label><Input type="number" value={animalWeight} onChange={(e) => setAnimalWeight(e.target.value)} placeholder="85" /></div>
            <div><Label>Cost (₹)</Label><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="12000" /></div>
            <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
            <div className="sm:col-span-2"><Label>Farm Location</Label><Input value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} placeholder="Village Farm" /></div>
          </div>
          <Button className="mt-4" onClick={handleSaveBefore}>Save</Button>
        </div>

        {/* After Slaughter */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">After Slaughter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Batch Number</Label>
              <Input value={nextBatch} disabled />
            </div>
            <div>
              <Label>Link to Animal ID</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={linkedAnimal}
                onChange={(e) => setLinkedAnimal(e.target.value)}
              >
                <option value="">Select Animal</option>
                {["AN-101", "AN-102", "AN-103", "AN-104", "AN-105", "AN-106"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div><Label>Head (kg)</Label><Input type="number" value={head} onChange={(e) => setHead(e.target.value)} /></div>
            <div><Label>Ribs (kg)</Label><Input type="number" value={ribs} onChange={(e) => setRibs(e.target.value)} /></div>
            <div><Label>Ham (kg)</Label><Input type="number" value={ham} onChange={(e) => setHam(e.target.value)} /></div>
            <div><Label>Offals (kg)</Label><Input type="number" value={offals} onChange={(e) => setOffals(e.target.value)} /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-secondary rounded-md p-2"><span className="text-muted-foreground">Total:</span> <strong>{totalCarcass} kg</strong></div>
            <div className="bg-secondary rounded-md p-2"><span className="text-muted-foreground">Wastage:</span> <strong>{wastage} kg</strong></div>
            <div className="bg-secondary rounded-md p-2"><span className="text-muted-foreground">Wastage %:</span> <strong>{wastagePercent}%</strong></div>
            <div className="bg-secondary rounded-md p-2"><span className="text-muted-foreground">Usable:</span> <strong>{usableMeat} kg</strong></div>
          </div>
          <Button className="mt-4" onClick={handleSaveAfter}>Save</Button>
        </div>
      </div>

      {/* Packaging */}
      {packagingBatch && (
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Packaging — Batch [{packagingBatch}]</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {packagingProducts.map((p, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-stripe" : ""}`}>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-20"
                        value={pkgQty[i] || ""}
                        onChange={(e) => {
                          const next = [...pkgQty];
                          next[i] = Number(e.target.value) || 0;
                          setPkgQty(next);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">₹{p.unitPrice}</td>
                    <td className="px-4 py-3 font-medium">₹{(pkgQty[i] || 0) * p.unitPrice}</td>
                  </tr>
                ))}
                <tr className="border-t-2 font-bold">
                  <td className="px-4 py-3" colSpan={3}>Grand Total</td>
                  <td className="px-4 py-3">₹{grandTotal.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleMoveToInventory} className="bg-[#B71C1C] hover:bg-[#8e1616] text-white">Move to Inventory</Button>
            <Button variant="outline" onClick={handleSavePackaging} className="border-[#B71C1C] text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white">Save Packaging</Button>
          </div>
        </div>
      )}

      {/* Records */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Dressing Records</h2>
        <DataTable
          columns={[
            { header: "Batch", accessor: "batch" },
            { header: "Animal ID", accessor: "animalId" },
            { header: "Date", accessor: "date" },
            { header: "Total Weight", accessor: (r) => `${r.totalWeight} kg` },
            { header: "Usable Meat", accessor: (r) => `${r.usableMeat} kg` },
            { header: "Wastage %", accessor: (r) => `${r.wastagePercent}%` },
            { header: "Status", accessor: (r) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "Packaged" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {r.status}
              </span>
            )},
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1 items-center">
                {r.status === "Slaughtered" && (
                  <Button variant="outline" size="sm" className="h-8 text-xs border-[#B71C1C] text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white mr-2" onClick={() => setPackagingBatch(r.batch)}>
                    Packaging
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.batch)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={records}
        />
      </div>
    </div>
  );
}
