import { create } from 'zustand';
import type { CubeState } from '../types/cube';
import { SOLVED_STATE, applyMove } from '../engine/cube';

interface CubeStore {
  state: CubeState;
  history: CubeState[];
  currentIndex: number;
  
  // Actions
  setState: (state: CubeState) => void;
  applyMoveAction: (move: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  state: SOLVED_STATE.map(face => face.map(row => [...row])),
  history: [],
  currentIndex: -1,
  
  setState: (newState: CubeState) => {
    set({ state: newState });
  },
  
  applyMoveAction: (move: string) => {
    const { state, history, currentIndex } = get();
    const newState = applyMove(state, move);
    
    // 删除当前位置之后的历史记录
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    set({
      state: newState,
      history: newHistory,
      currentIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const { history, currentIndex } = get();
    if (currentIndex > 0) {
      set({
        state: history[currentIndex - 1],
        currentIndex: currentIndex - 1,
      });
    }
  },
  
  redo: () => {
    const { history, currentIndex } = get();
    if (currentIndex < history.length - 1) {
      set({
        state: history[currentIndex + 1],
        currentIndex: currentIndex + 1,
      });
    }
  },
  
  reset: () => {
    const initialState = SOLVED_STATE.map(face => face.map(row => [...row]));
    set({
      state: initialState,
      history: [initialState],
      currentIndex: 0,
    });
  },
  
  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,
}));
