import {
  MatchState,
  TacticalPlanOutput,
  tacticalPlanOutputSchema,
  TeamId,
} from '@project-eleven/shared';
import { env } from '../config/env';
import { FallbackAI } from './FallbackAI';

export class LLMProvider {
  public static async generateTacticalPlan(
    state: MatchState,
    teamId: TeamId
  ): Promise<{ plan: TacticalPlanOutput; isLLM: boolean }> {
    // If provider is fallback or no key is provided, use deterministic FallbackAI
    if (env.LLM_PROVIDER === 'fallback' || !env.LLM_API_KEY) {
      return {
        plan: FallbackAI.evaluateTactics(state, teamId),
        isLLM: false,
      };
    }

    try {
      // Create concise read-only snapshot for the LLM
      const promptPayload = {
        team: teamId,
        score: {
          our: state.teams[teamId].score,
          opponent: state.teams[teamId === 'blue' ? 'red' : 'blue'].score,
        },
        remainingSeconds: state.remainingSeconds,
        ballPosition: state.ball.position,
        possessionTeam: state.possessionTeam,
        currentStrategy: state.teams[teamId].tactics.strategy,
      };

      // Query Gemini / OpenAI with strict timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.LLM_TIMEOUT_MS);

      if (env.LLM_PROVIDER === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.LLM_MODEL}:generateContent?key=${env.LLM_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are the Tactical AI Coach for team ${teamId.toUpperCase()} in a 5v5 soccer match. Analyze the match state and choose the next strategy. Output valid JSON matching schema: {"strategy":"BALANCED"|"ATTACK"|"HIGH_PRESS"|"DEFEND"|"COUNTER_ATTACK", "formation":"COMPACT_1_2_1"|"WIDE_1_1_2"|"DEFENSIVE_1_3_0"|"AGGRESSIVE_1_1_2"|"BALANCED_1_2_1", "pressingIntensity":number (0-1), "attackingRisk":number (0-1), "roleAssignments":[], "reasonCode":string, "explanation":string max 120 chars}.\nState: ${JSON.stringify(
                      promptPayload
                    )}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Gemini API returned status ${res.status}`);
        }

        const data = await res.json();
        const textContent =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textContent) {
          const parsed = JSON.parse(textContent);
          const validated = tacticalPlanOutputSchema.parse(parsed);
          return { plan: validated, isLLM: true };
        }
      }
    } catch (err) {
      console.warn(
        `[LLMProvider] Tactical call failed for ${teamId}, using deterministic fallback. Error:`,
        (err as Error).message
      );
    }

    return {
      plan: FallbackAI.evaluateTactics(state, teamId),
      isLLM: false,
    };
  }
}
