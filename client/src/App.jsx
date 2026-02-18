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
import Industries from './pages/Industries';
import Categories from './pages/Categories';
import Users from './pages/Users';
import MyTemplates from './pages/MyTemplates';
import Variables from './pages/Variables';
import Templates from './pages/Templates';
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
            <Route path="users" element={<Users />} />
            <Route path="templates" element={<Templates />} />
            <Route path="variables" element={<Variables />} />
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
