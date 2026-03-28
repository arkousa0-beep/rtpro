"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tag, Loader2, Check } from "lucide-react";
import { Category, categoryService } from "@/lib/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "يجب أن يكون الاسم حرفين على الأقل"),
});

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Category;
}

export function CategoryModal({ open, onOpenChange, initialData }: CategoryModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      if (initialData?.id) {
        await categoryService.update(initialData.id, values);
        toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات التصنيف" });
      } else {
        await categoryService.create(values);
        toast({ title: "تمت الإضافة بنجاح", description: "تم إضافة التصنيف الجديد" });
      }
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 bg-zinc-950/90 text-white sm:max-w-[500px] rounded-[2.5rem] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Tag className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                {initialData ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
              </DialogTitle>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Category Management System
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                    اسم التصنيف
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="مثلاً: خشب طبيعي، معادن..." 
                      className="h-14 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 transition-all text-lg font-bold" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 font-bold" />
                </FormItem>
              )}
            />



            <DialogFooter className="pt-6 border-t border-white/5 flex-row sm:justify-between items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-14 rounded-2xl font-black text-white/40 hover:text-white uppercase tracking-widest"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg gap-3 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-initial"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    {initialData ? "حفظ التعديلات" : "إضافة الآن"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
