import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { StaffPage } from './pages/StaffPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { SemesterPage } from './pages/SemesterPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
        <Navigation />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/scheduler" element={<SchedulerPage />} />
              <Route path="/semester" element={<SemesterPage />} />
              <Route path="*" element={<Navigate to="/staff" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
