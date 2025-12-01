import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../lib/supabase';

// Define Category interface based on Supabase schema
interface Category {
  id: number;
  title: string;
  slug: string | null;
  image: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

      {/* Promotional Banner */}
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        <h3 className="text-xl font-bold">SUMMER SALES</h3>
        <p>Up to 50% off</p>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug || category.id}`}
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
            <div>
              <h3 className="text-lg font-semibold">{category.title}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;