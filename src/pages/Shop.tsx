import { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  Store, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Search, 
  Plus, 
  StoreIcon,
  Check,
  X as XIcon,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// A simple Input mock if "@/components/ui/input" is not imported properly; assuming standard setup
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={cn("flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
    {...props}
  />
);

export default function Shop() {
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const initialShops = [
    {
      id: "shop1",
      displayId: "SHP-001",
      name: "Palipattu Shop",
      managerName: "Kumar",
      phone: "9959492720",
      location: "Palipattu",
      links: { in: "/shop/1/inventory/in", out: "/shop/1/inventory/out" }
    },
    {
      id: "shop2",
      displayId: "SHP-002",
      name: "Tirupati Shop",
      managerName: "Ramesh Babu",
      phone: "9866425756",
      location: "Tirupati",
      links: { in: "/shop/2/inventory/in", out: "/shop/2/inventory/out" }
    },
    {
      id: "shop3",
      displayId: "SHP-003",
      name: "Goa Beach Shop",
      managerName: "Ricardo",
      phone: "9800000010",
      location: "Goa",
      links: { in: "/shop/3/inventory/in", out: "/shop/3/inventory/out" }
    }
  ];

  const [shops, setShopsState] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("pinaka_shops_list");
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialShops;
  });

  const setShops = (newShops: any[]) => {
    setShopsState(newShops);
    localStorage.setItem("pinaka_shops_list", JSON.stringify(newShops));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this shop?")) {
      setShops(shops.filter(s => s.id !== id));
    }
  };

  const startEdit = (e: React.MouseEvent, shop: any) => {
    e.stopPropagation();
    setEditingShop(shop.id);
    setEditFormData({ ...shop });
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingShop(null);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShops(shops.map(s => s.id === editingShop ? { ...s, ...editFormData } : s));
    setEditingShop(null);
  };

  const handleAddShop = () => {
    const newId = `shop_${Date.now()}`;
    const newShop = {
      id: newId,
      displayId: "",
      name: "New Shop",
      managerName: "",
      phone: "",
      location: "",
      links: { in: `/shop/${newId}/inventory/in`, out: `/shop/${newId}/inventory/out` }
    };
    setShops([newShop, ...shops]);
    setEditingShop(newId);
    setEditFormData(newShop);
  };

  return (
    <div className="animate-fade-in pb-12 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Breadcrumb items={[{ label: "Shop Management" }]} />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Shop Management</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Manage offline shops and owners.</p>
          </div>
          <Button onClick={handleAddShop} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 h-11 px-6 rounded-sm shadow-none">
            <Plus className="w-5 h-5" /> Add New Shop
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-none">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search shops by name, ID or location..." 
            className="pl-12 py-3 h-auto text-base rounded-sm border-border shadow-none focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <Card key={shop.id} className="border border-border shadow-none hover:bg-card-hover transition-colors rounded-sm overflow-hidden bg-card">
            <CardContent className="p-6">
              
              {/* Card Header (Icon only now) */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
                  <StoreIcon className="w-5 h-5" />
                </div>
              </div>

              {editingShop === shop.id ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Shop Name</label>
                    <Input 
                      value={editFormData.name} 
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Shop ID</label>
                    <Input 
                      value={editFormData.displayId} 
                      onChange={e => setEditFormData({...editFormData, displayId: e.target.value})} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Manager Name</label>
                    <Input 
                      value={editFormData.managerName} 
                      onChange={e => setEditFormData({...editFormData, managerName: e.target.value})} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                    <Input 
                      value={editFormData.phone} 
                      onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                    <Input 
                      value={editFormData.location} 
                      onChange={e => setEditFormData({...editFormData, location: e.target.value})} 
                      className="h-9"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveEdit} className="w-full bg-success hover:bg-success/90 text-success-foreground h-10">
                      <Check className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" className="w-full h-10 text-muted-foreground hover:bg-accent">
                      <XIcon className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Title, ID and Actions (Edit/Delete) parallel to title */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-tight">{shop.name}</h3>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{shop.displayId}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => startEdit(e, shop)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, shop.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                        title="Delete Shop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{shop.managerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{shop.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link to={`/shop/${shop.id}`} className="block w-full">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 h-11 rounded-sm shadow-none"
                      >
                        <StoreIcon className="w-4 h-4" /> Open Shop
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
