import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  IndianRupee, Wallet, Smartphone, Beef, CookingPot, 
  Pencil, Trash2, Receipt, FileText, Download, X, Ham 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface OutRecord {
  id: string;
  date: string;
  boneSold: number;
  bonelessSold: number;
  fry: number;
  curry: number;
  cash: number;
  phonePe: number;
  total: number;
  billId: string;
}

const initialRecords: OutRecord[] = [
  { id: "1", date: "2026-03-10", boneSold: 8, bonelessSold: 5, fry: 3, curry: 2, cash: 2800, phonePe: 1500, total: 4300, billId: "PK-001" },
  { id: "2", date: "2026-03-11", boneSold: 10, bonelessSold: 6, fry: 4, curry: 3, cash: 3200, phonePe: 2000, total: 5200, billId: "PK-002" },
  { id: "3", date: "2026-03-12", boneSold: 7, bonelessSold: 4, fry: 2, curry: 2, cash: 2400, phonePe: 1200, total: 3600, billId: "PK-003" },
  { id: "4", date: "2026-03-13", boneSold: 12, bonelessSold: 8, fry: 5, curry: 3, cash: 4000, phonePe: 2500, total: 6500, billId: "PK-004" },
  { id: "5", date: "2026-03-14", boneSold: 9, bonelessSold: 6, fry: 3, curry: 2, cash: 3000, phonePe: 1800, total: 4800, billId: "PK-005" },
  { id: "6", date: "2026-03-15", boneSold: 11, bonelessSold: 7, fry: 4, curry: 3, cash: 3600, phonePe: 2200, total: 5800, billId: "PK-006" },
  { id: "7", date: "2026-03-16", boneSold: 6, bonelessSold: 3, fry: 2, curry: 1, cash: 1800, phonePe: 1000, total: 2800, billId: "PK-007" },
  { id: "8", date: "2026-03-17", boneSold: 14, bonelessSold: 9, fry: 6, curry: 4, cash: 4800, phonePe: 3000, total: 7800, billId: "PK-008" },
  { id: "9", date: "2026-03-18", boneSold: 8, bonelessSold: 5, fry: 3, curry: 2, cash: 2600, phonePe: 1600, total: 4200, billId: "PK-009" },
  { id: "10", date: "2026-03-19", boneSold: 10, bonelessSold: 7, fry: 4, curry: 3, cash: 3400, phonePe: 2100, total: 5500, billId: "PK-010" },
];

export default function InventoryOut() {
  const { toast } = useToast();
  const [records, setRecords] = useState<OutRecord[]>(initialRecords);
  const [selectedBill, setSelectedBill] = useState<OutRecord | null>(null);

  // Form State
  const [boneFry, setBoneFry] = useState("");
  const [bonelessFry, setBonelessFry] = useState("");
  const [fryOutput, setFryOutput] = useState("");
  const [curryOutput, setCurryOutput] = useState("");
  
  const [boneSold, setBoneSold] = useState("");
  const [bonePrice, setBonePrice] = useState("200");
  const [bonelessSold, setBonelessSold] = useState("");
  const [bonelessPrice, setBonelessPrice] = useState("250");
  
  const [cash, setCash] = useState("");
  const [phonePe, setPhonePe] = useState("");

  const boneTotalAmt = (Number(boneSold) || 0) * (Number(bonePrice) || 0);
  const bonelessTotalAmt = (Number(bonelessSold) || 0) * (Number(bonelessPrice) || 0);
  const paymentTotal = (Number(cash) || 0) + (Number(phonePe) || 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const todayCash = todayRecords.reduce((s, r) => s + r.cash, 0);
  const todayPhonePe = todayRecords.reduce((s, r) => s + r.phonePe, 0);
  const todaySales = todayCash + todayPhonePe;
  
  const todayFry = todayRecords.reduce((s, r) => s + r.fry, 0);
  const todayCurry = todayRecords.reduce((s, r) => s + r.curry, 0);

  const handleSave = () => {
    if (!boneSold && !bonelessSold && !fryOutput && !curryOutput) {
      toast({ title: "Error", description: "Empty entry. Provide some data.", variant: "destructive" });
      return;
    }
    const newRecord: OutRecord = {
      id: String(Date.now()),
      date: todayStr,
      boneSold: Number(boneSold) || 0,
      bonelessSold: Number(bonelessSold) || 0,
      fry: Number(fryOutput) || 0,
      curry: Number(curryOutput) || 0,
      cash: Number(cash) || 0,
      phonePe: Number(phonePe) || 0,
      total: paymentTotal,
      billId: `PK-${String(records.length + 1).padStart(3, "0")}`,
    };
    setRecords([newRecord, ...records]);
    toast({ title: "Success", description: "Daily entry recorded successfully." });
    
    // Clear form
    setBoneFry(""); setBonelessFry(""); setFryOutput(""); setCurryOutput("");
    setBoneSold(""); setBonelessSold(""); setCash(""); setPhonePe("");
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast({ title: "Deleted", description: "Record removed" });
  };

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: "Inventory", path: "/inventory/in" }, { label: "Inventory Out" }]} />
      <h1 className="text-2xl font-bold mb-6">Inventory Out / Daily Operations</h1>

      {/* EOD Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Cash Received" value={`₹${todayCash.toLocaleString("en-IN")}`} icon={<Wallet className="h-5 w-5 text-success" />} color="success" />
        <StatCard title="PhonePe Received" value={`₹${todayPhonePe.toLocaleString("en-IN")}`} icon={<Smartphone className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Total Sales Today" value={`₹${todaySales.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5 text-[#B71C1C]" />} />
        <StatCard title="Fry Prepared" value={`${todayFry} kg`} icon={<Beef className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Curry Prepared" value={`${todayCurry} kg`} icon={<CookingPot className="h-5 w-5 text-muted-foreground" />} />
      </div>

      {/* Entry Form */}
      <div className="rounded-xl border bg-card shadow-sm mb-8 overflow-hidden">
        <div className="bg-[#B71C1C] px-6 py-3">
          <h2 className="text-lg font-semibold text-white">Daily Entry Form</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section A */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 border-b pb-2">
                <CookingPot className="h-4 w-4" /> Section A - Preparation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Bone for Fry (kg)</Label>
                  <Input type="number" value={boneFry} onChange={(e) => setBoneFry(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Boneless for Fry (kg)</Label>
                  <Input type="number" value={bonelessFry} onChange={(e) => setBonelessFry(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fry Output (kg)</Label>
                  <Input type="number" value={fryOutput} onChange={(e) => setFryOutput(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Curry Output (kg)</Label>
                  <Input type="number" value={curryOutput} onChange={(e) => setCurryOutput(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Section B */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 border-b pb-2">
                <Beef className="h-4 w-4" /> Section B - Sales
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Bone Sold (kg)</Label>
                    <Input type="number" value={boneSold} onChange={(e) => setBoneSold(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (₹/kg)</Label>
                    <Input type="number" value={bonePrice} onChange={(e) => setBonePrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total (₹)</Label>
                    <Input readOnly className="bg-muted/50 font-medium" value={boneTotalAmt} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Boneless Sold (kg)</Label>
                    <Input type="number" value={bonelessSold} onChange={(e) => setBonelessSold(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (₹/kg)</Label>
                    <Input type="number" value={bonelessPrice} onChange={(e) => setBonelessPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total (₹)</Label>
                    <Input readOnly className="bg-muted/50 font-medium" value={bonelessTotalAmt} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section C */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 border-b pb-2">
                <Wallet className="h-4 w-4" /> Section C - Payment
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Cash Received (₹)</Label>
                  <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>PhonePe Received (₹)</Label>
                  <Input type="number" value={phonePe} onChange={(e) => setPhonePe(e.target.value)} placeholder="0" />
                </div>
                <div className="bg-secondary/30 p-3 rounded-md flex justify-between items-center px-4 border border-dashed">
                  <span className="font-medium text-muted-foreground">Total:</span>
                  <span className="text-lg font-bold text-primary">₹{paymentTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-4 border-t">
            <Button onClick={handleSave} className="bg-[#B71C1C] hover:bg-[#8e1616] text-white px-8">
              Save Entry
            </Button>
            <Button 
              variant="outline" 
              className="border-[#B71C1C] text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white"
              onClick={() => toast({ title: "Redirecting...", description: "Opening Billing System" })}
            >
              Generate Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Sales Log Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Daily Sales Log</h2>
          <Button variant="ghost" size="sm" className="text-xs">Export Records</Button>
        </div>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Bone (kg)", accessor: (r: OutRecord) => `${r.boneSold}` },
            { header: "Boneless (kg)", accessor: (r: OutRecord) => `${r.bonelessSold}` },
            { header: "Fry (kg)", accessor: (r: OutRecord) => `${r.fry}` },
            { header: "Curry (kg)", accessor: (r: OutRecord) => `${r.curry}` },
            { header: "Cash (₹)", accessor: (r: OutRecord) => `₹${r.cash.toLocaleString("en-IN")}` },
            { header: "PhonePe (₹)", accessor: (r: OutRecord) => `₹${r.phonePe.toLocaleString("en-IN")}` },
            { header: "Total (₹)", accessor: (r: OutRecord) => `₹${r.total.toLocaleString("en-IN")}` },
            { 
              header: "Bill", 
              accessor: (r: OutRecord) => (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] uppercase font-bold border-[#B71C1C] text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white"
                  onClick={() => setSelectedBill(r)}
                >
                  <Receipt className="h-3 w-3 mr-1" /> {r.billId}
                </Button>
              )
            },
            { 
              header: "Actions", 
              accessor: (r: OutRecord) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )
            },
          ]}
          data={records}
          pageSize={10}
        />
      </div>

      {/* Bill Preview Modal */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0">
          <div className="bg-[#B71C1C] p-6 text-white flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Ham className="h-8 w-8 text-[#B71C1C]" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Pinaka Meat Shop</h2>
                <p className="text-[10px] opacity-80">Premium Quality Meat & Poultry</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest">Invoice</p>
              <p className="text-xl font-mono">{selectedBill?.billId}</p>
            </div>
          </div>
          
          <div className="p-8 bg-white">
            <div className="flex justify-between mb-8 text-sm">
              <div className="text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Bill To:</p>
                <p>Counter Sale</p>
                <p>Date: {selectedBill?.date}</p>
              </div>
              <div className="text-right text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Payment Status:</p>
                <p className="text-green-600 font-bold uppercase">Paid via {selectedBill && (selectedBill.cash > 0 && selectedBill.phonePe > 0 ? "Mixed" : selectedBill.cash > 0 ? "Cash" : "PhonePe")}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-8">
              <thead>
                <tr className="border-b-2 border-primary/10">
                  <th className="text-left py-2 font-bold">Item</th>
                  <th className="text-center py-2 font-bold">Qty</th>
                  <th className="text-center py-2 font-bold">Rate</th>
                  <th className="text-right py-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedBill && selectedBill.boneSold > 0 && (
                  <tr>
                    <td className="py-3">Mutton Bone</td>
                    <td className="text-center py-3">{selectedBill.boneSold} kg</td>
                    <td className="text-center py-3">₹200</td>
                    <td className="text-right py-3 font-medium">₹{(selectedBill.boneSold * 200).toLocaleString("en-IN")}</td>
                  </tr>
                )}
                {selectedBill && selectedBill.bonelessSold > 0 && (
                  <tr>
                    <td className="py-3">Mutton Boneless</td>
                    <td className="text-center py-3">{selectedBill.bonelessSold} kg</td>
                    <td className="text-center py-3">₹250</td>
                    <td className="text-right py-3 font-medium">₹{(selectedBill.bonelessSold * 250).toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/10">
                  <td colSpan={3} className="pt-4 pb-1 text-right font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Subtotal</td>
                  <td className="pt-4 pb-1 text-right font-bold text-lg text-[#B71C1C]">₹{selectedBill?.total.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pb-4 text-right text-[10px] text-muted-foreground flex items-center justify-end gap-2">
                    {selectedBill && selectedBill.cash > 0 && <span>Cash: ₹{selectedBill.cash.toLocaleString("en-IN")}</span>}
                    {selectedBill && selectedBill.phonePe > 0 && <span>PhonePe: ₹{selectedBill.phonePe.toLocaleString("en-IN")}</span>}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-secondary/20 p-4 rounded-lg text-center border-dashed border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Support & Feedback</p>
              <p className="text-xs font-medium">+91-9876543210 | pinaka.meat@gmail.com</p>
            </div>
          </div>
          
          <DialogFooter className="p-4 bg-muted/30 border-t flex sm:justify-between items-center gap-2">
            <p className="text-[10px] text-muted-foreground flex-1 italic">Thank you for shopping with Pinaka Meat Shop!</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBill(null)} className="h-8">Close</Button>
              <Button size="sm" className="bg-[#B71C1C] hover:bg-[#8e1616] h-8">
                <Download className="h-3 w-3 mr-2" /> Download PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

