import { ACCESS_LEVEL_LABELS, EMPLOYEE_ACCESS_LEVELS } from './accessLevels';

export const ACCESS_LEVEL_OPTIONS = EMPLOYEE_ACCESS_LEVELS.map((level) => ({
  key: level,
  value: ACCESS_LEVEL_LABELS[level],
}));
