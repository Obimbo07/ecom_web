import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
const App = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Navbar />
    </div>
  );
};

export default App;