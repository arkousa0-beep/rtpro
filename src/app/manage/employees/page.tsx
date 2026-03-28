import { getAllEmployees, deleteEmployeeAction, updateEmployeeRoleAction } from "@/app/actions/userActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Trash2, 
  Shield, 
  ShieldAlert, 
  Mail, 
  Calendar,
  ChevronRight,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { CreateEmployeeDialog } from "@/components/CreateEmployeeDialog";
import { RoleSelect } from "@/components/RoleSelect";
import { PermissionManager } from "@/components/PermissionManager";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/lib/database.types";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "Manager") {
    redirect("/manage");
  }

  const employees = await getAllEmployees();

  return (
    <div className="min-h-screen pb-40 pt-10 px-6 space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2 text-center md:text-right flex-1">
          <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
             <Link href="/manage" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors ml-2">
                <ChevronRight className="w-5 h-5 text-white/40" />
             </Link>
             <h1 className="text-4xl font-black text-white">إدارة فريق العمل</h1>
          </div>
          <p className="text-white/30 text-lg font-medium">التحكم في الموظفين والمديرين وصلاحياتهم</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center md:justify-end">
        <CreateEmployeeDialog />
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.3em] text-right px-2">أعضاء الفريق ({employees.length})</h3>
        
        {employees.map((emp) => (
          <Card key={emp.id} className="glass border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all duration-500">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              {/* Avatar/Icon */}
              <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center border border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-500 ${
                emp.role === 'Manager' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
              }`}>
                {emp.role === 'Manager' ? <ShieldAlert className="w-10 h-10" /> : <UserCheck className="w-10 h-10" />}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right space-y-2">
                <div className="flex items-center justify-center md:justify-end gap-3">
                  {emp.role === 'Manager' && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase rounded-full border border-amber-500/20">
                      مشرف
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white">{emp.full_name}</h3>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-white/40 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-sans">{emp.id.split('-')[0]}...</span>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">انضم {new Date(emp.created_at).toLocaleDateString('ar-EG')}</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Actions & Role Management */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <RoleSelect 
                  userId={emp.id} 
                  initialRole={emp.role as "Employee" | "Manager"} 
                  isAdmin={user.id === emp.id} 
                />

                <PermissionManager 
                  userId={emp.id}
                  userName={emp.full_name || ""}
                  initialPermissions={emp.permissions}
                />
                
                <div className="flex items-center gap-3">
                  {/* Prevent self-deletion */}
                  {user.id !== emp.id && (
                  <form action={async () => {
                    "use server"
                    await deleteEmployeeAction(emp.id)
                  }}>
                    <Button 
                      type="submit"
                      variant="ghost" 
                      className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {employees.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-xl font-bold">لا يوجد موظفين حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
