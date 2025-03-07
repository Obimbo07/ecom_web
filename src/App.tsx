import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/SignIn';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';

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
          <Route path="/cart" element={<Cart />} />
          <Route path="/shop" element={<Categories />} />
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
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