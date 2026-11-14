import type { AnswersQuestions, PerformsActivities, UsesAbilities } from '@serenity-js/core';

/**
 * Serenity types an Interaction's actor without PerformsActivities, though it is always an Actor.
 * Checked here, so a target can run its own steps (e.g. a click) as reported activities.
 */
export function performer<A extends UsesAbilities & AnswersQuestions>(actor: A): A & PerformsActivities {
  if (typeof (actor as Partial<PerformsActivities>).attemptsTo !== 'function') {
    throw new TypeError('this interaction needs an actor that performs activities');
  }
  return actor as A & PerformsActivities;
}
