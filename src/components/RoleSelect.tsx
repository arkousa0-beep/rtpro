"use client";

import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { updateEmployeeRoleAction } from "@/app/actions/userActions";
import { toast } from "sonner";
import { Loader2, ShieldCheck, User } from "lucide-react";

interface RoleSelectProps {
  userId: string;
  initialRole: "Employee" | "Manager";
  isAdmin: boolean; // Cannot change own role
}

export function RoleSelect({ userId, initialRole, isAdmin }: RoleSelectProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(initialRole);

  const handleRoleChange = async (newRole: "Employee" | "Manager") => {
    if (newRole === role) return;
    
    setLoading(true);
    try {
      const result = await updateEmployeeRoleAction(userId, newRole);
      if (result.success) {
        setRole(newRole);
        toast.success("تم تحديث الصلاحيات بنجاح");
      } else {
        toast.error(result.error || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-white/40">
        <ShieldCheck className="w-4 h-4" />
        <span className="font-bold">مدير (أنت)</span>
      </div>
    );
  }

  return (
    <div className="relative group/role">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-xl z-10">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      <Select 
        value={role} 
        onValueChange={(val: any) => handleRoleChange(val)}
        disabled={loading}
      >
        <SelectTrigger className="w-[140px] h-12 bg-white/5 border-white/5 rounded-xl text-white text-right focus:ring-primary/20 transition-all hover:bg-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass border-white/10 bg-black/90 text-white rounded-xl">
          <SelectItem value="Employee" className="h-10 focus:bg-primary/20 cursor-pointer">
            <div className="flex items-center gap-2 justify-end">
              <span>موظف</span>
              <User className="w-4 h-4 text-white/40" />
            </div>
          </SelectItem>
          <SelectItem value="Manager" className="h-10 focus:bg-primary/20 cursor-pointer">
            <div className="flex items-center gap-2 justify-end">
              <span>مدير</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
