import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import SetPassword from './pages/SetPassword';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/set-password/:token" element={<SetPassword />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
