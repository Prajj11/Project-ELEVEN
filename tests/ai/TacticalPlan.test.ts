import { describe, expect, it } from 'vitest';
import {
  tacticalPlanOutputSchema,
  TacticalPlanOutput,
} from '@project-eleven/shared';
import { FallbackAI } from '../../apps/server/src/ai/FallbackAI';
import { MatchStateManager } from '../../apps/server/src/game/MatchState';

describe('Tactical AI & Plan Validation', () => {
  it('should validate conforming structured tactical plan output', () => {
    const validPlan: TacticalPlanOutput = {
      strategy: 'COUNTER_ATTACK',
      formation: 'COMPACT_1_2_1',
      pressingIntensity: 0.75,
      attackingRisk: 0.65,
      roleAssignments: [],
      reasonCode: 'TURNOVER_TRANSITION',
      explanation: 'Quick vertical break into vacated defensive territory.',
    };

    const parsed = tacticalPlanOutputSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
  });

  it('should reject malformed tactical plans with invalid strategies or out-of-bound pressing', () => {
    const invalidPlan = {
      strategy: 'HYPER_CHAOS', // Invalid enum
      formation: 'COMPACT_1_2_1',
      pressingIntensity: 2.5, // > 1.0
      attackingRisk: -0.5, // < 0.0
      roleAssignments: [],
      reasonCode: 'INVALID',
      explanation: 'Fake strategy',
    };

    const parsed = tacticalPlanOutputSchema.safeParse(invalidPlan);
    expect(parsed.success).toBe(false);
  });

  it('should adapt strategy via FallbackAI when trailing near full-time', () => {
    const state = MatchStateManager.createInitialState('test_match', []);
    // Simulate Blue trailing 0 - 2 with 45s left
    state.teams.blue.score = 0;
    state.teams.red.score = 2;
    state.remainingSeconds = 45;

    const tactics = FallbackAI.evaluateTactics(state, 'blue');
    expect(tactics.strategy).toBe('HIGH_PRESS');
    expect(tactics.pressingIntensity).toBeGreaterThan(0.7);
  });

  it('should adapt strategy via FallbackAI when leading near full-time', () => {
    const state = MatchStateManager.createInitialState('test_match', []);
    // Simulate Red leading 3 - 1 with 30s left
    state.teams.blue.score = 1;
    state.teams.red.score = 3;
    state.remainingSeconds = 30;

    const tactics = FallbackAI.evaluateTactics(state, 'red');
    expect(tactics.strategy).toBe('DEFEND');
    expect(tactics.pressingIntensity).toBeLessThan(0.5);
  });
});
