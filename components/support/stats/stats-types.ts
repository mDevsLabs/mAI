export type SupportTimelineDatum = {
  date: string;
  crees: number;
  resolus: number;
};

export type SupportProjectDatum = {
  name: string;
  value: number;
};

export type SupportPriorityDatum = {
  key?: string;
  name: string;
  value: number;
  color?: string;
};

export type SupportCategoryDatum = {
  name: string;
  value: number;
};

export type SupportStatsData = {
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  closed?: number;
  resolutionRate?: number | null;
  avgResolutionHours?: number | null;
  timeline?: SupportTimelineDatum[];
  byProject?: SupportProjectDatum[];
  byPriority?: SupportPriorityDatum[];
  byCategory?: SupportCategoryDatum[];
};
