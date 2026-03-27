import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InventoryOut from "@/pages/InventoryOut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, Store, Settings2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Sales() {
  const [selectedShop, setSelectedShop] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [shopsList] = useState<{id: string, name: string}[]>(() => {
    try {
      const saved = localStorage.getItem("pinaka_shops_list");
      return saved ? JSON.parse(saved) : [
        { id: "shop1", name: "Palipattu Shop" },
        { id: "shop2", name: "Tirupati Shop" },
        { id: "shop3", name: "New Shop" }
      ];
    } catch {
      return [
        { id: "shop1", name: "Palipattu Shop" },
        { id: "shop2", name: "Tirupati Shop" },
        { id: "shop3", name: "New Shop" }
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
    <div className="animate-fade-in pb-12">
      <Breadcrumb items={[{ label: "Sales" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border shadow-md">
            <Store className="w-4 h-4 text-muted-foreground" />
            <select 
              className="text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              <option value="">Select a Shop (Global View)</option>
              {shopsList.map(shop => (
                 <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border shadow-md">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select 
              className="text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 font-semibold">
                <Settings2 className="w-4 h-4" />
                Daily Selling Costs
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
                    <label className="font-bold text-sm tracking-wide text-zinc-700 w-24 uppercase">{cut}</label>
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
                    className="w-full bg-primary hover:bg-primary/80 text-white h-12 shadow font-bold tracking-widest uppercase"
                  >
                    Save Costs
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {dateFilter === "Custom" && (
        <div className="flex gap-4 mb-8 bg-card p-4 rounded-lg border shadow-md w-fit">
          <div className="space-y-1">
            <Label>From</Label>
            <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      <div className="space-y-8">
        
        {/* INVENTORY OUT SECTION */}
        <div className="bg-card rounded-lg shadow-md border overflow-hidden">
          <div className="bg-secondary px-6 py-4 border-b">
             <h2 className="text-xl font-bold">Sales Records</h2>
          </div>
          <div className="p-6">
            <InventoryOut 
              shopIdFilter={selectedShop} 
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
