import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { ChildrenList } from './ChildrenList';
import { AcademicDetail } from './AcademicDetail';
import { BehaviorProfile } from './BehaviorProfile';
import { ReportsOverview } from './ReportsOverview';
import { ChildReport } from './ChildReport';
import { Login } from './Login';
import { RequireAuth } from './components/RequireAuth';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Dashboard />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/children"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChildrenList />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/student/:id"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AcademicDetail />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/behavior/:id"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <BehaviorProfile />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ReportsOverview />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/reports/child/:studentId"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChildReport />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/reports/child/:studentId/:reportId"
            element={
              <RequireAuth>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChildReport />
                </motion.div>
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Navigate to="/" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Navigate to="/" replace />
              </RequireAuth>
            }
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
