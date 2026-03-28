"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import { ProfilePermissions } from "@/lib/database.types";
import { updateEmployeePermissionsAction } from "@/app/actions/userActions";
import { toast } from "sonner";

interface PermissionManagerProps {
  userId: string;
  initialPermissions: ProfilePermissions;
  userName: string;
}

const PERMISSION_LABELS: Record<keyof ProfilePermissions, string> = {
  pos: "نقطة البيع (POS)",
  inventory: "المخزن والمخزون",
  finance: "المالية والتقارير",
  staff: "إدارة الموظفين",
  customers: "إدارة العملاء",
  suppliers: "إدارة الموردين",
  transactions: "سجل العمليات",
};

export function PermissionManager({ userId, initialPermissions, userName }: PermissionManagerProps) {
  const [permissions, setPermissions] = useState<ProfilePermissions>(initialPermissions);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggle = (key: keyof ProfilePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateEmployeePermissionsAction(userId, permissions);
    setLoading(false);
    
    if (result.success) {
      toast.success("تم تحديث الصلاحيات بنجاح");
      setOpen(false);
    } else {
      toast.error(result.error || "فشل تحديث الصلاحيات");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-xl border-primary/20 hover:border-primary/50 gap-2 h-10 px-4"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          الصلاحيات
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-8 pb-0">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black">إدارة الصلاحيات</DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              تخصيص أذونات الوصول لـ {userName}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="flex flex-col gap-2 p-6 max-h-[60vh] overflow-y-auto">
          {(Object.keys(PERMISSION_LABELS) as Array<keyof ProfilePermissions>).map((key) => (
            <div 
              key={key} 
              onClick={() => handleToggle(key)}
              className="flex items-center justify-between p-4 px-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Label 
                htmlFor={key} 
                className="font-bold text-base cursor-pointer flex-1 text-right"
              >
                {PERMISSION_LABELS[key]}
              </Label>
              <Switch 
                id={key}
                checked={permissions[key]} 
                onCheckedChange={() => handleToggle(key)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>

        <div className="p-6 pt-2">
          <DialogFooter className="flex-row gap-3 sm:gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl h-14 hover:bg-white/5 font-bold text-white/60"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-[2] rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
