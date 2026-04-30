import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-t border-white/5">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            "p-2 rounded-lg border transition-all",
            currentPage === 1 
              ? "border-white/5 text-slate-700 cursor-not-allowed" 
              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                currentPage === page
                  ? "bg-accent text-white"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            "p-2 rounded-lg border transition-all",
            currentPage === totalPages 
              ? "border-white/5 text-slate-700 cursor-not-allowed" 
              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
