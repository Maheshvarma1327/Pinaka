import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CookingPot, Trash2 } from "lucide-react";
import DataTable from "@/components/DataTable";

export default function Preparation() {
  const { toast } = useToast();
  const params = useParams();
  const id = params.id;
  
  // Storage binding to exactly match InventoryOut.tsx
  const storageKey = `pinaka_shop_inventory_out_${id}`;
  const invInKey = `pinaka_shop_inventory_in_${id}`;
  
  const [records, setRecords] = useState<any[]>(() => {
    try { const d = localStorage.getItem(storageKey); return d ? JSON.parse(d) : []; } catch { return []; }
  });

  const [boneFry, setBoneFry] = useState("");
  const [bonelessFry, setBonelessFry] = useState("");
  const [boneCurry, setBoneCurry] = useState("");
  const [bonelessCurry, setBonelessCurry] = useState("");
  const [fryOutput, setFryOutput] = useState("");
  const [curryOutput, setCurryOutput] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSavePrep = () => {
    const b_fry = Number(boneFry) || 0;
    const bl_fry = Number(bonelessFry) || 0;
    const b_curry = Number(boneCurry) || 0;
    const bl_curry = Number(bonelessCurry) || 0;
    const out_fry = Number(fryOutput) || 0;
    const out_curry = Number(curryOutput) || 0;

    if (!b_fry && !bl_fry && !b_curry && !bl_curry && !out_fry && !out_curry) {
      toast({ title: "Error", description: "Empty preparation entry.", variant: "destructive" });
      return;
    }

    const total_bone_used = b_fry + b_curry;
    const total_boneless_used = bl_fry + bl_curry;

    // Available Bone Check
    const invIn = (() => {
      try { const d = localStorage.getItem(invInKey); return d ? JSON.parse(d) : []; } catch { return []; }
    })();
    const totalBoneIn = invIn.reduce((s: any, r: any) => s + (Number(r.bone) || 0), 0);
    const totalBonelessIn = invIn.reduce((s: any, r: any) => s + (Number(r.boneless) || 0), 0);
    
    // Overall Used + Sold
    const overallBoneSold = records.reduce((s: any, r: any) => s + (Number(r.boneSold) || 0), 0);
    const overallBoneUsed = records.reduce((s: any, r: any) => s + (Number(r.boneUsed) || 0), 0);
    const availBone = totalBoneIn - overallBoneSold - overallBoneUsed;

    const overallBonelessSold = records.reduce((s: any, r: any) => s + (Number(r.bonelessSold) || 0), 0);
    const overallBonelessUsed = records.reduce((s: any, r: any) => s + (Number(r.bonelessUsed) || 0), 0);
    const availBoneless = totalBonelessIn - overallBonelessSold - overallBonelessUsed;

    if (total_bone_used > availBone) {
      toast({ title: "Error", description: `Insufficient raw stock (Bone). Only ${availBone} kg available. Attempting save anyway.`, variant: "destructive" });
    }
    
    if (total_boneless_used > availBoneless) {
      toast({ title: "Error", description: `Insufficient raw stock (Boneless). Only ${availBoneless} kg available. Attempting save anyway.`, variant: "destructive" });
    }

    if ((out_fry + out_curry) > (total_bone_used + total_boneless_used)) {
      toast({ title: "Warning", description: "Output exceeds input! Adding anyway.", variant: "default" });
    }

    const newRecord = {
      id: String(Date.now()),
      date: todayStr,
      boneSold: 0, bonelessSold: 0, frySold: 0, currySold: 0, mixedSold: 0,
      boneUsed: total_bone_used,
      bonelessUsed: total_boneless_used,
      fry: out_fry,
      curry: out_curry,
      cash: 0, phonePe: 0, total: 0,
      billId: `PREP-${String(records.length + 1).padStart(3, "0")}`,
    };
    
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem(storageKey, JSON.stringify(updatedRecords));

    toast({ title: "Success", description: "Preparation data recorded successfully." });
    
    setBoneFry(""); setBonelessFry(""); setBoneCurry(""); setBonelessCurry(""); setFryOutput(""); setCurryOutput("");
  };

  const handleDelete = (rId: string) => {
    if (!confirm("Are you sure you want to delete this preparation entry?")) return;
    const updated = records.filter(r => r.id !== rId);
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast({ title: "Deleted", description: "Preparation record removed." });
  };

  return (
    <div className="rounded-sm border bg-card shadow-none mb-8 overflow-hidden animate-fade-in w-full max-w-full">
      <div className="bg-primary px-6 py-3">
        <h2 className="text-lg font-semibold text-white">Daily Entry Form</h2>
      </div>
      <div className="p-6 border-b border-zinc-200">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-muted-foreground uppercase flex items-center gap-3 border-b pb-3 mb-4">
            <CookingPot className="h-6 w-6" /> Section A - Preparation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Input Side */}
            <div className="space-y-5 border-2 p-5 bg-secondary/20 rounded-sm shadow-none">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2">Raw Usage</h4>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Bone for Fry (kg)</Label>
                  <Input type="number" className="h-[56px] text-2xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none" value={boneFry} onChange={(e) => setBoneFry(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Boneless for Fry (kg)</Label>
                  <Input type="number" className="h-[56px] text-2xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none" value={bonelessFry} onChange={(e) => setBonelessFry(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Bone for Curry (kg)</Label>
                  <Input type="number" className="h-[56px] text-2xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none" value={boneCurry} onChange={(e) => setBoneCurry(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Boneless for Curry (kg)</Label>
                  <Input type="number" className="h-[56px] text-2xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none" value={bonelessCurry} onChange={(e) => setBonelessCurry(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-5 border-2 p-5 bg-secondary/20 rounded-sm shadow-none">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2">Prepared Output</h4>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg font-bold">Fry Output (kg)</Label>
                  <Input type="number" className="h-[56px] text-3xl font-black border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none text-info" value={fryOutput} onChange={(e) => setFryOutput(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-bold">Curry Output (kg)</Label>
                  <Input type="number" className="h-[56px] text-3xl font-black border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none text-info" value={curryOutput} onChange={(e) => setCurryOutput(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-5 text-lg text-muted-foreground mr-2 font-black border-t mt-4">
             Total Used: {Number(boneFry || 0) + Number(bonelessFry || 0) + Number(boneCurry || 0) + Number(bonelessCurry || 0)} kg &nbsp;|&nbsp; 
             Output: {Number(fryOutput || 0) + Number(curryOutput || 0)} kg
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleSavePrep} className="w-full md:w-auto h-[60px] text-xl bg-primary hover:bg-primary/80 font-bold text-white shadow-none px-12">
              Save Preparation
            </Button>
          </div>
        </div>
      </div>
      
      {/* Preparation Data Log */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-4 border-b pb-2">
           Preparation Log
        </h3>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Ref ID", accessor: "billId" },
            { header: "Bone Used (kg)", accessor: (r: any) => `${r.boneUsed || 0}` },
            { header: "Boneless Used (kg)", accessor: (r: any) => `${r.bonelessUsed || 0}` },
            { header: "Fry Prep (kg)", accessor: (r: any) => `${r.fry || 0}` },
            { header: "Curry Prep (kg)", accessor: (r: any) => `${r.curry || 0}` },
            {
              header: "Actions",
              accessor: (r: any) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )
            }
          ]}
          data={records.filter(r => String(r.billId).startsWith("PREP"))}
        />
      </div>
    </div>
  );
}
