import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/SignIn';

// Component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();

  // Hide navbar on /login and /register routes
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className=" min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!hideNavbar && <Navbar />}
    </div>
  );
};

const App = () => {
  return (
      <AppContent />
  );
};

export default App;