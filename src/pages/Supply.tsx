import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

const initialInventoryIn = [
  { batch: "BAT-001", date: "2026-03-15", bone: 25, boneless: 20, mixed: 15, skin: 10, meat: 10, totalWeight: 80, totalAmount: 25000, status: "Available" },
  { batch: "BAT-002", date: "2026-03-16", bone: 30, boneless: 25, mixed: 20, skin: 15, meat: 10, totalWeight: 100, totalAmount: 30000, status: "Available" },
  { batch: "BAT-004", date: "2026-03-18", bone: 35, boneless: 30, mixed: 25, skin: 20, meat: 15, totalWeight: 125, totalAmount: 38000, status: "Available" },
];

const initialRecords = [
  { date: "2026-03-15", shopNo: "Shop 1", batch: "BAT-001", mixed: 10, bone: 15, boneless: 12, total: 37, totalAmount: 11000, extra: 0 },
  { date: "2026-03-16", shopNo: "Shop 2", batch: "BAT-002", mixed: 8, bone: 20, boneless: 10, total: 38, totalAmount: 11600, extra: 0 },
  { date: "2026-03-17", shopNo: "Others (John Doe)", batch: "BAT-003", mixed: 12, bone: 18, boneless: 14, total: 44, totalAmount: 13600, extra: 200 },
];

export default function Supply() {
  const { toast } = useToast();
  const [inventoryIn, setInventoryIn] = useState(() => {
    try {
      const stored = localStorage.getItem("pinaka_main_inventory");
      return stored ? JSON.parse(stored) : initialInventoryIn;
    } catch {
      return initialInventoryIn;
    }
  });
  const [records, setRecordsState] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("pinaka_inventory_out");
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialRecords;
  });

  const setRecords = (newRecords: any[]) => {
    setRecordsState(newRecords);
    localStorage.setItem("pinaka_inventory_out", JSON.stringify(newRecords));
  };

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [shopsList, setShopsList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("pinaka_shops_list");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: "shop1", name: "Palipattu Shop" },
      { id: "shop2", name: "Tirupati Shop" },
      { id: "shop3", name: "Goa Beach Shop" }
    ];
  });
  
  const [shopNo, setShopNo] = useState("");
  const [otherName, setOtherName] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [pendingSupply, setPendingSupply] = useState<any>(null);

  const [batch, setBatch] = useState("");
  const [mixed, setMixed] = useState("");
  const [bone, setBone] = useState("");
  const [boneless, setBoneless] = useState("");
  const [extra, setExtra] = useState("");

  const total = (Number(mixed) || 0) + (Number(bone) || 0) + (Number(boneless) || 0);

  // Fallback prices if we can't retrieve them
  const defaultPrices = { bone: 350, boneless: 400, mixed: 380 };
  const nMixed = Number(mixed) || 0;
  const nBone = Number(bone) || 0;
  const nBoneless = Number(boneless) || 0;
  const nExtra = Number(extra) || 0;
  
  const calculatedTotalAmount = (nMixed * defaultPrices.mixed) + (nBone * defaultPrices.bone) + (nBoneless * defaultPrices.boneless);
  const finalTotalAmount = calculatedTotalAmount + nExtra;

  const handleSave = (overrideFlag = false) => {
    if (!shopNo || !batch) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    if (shopNo === "Others" && (!otherName || !otherAddress)) {
      toast({ title: "Error", description: "Fill exact shop name and address for Others", variant: "destructive" });
      return;
    }

    const currentTotal = Number((nMixed + nBone + nBoneless).toFixed(2));

    if (currentTotal === 0) {
      toast({ title: "Error", description: "Enter at least one quantity to supply", variant: "destructive" });
      return;
    }

    const invItemIndex = inventoryIn.findIndex(item => item.batch === batch);
    if (invItemIndex !== -1) {
      const invItem = inventoryIn[invItemIndex];
      
      const required_bone = Number((nBone + (nMixed * 0.3)).toFixed(2));
      const required_boneless = nBoneless;
      const calculated_meat = Number((nMixed * 0.3).toFixed(2));
      const calculated_skin = Number((nMixed * 0.4).toFixed(2));

      const available_bone = invItem.bone || 0;
      const available_boneless = invItem.boneless || 0;
      const available_meat = invItem.meat || 0;
      const available_skin = invItem.skin || 0;

      if (!overrideFlag) {
        if (
          available_bone < required_bone || 
          available_boneless < required_boneless ||
          available_meat < calculated_meat || 
          available_skin < calculated_skin
        ) {
          setPendingSupply({ nMixed, nBone, nBoneless, nExtra, currentTotal, required_bone, calculated_meat, calculated_skin, invItemIndex });
          setShowOverrideModal(true);
          return;
        }
      }

      executeSupplyFinal(overrideFlag, nMixed, nBone, nBoneless, nExtra, currentTotal, required_bone, calculated_meat, calculated_skin, invItemIndex);
    } else {
       toast({ title: "Error", description: "Selected batch not found in Inventory", variant: "destructive" });
    }
  };

  const executeSupplyFinal = (
    overrideFlag: boolean,
    nMixed: number,
    nBone: number,
    nBoneless: number,
    nExtra: number,
    currentTotal: number,
    required_bone: number,
    calculated_meat: number,
    calculated_skin: number,
    invItemIndex: number
  ) => {
    const invItem = inventoryIn[invItemIndex];
    // Decrement stock
    const updatedInventoryIn = [...inventoryIn];
    updatedInventoryIn[invItemIndex] = {
      ...invItem,
      mixed: Number((invItem.mixed - nMixed).toFixed(2)),
      boneless: Number((invItem.boneless - nBoneless).toFixed(2)),
      bone: Number((invItem.bone - required_bone).toFixed(2)),
      meat: Number(((invItem.meat || 0) - calculated_meat).toFixed(2)),
      skin: Number(((invItem.skin || 0) - calculated_skin).toFixed(2)),
      totalWeight: Number(((invItem.totalWeight || invItem.total || 0) - currentTotal).toFixed(2)),
    };
    setInventoryIn(updatedInventoryIn);
    localStorage.setItem("pinaka_main_inventory", JSON.stringify(updatedInventoryIn));

    const selectedShopObj = shopsList.find(s => s.id === shopNo);
    const finalShopName = shopNo === "Others" ? `Others (${otherName} - ${otherAddress})` : (selectedShopObj ? selectedShopObj.name : shopNo);

    // Re-calculate the grand total amount based on latest extra, mixed, bone, boneless
    const calculatedTotalAmount = (nMixed * defaultPrices.mixed) + (nBone * defaultPrices.bone) + (nBoneless * defaultPrices.boneless);
    const finalTotalAmount = calculatedTotalAmount + nExtra;

    const finalRecord = {
      id: editingRecordId || Date.now().toString(),
      date: new Date().toISOString().split("T")[0], 
      shopNo: finalShopName, 
      batch, 
      mixed: nMixed, 
      bone: nBone, 
      boneless: nBoneless, 
      total: currentTotal,
      totalAmount: finalTotalAmount,
      extra: nExtra,
      override_flag: overrideFlag,
      calculated_skin,
      calculated_meat
    };

    if (editingRecordId) {
       setRecords(records.map(r => r.id === editingRecordId ? finalRecord : r));
       setEditingRecordId(null);
       toast({ title: "Updated", description: "Supply record updated." });
    } else {
       setRecords([finalRecord, ...records]);
       toast({ title: "Saved", description: "Supply record added and synced to exact shop!" });
    }

    // Push or Update Shop Inventory In
    if (shopNo !== "Others") {
      try {
        const shopInvKey = `pinaka_shop_inventory_in_${shopNo}`;
        let existingShopInventory = JSON.parse(localStorage.getItem(shopInvKey) || "[]");
        
        const invEntry = {
          id: finalRecord.id, // match ID
          date: finalRecord.date,
          batch: finalRecord.batch,
          transport: "Internal Supply",
          bone: finalRecord.bone,
          boneless: finalRecord.boneless,
          mixed: finalRecord.mixed,
          skin: Number(((finalRecord.bone * 0.4) + (finalRecord.boneless * 0.5) + (finalRecord.mixed * 0.4)).toFixed(2)),
          meat: Number(((finalRecord.bone * 0.3) + (finalRecord.boneless * 0.5) + (finalRecord.mixed * 0.3)).toFixed(2)),
          rate: 0,
          total_weight: finalRecord.total,
          total_amount: finalRecord.totalAmount,
        };

        if (editingRecordId) {
          existingShopInventory = existingShopInventory.map((item: any) => item.id === editingRecordId ? { ...item, ...invEntry } : item);
        } else {
          existingShopInventory.unshift(invEntry);
        }
        
        localStorage.setItem(shopInvKey, JSON.stringify(existingShopInventory));
      } catch (e) {
        console.error(e);
      }
    }

    setShopNo(""); setBatch(""); setMixed(""); setBone(""); setBoneless(""); setExtra(""); setOtherName(""); setOtherAddress("");
  };

  const startEditOut = (r: any) => {
    setEditingRecordId(r.id);
    // Find if shopNo is in list
    const foundShop = shopsList.find(s => s.name === r.shopNo || s.id === r.shopNo);
    if (foundShop) {
      setShopNo(foundShop.id);
    } else if (r.shopNo.startsWith("Others")) {
      setShopNo("Others");
      // Try parsing Others (name - address) roughly
      const match = r.shopNo.match(/Others \((.*) - (.*)\)/);
      if (match) {
        setOtherName(match[1]);
        setOtherAddress(match[2]);
      }
    }
    setBatch(r.batch);
    setMixed(r.mixed.toString());
    setBone(r.bone.toString());
    setBoneless(r.boneless.toString());
    setExtra((r.extra || "").toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteOut = (r: any) => {
    setRecords(records.filter(x => x.id !== r.id && x !== r)); // r.id or reference fallback
    toast({ title: "Deleted", description: "Supply record deleted." });

    // Try to delete from the specific shop if possible
    const shopToUpdate = shopsList.find(s => s.name === r.shopNo || s.id === r.shopNo);
    // If we have an id matching, or if we can guess the shop ID from the name
    const targetShopId = shopToUpdate ? shopToUpdate.id : null;
    if (targetShopId) {
      try {
        const shopInvKey = `pinaka_shop_inventory_in_${targetShopId}`;
        let existingShopInventory = JSON.parse(localStorage.getItem(shopInvKey) || "[]");
        existingShopInventory = existingShopInventory.filter((item: any) => item.id !== (r.id || ""));
        localStorage.setItem(shopInvKey, JSON.stringify(existingShopInventory));
      } catch (e) {}
    }
  };

  return (
    <div className="animate-fade-in pb-12 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Breadcrumb items={[{ label: "Inventory & Supply" }]} />
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Inventory & Supply Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage and distribute inventory stock to all retail shops.</p>
        </div>
      </div>

      <div className="rounded-sm border bg-card p-6 shadow-none mb-8">
        <h2 className="text-lg font-semibold mb-4">Inventory In (Packed Meat)</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Batch", accessor: "batch" },
            { header: "Bone (kg)", accessor: "bone" },
            { header: "Boneless (kg)", accessor: "boneless" },
            { header: "Mixed (kg)", accessor: "mixed" },
            { header: "Skin (kg)", accessor: (r) => r.skin || 0 },
            { header: "Meat (kg)", accessor: (r) => r.meat || 0 },
            { header: "Total Weight (kg)", accessor: (r) => r.totalWeight || r.total_weight || r.total || 0 },
            { header: "Total Amount (₹)", accessor: (r) => (r.totalAmount || r.total_amount) ? `₹${(r.totalAmount || r.total_amount).toLocaleString("en-IN")}` : "-" },
            { header: "Status", accessor: (r) => {
              const weight = r.totalWeight || r.total || 0;
              return (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                weight > 0 ? "badge-success" : "bg-muted text-muted-foreground"
              }`}>
                {weight > 0 ? "Available" : "Empty"}
              </span>
            )}},
          ]}
          data={inventoryIn}
        />
      </div>

      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <div className="bg-background rounded-sm shadow-none border w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-2">Insufficient Inventory</h3>
            <p className="text-muted-foreground mb-6">
              Insufficient inventory based on composition breakdown (Skin/Meat/Bone requirements exceed available stock).
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowOverrideModal(false)}>
                Stop
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/80" 
                onClick={() => {
                  setShowOverrideModal(false);
                  if (pendingSupply) {
                    executeSupplyFinal(
                      true, 
                      pendingSupply.nMixed, 
                      pendingSupply.nBone, 
                      pendingSupply.nBoneless, 
                      pendingSupply.nExtra, 
                      pendingSupply.currentTotal,
                      pendingSupply.required_bone,
                      pendingSupply.calculated_meat,
                      pendingSupply.calculated_skin,
                      pendingSupply.invItemIndex
                    );
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-sm border bg-card p-6 shadow-none mb-8">
        <h2 className="text-lg font-semibold mb-4">Record Supply (To Shop)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Shop Number</Label>
            <select className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" value={shopNo} onChange={(e) => setShopNo(e.target.value)}>
              <option value="" className="bg-background text-foreground">Select Shop</option>
              {shopsList.map((s) => (
                <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>
              ))}
              <option value="Others" className="bg-background text-foreground">Others</option>
            </select>
          </div>
          {shopNo === "Others" && (
            <>
              <div><Label>Shop Name</Label><Input value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="Enter shop name" /></div>
              <div><Label>Address</Label><Input value={otherAddress} onChange={(e) => setOtherAddress(e.target.value)} placeholder="Enter full address" /></div>
            </>
          )}
          <div>
            <Label>Batch Number</Label>
            <select className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="" className="bg-background text-foreground">Select Batch</option>
              {inventoryIn.filter(inv => (inv.totalWeight || inv.total || 0) > 0).map(inv => <option key={inv.batch} value={inv.batch} className="bg-background text-foreground">{inv.batch}</option>)}
              {/* Optional unlinked batches can be hidden or removed now that we pull from inventoryIn */}
            </select>
          </div>
          <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
          <div><Label>Mixed (kg)</Label><Input type="number" value={mixed} onChange={(e) => setMixed(e.target.value)} /></div>
          <div><Label>Bone (kg)</Label><Input type="number" value={bone} onChange={(e) => setBone(e.target.value)} /></div>
          <div><Label>Boneless (kg)</Label><Input type="number" value={boneless} onChange={(e) => setBoneless(e.target.value)} /></div>
          <div><Label>Extra Money (₹)</Label><Input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Optional" /></div>
        </div>
        
        <div className="mt-4 p-4 bg-muted/30 border rounded-sm">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span>Calculated Amount by Packaging:</span>
            <span>₹{calculatedTotalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-sm">
            <span>Extra Money:</span>
            <span>₹{nExtra.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg border-t pt-2 border-border/50">
            <span>Total Weight: {total} kg</span>
            <span>Total Amount: ₹{finalTotalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="bg-primary hover:bg-primary/80 text-primary-foreground tracking-wide flex-1" onClick={() => handleSave(false)}>
            {editingRecordId ? "Update Record" : "Supply to Shop / Sync to Shop Inventory"}
          </Button>
          {editingRecordId && (
            <Button variant="outline" className="flex-1 text-muted-foreground hover:bg-accent" onClick={() => {
              setEditingRecordId(null);
              setShopNo(""); setBatch(""); setMixed(""); setBone(""); setBoneless(""); setExtra("");
            }}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-sm border bg-card p-6 shadow-none">
        <h2 className="text-lg font-semibold mb-4">Inventory Out</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Shop No", accessor: "shopNo" },
            { header: "Batch", accessor: "batch" },
            { header: "Bone (kg)", accessor: (r) => `${r.bone}` },
            { header: "Boneless (kg)", accessor: (r) => `${r.boneless}` },
            { header: "Mixed (kg)", accessor: (r) => `${r.mixed}` },
            { header: "Total Wt.", accessor: (r) => `${r.total} kg` },
            { header: "Calculated Amount", accessor: (r) => `₹${(r.totalAmount - (r.extra || 0)).toLocaleString("en-IN")}` },
            { header: "Extra (₹)", accessor: (r) => r.extra ? `+₹${r.extra}` : "-" },
            { header: "Grand Total", accessor: (r) => <span className="font-bold text-primary">₹{r.totalAmount.toLocaleString("en-IN")}</span> },
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditOut(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteOut(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={records}
        />
      </div>
    </div>
  );
}
