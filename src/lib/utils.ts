import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(val: string | number) {
  if (val === undefined || val === null) return '';
  const strVal = String(val);
  
  // Keep values that end with M or B as is (e.g., Rp 450M)
  if (strVal.toUpperCase().endsWith('M') || strVal.toUpperCase().endsWith('B')) {
    return strVal;
  }
  
  const num = parseInt(strVal.replace(/\D/g, ''), 10);
  if (isNaN(num)) return strVal;
  
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(num);
}
