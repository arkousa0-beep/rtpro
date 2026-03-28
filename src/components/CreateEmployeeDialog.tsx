"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserPlus, Loader2, KeyRound, Mail, User } from "lucide-react";
import { createEmployeeAction } from "@/app/actions/userActions";
import { toast } from "sonner";

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Employee" as "Employee" | "Manager",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createEmployeeAction(formData);
      if (result.success) {
        toast.success("تم إنشاء حساب الموظف بنجاح");
        setOpen(false);
        setFormData({ fullName: "", email: "", password: "", role: "Employee" });
      } else {
        toast.error(result.error || "حدث خطأ أثناء إنشاء الحساب");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-20 rounded-[2rem] flex-1 border-white/5 bg-primary/20 text-xl font-bold text-white hover:bg-primary/30 transition-all group border border-primary/20">
          <UserPlus className="w-6 h-6 ml-3 text-primary group-hover:scale-110 transition-transform" />
          إضافة موظف جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 rounded-[2.5rem] max-w-md p-8 bg-black/80 backdrop-blur-2xl">
        <DialogHeader className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 border border-primary/20">
             <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-black text-center text-white">إضافة موظف للمجمع</DialogTitle>
          <DialogDescription className="text-center text-white/40 text-lg">
            قم بإنشاء حساب جديد للموظف مع تحديد صلاحياته
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-white/60 mr-2 block text-right">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <Input 
                required
                className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-lg text-white text-right focus:border-primary/50 transition-all"
                placeholder="اسم الموظف"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 mr-2 block text-right">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <Input 
                required
                type="email"
                className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-lg text-white text-right focus:border-primary/50 transition-all font-sans"
                placeholder="example@store.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 mr-2 block text-right">كلمة المرور</Label>
            <div className="relative">
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <Input 
                required
                type="password"
                className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-lg text-white text-right focus:border-primary/50 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 mr-2 block text-right">الرتبة (الصلاحية)</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val: any) => setFormData({...formData, role: val})}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-lg text-white text-right focus:border-primary/50 transition-all">
                <SelectValue placeholder="اختر الرتبة" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 bg-black/90 text-white rounded-2xl">
                <SelectItem value="Employee" className="h-12 focus:bg-primary/20 cursor-pointer">موظف (Employee)</SelectItem>
                <SelectItem value="Manager" className="h-12 focus:bg-primary/20 cursor-pointer">مدير (Manager)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary text-xl font-black text-black hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "إصدار الحساب والبدء"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
