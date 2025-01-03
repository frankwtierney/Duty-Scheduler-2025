import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { getMockDuties, getMockUnavailability, addMockUnavailability } from './mock';

// Always use mock mode in development
export const useMockMode = true;

// Mock implementations
const mockAuth: Auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    throw new Error('Mock auth: Use mock login instead');
  },
} as unknown as Auth;

// Mock Firestore implementation
const mockDb: Firestore = {
  collection: (collectionName: string) => ({
    doc: () => ({
      get: async () => ({
        data: () => null,
      }),
    }),
    where: () => ({
      get: async () => ({
        docs: [],
      }),
    }),
    get: async () => {
      let docs: any[] = [];
      
      switch (collectionName) {
        case 'duties':
          docs = getMockDuties().map(duty => ({
            id: duty.id,
            data: () => ({ ...duty }),
          }));
          break;
        case 'unavailability':
          docs = getMockUnavailability('parapro-1').map(period => ({
            id: period.id,
            data: () => ({ ...period }),
          }));
          break;
      }

      return { docs };
    }),
    add: async (data: any) => {
      if (collectionName === 'unavailability') {
        addMockUnavailability(data);
      }
      return { id: 'mock-id' };
    }),
  }),
} as unknown as Firestore;

// Export mock instances
export const app = {} as FirebaseApp;
export const auth = mockAuth;
export const db = mockDb;

console.info('🔧 Running in development mode with mock authentication');
