"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Box, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

import { Product } from "@/lib/services/productService";

interface ProductListProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductList({ products, onDelete, onEdit, onViewDetails }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.03 }}
          layout
        >
          <Card 
            className="glass border-white/5 rounded-[2rem] group hover:bg-white/[0.04] transition-all overflow-hidden relative cursor-pointer"
            onClick={() => onViewDetails(product)}
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box className="w-7 h-7" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-white text-lg truncate leading-tight group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    {product.categories?.name ? (
                      <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 rounded-lg text-[10px] font-black px-2 py-0.5">
                         {product.categories.name}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">بدون صنف</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-9 h-9 rounded-xl bg-white/5 text-white/40 hover:text-indigo-500 hover:bg-indigo-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(product);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-9 h-9 rounded-xl bg-white/5 text-white/40 hover:text-indigo-500 hover:bg-indigo-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-10 h-10 rounded-xl text-white/20 hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 transition-all active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(product.id!);
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
            
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
