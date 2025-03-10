import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa'; // For rating stars
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Define the Product interface based on the ProductResponse model
interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number;
  image: string | null; // Base64-encoded image
  rating: number;
  additional_images: { id: number; image: string | null; date: string }[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completeDisabled, setCompleteDisabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const hasDiscount = product.old_price > product.price;
  const discountPercentage = hasDiscount

  // Render stars based on rating (placeholder logic; adjust based on actual rating source)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  const handleAddToCart = async () => {
    setFetchDisabled(true);
  
    try {
      const addToCartResponse = await api.post(`/api/cart/items/`, {
        product_id: product.id,
        quantity: 1,
      });
      console.log(addToCartResponse.data, 'cart response');
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setMessage(err.response?.data?.detail || 'Failed to add to cart.');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none overflow-hidden p-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-0">
        <div className="w-full h-48 bg-gray-200 relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>
        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(4.5)} {/* Placeholder rating; replace with actual rating if available */}
            <span className="text-sm text-gray-600">(4.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              Ksh {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                Ksh {product.old_price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex justify-between text-white text-sm space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={fetchDisabled}
              className="bg-green-500 p-2 rounded-xl"
            >
              {fetchDisabled ? `Added to cart` : 'Add to cart'}
            </button>
            
            <button
              // onClick={handleComplete}
              disabled={completeDisabled}
              className="bg-green-500 p-2 rounded-xl"
            >
              {completeDisabled ? `Complete (s)` : 'View Product'}
            </button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;