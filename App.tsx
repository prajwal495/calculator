import React, { useReducer, useEffect, useRef } from 'react';
import { Button } from './components/Button';
import { Display } from './components/Display';
import { HistoryLog } from './components/HistoryLog';
import { CalcState, CalcActionType, HistoryItem } from './types';
import { askTheDragon } from './services/geminiService';

// --- Reducer Logic ---

type Action =
  | { type: CalcActionType.ADD_DIGIT; payload: string }
  | { type: CalcActionType.CHOOSE_OPERATION; payload: string }
  | { type: CalcActionType.CLEAR }
  | { type: CalcActionType.DELETE }
  | { type: CalcActionType.EVALUATE }
  | { type: CalcActionType.SET_RESULT; payload: { result: string, expression: string } }
  | { type: 'TOGGLE_AI' }
  | { type: 'SET_AI_QUERY'; payload: string }
  | { type: 'START_AI_LOADING' }
  | { type: 'AI_SUCCESS'; payload: { answer: string; flavorText?: string } }
  | { type: 'CLEAR_HISTORY' };

const INITIAL_STATE: CalcState = {
  currentOperand: '0',
  previousOperand: null,
  operation: null,
  overwrite: false,
  history: [],
  isAiMode: false,
  aiQuery: '',
  aiResponse: null,
  isLoading: false,
};

function evaluate({ currentOperand, previousOperand, operation }: Partial<CalcState>): string {
  const prev = parseFloat(previousOperand || '0');
  const current = parseFloat(currentOperand || '0');
  if (isNaN(prev) || isNaN(current)) return '';
  
  let computation = 0;
  switch (operation) {
    case '+': computation = prev + current; break;
    case '-': computation = prev - current; break;
    case '*': computation = prev * current; break;
    case '/': computation = prev / current; break;
  }
  return computation.toString();
}

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case CalcActionType.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload,
          overwrite: false,
        };
      }
      if (action.payload === '0' && state.currentOperand === '0') return state;
      if (action.payload === '.' && state.currentOperand.includes('.')) return state;
      if (state.currentOperand === '0' && action.payload !== '.') {
         return { ...state, currentOperand: action.payload };
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${action.payload}`,
      };

    case CalcActionType.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) return state;
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: action.payload,
        };
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: action.payload,
          previousOperand: state.currentOperand,
          currentOperand: '0',
        };
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload,
        currentOperand: '0',
      };

    case CalcActionType.CLEAR:
      return { ...state, currentOperand: '0', previousOperand: null, operation: null, isAiMode: false, aiResponse: null };

    case CalcActionType.DELETE:
      if (state.overwrite) {
        return { ...state, overwrite: false, currentOperand: '0' };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: '0' };
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case CalcActionType.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }
      const result = evaluate(state);
      const expression = `${state.previousOperand} ${state.operation} ${state.currentOperand}`;
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: result,
        history: [
          ...state.history,
          {
            expression,
            result,
            timestamp: Date.now(),
            type: 'standard'
          }
        ]
      };

    case 'TOGGLE_AI':
      return { ...state, isAiMode: !state.isAiMode, aiResponse: null, aiQuery: '' };
    
    case 'SET_AI_QUERY':
      return { ...state, aiQuery: action.payload };

    case 'START_AI_LOADING':
      return { ...state, isLoading: true, aiResponse: null };

    case 'AI_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        aiResponse: action.payload.flavorText || null,
        // We put the answer in the calculator display to continue using it
        currentOperand: action.payload.answer,
        isAiMode: false, // Switch back to allow using the number
        overwrite: true,
        history: [
            ...state.history,
            {
              expression: state.aiQuery,
              result: action.payload.answer,
              timestamp: Date.now(),
              type: 'dragon'
            }
          ]
      };
    
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    default:
      return state;
  }
}


export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const aiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.isAiMode && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [state.isAiMode]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.aiQuery.trim()) return;

    dispatch({ type: 'START_AI_LOADING' });
    const response = await askTheDragon(state.aiQuery);
    
    // Check if the answer is a pure number or string
    // If it's a number, we can use it in calc. If text, just display it.
    // For this app, we treat it as the new current operand.
    dispatch({ type: 'AI_SUCCESS', payload: response });
  };

  return (
    <div className="min-h-screen bg-[#0a0202] text-white flex flex-col lg:flex-row items-stretch justify-center overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-60"></div>

      {/* Main Calculator Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-gradient-to-b from-[#1a0505] to-black p-6 rounded-3xl border-4 border-[#5c1010] shadow-[0_0_50px_rgba(139,0,0,0.3)] relative">
          
          {/* Dragon Header/Logo */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#0f0f0f] px-6 py-2 rounded-full border-2 border-amber-700 shadow-lg flex items-center gap-2 whitespace-nowrap">
             <span className="text-2xl">🐉</span>
             <h1 className="font-dragon text-amber-600 font-bold tracking-widest text-lg">RED DRAGON</h1>
          </div>

          {/* Screen */}
          <div className="mt-6">
            <Display 
              previousOperand={state.previousOperand} 
              currentOperand={state.currentOperand} 
              operation={state.operation} 
              isAiMode={state.isAiMode}
            />
          </div>

          {/* AI Overlay Input */}
          {state.isAiMode && (
             <div className="absolute top-36 left-6 right-6 z-20">
               <form onSubmit={handleAiSubmit} className="bg-black/90 p-4 rounded-xl border border-red-600 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <label className="block text-red-400 text-sm font-dragon mb-2">Ask the Ancient One:</label>
                  <input
                    ref={aiInputRef}
                    type="text"
                    value={state.aiQuery}
                    onChange={(e) => dispatch({ type: 'SET_AI_QUERY', payload: e.target.value })}
                    className="w-full bg-[#1a0a0a] border border-red-900 rounded p-2 text-white focus:outline-none focus:border-amber-500 mb-4 font-mono"
                    placeholder="e.g. Volume of a sphere radius 6..."
                    disabled={state.isLoading}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_AI' })}
                      className="px-4 py-2 text-xs text-red-400 hover:text-red-200"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      disabled={state.isLoading}
                      className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded font-dragon text-sm flex items-center gap-2"
                    >
                      {state.isLoading ? 'CONJURING...' : 'SUMMON'}
                    </button>
                  </div>
               </form>
             </div>
          )}

          {/* AI Response Flavor Text */}
          {state.aiResponse && !state.isAiMode && (
             <div className="mb-4 bg-amber-900/10 border border-amber-900/30 p-2 rounded text-center">
                <p className="text-amber-500 italic text-sm font-serif">"{state.aiResponse}"</p>
             </div>
          )}

          {/* Keypad */}
          <div className={`grid grid-cols-4 gap-3 sm:gap-4 transition-opacity duration-300 ${state.isAiMode ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
            <Button label="AC" variant="action" onClick={() => dispatch({ type: CalcActionType.CLEAR })} span={2} />
            <Button label="DEL" variant="action" onClick={() => dispatch({ type: CalcActionType.DELETE })} />
            <Button label="÷" variant="operator" onClick={() => dispatch({ type: CalcActionType.CHOOSE_OPERATION, payload: '/' })} />
            
            <Button label="7" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '7' })} />
            <Button label="8" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '8' })} />
            <Button label="9" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '9' })} />
            <Button label="×" variant="operator" onClick={() => dispatch({ type: CalcActionType.CHOOSE_OPERATION, payload: '*' })} />
            
            <Button label="4" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '4' })} />
            <Button label="5" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '5' })} />
            <Button label="6" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '6' })} />
            <Button label="-" variant="operator" onClick={() => dispatch({ type: CalcActionType.CHOOSE_OPERATION, payload: '-' })} />
            
            <Button label="1" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '1' })} />
            <Button label="2" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '2' })} />
            <Button label="3" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '3' })} />
            <Button label="+" variant="operator" onClick={() => dispatch({ type: CalcActionType.CHOOSE_OPERATION, payload: '+' })} />
            
            <Button label="." onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '.' })} />
            <Button label="0" onClick={() => dispatch({ type: CalcActionType.ADD_DIGIT, payload: '0' })} />
            
            {/* The Dragon Button (AI) */}
            <Button 
              label="🐲" 
              variant="action" 
              onClick={() => dispatch({ type: 'TOGGLE_AI' })} 
              className="text-2xl"
            />
            
            <Button label="=" variant="dragon" onClick={() => dispatch({ type: CalcActionType.EVALUATE })} />
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="hidden lg:block h-screen shadow-2xl z-20">
         <HistoryLog history={state.history} onClear={() => dispatch({ type: 'CLEAR_HISTORY' })} />
      </div>

      {/* Mobile History Toggle (Optional implementation, but sticking to simple layout for now, history is hidden on small screens per layout classes above) */}
    </div>
  );
}
