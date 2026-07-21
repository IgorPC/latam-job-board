import { Navigate, Route, Routes } from 'react-router-dom';
import { SetupPage } from '@/features/settings/SetupPage';
import { JobsBoardPage } from '@/features/jobs/JobsBoardPage';
import { JobDetailPage } from '@/features/jobs/JobDetailPage';
import { RequireSetup } from './RequireSetup';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/"
        element={
          <RequireSetup>
            <JobsBoardPage />
          </RequireSetup>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <RequireSetup>
            <JobDetailPage />
          </RequireSetup>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
