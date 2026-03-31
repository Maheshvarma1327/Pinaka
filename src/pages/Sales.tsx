import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InventoryOut from "@/pages/InventoryOut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, Store, Settings2, Calendar, DownloadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdvancedDatePicker } from "@/components/ui/advanced-date-picker";

export default function Sales() {
  const [selectedShop, setSelectedShop] = useState("global");
  const [dateFilter, setDateFilter] = useState("Today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
  const [exportRange, setExportRange] = useState<"Daily" | "Weekly" | "Monthly" | "Custom">("Daily");

  const [shopsList] = useState<{id: string, name: string}[]>(() => {
    try {
      const saved = localStorage.getItem("pinaka_shops_list");
      return saved ? JSON.parse(saved) : [
        { id: "shop1", name: "Palipattu Shop" },
        { id: "shop2", name: "Tirupati Shop" },
        { id: "shop3", name: "Goa Beach Shop" }
      ];
    } catch {
      return [
        { id: "shop1", name: "Palipattu Shop" },
        { id: "shop2", name: "Tirupati Shop" },
        { id: "shop3", name: "Goa Beach Shop" }
      ];
    }
  });

  const defaultCosts = { fry: 280, curry: 250, bone: 200, boneless: 400, mixed: 200 };
  const [sellingCosts, setSellingCosts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("pinaka_selling_costs");
      return saved ? JSON.parse(saved) : defaultCosts;
    } catch {
      return defaultCosts;
    }
  });

  const handleSaveCosts = () => {
    localStorage.setItem("pinaka_selling_costs", JSON.stringify(sellingCosts));
    alert("Selling costs updated successfully! New prices will apply to Inventory Out.");
  };

  return (
    <div className="animate-fade-in pb-12 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Breadcrumb items={[{ label: "Sales" }]} />
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Sales Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage sales, calculate billing, and configure daily shop costs.</p>
        </div>
      </div>
      
      {/* FILTER BAR - SAME EVERYWHERE */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 w-full">
        {/* LEFT: Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-card px-3 py-1.5 rounded-sm border border-[var(--border)] shadow-none h-11 w-full sm:w-auto hover:border-slate-300 transition-all">
            <Store className="w-5 h-5 text-primary shrink-0" />
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-full sm:w-[220px] border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none font-bold text-sm text-foreground">
                <SelectValue placeholder="Select a Shop (Global View)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Select a Shop (Global View)</SelectItem>
                {shopsList.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 rounded-sm bg-card border-[var(--border)] shadow-none transition-all hover:text-primary hover:border-primary/30 font-bold w-full sm:w-auto" style={{color: 'var(--text-primary)'}}>
                <Settings2 className="w-4 h-4 mr-2" />
                Daily Costs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Daily Selling Costs</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6">
                <p className="text-sm text-muted-foreground">Configure exactly how much each item cuts and mixes should cost today.</p>
                {["fry", "curry", "bone", "boneless", "mixed"].map((cut) => (
                  <div key={cut} className="flex items-center justify-between gap-4 border-b border-secondary pb-4 last:border-0 last:pb-0">
                    <label className="font-bold text-sm tracking-wide text-muted-foreground w-24 uppercase">{cut}</label>
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-9 h-11 bg-card border-zinc-200 font-bold" 
                        value={sellingCosts[cut] || 0}
                        onChange={(e) => setSellingCosts(prev => ({...prev, [cut]: Number(e.target.value)}))}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button 
                    onClick={handleSaveCosts}
                    className="w-full bg-primary hover:bg-primary/80 text-white h-12 shadow-none font-bold tracking-widest uppercase rounded-sm"
                  >
                    Save Costs
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
             <div className="p-1.5 rounded-sm flex items-center shadow-none border h-11 no-scrollbar overflow-x-auto" style={{backgroundColor: 'var(--navbar-bg)', borderColor: 'var(--border)'}}>
                {["Today", "This Week", "This Month", "Custom"].map(t => (
                  <button
                    key={t}
                    onClick={() => setDateFilter(t)}
                    className={cn(
                      "whitespace-nowrap flex-1 lg:flex-none px-4 lg:px-6 py-1.5 rounded-sm text-sm font-bold transition-all",
                      dateFilter === t ? "bg-primary text-white shadow-none scale-100" : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
             </div>

             {dateFilter === "Custom" && (
                <div className="flex items-center gap-2 bg-card p-1 rounded-sm border border-[var(--border)] shadow-none px-2 h-11 animate-in fade-in slide-in-from-left-4 duration-300 w-full lg:w-auto">
                   <AdvancedDatePicker value={customStart} onChange={setCustomStart} placeholder="Start Date" />
                   <span className="text-muted-foreground font-bold">-</span>
                   <AdvancedDatePicker value={customEnd} onChange={setCustomEnd} placeholder="End Date" />
                </div>
             )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto mt-2 xl:mt-0">
             <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-sm font-bold border border-[var(--border)] shadow-none hover:text-primary hover:border-primary/30 transition-all px-4 flex items-center gap-2 w-full lg:w-auto" style={{backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)'}}>
                    <DownloadCloud className="w-4 h-4" /> Download
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
                        <Button variant={exportFormat === "CSV" ? "default" : "outline"} className={exportFormat === "CSV" ? "bg-primary hover:bg-primary/80 text-white" : ""} onClick={() => setExportFormat("CSV")}>CSV Data</Button>
                        <Button variant={exportFormat === "PDF" ? "default" : "outline"} className={exportFormat === "PDF" ? "bg-primary hover:bg-primary/80 text-white" : ""} onClick={() => setExportFormat("PDF")}>PDF Report</Button>
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <Label>Date Range</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Button variant={exportRange === "Daily" ? "default" : "outline"} className={exportRange === "Daily" ? "bg-primary text-white" : ""} onClick={() => setExportRange("Daily")}>Today</Button>
                        <Button variant={exportRange === "Weekly" ? "default" : "outline"} className={exportRange === "Weekly" ? "bg-primary text-white" : ""} onClick={() => setExportRange("Weekly")}>This Week</Button>
                        <Button variant={exportRange === "Monthly" ? "default" : "outline"} className={exportRange === "Monthly" ? "bg-primary text-white" : ""} onClick={() => setExportRange("Monthly")}>This Month</Button>
                        <Button variant={exportRange === "Custom" ? "default" : "outline"} className={exportRange === "Custom" ? "bg-primary text-white" : ""} onClick={() => setExportRange("Custom")}>Custom Range</Button>
                      </div>
                    </div>
                    {exportRange === "Custom" && (
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1.5">
                          <Label>Start Date</Label>
                          <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>End Date</Label>
                          <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => alert(`Exporting Sales Records in ${exportFormat} format...`)} className="bg-primary hover:bg-primary/80 text-white font-bold w-full sm:w-auto">
                      Export Records
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* INVENTORY OUT SECTION */}
        <div className="bg-card rounded-sm shadow-none border overflow-hidden">
          <div className="px-6 py-4 border-b" style={{backgroundColor: 'var(--table-header)'}}>
             <h2 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Sales Records</h2>
          </div>
          <div className="p-6">
            <InventoryOut 
              shopIdFilter={selectedShop === "global" ? "" : selectedShop} 
              dateFilter={dateFilter}
              customStart={customStart}
              customEnd={customEnd}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
