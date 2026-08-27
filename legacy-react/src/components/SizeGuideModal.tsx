import { useState } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";

const sizeData = [
  { size: "XS", us: "0-2", bust: "31-32", waist: "24-25", hip: "34-35" },
  { size: "S", us: "4-6", bust: "33-34", waist: "26-27", hip: "36-37" },
  { size: "M", us: "8-10", bust: "35-36", waist: "28-29", hip: "38-39" },
  { size: "L", us: "12-14", bust: "37-39", waist: "30-32", hip: "40-42" },
  { size: "XL", us: "16-18", bust: "40-42", waist: "33-35", hip: "43-45" },
  { size: "XXL", us: "20-22", bust: "43-45", waist: "36-38", hip: "46-48" },
];

const shoeData = [
  { us: "5", eu: "35", uk: "2.5" },
  { us: "6", eu: "36", uk: "3.5" },
  { us: "7", eu: "37.5", uk: "4.5" },
  { us: "8", eu: "38.5", uk: "5.5" },
  { us: "9", eu: "40", uk: "6.5" },
  { us: "10", eu: "41", uk: "7.5" },
];

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ open, onClose, category }: SizeGuideModalProps) {
  const isShoes = category === "shoes";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-card rounded-xl border border-border shadow-xl z-[91] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold">Size Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <p className="text-sm text-muted-foreground mb-4">
                All measurements are in inches. For the best fit, we recommend measuring yourself
                and comparing with the size chart below.
              </p>

              {!isShoes ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-semibold">Size</th>
                        <th className="text-left py-3 px-3 font-semibold">US</th>
                        <th className="text-left py-3 px-3 font-semibold">Bust</th>
                        <th className="text-left py-3 px-3 font-semibold">Waist</th>
                        <th className="text-left py-3 px-3 font-semibold">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData.map((row) => (
                        <tr key={row.size} className="border-b border-border/50 hover:bg-accent/50">
                          <td className="py-3 px-3 font-medium">{row.size}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.us}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.bust}&quot;</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.waist}&quot;</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.hip}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-semibold">US</th>
                        <th className="text-left py-3 px-3 font-semibold">EU</th>
                        <th className="text-left py-3 px-3 font-semibold">UK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shoeData.map((row) => (
                        <tr key={row.us} className="border-b border-border/50 hover:bg-accent/50">
                          <td className="py-3 px-3 font-medium">{row.us}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.eu}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.uk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">How to Measure</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li><strong>Bust:</strong> Measure around the fullest part of your chest.</li>
                  <li><strong>Waist:</strong> Measure around the narrowest part of your natural waistline.</li>
                  <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <Button variant="rose" onClick={onClose} className="w-full">
                Got It
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
