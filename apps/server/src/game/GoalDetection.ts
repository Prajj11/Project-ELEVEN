import { MatchState, TeamId } from '@project-eleven/shared';
import { PhysicsWorld } from './PhysicsWorld';

export class GoalDetection {
  public static checkAndHandleGoal(
    state: MatchState,
    onGoalScored: (scoringTeam: TeamId, description: string) => void
  ): boolean {
    if (state.phase !== 'PLAYING') return false;

    const scoredOnTeam = PhysicsWorld.checkGoal(state.ball.position);
    if (!scoredOnTeam) return false;

    // The opposing team scored the goal!
    const scoringTeam: TeamId = scoredOnTeam === 'blue' ? 'red' : 'blue';

    // Increment score
    state.teams[scoringTeam].score += 1;
    state.phase = 'GOAL_PAUSE';
    state.kickoffTeam = scoredOnTeam;

    const desc = `${scoringTeam.toUpperCase()} TEAM SCORED! (${state.teams.blue.score} - ${state.teams.red.score})`;
    onGoalScored(scoringTeam, desc);

    return true;
  }
}
