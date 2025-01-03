export interface SchedulingConstraints {
  startDate: Date;
  endDate: Date;
  requiredDutiesPerNight: number;
}

export interface SchedulingResult {
  success: boolean;
  duties: Array<{
    date: Date;
    assignments: string[];
  }>;
  errors?: string[];
  stats?: {
    [userId: string]: {
      primaryCount: number;
      secondaryCount: number;
      totalCount: number;
    };
  };
}
