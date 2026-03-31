import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialRecords = [
  { batch: "BAT-001", animalId: "AN-101", date: "2026-03-15", animalWeight: 140, totalWeight: 80, usableMeat: 58, wastagePercent: 27.5, status: "Packed", cost: 12000, rate: 140, farmLocation: "Village Farm", head: 5, ribs: 30, ham: 40, offals: 5, pkgItems: { bone: 20, boneless: 20, mixed: 10, skin: 5, meat: 3 } },
  { batch: "BAT-002", animalId: "AN-102", date: "2026-03-16", animalWeight: 160, totalWeight: 95, usableMeat: 70, wastagePercent: 26.3, status: "Packed", cost: 14500, rate: 145, farmLocation: "Farm B", head: 6, ribs: 35, ham: 48, offals: 6, pkgItems: { bone: 25, boneless: 25, mixed: 10, skin: 7, meat: 3 } },
  { batch: "BAT-003", animalId: "AN-103", date: "2026-03-17", animalWeight: 125, totalWeight: 72, usableMeat: 52, wastagePercent: 27.8, status: "Slaughtered", cost: 11000, rate: 110, farmLocation: "Farm C", head: 5, ribs: 25, ham: 37, offals: 5, pkgItems: { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 } },
  { batch: "BAT-004", animalId: "AN-104", date: "2026-03-18", animalWeight: 145, totalWeight: 88, usableMeat: 64, wastagePercent: 27.3, status: "Packed", cost: 13000, rate: 130, farmLocation: "Farm D", head: 6, ribs: 30, ham: 46, offals: 6, pkgItems: { bone: 22, boneless: 20, mixed: 12, skin: 6, meat: 4 } },
  { batch: "BAT-005", animalId: "AN-105", date: "2026-03-19", animalWeight: 175, totalWeight: 105, usableMeat: 78, wastagePercent: 25.7, status: "Slaughtered", cost: 15000, rate: 150, farmLocation: "Farm E", head: 7, ribs: 40, ham: 51, offals: 7, pkgItems: { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 } },
  { batch: "BAT-006", animalId: "AN-106", date: "2026-03-20", animalWeight: 130, totalWeight: "-", usableMeat: "-", wastagePercent: "-", status: "Unslaughtered", cost: 12500, rate: 125, farmLocation: "Farm G", head: 0, ribs: 0, ham: 0, offals: 0, pkgItems: { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 } },
];

const defaultPackaging = [
  { name: "Bone", price: 350 },
  { name: "Boneless", price: 400 },
  { name: "Mixed", price: 380 },
  { name: "Skin", price: 50 },
  { name: "Meat", price: 450 },
];

export default function Dressing() {
  const { toast } = useToast();
  const [records, setRecordsState] = useState(() => {
    try {
      const stored = localStorage.getItem("pinaka_dressing_records");
      return stored ? JSON.parse(stored) : initialRecords;
    } catch {
      return initialRecords;
    }
  });

  const setRecords = (newRecs: any[]) => {
    setRecordsState(newRecs);
    localStorage.setItem("pinaka_dressing_records", JSON.stringify(newRecs));
  };

  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const handleEditClick = (r: any) => {
    setEditingBatch(r.batch);
    setEditForm({ ...r, pkgItems: r.pkgItems || { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 } });
  };

  const handleEditField = (field: string, val: any) => {
    const next = { ...editForm, [field]: val };
    if (['head', 'ribs', 'ham', 'offals'].includes(field)) {
        const hc = Number(next.head) || 0;
        const rc = Number(next.ribs) || 0;
        const hmc = Number(next.ham) || 0;
        const oc = Number(next.offals) || 0;
        const tCarcass = hc + rc + hmc + oc;
        const wst = hc + oc;
        const wstPct = tCarcass > 0 ? ((wst / tCarcass) * 100).toFixed(1) : "0";
        next.totalWeight = tCarcass;
        next.usableMeat = tCarcass - wst;
        next.wastagePercent = Number(wstPct);
    }
    if (['animalWeight', 'rate'].includes(field)) {
        next.cost = Math.round((Number(next.animalWeight) || 0) * (Number(next.rate) || 0));
    }
    setEditForm(next);
  };

  const handleEditPkg = (item: string, val: any) => {
    setEditForm({
        ...editForm,
        pkgItems: {
          ...editForm.pkgItems,
          [item]: Number(val) || 0
        }
    });
  };

  const handleEditSave = () => {
    const updatedRecords = records.map(r => r.batch === editingBatch ? editForm : r);
    setRecords(updatedRecords);

    if (editForm.status === "Packed") {
        try {
          const existingInv = JSON.parse(localStorage.getItem("pinaka_main_inventory") || "[]");
          const invIndex = existingInv.findIndex((i:any) => i.batch === editingBatch);
          const totalWt = Object.values(editForm.pkgItems).reduce((sum:any, val:any) => sum + Number(val), 0);
          const grandTotal = editForm.pkgItems.bone * 350 + editForm.pkgItems.boneless * 400 + editForm.pkgItems.mixed * 380 + editForm.pkgItems.skin * 50 + editForm.pkgItems.meat * 450;
          
          const updatedInvItem = {
            batch: editForm.batch,
            date: editForm.date,
            bone: editForm.pkgItems.bone,
            boneless: editForm.pkgItems.boneless,
            mixed: editForm.pkgItems.mixed,
            skin: editForm.pkgItems.skin,
            meat: editForm.pkgItems.meat,
            totalWeight: totalWt,
            totalAmount: grandTotal,
            status: "Available"
          };

          if (invIndex >= 0) {
              existingInv[invIndex] = { ...existingInv[invIndex], ...updatedInvItem };
          } else {
              existingInv.unshift(updatedInvItem);
          }
          localStorage.setItem("pinaka_main_inventory", JSON.stringify(existingInv));
        } catch (e) {
            console.error(e);
        }
    }

    toast({ title: "Updated", description: "Record updated successfully!" });
    setEditingBatch(null);
  };

  // Before slaughter form
  const [animalId, setAnimalId] = useState("");
  const [animalWeight, setAnimalWeight] = useState("");
  const [rate, setRate] = useState("");
  const [cost, setCost] = useState("");
  const [farmLocation, setFarmLocation] = useState("");

  const handleWeightChange = (val: string) => {
    setAnimalWeight(val);
    if (rate && val) {
      setCost(Math.round(Number(rate) * Number(val)).toString());
    }
  };

  const handleRateChange = (val: string) => {
    setRate(val);
    if (val && animalWeight) {
      setCost(Math.round(Number(val) * Number(animalWeight)).toString());
    }
  };

  // After slaughter form
  const [linkedAnimal, setLinkedAnimal] = useState("");
  const [head, setHead] = useState("");
  const [ribs, setRibs] = useState("");
  const [ham, setHam] = useState("");
  const [offals, setOffals] = useState("");
  const [packagingBatch, setPackagingBatch] = useState<string | null>(null);

  // Packaging
  const [pkgItems, setPkgItems] = useState(
    defaultPackaging.map(p => ({ qty: 0, price: p.price }))
  );

  const totalCarcass = (Number(head) || 0) + (Number(ribs) || 0) + (Number(ham) || 0) + (Number(offals) || 0);
  const wastage = (Number(head) || 0) + (Number(offals) || 0);
  const wastagePercent = totalCarcass > 0 ? ((wastage / totalCarcass) * 100).toFixed(1) : "0";
  const usableMeat = totalCarcass - wastage;

  const selectedRecord: any = records.find(r => r.animalId === linkedAnimal);
  const totalCost = selectedRecord?.cost || 0;
  const costPerKg = (totalCost > 0 && usableMeat > 0) ? (totalCost / usableMeat).toFixed(2) : "0.00";

  const nextBatch = `BAT-${String(records.length + 1).padStart(3, "0")}`;

  const handleSaveBefore = () => {
    if (!animalId || !animalWeight) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    const newRecord = {
      batch: nextBatch,
      animalId,
      date: new Date().toISOString().split("T")[0],
      animalWeight: Number(animalWeight) || 0,
      totalWeight: "-",
      usableMeat: "-",
      wastagePercent: "-",
      status: "Unslaughtered",
      cost: Number(cost) || 0,
      rate: Number(rate) || 0,
      farmLocation,
      head: 0, ribs: 0, ham: 0, offals: 0,
      pkgItems: { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 },
    };
    setRecords([newRecord, ...records]);

    toast({ title: "Saved", description: `Animal ${animalId} recorded successfully` });
    setAnimalId("");
    setAnimalWeight("");
    setRate("");
    setCost("");
    setFarmLocation("");
  };

  const handleSaveAfter = () => {
    if (!linkedAnimal || totalCarcass === 0) {
      toast({ title: "Error", description: "Fill all weight fields", variant: "destructive" });
      return;
    }
    const existingRecIndex = records.findIndex(r => r.animalId === linkedAnimal && r.status === "Unslaughtered");
    
    let targetBatch = nextBatch;
    if (existingRecIndex !== -1) {
      const updatedRecords = [...records];
      targetBatch = updatedRecords[existingRecIndex].batch;
      updatedRecords[existingRecIndex] = {
        ...updatedRecords[existingRecIndex],
        totalWeight: totalCarcass,
        usableMeat,
        wastagePercent: Number(wastagePercent),
        status: "Slaughtered",
        head: Number(head) || 0,
        ribs: Number(ribs) || 0,
        ham: Number(ham) || 0,
        offals: Number(offals) || 0,
      };
      setRecords(updatedRecords);
    } else {
      const newRecord = {
        batch: nextBatch,
        animalId: linkedAnimal,
        date: new Date().toISOString().split("T")[0],
        animalWeight: 0,
        totalWeight: totalCarcass,
        usableMeat,
        wastagePercent: Number(wastagePercent),
        status: "Slaughtered",
        cost: totalCost,
        rate: 0,
        farmLocation: "",
        head: Number(head) || 0,
        ribs: Number(ribs) || 0,
        ham: Number(ham) || 0,
        offals: Number(offals) || 0,
        pkgItems: { bone: 0, boneless: 0, mixed: 0, skin: 0, meat: 0 },
      };
      setRecords([newRecord, ...records]);
    }
    
    toast({ title: "Saved", description: `After slaughter data saved for ${targetBatch}` });

    // Clear fields
    setLinkedAnimal("");
    setHead("");
    setRibs("");
    setHam("");
    setOffals("");
  };

  const handleMoveToInventory = () => {
    if (packagingBatch) {
      setRecords(records.map(r => r.batch === packagingBatch ? { 
         ...r, 
         status: "Packed",
         pkgItems: {
            bone: pkgItems[0].qty,
            boneless: pkgItems[1].qty,
            mixed: pkgItems[2].qty,
            skin: pkgItems[3].qty,
            meat: pkgItems[4].qty,
         }
      } : r));
      
      const totalWt = pkgItems.reduce((sum, item) => sum + item.qty, 0);
      const grandTotal = pkgItems.reduce((sum, item) => sum + item.qty * item.price, 0);
      
      const packagingData = {
        batch: packagingBatch,
        date: new Date().toISOString().split("T")[0],
        bone: pkgItems[0].qty,
        boneless: pkgItems[1].qty,
        mixed: pkgItems[2].qty,
        skin: pkgItems[3].qty,
        meat: pkgItems[4].qty,
        total_weight: totalWt,
        total_amount: grandTotal,
        totalWeight: totalWt,
        totalAmount: grandTotal,
        status: "Available"
      };

      console.log(packagingData);

      try {
        const existingInv = JSON.parse(localStorage.getItem("pinaka_main_inventory") || "[]");
        existingInv.unshift(packagingData);
        localStorage.setItem("pinaka_main_inventory", JSON.stringify(existingInv));
      } catch (e) {
         console.error(e);
      }

      toast({ title: "Moved to Inventory", description: "All packets added to inventory successfully!" });
      setPackagingBatch(null);
      setPkgItems(defaultPackaging.map(p => ({ qty: 0, price: p.price })));
      setLinkedAnimal("");
      setHead("");
      setRibs("");
      setHam("");
      setOffals("");
    }
  };

  const handleSavePackaging = () => {
    if (packagingBatch) {
      setRecords(records.map(r => r.batch === packagingBatch ? { 
         ...r, 
         status: r.status === "Slaughtered" ? "Packed" : r.status,
         pkgItems: {
            bone: pkgItems[0].qty,
            boneless: pkgItems[1].qty,
            mixed: pkgItems[2].qty,
            skin: pkgItems[3].qty,
            meat: pkgItems[4].qty,
         }
      } : r));
      toast({ title: "Packaging Saved", description: `Packaging data saved for ${packagingBatch}` });
      setPackagingBatch(null);
      setPkgItems(defaultPackaging.map(p => ({ qty: 0, price: p.price })));
    }
  };

  const handleDelete = (batch: string) => {
    const rec = records.find(r => r.batch === batch);
    setRecords(records.filter((r) => r.batch !== batch));
    if (rec && rec.status === "Packed") {
       try {
         const existingInv = JSON.parse(localStorage.getItem("pinaka_main_inventory") || "[]");
         const filteredInv = existingInv.filter((i:any) => i.batch !== batch);
         localStorage.setItem("pinaka_main_inventory", JSON.stringify(filteredInv));
       } catch (e) {}
    }
    toast({ title: "Deleted", description: `Record ${batch} deleted` });
  };

  const grandTotal = pkgItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const animalOptions = Array.from(new Set([
    ...records.filter(r => r.status === "Unslaughtered").map(r => r.animalId),
    "AN-101", "AN-102", "AN-103", "AN-104", "AN-105", "AN-106"
  ]));

  return (
    <div className="animate-fade-in pb-12 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Breadcrumb items={[{ label: "Dressing" }]} />
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Dressing Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage before and after slaughter processes and yields.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Before Slaughter */}
        <div className="rounded-sm border bg-card p-6 shadow-none">
          <h2 className="text-lg font-semibold mb-4">Before Slaughter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Animal ID</Label><Input value={animalId} onChange={(e) => setAnimalId(e.target.value)} placeholder="AN-106" /></div>
            <div><Label>Animal Weight (kg)</Label><Input type="number" value={animalWeight} onChange={(e) => handleWeightChange(e.target.value)} placeholder="85" /></div>
            <div><Label>Rate per kg (₹)</Label><Input type="number" value={rate} onChange={(e) => handleRateChange(e.target.value)} placeholder="140" /></div>
            <div><Label>Total Cost (₹)</Label><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="11900" /></div>
            <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
            <div><Label>Farm Location</Label><Input value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} placeholder="Village Farm" /></div>
          </div>
          <Button className="mt-4" onClick={handleSaveBefore}>Save</Button>
        </div>

        {/* After Slaughter */}
        <div className="rounded-sm border bg-card p-6 shadow-none">
          <h2 className="text-lg font-semibold mb-4">After Slaughter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Batch Number (Auto)</Label>
              <Input value={nextBatch} disabled />
            </div>
            <div>
              <div className="flex flex-wrap justify-between items-center mb-1 gap-1">
                <Label>Link to Animal ID</Label>
                {linkedAnimal && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {linkedAnimal} / {selectedRecord?.animalWeight ? `${selectedRecord.animalWeight} kg` : "N/A"}
                  </span>
                )}
              </div>
              <select
                className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
                value={linkedAnimal}
                onChange={(e) => setLinkedAnimal(e.target.value)}
              >
                <option value="" className="bg-background text-foreground">Select Animal</option>
                {animalOptions.map((a) => (
                  <option key={a} value={a} className="bg-background text-foreground">{a}</option>
                ))}
              </select>
            </div>
            <div><Label>Head (kg)</Label><Input type="number" value={head} onChange={(e) => setHead(e.target.value)} /></div>
            <div><Label>Ribs (kg)</Label><Input type="number" value={ribs} onChange={(e) => setRibs(e.target.value)} /></div>
            <div><Label>Ham (kg)</Label><Input type="number" value={ham} onChange={(e) => setHam(e.target.value)} /></div>
            <div><Label>Offals (kg)</Label><Input type="number" value={offals} onChange={(e) => setOffals(e.target.value)} /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-secondary rounded-sm p-2"><span className="text-muted-foreground">Total:</span> <strong>{totalCarcass} kg</strong></div>
            <div className="bg-secondary rounded-sm p-2"><span className="text-muted-foreground">Wastage:</span> <strong>{wastage} kg</strong></div>
            <div className="bg-secondary rounded-sm p-2"><span className="text-muted-foreground">Wastage %:</span> <strong>{wastagePercent}%</strong></div>
            <div className="bg-secondary rounded-sm p-2"><span className="text-muted-foreground">Usable:</span> <strong>{usableMeat} kg</strong></div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-2">
              <span className="text-muted-foreground">Total Amount:</span> <strong className="text-primary">₹{totalCost.toLocaleString("en-IN")}</strong>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-2">
              <span className="text-muted-foreground">Cost per kg:</span> <strong className="text-primary">₹{costPerKg}/kg</strong>
            </div>
          </div>
          <Button className="mt-4" onClick={handleSaveAfter}>Save</Button>
        </div>
      </div>

      {/* Packaging */}
      {packagingBatch && (
        <div className="rounded-sm border bg-card p-6 shadow-none mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setPackagingBatch(null)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold m-0">Packaging — Batch [{packagingBatch}]</h2>
            </div>
            
            <div className="bg-primary/15 text-primary border border-primary/30 px-5 py-2.5 rounded-sm shadow-none font-bold text-sm tracking-wide self-start sm:self-auto">
              Usable Meat: {(() => {
                const pRec = records.find(r => r.batch === packagingBatch);
                return pRec?.usableMeat && pRec.usableMeat !== "-" ? `${pRec.usableMeat} kg` : "N/A";
              })()}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {defaultPackaging.map((p, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-stripe" : ""}`}>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-20"
                        value={pkgItems[i].qty || ""}
                        onChange={(e) => {
                          const next = [...pkgItems];
                          next[i] = { ...next[i], qty: Number(e.target.value) || 0 };
                          setPkgItems(next);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          className="w-20 inline-flex"
                          value={pkgItems[i].price || ""}
                          onChange={(e) => {
                            const next = [...pkgItems];
                            next[i] = { ...next[i], price: Number(e.target.value) || 0 };
                            setPkgItems(next);
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{pkgItems[i].qty * pkgItems[i].price}</td>
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
            <Button onClick={handleMoveToInventory} className="bg-primary hover:bg-primary/80 text-white">Move to Inventory</Button>
            <Button variant="outline" onClick={handleSavePackaging} className="border-primary text-primary hover:bg-primary hover:text-white">Save Packaging</Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingBatch} onOpenChange={(open) => !open && setEditingBatch(null)}>
        <DialogContent className="w-full max-w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record — {editingBatch}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-6">
              {/* Before Slaughter */}
              <div className="border rounded-sm p-4 bg-muted/20">
                <h3 className="font-medium mb-3">Before Slaughter</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><Label>Animal ID</Label><Input value={editForm.animalId || ""} onChange={(e) => handleEditField("animalId", e.target.value)} /></div>
                  <div><Label>Date</Label><Input type="date" value={editForm.date || ""} onChange={(e) => handleEditField("date", e.target.value)} /></div>
                  <div><Label>Farm Location</Label><Input value={editForm.farmLocation || ""} onChange={(e) => handleEditField("farmLocation", e.target.value)} /></div>
                  <div><Label>Animal Weight</Label><Input type="number" value={editForm.animalWeight || ""} onChange={(e) => handleEditField("animalWeight", e.target.value)} /></div>
                  <div><Label>Rate</Label><Input type="number" value={editForm.rate || ""} onChange={(e) => handleEditField("rate", e.target.value)} /></div>
                  <div><Label>Total Cost</Label><Input type="number" value={editForm.cost || ""} onChange={(e) => handleEditField("cost", e.target.value)} /></div>
                </div>
              </div>

              {/* After Slaughter */}
              <div className="border rounded-sm p-4 bg-muted/20">
                <h3 className="font-medium mb-3">After Slaughter</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><Label>Head (kg)</Label><Input type="number" value={editForm.head || ""} onChange={(e) => handleEditField("head", e.target.value)} /></div>
                  <div><Label>Ribs (kg)</Label><Input type="number" value={editForm.ribs || ""} onChange={(e) => handleEditField("ribs", e.target.value)} /></div>
                  <div><Label>Ham (kg)</Label><Input type="number" value={editForm.ham || ""} onChange={(e) => handleEditField("ham", e.target.value)} /></div>
                  <div><Label>Offals (kg)</Label><Input type="number" value={editForm.offals || ""} onChange={(e) => handleEditField("offals", e.target.value)} /></div>
                </div>
                <div className="mt-3 flex gap-4 text-sm text-muted-foreground bg-background p-2 rounded">
                  <span>Total: <strong className="text-foreground">{editForm.totalWeight} kg</strong></span>
                  <span>Usable: <strong className="text-foreground">{editForm.usableMeat} kg</strong></span>
                  <span>Wastage %: <strong className="text-foreground">{editForm.wastagePercent}%</strong></span>
                </div>
              </div>

              {/* Packaging */}
              <div className="border rounded-sm p-4 bg-muted/20">
                <h3 className="font-medium mb-3">Packaging</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div><Label>Bone (kg)</Label><Input type="number" value={editForm.pkgItems?.bone || ""} onChange={(e) => handleEditPkg("bone", e.target.value)} /></div>
                  <div><Label>Boneless (kg)</Label><Input type="number" value={editForm.pkgItems?.boneless || ""} onChange={(e) => handleEditPkg("boneless", e.target.value)} /></div>
                  <div><Label>Mixed (kg)</Label><Input type="number" value={editForm.pkgItems?.mixed || ""} onChange={(e) => handleEditPkg("mixed", e.target.value)} /></div>
                  <div><Label>Skin (kg)</Label><Input type="number" value={editForm.pkgItems?.skin || ""} onChange={(e) => handleEditPkg("skin", e.target.value)} /></div>
                  <div><Label>Meat (kg)</Label><Input type="number" value={editForm.pkgItems?.meat || ""} onChange={(e) => handleEditPkg("meat", e.target.value)} /></div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Label>Status:</Label>
                <select className="h-9 rounded-sm border text-sm px-2 bg-background" value={editForm.status} onChange={(e) => handleEditField("status", e.target.value)}>
                   <option value="Unslaughtered" className="bg-background text-foreground">Unslaughtered</option>
                   <option value="Slaughtered" className="bg-background text-foreground">Slaughtered</option>
                   <option value="Packed" className="bg-background text-foreground">Packed</option>
                </select>
              </div>

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBatch(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/80" onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Records */}
      <div className="rounded-sm border bg-card p-6 shadow-none">
        <h2 className="text-lg font-semibold mb-4">Dressing Records</h2>
        <DataTable
          columns={[
            { header: "Batch", accessor: "batch" },
            { header: "Animal ID", accessor: "animalId" },
            { header: "Date", accessor: "date" },
            { header: "Total Weight", accessor: (r) => r.status === "Unslaughtered" ? `${r.animalWeight || "-"} kg` : `${r.totalWeight} kg` },
            { header: "Usable Meat", accessor: (r) => r.usableMeat === "-" ? "-" : `${r.usableMeat} kg` },
            { header: "Wastage %", accessor: (r) => r.wastagePercent === "-" ? "-" : `${r.wastagePercent}%` },
            { header: "Total Cost", accessor: (r) => r.cost ? `₹${r.cost.toLocaleString("en-IN")}` : "-" },
            { header: "Price/kg (Live/Meat)", accessor: (r) => {
               if (!r.cost) return "-";
               const live = r.animalWeight ? (r.cost / r.animalWeight).toFixed(0) : "0";
               const meat = r.usableMeat !== "-" ? (r.cost / Number(r.usableMeat)).toFixed(0) : "0";
               return r.status === "Unslaughtered" ? `₹${live} (L)` : `₹${live} (L) / ₹${meat} (M)`;
            }},
            { header: "Status", accessor: (r) => {
              let colorClass = "bg-secondary text-secondary-foreground";
              if (r.status === "Packed") colorClass = "badge-success";
              else if (r.status === "Slaughtered") colorClass = "badge-warning";
              else if (r.status === "Unslaughtered") colorClass = "badge-error";

              return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                  {r.status}
                </span>
              );
            }},
            { header: "Action", accessor: (r) => (
              <div className="flex gap-1 items-center">
                {r.status === "Slaughtered" && (
                  <Button variant="outline" size="sm" className="h-8 text-xs border-primary text-primary hover:bg-primary hover:text-white mr-2" onClick={() => setPackagingBatch(r.batch)}>
                    Packaging
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleEditClick(r)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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
