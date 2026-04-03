import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { ChildrenList } from './ChildrenList';
import { AcademicDetail } from './AcademicDetail';
import { BehaviorProfile } from './BehaviorProfile';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard />
            </motion.div>
          } />
          <Route path="/children" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChildrenList />
            </motion.div>
          } />
          <Route path="/student/:id" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AcademicDetail />
            </motion.div>
          } />
          <Route path="/behavior/:id" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BehaviorProfile />
            </motion.div>
          } />
          {/* Placeholder routes */}
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/notifications" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
