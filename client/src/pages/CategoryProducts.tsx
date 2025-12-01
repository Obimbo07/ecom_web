import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts, getCategoryByIdOrSlug } from '../lib/supabase';
import ProductCard from '../components/products/ProductsCard';

// Define interfaces based on Supabase schema
interface Category {
  id: number;
  title: string;
  slug: string | null;
  image: string | null;
  description: string | null;
}

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number | null;
  image: string | null;
  description: string | null;
  specifications: string | null;
  type: string | null;
  stock_count: number;
  slug: string | null;
  featured: boolean;
  category: {
    id: number;
    title: string;
    slug: string | null;
  } | null;
  images: Array<{
    id: number;
    image: string;
    alt_text: string | null;
    display_order: number;
  }>;
}

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>(); // Get category ID or slug from URL
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch category and products from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryData = await getCategoryByIdOrSlug(categoryId);
        setCategory(categoryData as Category);
        
        // Fetch products for this category
        const productsData = await getProducts({
          categoryId: (categoryData as Category).id,
        });
        setProducts(productsData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <p className="text-gray-600 mb-4">
          {category ? `No products available in "${category.title}" category.` : 'This category has no products yet.'}
        </p>
        <Link to="/categories" className="text-blue-500 hover:underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Category Header */}
      {category && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">{category.title}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>
      )}
      
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