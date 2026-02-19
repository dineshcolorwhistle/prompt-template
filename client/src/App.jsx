import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import PageTransition from './components/PageTransition';
import Layout from './components/Layout';
import SetPassword from './pages/SetPassword';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ExpertRequests from './pages/ExpertRequests';
import Industries from './pages/Industries';
import Categories from './pages/Categories';
import Users from './pages/Users';
import MyTemplates from './pages/MyTemplates';

import Templates from './pages/Templates';
import PlaceholderPage from './components/PlaceholderPage';
import './App.css';

const DashboardWrapper = () => (
  <DashboardLayout />
);

const PublicLayoutWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          {children}
        </PageTransition>
      </AnimatePresence>
    </Layout>
  );
};
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route path="/" element={<PublicLayoutWrapper><Home /></PublicLayoutWrapper>} />
          <Route path="/login" element={<PublicLayoutWrapper><Login /></PublicLayoutWrapper>} />
          <Route path="/signup" element={<PublicLayoutWrapper><Signup /></PublicLayoutWrapper>} />
          <Route path="/set-password/:token" element={<PublicLayoutWrapper><SetPassword /></PublicLayoutWrapper>} />

          {/* Dashboard Routes with Dashboard Layout */}
          <Route path="/dashboard" element={<DashboardWrapper />}>
            <Route index element={<DashboardOverview />} />
            <Route path="requests" element={<ExpertRequests />} />
            <Route path="users" element={<Users />} />
            <Route path="templates" element={<Templates />} />

            <Route path="industries" element={<Industries />} />
            <Route path="categories" element={<Categories />} />
            <Route path="comments" element={<PlaceholderPage title="Moderate Comments" />} />
            <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="models" element={<MyTemplates />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
