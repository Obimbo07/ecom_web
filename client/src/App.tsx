import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/SignIn';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Profile from './pages/Profile';
import Orders from './components/profile/orders/Orders';
import OrderDetails from './components/profile/orders/OrderDetails';
import Checkout from './pages/Checkout';
import DealsScreen from './pages/DealsScreen';
import DealDetailScreen from './pages/DealsDetailScreen';
import DiscountsScreen from './pages/DiscountsScreen';
import { useEffect, useState } from 'react';
import ShippingAddressScreen from './components/profile/address/ShippingAddressScreen';
import PaymentMethodScreen from './components/profile/payments/PaymentMethodScreen';
import SettingsScreen from './components/profile/settings/SettingsScreen';
import Reviews from './components/profile/reviews/Reviews';
// Component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  // Hide navbar on /login and /register routes
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault(); // Prevent the default browser prompt
      setDeferredPrompt(event); // Store the event for later use
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  console.log(deferredPrompt);
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<Orders />} />
          <Route path="/profile/orders/:orderId" element={<OrderDetails />} />
          <Route path="/checkout/:orderid" element={<Checkout />} />
          <Route path="/deals" element={<DealsScreen />} />
          <Route path="/deals/:dealId" element={<DealDetailScreen />} />
          <Route path="/discounts" element={<DiscountsScreen />} />
          <Route path="/profile/shipping-addresses" element={<ShippingAddressScreen />} />
          <Route path="/profile/payment-methods" element={<PaymentMethodScreen />} />
           {/*<Route path="/profile/promocodes" element={<Promocodes />} /> */} 
          <Route path="/profile/reviews" element={<Reviews />} />
          <Route path="/profile/settings" element={<SettingsScreen />} />" 
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