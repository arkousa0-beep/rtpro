"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Loader2,
  Plus,
  ArrowUpAZ,
  ChevronRight,
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagePageLayoutProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  addButtonLabel?: string;
  addLink?: string;
  addDialogIcon?: any;
  addDialogTitle?: string;
  addDialogDescription?: string;
  addDialogContent?: React.ReactNode;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  isLoading: boolean;
  children: React.ReactNode;
  iconColor?: string;
  buttonColor?: string;
  onAddClick?: () => void;
  showSort?: boolean;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: { value: string; label: string }[];
  extraContent?: React.ReactNode;
  backHref?: string;
}

export function ManagePageLayout({
  title,
  subtitle,
  searchPlaceholder = "ابحث هنا...",
  searchValue,
  onSearchChange,
  addButtonLabel = "إضافة جديد",
  addLink,
  addDialogIcon: addIcon,
  addDialogTitle,
  addDialogDescription,
  addDialogContent,
  isDialogOpen,
  onDialogOpenChange,
  isLoading,
  children,
  iconColor = "text-primary",
  buttonColor = "bg-primary",
  onAddClick,
  showSort = false,
  sortBy,
  onSortChange,
  sortOptions = [],
  extraContent,
  backHref,
}: ManagePageLayoutProps) {
  const AddIcon = addIcon || Plus;
  const AddButton = (
    <Button
      onClick={onAddClick}
      className={cn("h-16 px-8 rounded-2xl text-white font-black text-lg gap-3 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all", buttonColor)}
    >
      <Plus className="w-6 h-6" />
      {addButtonLabel}
    </Button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              {backHref && (
                <Link 
                  href={backHref}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              )}
              <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0", iconColor)}>
                <AddIcon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none uppercase italic">
                  {title}
                </h2>
                <p className="text-white/40 text-[10px] md:text-sm font-bold mt-1 md:mt-2 uppercase tracking-[0.2em] line-clamp-1">
                  {subtitle}
                </p>
              </div>
            </div>

            {addLink ? (
              <Link href={addLink}>
                {AddButton}
              </Link>
            ) : (
              AddButton
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder={searchPlaceholder}
                className="w-full h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all font-bold"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {showSort && (
              <div className="w-full md:w-56">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all font-bold px-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpAZ className="w-4 h-4 text-indigo-500" />
                      <SelectValue placeholder="ترتيب حسب" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/5 rounded-lg">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {extraContent && (
            <div className="mt-6">
              {extraContent}
            </div>
          )}
        </div>

        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />
      </div>

      {/* Main Content */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="grid gap-4 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-24 rounded-[2rem]" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="glass border-white/10 bg-zinc-950/90 text-white sm:max-w-[700px] p-0 rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-0">
            <DialogHeader className="p-8 pb-0 text-right">
              <div className="flex items-center gap-4 justify-end">
                <div className="text-right">
                  <DialogTitle className="text-2xl font-black text-white">
                    {addDialogTitle || `إضافة ${title}`}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-white/40 font-medium italic mt-1">
                    {addDialogDescription || `قم بملء البيانات لإضافة ${title} جديد`}
                  </DialogDescription>
                </div>
                {addIcon && (
                  <div className={`w-12 h-12 rounded-2xl ${iconColor.replace('text-', 'bg-')}/10 flex items-center justify-center ${iconColor} border border-white/5 shadow-xl`}>
                    <AddIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto px-8 pb-8 custom-scrollbar">
              {addDialogContent}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
