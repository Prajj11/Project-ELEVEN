import { create } from 'zustand';
import {
  MatchFinalResults,
  MatchSnapshot,
  TeamId,
} from '@project-eleven/shared';

interface MatchStoreState {
  matchId: string | null;
  assignedPlayerId: string | null;
  assignedTeamId: TeamId | null;
  currentSnapshot: MatchSnapshot | null;
  previousSnapshot: MatchSnapshot | null;
  finalResults: MatchFinalResults | null;
  recentEvents: Array<{ id: string; type: string; description: string; timestamp: number }>;
  goalOverlayText: string | null;
  setMatchStarted: (matchId: string, assignedPlayerId: string, assignedTeamId: TeamId) => void;
  updateSnapshot: (snapshot: MatchSnapshot) => void;
  setFinalResults: (results: MatchFinalResults) => void;
  addEvent: (event: { type: string; description: string; timestamp: number }) => void;
  showGoalOverlay: (text: string) => void;
  hideGoalOverlay: () => void;
  resetMatch: () => void;
}

export const useMatchStore = create<MatchStoreState>((set) => ({
  matchId: null,
  assignedPlayerId: null,
  assignedTeamId: null,
  currentSnapshot: null,
  previousSnapshot: null,
  finalResults: null,
  recentEvents: [],
  goalOverlayText: null,

  setMatchStarted: (matchId, assignedPlayerId, assignedTeamId) =>
    set({
      matchId,
      assignedPlayerId,
      assignedTeamId,
      finalResults: null,
      recentEvents: [],
      goalOverlayText: null,
    }),

  updateSnapshot: (newSnapshot) =>
    set((state) => ({
      previousSnapshot: state.currentSnapshot,
      currentSnapshot: newSnapshot,
    })),

  setFinalResults: (finalResults) => set({ finalResults }),

  addEvent: (event) =>
    set((state) => ({
      recentEvents: [
        { ...event, id: Math.random().toString(36).substring(7) },
        ...state.recentEvents.slice(0, 9),
      ],
    })),

  showGoalOverlay: (goalOverlayText) => set({ goalOverlayText }),
  hideGoalOverlay: () => set({ goalOverlayText: null }),

  resetMatch: () =>
    set({
      matchId: null,
      assignedPlayerId: null,
      assignedTeamId: null,
      currentSnapshot: null,
      previousSnapshot: null,
      finalResults: null,
      recentEvents: [],
      goalOverlayText: null,
    }),
}));
