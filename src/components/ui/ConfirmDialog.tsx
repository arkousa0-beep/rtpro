"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/**
 * Reusable confirmation dialog — replaces all native window.confirm() calls.
 * Matches the dark glassmorphism design system.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="glass border-white/10 rounded-[2rem] bg-black/90 backdrop-blur-3xl max-w-sm mx-auto text-right"
      >
        <DialogHeader>
          <DialogTitle className="text-white font-black text-xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-white/50 font-medium text-right">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="border-t-0 bg-transparent flex-row gap-2 p-0 mt-2">
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`flex-1 rounded-2xl font-black h-12 ${
              destructive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-primary hover:bg-primary/90 text-black"
            }`}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl font-bold h-12 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
