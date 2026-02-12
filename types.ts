export enum CalcActionType {
  ADD_DIGIT = 'ADD_DIGIT',
  CHOOSE_OPERATION = 'CHOOSE_OPERATION',
  CLEAR = 'CLEAR',
  DELETE = 'DELETE',
  EVALUATE = 'EVALUATE',
  SET_ERROR = 'SET_ERROR',
  SET_RESULT = 'SET_RESULT'
}

export interface CalcState {
  currentOperand: string;
  previousOperand: string | null;
  operation: string | null;
  overwrite: boolean;
  history: HistoryItem[];
  isAiMode: boolean;
  aiQuery: string;
  aiResponse: string | null;
  isLoading: boolean;
}

export interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
  type: 'standard' | 'dragon';
}

export interface DragonResponse {
  answer: string;
  flavorText?: string;
}
