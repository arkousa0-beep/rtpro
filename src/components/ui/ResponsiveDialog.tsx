"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  open,
  onOpenChange,
  className,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn("glass border-white/10 bg-zinc-950/90 text-white sm:max-w-[700px] p-0 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]", className)}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500 z-50" />
          
          {/* Persistent Header */}
          <div className="p-8 pb-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md z-40">
            <DialogHeader className="space-y-1 text-right flex-1">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange?.(false)}
              className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            <div className="relative">
              {children}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn("bg-zinc-950 border-white/10 text-white rounded-t-[2.5rem]", className)}>
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-white/10" />
        <DrawerHeader className="text-right border-b border-white/5 pb-6 px-8">
          <DrawerTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {title}
          </DrawerTitle>
          {description && (
            <DrawerDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-8 py-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
          {children}
        </div>
        <DrawerFooter className="pt-2 pb-8 px-8 border-t border-white/5">
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full rounded-2xl h-14 font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">
              إغلاق النافذة
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
