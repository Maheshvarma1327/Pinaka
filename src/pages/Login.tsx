import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ham } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-pig.png')" }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-sm bg-card/10 border border-white/20 shadow-none backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 border border-primary/30">
            <Ham className="w-8 h-8 text-primary shadow-none" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pinaka Retail</h1>
          <p className="text-sm text-gray-300 mt-2">Sign in to manage your inventory</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-200">Name</Label>
            <Input 
              type="text" 
              placeholder="Enter your name" 
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-primary/50 text-lg py-6"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200">Password</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-primary/50 text-lg py-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-none shadow-primary/20"
          >
            Login
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Forgot password? <a href="#" className="text-primary hover:text-primary/80 transition-colors">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}
