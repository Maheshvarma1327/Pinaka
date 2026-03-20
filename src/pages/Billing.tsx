import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, FileText, Clock, Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const bills = [
  { billNo: "#001", date: "2026-03-10", items: "Bone 10kg, Boneless 5kg", total: 3250, payment: "Cash", status: "Paid" },
  { billNo: "#002", date: "2026-03-11", items: "Bone 12kg, Boneless 6kg", total: 3900, payment: "PhonePe", status: "Paid" },
  { billNo: "#003", date: "2026-03-12", items: "Bone 7kg, Boneless 4kg", total: 2400, payment: "Cash", status: "Paid" },
  { billNo: "#004", date: "2026-03-13", items: "Bone 15kg, Boneless 8kg", total: 5000, payment: "Mixed", status: "Paid" },
  { billNo: "#005", date: "2026-03-14", items: "Bone 9kg, Boneless 6kg", total: 3300, payment: "PhonePe", status: "Pending" },
  { billNo: "#006", date: "2026-03-15", items: "Bone 11kg, Boneless 7kg", total: 3950, payment: "Cash", status: "Paid" },
  { billNo: "#007", date: "2026-03-16", items: "Bone 6kg, Boneless 3kg", total: 1950, payment: "Cash", status: "Paid" },
  { billNo: "#008", date: "2026-03-17", items: "Bone 14kg, Boneless 9kg", total: 5050, payment: "Mixed", status: "Pending" },
  { billNo: "#009", date: "2026-03-18", items: "Bone 8kg, Boneless 5kg", total: 2850, payment: "PhonePe", status: "Paid" },
  { billNo: "#010", date: "2026-03-19", items: "Bone 10kg, Boneless 7kg", total: 3750, payment: "Cash", status: "Paid" },
];

export default function Billing() {
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);
  const pending = bills.filter(b => b.status === "Pending").length;

  const handleDownload = () => {
    window.print();
    toast({ title: "Download", description: "Use print dialog to save as PDF" });
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Billing" }]} />
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Bills" value={String(bills.length)} icon={<FileText className="h-5 w-5 text-info" />} color="info" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5 text-success" />} color="success" />
        <StatCard title="Pending Payments" value={String(pending)} icon={<Clock className="h-5 w-5 text-warning" />} color="warning" />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">All Bills</h2>
        <DataTable
          columns={[
            { header: "Bill No", accessor: "billNo" },
            { header: "Date", accessor: "date" },
            { header: "Items", accessor: "items" },
            { header: "Total (₹)", accessor: (r) => `₹${r.total.toLocaleString("en-IN")}` },
            { header: "Payment", accessor: "payment" },
            { header: "Status", accessor: (r) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {r.status}
              </span>
            )},
            { header: "Actions", accessor: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBill(r)}><Eye className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}><Download className="h-3.5 w-3.5" /></Button>
              </div>
            )},
          ]}
          data={bills}
          pageSize={10}
        />
      </div>

      {/* Bill Preview Modal */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="border rounded-lg p-6 font-mono text-sm space-y-4">
              <div className="text-center border-b pb-3">
                <h3 className="text-lg font-bold text-primary">PINAKA</h3>
                <p className="text-muted-foreground">B Manoj</p>
                <p className="text-muted-foreground">Bill No: {selectedBill.billNo} &nbsp; Date: {selectedBill.date}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Item</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">Rate</th>
                    <th className="text-right py-1">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">Bone</td>
                    <td className="text-right">10kg</td>
                    <td className="text-right">₹200</td>
                    <td className="text-right">₹2,000</td>
                  </tr>
                  <tr>
                    <td className="py-1">Boneless</td>
                    <td className="text-right">5kg</td>
                    <td className="text-right">₹250</td>
                    <td className="text-right">₹1,250</td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{selectedBill.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Payment: {selectedBill.payment}</span>
                  <span>Status: {selectedBill.status}</span>
                </div>
              </div>
              <div className="border-t pt-4 text-center text-xs text-muted-foreground">
                <div className="border-b border-dashed mb-2 pb-4">&nbsp;</div>
                <p>Authorized Signatory</p>
              </div>
              <Button className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download as PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
