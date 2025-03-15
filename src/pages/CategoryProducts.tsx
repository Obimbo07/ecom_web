import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/products/ProductsCard'; // Reuse the ProductCard component

// Define Product interface based on ProductResponse
// Define interfaces based on the ProductResponse and HolidayDeal structure
interface HolidayDeal {
  deal_id: string;
  name: string;
  discount_percentage: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number;
  image: string | null;
  description: string;
  specifications: string | null;
  type: string;
  stock_count: string;
  life: string;
  additional_images: { id: number; image: string | null; date: string }[];
  holiday_deals: HolidayDeal | null;
}

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>(); // Get category ID from URL
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch products for the selected category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`api/products/category/${categoryId}/`);
        setProducts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">No Products Found</h2>
        <Link to="/categories" className="text-blue-500 hover:underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">Products in Category</h2>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
      <Link to="/categories" className="block mt-6 text-blue-500 hover:underline">
        Back to Categories
      </Link>
    </div>
  );
};

export default CategoryProducts;