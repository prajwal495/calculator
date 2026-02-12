import React from 'react';

interface DisplayProps {
  previousOperand: string | null;
  currentOperand: string;
  operation: string | null;
  isAiMode: boolean;
}

const formatOperand = (operand: string) => {
  if (operand === null || operand === undefined) return '';
  const [integer, decimal] = operand.split('.');
  if (decimal == null) return new Intl.NumberFormat('en-US').format(parseInt(integer));
  return `${new Intl.NumberFormat('en-US').format(parseInt(integer))}.${decimal}`;
};

export const Display: React.FC<DisplayProps> = ({ previousOperand, currentOperand, operation, isAiMode }) => {
  return (
    <div className="w-full bg-[#180808] p-4 sm:p-6 rounded-xl border-2 border-[#3d1010] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex flex-col items-end justify-between h-32 sm:h-40 mb-6 relative overflow-hidden group">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-red-900/5 pointer-events-none animate-pulse" />

      {isAiMode ? (
        <div className="w-full h-full flex items-center justify-center text-red-500/80 font-dragon italic text-lg z-10">
          The Dragon Awaits Your Query...
        </div>
      ) : (
        <>
          <div className="text-red-400/60 text-lg sm:text-xl font-dragon min-h-[1.5rem] z-10 break-all text-right">
            {previousOperand ? `${formatOperand(previousOperand)} ${operation}` : ''}
          </div>
          <div className="text-red-100 text-4xl sm:text-5xl font-dragon font-bold z-10 break-all text-right w-full">
             {currentOperand ? formatOperand(currentOperand) : '0'}
          </div>
        </>
      )}
      
      {/* Decorative corner accents */}
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-red-600 rounded-full opacity-50 shadow-[0_0_10px_#ff0000]" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full opacity-50 shadow-[0_0_10px_#ff0000]" />
    </div>
  );
};
