import { z } from 'zod';

export const teamIdSchema = z.enum(['blue', 'red']);

export const controllerTypeSchema = z.enum(['HUMAN', 'AI']);

export const matchPhaseSchema = z.enum([
  'LOBBY',
  'KICKOFF',
  'PLAYING',
  'PAUSED',
  'GOAL_PAUSE',
  'FINISHED',
  'CANCELLED',
]);

export const playerRoleSchema = z.enum([
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'FORWARD',
]);

export const tacticalStrategySchema = z.enum([
  'BALANCED',
  'ATTACK',
  'HIGH_PRESS',
  'DEFEND',
  'COUNTER_ATTACK',
]);

export const tacticalFormationSchema = z.enum([
  'COMPACT_1_2_1',
  'WIDE_1_1_2',
  'DEFENSIVE_1_3_0',
  'AGGRESSIVE_1_1_2',
  'BALANCED_1_2_1',
]);

export const vec3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

export const vec2Schema = z.object({
  x: z.number().finite(),
  z: z.number().finite(),
});

export const playerInputSchema = z.object({
  sequence: z.number().int().nonnegative(),
  movement: z.object({
    x: z.number().min(-1).max(1),
    z: z.number().min(-1).max(1),
  }),
  aim: z
    .object({
      x: z.number().finite(),
      z: z.number().finite(),
    })
    .optional(),
  sprint: z.boolean(),
});

export const actionTypeSchema = z.enum(['PASS', 'SHOOT', 'TACKLE']);

export const playerActionSchema = z.object({
  type: actionTypeSchema,
  power: z.number().min(0).max(1).optional(),
  direction: vec2Schema.optional(),
});

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1).max(24),
  isSoloPractice: z.boolean().default(false),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().trim().length(6).toUpperCase(),
  playerName: z.string().trim().min(1).max(24),
});

export const selectTeamSchema = z.object({
  teamId: teamIdSchema,
});

export const tacticalPlanOutputSchema = z.object({
  strategy: tacticalStrategySchema,
  formation: tacticalFormationSchema,
  pressingIntensity: z.number().min(0).max(1),
  attackingRisk: z.number().min(0).max(1),
  roleAssignments: z.array(
    z.object({
      playerId: z.string(),
      role: z.string(),
    })
  ),
  reasonCode: z.string().max(64),
  explanation: z.string().max(256),
});

export type TacticalPlanOutput = z.infer<typeof tacticalPlanOutputSchema>;
