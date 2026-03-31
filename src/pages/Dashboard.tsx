import { useState, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  TrendingUp, ArrowDownRight, Activity, Calendar as CalendarIcon, DownloadCloud,
  CheckCircle2, DollarSign, Package, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdvancedDatePicker } from "@/components/ui/advanced-date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, Cell, LabelList
} from 'recharts';
import { Ham } from "lucide-react";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"Today" | "This Week" | "This Month" | "Custom">("This Week");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
  const [exportRange, setExportRange] = useState<"Daily" | "Weekly" | "Monthly" | "Custom">("Daily");
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const filterByDateRange = (records: any[], dateField: string = "date") => {
    const now = new Date();
    return records.filter(r => {
      const recDate = r[dateField];
      if (!recDate) return false;
      if (timeframe === "Today") return recDate === todayStr;
      if (timeframe === "This Week") {
        const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        return recDate >= pastWeek;
      }
      if (timeframe === "This Month") {
        const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        return recDate >= pastMonth;
      }
      if (timeframe === "Custom") return recDate >= customStart && recDate <= customEnd;
      return false;
    });
  };

  const {
    netResult, shopSales, othersSales, totalSales, totalDiscount, operationalCost,
    beforeSlaughterCost, afterSlaughterCost, totalExpenses, shopNet, totalInventorySales,
    trendData, breakdownData, inventoryFlow
  } = useMemo(() => {
    
    // --- DUMMY DATA OVERRIDE ---
    const useDummyData = true; // Set this to false to switch back to real database numbers
    if (useDummyData) {
      return {
        totalSales: 345000,
        shopSales: 285000,
        othersSales: 60000,
        totalDiscount: 15500,
        operationalCost: 95000,
        netSales: 329500,
        shopNet: 269500,
        totalInventorySales: 329500,
        netResult: 234500,
        beforeSlaughterCost: 25000,
        afterSlaughterCost: 18000,
        totalExpenses: 110500,
        trendData: [
          { name: 'Mon', Profit_Loss: 15000 },
          { name: 'Tue', Profit_Loss: 22000 },
          { name: 'Wed', Profit_Loss: -4500 },
          { name: 'Thu', Profit_Loss: 31000 },
          { name: 'Fri', Profit_Loss: 45000 },
          { name: 'Sat', Profit_Loss: 58000 },
          { name: 'Sun', Profit_Loss: 68000 }
        ],
        breakdownData: [
          { name: 'Sales', Value: 345000 },
          { name: 'Expenses', Value: 110500 }
        ],
        inventoryFlow: [
          { name: 'Stock In', Value: 1450 },
          { name: 'Stock Out', Value: 920 }
        ]
      };
    }
    // ---------------------------

    // 1. Fetch Shops
    let shopsList: any[] = [];
    try {
      shopsList = JSON.parse(localStorage.getItem("pinaka_shops_list") || "[]");
    } catch {}

    // 2. Aggregate metrics definition
    let sumShopSales = 0;
    let sumDiscount = 0;
    let sumOpCost = 0;

    // Include a virtual "global" shop to capture common / headquarters-level costs and sales
    const allEntities = [...shopsList, { id: 'global' }];

    allEntities.forEach(shop => {
      const invOut = JSON.parse(localStorage.getItem(`pinaka_shop_inventory_out_${shop.id}`) || "[]");
      const filteredOut = filterByDateRange(invOut).filter(r => !String(r.billId).startsWith("PREP"));
      sumShopSales += filteredOut.reduce((s: number, r: any) => s + (Number(r.total) || 0), 0);
      sumDiscount += filteredOut.reduce((s: number, r: any) => s + (Number(r.discountGiven) || 0), 0);

      const dCosts = JSON.parse(localStorage.getItem(`pinaka_daily_costs_${shop.id}`) || "[]");
      const mBills = JSON.parse(localStorage.getItem(`pinaka_monthly_bills_${shop.id}`) || "[]");
      const sCosts = JSON.parse(localStorage.getItem(`pinaka_slaughter_costs_${shop.id}`) || "[]");

      sumOpCost += filterByDateRange(dCosts).reduce((s: number, r: any) => s + (Number(r.total) || 0), 0);
      sumOpCost += filterByDateRange(sCosts).reduce((s: number, r: any) => s + (Number(r.total) || 0), 0);
      
      const filteredMonthly = mBills.filter((r: any) => {
        if (!r.month) return false;
        if (timeframe === "Today" || timeframe === "This Week") return false; 
        if (timeframe === "This Month") return r.month === todayStr.substring(0, 7);
        if (timeframe === "Custom") {
           const mStart = customStart.substring(0, 7);
           const mEnd = customEnd.substring(0, 7);
           return r.month >= mStart && r.month <= mEnd;
        }
        return false;
      });
      sumOpCost += filteredMonthly.reduce((s: number, r: any) => s + (Number(r.total) || 0), 0);
    });

    const supplyData = JSON.parse(localStorage.getItem("pinaka_inventory_out") || "[]");
    const filteredSupply = filterByDateRange(supplyData);
    let sumOthersSales = filteredSupply
      .filter((r: any) => r.shopNo && String(r.shopNo).startsWith("Others"))
      .reduce((s: number, r: any) => s + (Number(r.totalAmount) || 0), 0);

    const dressingData = JSON.parse(localStorage.getItem("pinaka_dressing_records") || "[]");
    const filteredDressing = filterByDateRange(dressingData);
    
    let beforeSlaughterCost = filteredDressing
      .filter((r: any) => r.status === "Unslaughtered")
      .reduce((s: number, r: any) => s + (Number(r.cost) || 0), 0);
      
    let afterSlaughterCost = filteredDressing
      .filter((r: any) => ["Slaughtered", "Packed"].includes(r.status))
      .reduce((s: number, r: any) => s + (Number(r.cost) || 0), 0);

    // Remove dummy overrides for dummyActive block to allow natural testing of ZERO/Empty states.
    // Natural fallback for UI to show "No expenses recorded" when data is fully empty.

    const tSales = sumShopSales + sumOthersSales;
    const nSales = tSales - sumDiscount;
    const fResult = nSales - sumOpCost;
    
    // Fallback analytics formatting for graph UI
    const chartTrend = [
      { name: 'Start', Profit_Loss: 0 },
      { name: 'Mid', Profit_Loss: fResult * 0.4 },
      { name: 'Current', Profit_Loss: fResult }
    ];
    
    const chartBreakdown = [
      { name: 'Sales', Value: tSales },
      { name: 'Expenses', Value: sumDiscount + sumOpCost }
    ];

    const invInTotal = JSON.parse(localStorage.getItem("pinaka_main_inventory") || "[]").length * 50; 
    const chartFlow = [
      { name: 'Stock In', Value: invInTotal },
      { name: 'Stock Out', Value: sumShopSales > 0 ? sumShopSales / 400 : 0 }
    ];

    return {
      totalSales: tSales,
      shopSales: sumShopSales,
      othersSales: sumOthersSales,
      totalDiscount: sumDiscount,
      operationalCost: sumOpCost,
      netSales: nSales,
      shopNet: sumShopSales - sumDiscount,
      totalInventorySales: (sumShopSales - sumDiscount) + sumOthersSales,
      netResult: fResult,
      beforeSlaughterCost,
      afterSlaughterCost,
      totalExpenses: sumDiscount + sumOpCost,
      trendData: chartTrend,
      breakdownData: chartBreakdown,
      inventoryFlow: chartFlow
    };
  }, [timeframe, customStart, customEnd, todayStr]);

  const handleExportAnalytics = () => {
    alert(`Exporting Global Analytics (${exportRange}) in ${exportFormat} format!`);
  };

  return (
    <div className="animate-fade-in pb-12 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Breadcrumb items={[{ label: "Global Control Center Dashboard" }]} />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Financial Control Center</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Global operations and financial overview.</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-sm font-bold">
            <span className="hidden sm:inline">Welcome,</span> Pinaka
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-8 gap-6">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full lg:w-auto">
            <div className="p-1.5 rounded-sm flex items-center shadow-none border lg:h-11 no-scrollbar overflow-x-auto w-full max-w-full" style={{backgroundColor: 'var(--navbar-bg)', borderColor: 'var(--border)'}}>
              {["Today", "This Week", "This Month", "Custom"].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t as any)} 
                  className={cn(
                    "whitespace-nowrap flex-1 lg:flex-none px-4 lg:px-6 py-1.5 rounded-sm text-sm font-bold transition-all", 
                    timeframe === t ? "bg-primary text-primary-foreground shadow-none scale-100" : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            
            {timeframe === "Custom" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card p-1.5 rounded-sm border border-[var(--border)] shadow-none px-2 lg:h-11 animate-in fade-in slide-in-from-left-4 duration-300 w-full lg:w-auto">
                <div className="w-full sm:w-[130px]">
                  <AdvancedDatePicker value={customStart} onChange={(val) => setCustomStart(val)} placeholder="Start Date" />
                </div>
                <span className="text-muted-foreground font-bold hidden sm:block">-</span>
                <div className="w-full sm:w-[130px]">
                  <AdvancedDatePicker value={customEnd} onChange={(val) => setCustomEnd(val)} placeholder="End Date" />
                </div>
              </div>
            )}
            
            {/* SECTION 6 — EXPORT FEATURE */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 rounded-sm font-bold bg-card border border-[var(--border)] shadow-none hover:text-primary hover:border-primary/30 transition-all px-4 flex items-center justify-center gap-2 w-full lg:w-auto" style={{color: 'var(--text-primary)'}}>
                  <DownloadCloud className="w-4 h-4" /> Download
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Analytics Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label>Format</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={exportFormat === "CSV" ? "default" : "outline"} className={exportFormat === "CSV" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportFormat("CSV")}>CSV Data</Button>
                      <Button variant={exportFormat === "PDF" ? "default" : "outline"} className={exportFormat === "PDF" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportFormat("PDF")}>PDF Report</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={exportRange === "Daily" ? "default" : "outline"} className={exportRange === "Daily" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportRange("Daily")}>Today</Button>
                      <Button variant={exportRange === "Weekly" ? "default" : "outline"} className={exportRange === "Weekly" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportRange("Weekly")}>This Week</Button>
                      <Button variant={exportRange === "Monthly" ? "default" : "outline"} className={exportRange === "Monthly" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportRange("Monthly")}>This Month</Button>
                      <Button variant={exportRange === "Custom" ? "default" : "outline"} className={exportRange === "Custom" ? "bg-primary hover:bg-primary/80 text-primary-foreground" : "text-foreground"} onClick={() => setExportRange("Custom")}>Custom Range</Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleExportAnalytics} className="bg-primary hover:bg-primary/80 text-primary-foreground">Export Data</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* SECTION 1 — NET RESULT (DOMINANT CARD) */}
      <Card className={cn(
        "rounded-sm border shadow-none relative overflow-hidden flex flex-col items-center justify-center p-12 transition-colors bg-card", 
        netResult >= 0 ? "border-l-4 border-l-success" : "border-l-4 border-l-destructive"
      )}>
         <p className={cn("text-lg font-bold tracking-[0.3em] mb-4 uppercase", netResult >= 0 ? "text-success/80" : "text-destructive/80")}>Net Result</p>
         <h2 className={cn("text-7xl font-black tracking-tighter mb-8", netResult >= 0 ? "text-success" : "text-destructive")}>
           {netResult < 0 ? "-" : ""}₹{Math.abs(netResult).toLocaleString("en-IN")}
         </h2>
         <div className="flex items-center gap-3">
            <span className={cn("text-sm font-black px-4 py-2 rounded-sm uppercase tracking-widest shadow-none", netResult >= 0 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground")}>
              {netResult >= 0 ? "PROFIT" : "LOSS"}
            </span>
         </div>
         
         <div className="absolute right-[-48px] bottom-[-48px] opacity-[0.06] pointer-events-none">
           <Activity className={cn("w-96 h-96", netResult >= 0 ? "text-success" : "text-destructive")} />
         </div>

         {/* Sub-breakdown inside card */}
         <div className="mt-12 w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-background/30 backdrop-blur-sm p-6 rounded-sm border border-border/30">
            <div className="flex flex-col items-center justify-center border-r border-border/30 last:border-0 px-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Sales</span>
              <span className="text-xl font-bold text-foreground">₹{totalSales.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-border/30 last:border-0 px-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Discount</span>
              <span className="text-xl font-bold text-foreground">₹{totalDiscount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Operational Cost</span>
              <span className="text-xl font-bold text-foreground">₹{operationalCost.toLocaleString("en-IN")}</span>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECTION 2 — EXPENSES */}
        <Card className="rounded-sm border shadow-none bg-card hover:bg-card-hover transition-all">
           <CardContent className="p-8">
             <div className="flex justify-between items-center bg-destructive/5 rounded-sm border border-destructive/10 p-3 mb-6">
                <span className="text-sm font-black text-destructive tracking-widest uppercase flex items-center gap-2"><ArrowDownRight className="w-4 h-4" /> Total Expenses</span>
                <span className="text-3xl font-black text-destructive">₹{totalExpenses.toLocaleString("en-IN")}</span>
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">Discount Given</span>
                  <span className="text-lg font-bold text-foreground">₹{totalDiscount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">Operational Cost</span>
                  <span className="text-lg font-bold text-foreground">₹{operationalCost.toLocaleString("en-IN")}</span>
                </div>
             </div>
           </CardContent>
        </Card>

        {/* SECTION 4 — INVENTORY SALES */}
        <Card className="rounded-sm border shadow-none bg-card hover:bg-card-hover transition-all">
           <CardContent className="p-8">
             <div className="flex justify-between items-center bg-info/5 rounded-sm border border-info/10 p-3 mb-6">
                <span className="text-sm font-black text-info tracking-widest uppercase flex items-center gap-2"><DollarSign className="w-4 h-4" /> Inventory Sales</span>
                <span className="text-3xl font-black text-info">₹{totalInventorySales.toLocaleString("en-IN")}</span>
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">Shop Sales (Net after discount)</span>
                  <span className="text-lg font-bold text-foreground">₹{shopNet.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">Others Sales</span>
                  <span className="text-lg font-bold text-foreground">₹{othersSales.toLocaleString("en-IN")}</span>
                </div>
             </div>
           </CardContent>
        </Card>

      </div>


      {/* SECTION 5 — ANALYTICS */}
      <div className="w-full pt-4">
         <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4">Analytics Visualization</h2>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <Card className="rounded-sm bg-card border border-border shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Net Result Trend</CardTitle>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{timeframe === "Custom" ? "Custom Range" : timeframe}</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px] w-full">
                {trendData.some((d: any) => d.Profit_Loss !== 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--chart-text)' }} />
                      <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Net Result']} />
                      <Line type="monotone" dataKey="Profit_Loss" stroke={netResult >= 0 ? "var(--chart-3)" : "var(--chart-5)"} strokeWidth={3} dot={{ r: 4 }}>
                         <LabelList dataKey="Profit_Loss" position="top" formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} fontSize={10} fill="var(--chart-text)" />
                      </Line>
                      <Legend verticalAlign="top" content={() => (
                        <div className="flex justify-center gap-4 text-[10px] font-bold pb-2 uppercase tracking-wider">
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div>Profit</span>
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive"></div>Loss</span>
                        </div>
                      )} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2 rounded-sm h-full">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">No financial data yet</span>
                  </div>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t bg-muted rounded-b-xl text-center mt-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {netResult === 0 ? "No result data to display." : (netResult > 0 ? `Trending positive with ₹${netResult.toLocaleString('en-IN')} profit.` : `Warning: Net loss of ₹${Math.abs(netResult).toLocaleString('en-IN')}.`)}
                </p>
              </div>
            </Card>

            <Card className="rounded-sm bg-card border border-border shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Sales vs Expenses</CardTitle>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{timeframe === "Custom" ? "Custom Range" : timeframe}</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px] w-full">
                {breakdownData.some((d: any) => d.Value !== 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakdownData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--chart-text)' }} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                      <Bar dataKey="Value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {breakdownData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Sales' ? 'var(--primary)' : 'var(--chart-5)'} />
                        ))}
                        <LabelList dataKey="Value" position="top" formatter={(value: number) => value > 0 ? `₹${value.toLocaleString()}` : ''} fontSize={10} fill="var(--chart-text)" />
                      </Bar>
                      <Legend verticalAlign="top" content={() => (
                        <div className="flex justify-center gap-4 text-[10px] font-bold pb-2 uppercase tracking-wider">
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-info"></div>Sales</span>
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive"></div>Expenses</span>
                        </div>
                      )} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2 rounded-sm h-full">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">No expenses or sales recorded</span>
                  </div>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t bg-muted rounded-b-xl text-center mt-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {totalSales === 0 && totalExpenses === 0 ? "No records found." : (totalExpenses === 0 ? "No expenses recorded this period." : `Expenses are ${Math.round((totalExpenses / (totalSales || 1)) * 100)}% of sales limit.`)}
                </p>
              </div>
            </Card>

            <Card className="rounded-sm bg-card border border-border shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Inventory Flow</CardTitle>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{timeframe === "Custom" ? "Custom Range" : timeframe}</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px] w-full">
                {inventoryFlow.some((d: any) => d.Value !== 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryFlow} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--chart-text)' }} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [Math.round(value), 'Units']} />
                      <Bar dataKey="Value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {inventoryFlow.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.name === 'Stock In' ? 'var(--chart-3)' : 'var(--chart-6)'} />
                        ))}
                        <LabelList dataKey="Value" position="top" formatter={(value: number) => value > 0 ? Math.round(value) : ''} fontSize={10} fill="var(--chart-text)" />
                      </Bar>
                      <Legend verticalAlign="top" content={() => (
                        <div className="flex justify-center gap-4 text-[10px] font-bold pb-2 uppercase tracking-wider">
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div>Stock In</span>
                           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Stock Out</span>
                        </div>
                      )} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2 rounded-sm h-full">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">No inventory movement yet</span>
                  </div>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t bg-muted rounded-b-xl text-center mt-2">
                <p className="text-xs font-semibold text-muted-foreground">
                   {inventoryFlow[0].Value === 0 && inventoryFlow[1].Value === 0 ? "No stock moved recently." : `Stock In outpaces Stock Out by ${Math.round(inventoryFlow[0].Value - inventoryFlow[1].Value)} units.`}
                </p>
              </div>
            </Card>

         </div>
      </div>
    </div>
  );
}

