"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Loader2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import Link from "next/link";

interface ManagePageLayoutProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  addButtonLabel?: string;
  addDialogTitle?: string;
  addDialogIcon: React.ElementType;
  addDialogContent?: React.ReactNode;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  isLoading: boolean;
  children: React.ReactNode;
  iconColor?: string;
  buttonColor?: string;
  extraContent?: React.ReactNode;
  addLink?: string;
  onAddClick?: () => void; // Optional explicit click handler to bypass dialog trigger
}

export const ManagePageLayout = ({
  title,
  subtitle,
  searchPlaceholder = "ابحث هنا...",
  searchValue,
  onSearchChange,
  addButtonLabel = "إضافة جديد",
  addDialogTitle,
  addDialogIcon: AddIcon,
  addDialogContent,
  isDialogOpen,
  onDialogOpenChange,
  isLoading,
  children,
  iconColor = "text-primary",
  buttonColor = "bg-primary",
  extraContent,
  addLink,
  onAddClick
}: ManagePageLayoutProps) => {
  return (
    <div className="min-h-screen pb-32 pt-6 space-y-8 px-1">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/manage" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              {title}
            </h2>
            <p className="text-white/40 text-sm font-medium">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={searchPlaceholder} 
              className="pr-12 h-14 bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-primary focus-visible:border-primary/50 text-right glass transition-all"
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
          
          {addButtonLabel && (
            addLink ? (
              <Button asChild className={cn("h-14 px-6 rounded-2xl text-white shadow-xl shadow-primary/20 font-black border border-white/10 group active:scale-95 transition-all text-lg", buttonColor)}>
                <Link href={addLink}>
                  <Plus className="w-6 h-6 md:ml-2 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden md:inline">{addButtonLabel}</span>
                </Link>
              </Button>
            ) : onAddClick ? (
              <Button onClick={onAddClick} className={cn("h-14 px-6 rounded-2xl text-white shadow-xl shadow-primary/20 font-black border border-white/10 group active:scale-95 transition-all text-lg", buttonColor)}>
                <Plus className="w-6 h-6 md:ml-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden md:inline">{addButtonLabel}</span>
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button className={cn("h-14 px-6 rounded-2xl text-white shadow-xl shadow-primary/20 font-black border border-white/10 group active:scale-95 transition-all text-lg", buttonColor)}>
                    <Plus className="w-6 h-6 md:ml-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden md:inline">{addButtonLabel}</span>
                  </Button>
                </DialogTrigger>
                {addDialogContent && (
                  <DialogContent className="rounded-[2.5rem] border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl p-8 max-w-sm mx-auto">
                    <DialogHeader className="space-y-3">
                      <div className={cn("w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 mx-auto mb-2", iconColor)}>
                        <AddIcon className="w-8 h-8" />
                      </div>
                      <DialogTitle className="text-center text-2xl font-black text-white">
                        {addDialogTitle || `إضافة ${title}`}
                      </DialogTitle>
                    </DialogHeader>
                    {addDialogContent}
                  </DialogContent>
                )}
              </Dialog>
            )
          )}
        </div>

        {extraContent}

        {isLoading ? (
          <div className="text-center py-24 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-white/40 text-lg font-bold tracking-wide">جاري التحميل...</p>
          </div>
        ) : children}
      </div>
    </div>
  );
};
