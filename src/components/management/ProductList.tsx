"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Tag, Trash2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

import { Product } from "@/lib/services/productService";

interface ProductListProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductList({ products, onDelete }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {products.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.02 }}
        >
          <Card className="glass border-white/5 rounded-[1.5rem] group hover:bg-white/[0.04] transition-all overflow-hidden border-r-4 border-r-transparent hover:border-r-primary">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <Box className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-white truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {product.categories?.name ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[9px] font-black h-5 px-2">
                       {product.categories.name}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-white/20 font-bold">بدون صنف</span>
                  )}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full text-white/20 hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete?.(product.id!)}              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
