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
  Pencil, Trash2, Receipt, FileText, Download, X, Ham, DownloadCloud,
  Package, Bone, TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "react-router-dom";
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
  frySold?: number;
  currySold?: number;
  mixedSold?: number;
  fry: number;
  curry: number;
  cash: number;
  phonePe: number;
  total: number;
  discountGiven?: number;
  boneUsed?: number;
  bonelessUsed?: number;
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

export default function InventoryOut({ 
  shopIdFilter, 
  dateFilter = "Today", 
  customStart, 
  customEnd 
}: { 
  shopIdFilter?: string; 
  dateFilter?: string; 
  customStart?: string; 
  customEnd?: string; 
}) {
  const params = useParams();
  const id = shopIdFilter || params.id;
  const shops = (() => {
    try {
      const d = localStorage.getItem("pinaka_shops_list");
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  })();
  const currentShop = shops.find((s: any) => s.id === id);
  const shopName = currentShop?.name || "Pinaka Default Shop";
  const shopLocation = currentShop?.location || "Main Branch";

  const { toast } = useToast();
  const [records, setRecords] = useState<OutRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`pinaka_shop_inventory_out_${id}`);
      return saved ? JSON.parse(saved) : initialRecords;
    } catch {
      return initialRecords;
    }
  });
  const [selectedBill, setSelectedBill] = useState<OutRecord | null>(null);

  const defaultCosts = { fry: 280, curry: 250, bone: 200, boneless: 400, mixed: 200 };
  const [sellingCosts] = useState(() => {
    try {
      const saved = localStorage.getItem("pinaka_selling_costs");
      return saved ? JSON.parse(saved) : defaultCosts;
    } catch {
      return defaultCosts;
    }
  });

  // Form State
  
  const [boneSold, setBoneSold] = useState("");
  const [bonelessSold, setBonelessSold] = useState("");
  const [frySold, setFrySold] = useState("");
  const [currySold, setCurrySold] = useState("");
  const [mixedSold, setMixedSold] = useState("");
  
  const [cash, setCash] = useState("");
  const [phonePe, setPhonePe] = useState("");

  const boneTotalAmt = (Number(boneSold) || 0) * sellingCosts.bone;
  const bonelessTotalAmt = (Number(bonelessSold) || 0) * sellingCosts.boneless;
  const fryTotalAmt = (Number(frySold) || 0) * sellingCosts.fry;
  const curryTotalAmt = (Number(currySold) || 0) * sellingCosts.curry;
  const mixedTotalAmt = (Number(mixedSold) || 0) * sellingCosts.mixed;
  
  const grandTotalAmt = boneTotalAmt + bonelessTotalAmt + fryTotalAmt + curryTotalAmt + mixedTotalAmt;
  const paymentTotalInitial = (Number(cash) || 0) + (Number(phonePe) || 0);
  const remainingBalance = grandTotalAmt - paymentTotalInitial;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const todayCash = todayRecords.reduce((s, r) => s + r.cash, 0);
  const todayPhonePe = todayRecords.reduce((s, r) => s + r.phonePe, 0);
  const todaySales = todayCash + todayPhonePe;
  
  const todayFry = todayRecords.reduce((s, r) => s + r.fry, 0);
  const todayCurry = todayRecords.reduce((s, r) => s + r.curry, 0);

  // Filter records based on dateFilter prop
  let filteredRecords = records;
  const now = new Date();
  
  if (dateFilter === "Today") {
    filteredRecords = records.filter(r => r.date === todayStr);
  } else if (dateFilter === "This Week") {
    const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    filteredRecords = records.filter(r => r.date >= pastWeek);
  } else if (dateFilter === "This Month") {
    const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    filteredRecords = records.filter(r => r.date >= pastMonth);
  } else if (dateFilter === "Custom" && customStart && customEnd) {
    filteredRecords = records.filter(r => r.date >= customStart && r.date <= customEnd);
  }

  // Overall KPIs Calculation
  const invIn = (() => {
    try { const d = localStorage.getItem(`pinaka_shop_inventory_in_${id}`); return d ? JSON.parse(d) : []; } catch { return []; }
  })();
  const totalBoneIn = invIn.reduce((s: any, r: any) => s + (Number(r.bone) || 0), 0);
  const totalBonelessIn = invIn.reduce((s: any, r: any) => s + (Number(r.boneless) || 0), 0);
  const totalMixedIn = invIn.reduce((s: any, r: any) => s + (Number(r.mixed) || 0), 0);
  
  const totalFryPrep = records.reduce((s, r) => s + (Number(r.fry) || 0), 0);
  const totalCurryPrep = records.reduce((s, r) => s + (Number(r.curry) || 0), 0);

  const overallBoneSold = records.reduce((s, r) => s + (Number(r.boneSold) || 0), 0);
  const overallBonelessSold = records.reduce((s, r) => s + (Number(r.bonelessSold) || 0), 0);
  const overallBoneUsed = records.reduce((s, r) => s + (Number(r.boneUsed) || 0), 0);
  const overallBonelessUsed = records.reduce((s, r) => s + (Number(r.bonelessUsed) || 0), 0);
  
  const overallMixedSold = records.reduce((s, r) => s + (Number(r.mixedSold) || 0), 0);
  const overallFrySold = records.reduce((s, r) => s + (Number(r.frySold) || 0), 0);
  const overallCurrySold = records.reduce((s, r) => s + (Number(r.currySold) || 0), 0);

  const availBone = totalBoneIn - overallBoneSold - overallBoneUsed;
  const availBoneless = totalBonelessIn - overallBonelessSold - overallBonelessUsed;
  const availMixed = totalMixedIn - overallMixedSold;
  const availFry = totalFryPrep - overallFrySold;
  const availCurry = totalCurryPrep - overallCurrySold;
  const totalStock = availBone + availBoneless + availMixed + availFry + availCurry;

  // KPIs for Sold & Payment should compute over filteredRecords
  const totalBoneSold = filteredRecords.reduce((s, r) => s + (Number(r.boneSold) || 0), 0);
  const totalBonelessSold = filteredRecords.reduce((s, r) => s + (Number(r.bonelessSold) || 0), 0);
  const totalMixedSold = filteredRecords.reduce((s, r) => s + (Number(r.mixedSold) || 0), 0);
  const totalFrySold = filteredRecords.reduce((s, r) => s + (Number(r.frySold) || 0), 0);
  const totalCurrySold = filteredRecords.reduce((s, r) => s + (Number(r.currySold) || 0), 0);

  const totalCash = filteredRecords.reduce((s, r) => s + (Number(r.cash) || 0), 0);
  const totalPhonePe = filteredRecords.reduce((s, r) => s + (Number(r.phonePe) || 0), 0);
  const discountedAmount = filteredRecords.reduce((s, r) => s + (Number(r.discountGiven) || 0), 0);

  // Payment Form calculation
  const paymentTotal = (Number(cash) || 0) + (Number(phonePe) || 0);
  const discountGivenVal = Math.max(0, grandTotalAmt - paymentTotal);

  // Export State
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
  const [exportRange, setExportRange] = useState<"Daily" | "Weekly" | "Monthly" | "Custom">("Daily");
  const [exportStart, setExportStart] = useState(todayStr);
  const [exportEnd, setExportEnd] = useState(todayStr);



  const handleSaveSales = () => {
    if (!boneSold && !bonelessSold && !frySold && !currySold && !mixedSold) {
      toast({ title: "Error", description: "Empty sales entry.", variant: "destructive" });
      return;
    }
    const newRecord: OutRecord = {
      id: String(Date.now()),
      date: todayStr,
      boneSold: Number(boneSold) || 0,
      bonelessSold: Number(bonelessSold) || 0,
      frySold: Number(frySold) || 0,
      currySold: Number(currySold) || 0,
      mixedSold: Number(mixedSold) || 0,
      fry: 0, curry: 0,
      cash: Number(cash) || 0,
      phonePe: Number(phonePe) || 0,
      total: grandTotalAmt,
      discountGiven: discountGivenVal,
      billId: `PK-${String(records.length + 1).padStart(3, "0")}`,
    };
    const newRecords = [newRecord, ...records];
    setRecords(newRecords);
    localStorage.setItem(`pinaka_shop_inventory_out_${id}`, JSON.stringify(newRecords));
    toast({ title: "Success", description: "Daily sales recorded successfully." });
    
    setBoneSold(""); setBonelessSold(""); setFrySold(""); setCurrySold(""); setMixedSold("");
    setCash(""); setPhonePe("");
  };

  const handleDelete = (deleteId: string) => {
    const newRecords = records.filter(r => r.id !== deleteId);
    setRecords(newRecords);
    localStorage.setItem(`pinaka_shop_inventory_out_${id}`, JSON.stringify(newRecords));
    toast({ title: "Deleted", description: "Record removed" });
  };

  const handleExport = () => {
    let filteredRecords = records;
    const now = new Date();
    
    if (exportRange === "Daily") {
      filteredRecords = records.filter(r => r.date === todayStr);
    } else if (exportRange === "Weekly") {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      filteredRecords = records.filter(r => r.date >= pastWeek);
    } else if (exportRange === "Monthly") {
      const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      filteredRecords = records.filter(r => r.date >= pastMonth);
    } else if (exportRange === "Custom") {
      filteredRecords = records.filter(r => r.date >= exportStart && r.date <= exportEnd);
    }
    
    // Distinguish sales rows over production rows
    filteredRecords = filteredRecords.filter(r => !String(r.billId).startsWith("PREP"));

    if (exportFormat === "CSV") {
      const header = "Date,Bone(kg),Boneless(kg),Fry Sale,Curry Sale,Mixed Sale,Cash(Rs),PhonePe(Rs),Total(Rs),Bill Id\n";
      const rows = filteredRecords.map(r => 
        `${r.date},${r.boneSold},${r.bonelessSold},${r.frySold || 0},${r.currySold || 0},${r.mixedSold || 0},${r.cash},${r.phonePe},${r.total},${r.billId}`
      ).join("\n");
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + `Shop Name:,${shopName}\nLocation:,${shopLocation}\nReport Range:,${exportRange} ${exportRange === "Custom" ? `(${exportStart} to ${exportEnd})` : ""}\n\n`
        + header 
        + rows;
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${shopName.replace(/\s+/g, "_")}_${exportRange}_Sales.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({ title: "Popup Blocked", description: "Allow popups to download PDF." });
        return;
      }
      
      const rowsHtml = filteredRecords.map(r => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.boneSold}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.bonelessSold}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.frySold || 0}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.currySold || 0}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.mixedSold || 0}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${r.cash}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${r.phonePe}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">₹${r.total}</td>
        </tr>
      `).join("");
      
      const html = `
        <html>
          <head>
            <title>${shopName} - Sales Report</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              h1 { color: #B71C1C; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; font-size: 14px; }
              th { background: #f4f4f5; padding: 10px 8px; border-bottom: 2px solid #ddd; }
            </style>
          </head>
          <body>
            <h1>${shopName}</h1>
            <p><strong>Location:</strong> ${shopLocation}</p>
            <p><strong>Report Range:</strong> ${exportRange} ${exportRange === "Custom" ? `(${customStart} to ${customEnd})` : ""}</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bone</th>
                  <th>Boneless</th>
                  <th>Fry</th>
                  <th>Curry</th>
                  <th>Mixed</th>
                  <th>Cash</th>
                  <th>PhonePe</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <script>
              window.onload = () => window.print();
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }
    
    toast({ title: "Export Started", description: `Generating ${exportFormat} for ${exportRange}...` });
  };

  return (
    <div className="animate-fade-in">

      {/* KPI Dashboard - Top Section */}
      <div className="space-y-6 mb-8">
         {/* ROW 1: TOTAL AVAILABLE STOCK */}
         <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Total Available Stock & Preparation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard title="Overall Total" value={`${totalStock} kg`} color={totalStock < 0 ? "destructive" : "info"} icon={<Package className="h-4 w-4" />} />
              <StatCard title="Bone Available" value={`${availBone} kg`} color={availBone < 0 ? "destructive" : "success"} icon={<Bone className="h-4 w-4" />} />
              <StatCard title="Boneless Avail." value={`${availBoneless} kg`} color={availBoneless < 0 ? "destructive" : "success"} icon={<Beef className="h-4 w-4" />} />
              <StatCard title="Mixed Avail." value={`${availMixed} kg`} color={availMixed < 0 ? "destructive" : "success"} icon={<Package className="h-4 w-4" />} />
              <StatCard title="Fry Prep." value={`${availFry} kg`} color="info" icon={<Beef className="h-4 w-4" />} />
              <StatCard title="Curry Prep." value={`${availCurry} kg`} color="info" icon={<CookingPot className="h-4 w-4" />} />
            </div>
         </div>

         {/* ROW 2: TOTAL STOCK SOLD */}
         <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Total Stock Sold</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard title="Overall Total Sold" className="bg-card border-dashed" value={`${totalBoneSold + totalBonelessSold + totalMixedSold + totalFrySold + totalCurrySold} kg`} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
              <StatCard title="Bone Sold" value={`${totalBoneSold} kg`} icon={<Bone className="h-4 w-4 text-muted-foreground" />} />
              <StatCard title="Boneless Sold" value={`${totalBonelessSold} kg`} icon={<Beef className="h-4 w-4 text-muted-foreground" />} />
              <StatCard title="Mixed Sold" value={`${totalMixedSold} kg`} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
              <StatCard title="Fry Sold" value={`${totalFrySold} kg`} icon={<Beef className="h-4 w-4 text-muted-foreground" />} />
              <StatCard title="Curry Sold" value={`${totalCurrySold} kg`} icon={<CookingPot className="h-4 w-4 text-muted-foreground" />} />
            </div>
         </div>

         {/* ROW 3: TOTAL AMOUNT */}
         <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Total Sales Amount</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Amount Received (₹)" value={`₹${(totalCash + totalPhonePe).toLocaleString("en-IN")}`} color="success" icon={<IndianRupee className="h-4 w-4" />} />
              <StatCard title="Cash Received" value={`₹${totalCash.toLocaleString("en-IN")}`} color="success" icon={<Wallet className="h-4 w-4" />} />
              <StatCard title="PhonePe Received" value={`₹${totalPhonePe.toLocaleString("en-IN")}`} color="info" icon={<Smartphone className="h-4 w-4" />} />
              <StatCard title="Discount Given" value={`₹${discountedAmount.toLocaleString("en-IN")}`} color="insights" icon={<TrendingUp className="h-4 w-4" />} />
            </div>
         </div>
      </div>

      {/* Entry Form */}
      <div className="rounded-sm border bg-card shadow-none mb-8 overflow-hidden hover:bg-[var(--table-row-2)] transition-colors">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3" style={{backgroundColor: 'var(--table-header)'}}>
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Daily Entry Form</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Section B */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-muted-foreground uppercase flex items-center gap-3 border-b pb-3 mb-4">
                <Beef className="h-6 w-6" /> Section B - Sales
              </h3>
              <div className="space-y-5">
                {[
                  { label: "Bone", val: boneSold, setter: setBoneSold, price: sellingCosts.bone, total: boneTotalAmt },
                  { label: "Boneless", val: bonelessSold, setter: setBonelessSold, price: sellingCosts.boneless, total: bonelessTotalAmt },
                  { label: "Fry", val: frySold, setter: setFrySold, price: sellingCosts.fry, total: fryTotalAmt },
                  { label: "Curry", val: currySold, setter: setCurrySold, price: sellingCosts.curry, total: curryTotalAmt },
                  { label: "Mixed", val: mixedSold, setter: setMixedSold, price: sellingCosts.mixed, total: mixedTotalAmt },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 rounded-sm border border-border" style={{backgroundColor: 'var(--table-row-2)'}}>
                    <div className="space-y-2">
                       <Label className="text-lg font-semibold text-muted-foreground">{item.label} Sold (kg)</Label>
                      <Input 
                        type="number" 
                        value={item.val} 
                        onChange={(e) => item.setter(e.target.value)} 
                        placeholder="0" 
                        className="h-[56px] text-2xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 shadow-none bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold text-muted-foreground">Price (₹/kg)</Label>
                      <Input readOnly className="h-[56px] text-xl bg-muted/30 font-bold border-2 text-foreground" value={item.price} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold text-muted-foreground">Total (₹)</Label>
                      <Input readOnly className="h-[56px] text-2xl font-black border-2 border-info/30 text-info" value={item.total} style={{backgroundColor: 'var(--primary-light-bg)'}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section C */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-muted-foreground uppercase flex items-center gap-3 border-b pb-3 mb-4">
                <Wallet className="h-6 w-6" /> Section C - Payment
              </h3>
              <div className="space-y-6">
                
                <div className="p-6 rounded-sm border-2 border-info/20 shadow-none flex justify-between items-center relative overflow-hidden" style={{backgroundColor: 'var(--primary-light-bg)'}}>
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-info" />
                  <span className="font-bold text-info/80 justify-start pl-2 uppercase tracking-widest text-sm">Bill Total</span>
                  <span className="text-4xl font-black text-info flex items-center tracking-tight"><IndianRupee className="w-8 h-8 mr-1" />{grandTotalAmt.toLocaleString("en-IN")}</span>
                </div>
                
                <div className="space-y-2 p-5 rounded-sm border border-border" style={{backgroundColor: 'var(--table-row-2)'}}>
                  <Label className="text-lg font-semibold block mb-2">Cash Received (₹)</Label>
                  <Input 
                    type="number" 
                    value={cash} 
                    onChange={(e) => setCash(e.target.value)} 
                    placeholder="0" 
                    className="h-[60px] text-3xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 bg-background"
                  />
                </div>
                
                <div className="space-y-2 p-5 rounded-sm border border-border" style={{backgroundColor: 'var(--table-row-2)'}}>
                  <Label className="text-lg font-semibold block mb-2">PhonePe Received (₹)</Label>
                  <Input 
                    type="number" 
                    value={phonePe} 
                    onChange={(e) => setPhonePe(e.target.value)} 
                    placeholder="0" 
                    className="h-[60px] text-3xl font-bold border-2 focus-visible:ring-primary focus-visible:border-primary px-4 text-info bg-background"
                  />
                </div>
                
                <div className="p-5 rounded-sm flex justify-between items-center shadow-none block border-2 border-destructive badge-error">
                  <span className="font-extrabold uppercase tracking-widest text-lg">Discount Given:</span>
                  <span className="text-3xl font-black flex items-center"><IndianRupee className="w-6 h-6 mr-1" />{discountGivenVal.toLocaleString("en-IN")}</span>
                </div>
                
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-10 pt-6 border-t">
            <Button onClick={handleSaveSales} className="flex-1 h-[60px] text-xl bg-primary hover:bg-primary/80 font-bold text-white shadow-none">
              Save Sales Entry
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-[60px] text-xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold shadow-none"
              onClick={() => toast({ title: "Redirecting...", description: "Opening Billing System" })}
            >
              Generate Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Sales Log Table */}
      <div className="rounded-sm border bg-card shadow-none mb-8">
        <div className="px-6 py-4 border-b flex justify-between items-center border-border" style={{backgroundColor: 'var(--table-header)'}}>
          <h2 className="text-lg font-black text-foreground uppercase tracking-wide">Daily Sales Log</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <DownloadCloud className="w-3.5 h-3.5 mr-2" /> Export Records
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Sales Records</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={exportFormat === "CSV" ? "default" : "outline"} className={exportFormat === "CSV" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportFormat("CSV")}>CSV (Excel)</Button>
                    <Button variant={exportFormat === "PDF" ? "default" : "outline"} className={exportFormat === "PDF" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportFormat("PDF")}>PDF Document</Button>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={exportRange === "Daily" ? "default" : "outline"} className={exportRange === "Daily" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Daily")}>Today</Button>
                    <Button variant={exportRange === "Weekly" ? "default" : "outline"} className={exportRange === "Weekly" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Weekly")}>This Week</Button>
                    <Button variant={exportRange === "Monthly" ? "default" : "outline"} className={exportRange === "Monthly" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Monthly")}>This Month</Button>
                    <Button variant={exportRange === "Custom" ? "default" : "outline"} className={exportRange === "Custom" ? "bg-primary hover:bg-primary/80" : ""} onClick={() => setExportRange("Custom")}>Custom Margin</Button>
                  </div>
                </div>
                {exportRange === "Custom" && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Date</Label>
                      <Input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleExport} className="bg-primary hover:bg-primary/80">Download {exportFormat}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="p-2 border-b">
          <DataTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Bone (kg)", accessor: (r: OutRecord) => `${r.boneSold}` },
              { header: "Boneless (kg)", accessor: (r: OutRecord) => `${r.bonelessSold}` },
              { header: "Fry Sale (kg)", accessor: (r: OutRecord) => `${r.frySold || 0}` },
              { header: "Curry Sale (kg)", accessor: (r: OutRecord) => `${r.currySold || 0}` },
              { header: "Mixed Sale (kg)", accessor: (r: OutRecord) => `${r.mixedSold || 0}` },
              { header: "Total (₹)", accessor: (r: OutRecord) => `₹${r.total.toLocaleString("en-IN")}` },
              { header: "Discount (₹)", accessor: (r: OutRecord) => `₹${(r.discountGiven || 0).toLocaleString("en-IN")}` },
              { header: "Cash (₹)", accessor: (r: OutRecord) => `₹${r.cash.toLocaleString("en-IN")}` },
              { header: "PhonePe (₹)", accessor: (r: OutRecord) => `₹${r.phonePe.toLocaleString("en-IN")}` },
              { 
                header: "Bill", 
                accessor: (r: OutRecord) => (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] uppercase font-bold border-primary text-primary hover:bg-primary hover:text-white"
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )
              },
            ]}
            data={filteredRecords.filter((r) => !String(r.billId).startsWith("PREP"))}
            pageSize={10}
          />
        </div>
      </div>

      {/* Bill Preview Modal */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="w-[95%] w-[95%] sm:max-w-[450px] p-0 overflow-hidden gap-0">
          <div className="bg-primary p-6 text-white flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-card p-2 rounded-sm">
                <Ham className="h-8 w-8 text-primary" />
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
          
          <div className="p-8 bg-card">
            <div className="flex justify-between mb-8 text-sm">
              <div className="text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Bill To:</p>
                <p>Counter Sale</p>
                <p>Date: {selectedBill?.date}</p>
              </div>
              <div className="text-right text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Payment Status:</p>
                <p className="text-success font-bold uppercase">Paid via {selectedBill && (selectedBill.cash > 0 && selectedBill.phonePe > 0 ? "Mixed" : selectedBill.cash > 0 ? "Cash" : "PhonePe")}</p>
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
                {[
                  { name: "Mutton Bone", sold: selectedBill?.boneSold, price: sellingCosts.bone },
                  { name: "Mutton Boneless", sold: selectedBill?.bonelessSold, price: sellingCosts.boneless },
                  { name: "Mutton Fry", sold: selectedBill?.frySold, price: sellingCosts.fry },
                  { name: "Mutton Curry", sold: selectedBill?.currySold, price: sellingCosts.curry },
                  { name: "Mutton Mixed", sold: selectedBill?.mixedSold, price: sellingCosts.mixed },
                ].map((item) => (
                  item.sold && item.sold > 0 ? (
                    <tr key={item.name}>
                      <td className="py-3">{item.name}</td>
                      <td className="text-center py-3">{item.sold} kg</td>
                      <td className="text-center py-3">₹{item.price}</td>
                      <td className="text-right py-3 font-medium">₹{(item.sold * item.price).toLocaleString("en-IN")}</td>
                    </tr>
                  ) : null
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/10">
                  <td colSpan={3} className="pt-4 pb-1 text-right font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Subtotal</td>
                  <td className="pt-4 pb-1 text-right font-bold text-lg text-foreground">₹{selectedBill?.total.toLocaleString("en-IN")}</td>
                </tr>
                {selectedBill && selectedBill.discountGiven !== undefined && selectedBill.discountGiven > 0 && (
                  <tr>
                    <td colSpan={3} className="pb-1 text-right font-bold uppercase text-[10px] tracking-wider text-destructive">Discount Given</td>
                    <td className="pb-1 text-right font-bold text-md text-destructive">-₹{selectedBill.discountGiven.toLocaleString("en-IN")}</td>
                  </tr>
                )}
                <tr className="border-t border-dashed">
                  <td colSpan={3} className="pt-2 pb-1 text-right font-bold uppercase text-[12px] tracking-wider text-muted-foreground">Amount Paid</td>
                  <td className="pt-2 pb-1 text-right font-black text-xl text-primary">₹{((selectedBill?.cash || 0) + (selectedBill?.phonePe || 0)).toLocaleString("en-IN")}</td>
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

            <div className="bg-secondary/20 p-4 rounded-sm text-center border-dashed border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Support & Feedback</p>
              <p className="text-xs font-medium">+91-9876543210 | pinaka.meat@gmail.com</p>
            </div>
          </div>
          
          <DialogFooter className="p-4 bg-muted/30 border-t flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-2">
            <p className="text-[10px] text-center sm:text-left text-muted-foreground flex-1 italic mb-2 sm:mb-0">Thank you for shopping with Pinaka Meat Shop!</p>
            <div className="flex w-full sm:w-auto gap-2 justify-center sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedBill(null)} className="h-8">Close</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/80 h-8">
                <Download className="h-3 w-3 mr-2" /> Download PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

