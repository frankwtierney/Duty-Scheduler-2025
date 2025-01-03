import { ParaPro, UnavailabilityPeriod, DutyAssignment, Schedule } from '@/types';
import { addDays, eachDayOfInterval } from 'date-fns';

// Mock data storage
let mockParapros: ParaPro[] = [];
let mockUnavailabilityPeriods: UnavailabilityPeriod[] = [];
let mockDuties: DutyAssignment[] = [];
let mockSchedules: Schedule[] = [];

// Initialize with some mock data
export function initializeMockStore(): void {
  // Clear existing data
  clearMockData();

  // Add mock parapros
  mockParapros = [
    { id: 'parapro-1', name: 'John Doe', email: 'john@example.com', type: 'returner', order: 0 },
    { id: 'parapro-2', name: 'Jane Smith', email: 'jane@example.com', type: 'new', order: 1 },
    { id: 'parapro-3', name: 'Bob Wilson', email: 'bob@example.com', type: 'returner', order: 2 },
  ];

  // Add mock unavailability periods
  mockUnavailabilityPeriods = [];

  // Create initial mock duties for the next 30 days
  const today = new Date();
  const endDate = addDays(today, 30);
  const dateRange = eachDayOfInterval({ start: today, end: endDate });

  mockDuties = dateRange.map((date, index) => ({
    id: `duty-${index + 1}`,
    date,
    primaryParaproId: mockParapros[index % 3].id,
    secondaryParaproId: mockParapros[(index + 1) % 3].id,
    isOverridden: false,
  }));

  // Add mock schedule
  const mockSchedule: Schedule = {
    id: 'schedule-1',
    name: 'Fall 2024',
    startDate: today,
    endDate,
    duties: mockDuties,
    stats: mockParapros.reduce((acc, parapro) => {
      acc[parapro.id] = {
        primary: mockDuties.filter(d => d.primaryParaproId === parapro.id).length,
        secondary: mockDuties.filter(d => d.secondaryParaproId === parapro.id).length,
      };
      return acc;
    }, {} as Record<string, { primary: number; secondary: number }>),
    isArchived: false,
    createdAt: today,
    updatedAt: today,
  };

  mockSchedules = [mockSchedule];
}

// Helper functions
export function clearMockData(): void {
  mockParapros = [];
  mockUnavailabilityPeriods = [];
  mockDuties = [];
  mockSchedules = [];
}

// Parapro operations
export function getMockParapros(): ParaPro[] {
  return [...mockParapros];
}

export function addMockParapro(parapro: Omit<ParaPro, 'id' | 'order'>): void {
  const newParapro: ParaPro = {
    ...parapro,
    id: `parapro-${mockParapros.length + 1}`,
    order: mockParapros.length,
  };
  mockParapros.push(newParapro);
  
  // Update mock duties to include the new parapro
  regenerateMockDuties();
}

// Regenerate duties with current parapros
function regenerateMockDuties(): void {
  if (mockParapros.length === 0) return;

  const today = new Date();
  const endDate = addDays(today, 30);
  const dateRange = eachDayOfInterval({ start: today, end: endDate });

  mockDuties = dateRange.map((date, index) => ({
    id: `duty-${index + 1}`,
    date,
    primaryParaproId: mockParapros[index % mockParapros.length].id,
    secondaryParaproId: mockParapros[(index + 1) % mockParapros.length].id,
    isOverridden: false,
  }));

  // Update the schedule with new duties
  if (mockSchedules.length > 0) {
    const stats = mockParapros.reduce((acc, parapro) => {
      acc[parapro.id] = {
        primary: mockDuties.filter(d => d.primaryParaproId === parapro.id).length,
        secondary: mockDuties.filter(d => d.secondaryParaproId === parapro.id).length,
      };
      return acc;
    }, {} as Record<string, { primary: number; secondary: number }>);

    mockSchedules[0] = {
      ...mockSchedules[0],
      duties: mockDuties,
      stats,
      updatedAt: new Date(),
    };
  }
}

// Unavailability operations
export function getMockUnavailability(paraproId: string): UnavailabilityPeriod[] {
  return mockUnavailabilityPeriods.filter(u => u.paraproId === paraproId);
}

export function addMockUnavailability(period: Omit<UnavailabilityPeriod, 'id'>): void {
  const newPeriod: UnavailabilityPeriod = {
    ...period,
    id: `unavail-${mockUnavailabilityPeriods.length + 1}`,
  };
  mockUnavailabilityPeriods.push(newPeriod);
}

// Duty operations
export function getMockDuties(): DutyAssignment[] {
  return [...mockDuties];
}

export function addMockDuty(duty: Omit<DutyAssignment, 'id'>): void {
  const newDuty: DutyAssignment = {
    ...duty,
    id: `duty-${mockDuties.length + 1}`,
  };
  mockDuties.push(newDuty);
}

export function updateMockDuty(id: string, updates: Partial<DutyAssignment>): void {
  const index = mockDuties.findIndex(d => d.id === id);
  if (index !== -1) {
    mockDuties[index] = { ...mockDuties[index], ...updates };
  }
}

// Schedule operations
export function getMockSchedules(): Schedule[] {
  return [...mockSchedules];
}

export function addMockSchedule(schedule: Schedule): void {
  mockSchedules.push(schedule);
}

// Mock user operations
export function findMockUser(email: string) {
  const mockUsers = {
    'admin@example.com': {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
    'parapro1@example.com': {
      id: 'parapro-1',
      email: 'parapro1@example.com',
      name: 'ParaPro User',
      role: 'paraprofessional',
    },
  };

  return mockUsers[email as keyof typeof mockUsers] || null;
}

// Initialize mock data
initializeMockStore();
