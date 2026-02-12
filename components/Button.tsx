import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'operator' | 'action' | 'dragon';
  span?: number;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, className = '', variant = 'default', span = 1 }) => {
  const baseStyles = "relative overflow-hidden font-dragon text-xl sm:text-2xl transition-all duration-200 active:scale-95 shadow-md border-b-4 active:border-b-0 active:translate-y-1 rounded-lg flex items-center justify-center";
  
  const variants = {
    default: "bg-neutral-800 text-gray-200 border-neutral-950 hover:bg-neutral-700 hover:text-white shadow-black/50",
    operator: "bg-red-950 text-red-100 border-red-950 hover:bg-red-900 hover:text-white shadow-red-950/50",
    action: "bg-stone-700 text-stone-200 border-stone-900 hover:bg-stone-600 shadow-black/50",
    dragon: "bg-gradient-to-br from-orange-600 to-red-600 text-black font-bold border-red-900 hover:from-orange-500 hover:to-red-500 shadow-orange-900/40"
  };

  const spanClass = span === 2 ? "col-span-2" : "col-span-1";

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanClass} ${className} h-16 sm:h-20`}
    >
      <span className="z-10">{label}</span>
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};
