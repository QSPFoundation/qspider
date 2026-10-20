import { Duration } from '@serenity-js/core';

/**
 * How long every wait and eventual check may take (Serenity's interactionTimeout, set by both
 * target configs). Phase 1 allowed 15s for a game to start; a cold desktop launch on CI can need it.
 */
export const INTERACTION_TIMEOUT = Duration.ofSeconds(15);
