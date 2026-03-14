"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tag, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { Category } from "@/lib/services/categoryService";

interface CategoryListProps {
  categories: Category[];
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, onDelete }: CategoryListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category, idx) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="glass border-white/5 rounded-[1.5rem] group hover:bg-white/[0.04] transition-all overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white">{category.name}</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mt-1">
                     صنف منتجات
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full text-white/20 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete?.(category.id!)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
