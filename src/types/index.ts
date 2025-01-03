export interface ParaPro {
  id: string;
  email: string;
  name: string;
  type: 'returner' | 'new';
  order: number;
}

export interface UnavailabilityPeriod {
  id: string;
  paraproId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface DutyAssignment {
  id: string;
  date: Date;
  primaryParaproId: string;
  secondaryParaproId: string;
  isOverridden?: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duties: DutyAssignment[];
  stats: Record<string, { primary: number; secondary: number }>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SemesterSettings {
  startDate: Date | null;
  endDate: Date | null;
  noDutyDates: Date[];
}</content>
