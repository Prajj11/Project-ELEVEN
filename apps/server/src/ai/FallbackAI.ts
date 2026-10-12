import {
  MatchState,
  TacticalFormation,
  TacticalPlanOutput,
  TacticalStrategy,
  TeamId,
} from '@project-eleven/shared';

export class FallbackAI {
  public static evaluateTactics(
    state: MatchState,
    teamId: TeamId
  ): TacticalPlanOutput {
    const opponentTeamId: TeamId = teamId === 'blue' ? 'red' : 'blue';
    const ourScore = state.teams[teamId].score;
    const oppScore = state.teams[opponentTeamId].score;
    const scoreDiff = ourScore - oppScore;
    const remainingTime = state.remainingSeconds;

    let strategy: TacticalStrategy = 'BALANCED';
    let formation: TacticalFormation = 'BALANCED_1_2_1';
    let pressingIntensity = 0.55;
    let attackingRisk = 0.5;
    let reasonCode = 'BALANCED_MAINTENANCE';
    let explanation =
      'Maintaining balanced 1-2-1 structure with standard lane coverage.';

    if (scoreDiff < 0) {
      // Trailing in score
      if (remainingTime < 60 || scoreDiff <= -2) {
        strategy = 'HIGH_PRESS';
        formation = 'AGGRESSIVE_1_1_2';
        pressingIntensity = 0.85;
        attackingRisk = 0.85;
        reasonCode = 'TRAILING_LATE_URGENCY';
        explanation =
          'Team is trailing in the final minutes. Shifting to high-line full-pitch pressing.';
      } else {
        strategy = 'ATTACK';
        formation = 'WIDE_1_1_2';
        pressingIntensity = 0.7;
        attackingRisk = 0.75;
        reasonCode = 'OVERCOMING_DEFICIT';
        explanation =
          'Pushing midfielders higher and stretching width to create progressive shooting options.';
      }
    } else if (scoreDiff > 0) {
      // Leading in score
      if (remainingTime < 60) {
        strategy = 'DEFEND';
        formation = 'DEFENSIVE_1_3_0';
        pressingIntensity = 0.35;
        attackingRisk = 0.25;
        reasonCode = 'PRESERVING_VICTORY';
        explanation =
          'Leading near full-time. Holding compact low-block defense around our penalty box.';
      } else {
        strategy = 'COUNTER_ATTACK';
        formation = 'COMPACT_1_2_1';
        pressingIntensity = 0.6;
        attackingRisk = 0.55;
        reasonCode = 'EXPLOITING_OPPONENT_OVEREXTENSION';
        explanation =
          'Opponents are pressing forward; absorbing pressure and looking for quick vertical counters.';
      }
    }

    return {
      strategy,
      formation,
      pressingIntensity,
      attackingRisk,
      roleAssignments: [],
      reasonCode,
      explanation,
    };
  }
}
