import { MatchState, TeamId } from '@project-eleven/shared';
import { LLMProvider } from './LLMProvider';

export class TacticalAgent {
  private lastEvaluationTick: number = 0;
  private isEvaluating: boolean = false;

  constructor(public readonly teamId: TeamId) {}

  public async evaluate(state: MatchState) {
    if (this.isEvaluating || state.phase !== 'PLAYING') return;

    // Cooldown check: evaluate at most every 15 seconds (900 ticks at 60Hz)
    if (state.tick - this.lastEvaluationTick < 900) {
      return;
    }

    this.isEvaluating = true;
    this.lastEvaluationTick = state.tick;

    try {
      const { plan, isLLM } = await LLMProvider.generateTacticalPlan(
        state,
        this.teamId
      );

      // Atomically update team tactics
      const tactics = state.teams[this.teamId].tactics;
      tactics.strategy = plan.strategy;
      tactics.formation = plan.formation;
      tactics.pressingIntensity = plan.pressingIntensity;
      tactics.attackingRisk = plan.attackingRisk;
      tactics.reasonCode = plan.reasonCode;
      tactics.explanation = plan.explanation;
      tactics.isLLMGenerated = isLLM;
      tactics.lastUpdatedTick = state.tick;

      console.log(
        `[TacticalAgent] ${this.teamId.toUpperCase()} updated strategy: ${
          plan.strategy
        } (${isLLM ? 'LLM' : 'Fallback'}) - "${plan.explanation}"`
      );
    } catch (err) {
      console.error(
        `[TacticalAgent] Error evaluating tactics for ${this.teamId}:`,
        err
      );
    } finally {
      this.isEvaluating = false;
    }
  }
}
