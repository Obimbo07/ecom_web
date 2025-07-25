import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { applyFilters } from '../store/slices/productSlice';
import ProductCard from '../components/products/ProductsCard'; // Reuse the ProductCard component

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  specifications: string | null;
  type: string;
  stock_count: string;
  life: string;
  additional_images: { id: number; image: string | null; date: string }[];
  holiday_deals: {
    deal_id: string;
    name: string;
    discount_percentage: number;
    discounted_price: number;
    start_date: string;
    end_date: string;
  } | null;
  old_price: number;
}

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { filteredProducts, loading, error } = useSelector((state: RootState) => state.product) as { filteredProducts: any[]; loading: boolean; error: string | null };

  useEffect(() => {
    if (categoryId) {
      dispatch(applyFilters({ category: categoryId }));
    }
  }, [categoryId, dispatch]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (filteredProducts.length === 0) {
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
        {filteredProducts.map((product) => (
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
