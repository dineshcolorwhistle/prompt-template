import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import SetPassword from './pages/SetPassword';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ExpertRequests from './pages/ExpertRequests';
import PlaceholderPage from './components/PlaceholderPage';
import './App.css';

const DashboardWrapper = () => (
  <DashboardLayout />
);

const PublicLayoutWrapper = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);
function App() {
  return (
    <AuthProvider>
      <Router>
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
            <Route path="users" element={<PlaceholderPage title="Manage Users" />} />
            <Route path="templates" element={<PlaceholderPage title="Approve Templates" />} />
            <Route path="industries" element={<PlaceholderPage title="Manage Industries" />} />
            <Route path="categories" element={<PlaceholderPage title="Manage Categories" />} />
            <Route path="comments" element={<PlaceholderPage title="Moderate Comments" />} />
            <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="models" element={<PlaceholderPage title="My Models" />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
