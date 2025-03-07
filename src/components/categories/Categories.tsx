import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

// Define Category interface based on CategoryResponse
interface Category {
  id: number;
  title: string;
  image: string | null; // Base64-encoded image
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Women'); // Default tab

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories/');
        setCategories(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on active tab (mock filtering for demo)
  const filteredCategories = categories.filter((category) => {
    if (activeTab === 'Women') return category.title.toLowerCase().includes('women');
    if (activeTab === 'Men') return category.title.toLowerCase().includes('men');
    if (activeTab === 'Kids') return category.title.toLowerCase().includes('kids');
    return true; // Default: show all
  });

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Link to="/search" className="text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        {['Women', 'Men', 'Kids'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 rounded-full font-semibold transition ${
              activeTab === tab ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Promotional Banner */}
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        <h3 className="text-xl font-bold">SUMMER SALES</h3>
        <p>Up to 50% off</p>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="flex items-center bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
          >
            {/* Category Image */}
            <div className="w-24 h-24 mr-4">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                  No image
                </div>
              )}
            </div>
            {/* Category Title */}
            <h3 className="text-lg font-semibold">{category.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;