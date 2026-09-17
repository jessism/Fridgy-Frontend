import { NONE_ID } from '../constants/onboardingConstants';

/**
 * Multi-select toggle where "None" is mutually exclusive with everything
 * else, as on the app's dietary and allergy screens.
 *
 * Picking None clears the rest; picking anything else clears None. The list
 * never ends up empty — deselecting the last real option falls back to None.
 */
export const toggleWithNone = (list = [], id) => {
  if (id === NONE_ID) return [NONE_ID];

  const withoutNone = list.filter((x) => x !== NONE_ID);
  const next = withoutNone.includes(id)
    ? withoutNone.filter((x) => x !== id)
    : [...withoutNone, id];

  return next.length ? next : [NONE_ID];
};
