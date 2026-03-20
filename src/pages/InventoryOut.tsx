import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Wallet, Smartphone, Beef, CookingPot, Pencil, Trash2, Eye } from "lucide-react";

const initialRecords = [
  { date: "2026-03-10", boneSold: 8, bonelessSold: 5, fry: 3, curry: 2, cash: 2800, phonePe: 1500, total: 4300, bill: "#001" },
  { date: "2026-03-11", boneSold: 10, bonelessSold: 6, fry: 4, curry: 3, cash: 3200, phonePe: 2000, total: 5200, bill: "#002" },
  { date: "2026-03-12", boneSold: 7, bonelessSold: 4, fry: 2, curry: 2, cash: 2400, phonePe: 1200, total: 3600, bill: "#003" },
  { date: "2026-03-13", boneSold: 12, bonelessSold: 8, fry: 5, curry: 3, cash: 4000, phonePe: 2500, total: 6500, bill: "#004" },
  { date: "2026-03-14", boneSold: 9, bonelessSold: 6, fry: 3, curry: 2, cash: 3000, phonePe: 1800, total: 4800, bill: "#005" },
  { date: "2026-03-15", boneSold: 11, bonelessSold: 7, fry: 4, curry: 3, cash: 3600, phonePe: 2200, total: 5800, bill: "#006" },
  { date: "2026-03-16", boneSold: 6, bonelessSold: 3, fry: 2, curry: 1, cash: 1800, phonePe: 1000, total: 2800, bill: "#007" },
  { date: "2026-03-17", boneSold: 14, bonelessSold: 9, fry: 6, curry: 4, cash: 4800, phonePe: 3000, total: 7800, bill: "#008" },
  { date: "2026-03-18", boneSold: 8, bonelessSold: 5, fry: 3, curry: 2, cash: 2600, phonePe: 1600, total: 4200, bill: "#009" },
  { date: "2026-03-19", boneSold: 10, bonelessSold: 7, fry: 4, curry: 3, cash: 3400, phonePe: 2100, total: 5500, bill: "#010" },
];

export default function InventoryOut() {
  const { toast } = useToast();
  const [records, setRecords] = useState(initialRecords);

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

  const boneTotal = (Number(boneSold) || 0) * (Number(bonePrice) || 0);
  const bonelessTotal = (Number(bonelessSold) || 0) * (Number(bonelessPrice) || 0);
  const paymentTotal = (Number(cash) || 0) + (Number(phonePe) || 0);

  const todayCash = records.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((s, r) => s + r.cash, 0) + (Number(cash) || 0);
  const todayPhonePe = records.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((s, r) => s + r.phonePe, 0) + (Number(phonePe) || 0);

  const handleSave = () => {
    const newRecord = {
      date: new Date().toISOString().split("T")[0],
      boneSold: Number(boneSold) || 0,
      bonelessSold: Number(bonelessSold) || 0,
      fry: Number(fryOutput) || 0,
      curry: Number(curryOutput) || 0,
      cash: Number(cash) || 0,
      phonePe: Number(phonePe) || 0,
      total: paymentTotal,
      bill: `#${String(records.length + 1).padStart(3, "0")}`,
    };
    setRecords([newRecord, ...records]);
    toast({ title: "Saved", description: "Daily entry recorded" });
    setBoneFry(""); setBonelessFry(""); setFryOutput(""); setCurryOutput("");
    setBoneSold(""); setBonelessSold(""); setCash(""); setPhonePe("");
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Inventory", path: "/inventory/in" }, { label: "Inventory Out" }]} />
      <h1 className="text-2xl font-bold mb-6">Inventory Out / Daily Operations</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Cash Received" value={`₹${todayCash.toLocaleString("en-IN")}`} icon={<Wallet className="h-5 w-5 text-success" />} color="success" />
        <StatCard title="PhonePe Received" value={`₹${todayPhonePe.toLocaleString("en-IN")}`} icon={<Smartphone className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Total Sales" value={`₹${(todayCash + todayPhonePe).toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5 text-foreground" />} />
        <StatCard title="Fry Prepared" value={`${Number(fryOutput) || 0} kg`} icon={<Beef className="h-5 w-5 text-foreground" />} />
        <StatCard title="Curry Prepared" value={`${Number(curryOutput) || 0} kg`} icon={<CookingPot className="h-5 w-5 text-foreground" />} />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Entry</h2>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Section A - Internal Use (Preparation)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div><Label>Bone for Fry (kg)</Label><Input type="number" value={boneFry} onChange={(e) => setBoneFry(e.target.value)} /></div>
          <div><Label>Boneless for Fry (kg)</Label><Input type="number" value={bonelessFry} onChange={(e) => setBonelessFry(e.target.value)} /></div>
          <div><Label>Fry Output (kg)</Label><Input type="number" value={fryOutput} onChange={(e) => setFryOutput(e.target.value)} /></div>
          <div><Label>Curry Output (kg)</Label><Input type="number" value={curryOutput} onChange={(e) => setCurryOutput(e.target.value)} /></div>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Section B - Sales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
          <div><Label>Bone Sold (kg)</Label><Input type="number" value={boneSold} onChange={(e) => setBoneSold(e.target.value)} /></div>
          <div><Label>Price per kg (₹)</Label><Input type="number" value={bonePrice} onChange={(e) => setBonePrice(e.target.value)} /></div>
          <div className="flex items-end text-sm font-medium pb-2">Total: ₹{boneTotal.toLocaleString("en-IN")}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div><Label>Boneless Sold (kg)</Label><Input type="number" value={bonelessSold} onChange={(e) => setBonelessSold(e.target.value)} /></div>
          <div><Label>Price per kg (₹)</Label><Input type="number" value={bonelessPrice} onChange={(e) => setBonelessPrice(e.target.value)} /></div>
          <div className="flex items-end text-sm font-medium pb-2">Total: ₹{bonelessTotal.toLocaleString("en-IN")}</div>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Section C - Payment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div><Label>Cash Received (₹)</Label><Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} /></div>
          <div><Label>PhonePe Received (₹)</Label><Input type="number" value={phonePe} onChange={(e) => setPhonePe(e.target.value)} /></div>
          <div className="flex items-end text-sm font-bold pb-2">Total: ₹{paymentTotal.toLocaleString("en-IN")}</div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Entry</Button>
          <Button variant="outline" onClick={() => toast({ title: "Bill Generated" })}>Generate Bill</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Sales Log</h2>
        <DataTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Bone Sold", accessor: (r) => `${r.boneSold} kg` },
            { header: "Boneless Sold", accessor: (r) => `${r.bonelessSold} kg` },
            { header: "Fry (kg)", accessor: (r) => `${r.fry}` },
            { header: "Curry (kg)", accessor: (r) => `${r.curry}` },
            { header: "Cash (₹)", accessor: (r) => `₹${r.cash.toLocaleString("en-IN")}` },
            { header: "PhonePe (₹)", accessor: (r) => `₹${r.phonePe.toLocaleString("en-IN")}` },
            { header: "Total (₹)", accessor: (r) => `₹${r.total.toLocaleString("en-IN")}` },
            { header: "Bill", accessor: "bill" },
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setRecords(records.filter(x => x !== r)); toast({ title: "Deleted" }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={records}
          pageSize={10}
        />
      </div>
    </div>
  );
}
