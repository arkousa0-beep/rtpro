"use client";

import React from "react";
import { 
  Trash2, 
  Pencil, 
  Tag, 
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Category } from "@/lib/services/categoryService";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CategoryListProps {
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (category: Category) => void;
  onViewDetails: (category: Category) => void;
}

export function CategoryList({ categories, onDelete, onEdit, onViewDetails }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <Tag className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
          لا توجد أصناف
        </h3>
        <p className="text-white/40 font-bold mt-2 uppercase tracking-widest text-xs">
          No Categories Found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group relative"
        >
          {/* Card Border Flare */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="glass p-6 rounded-[2rem] border-white/5 relative flex flex-col h-full hover:bg-white/10 transition-colors duration-500 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                <Tag className="w-7 h-7 text-indigo-500" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-white/20 hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-xl w-48 p-2">
                  <DropdownMenuItem 
                    onClick={() => onViewDetails(category)}
                    className="gap-3 text-white focus:bg-white/5 cursor-pointer rounded-lg px-3 h-11"
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold">عرض التفاصيل</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEdit(category)}
                    className="gap-3 text-white focus:bg-white/5 cursor-pointer rounded-lg px-3 h-11"
                  >
                    <Pencil className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">تعديل التصنيف</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem 
                    onClick={() => {
                      onDelete(category.id!);
                    }}
                    className="gap-3 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-lg px-3 h-11"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-bold">حذف التصنيف</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
                {category.name}
              </h3>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-white/5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-indigo-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-black text-indigo-400">+5</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewDetails(category)}
                className="text-indigo-400 hover:text-indigo-300 hover:bg-transparent font-black gap-2 group/btn p-0"
              >
                التفاصيل
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-700" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
