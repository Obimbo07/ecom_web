import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

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
  additional_images: { id: number; image: string | null; date: string }[];
  holiday_deals: HolidayDeal | null; // Single deal or null if inactive/multiple not supported here
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [completeDisabled] = useState(false);

  // Regular discount (old_price vs price)
  const hasRegularDiscount = product.old_price > product.price;
  const regularDiscountPercentage = hasRegularDiscount
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  // Holiday deal discount
  const holidayDeal = product.holiday_deals;
  const hasHolidayDiscount = !!holidayDeal;

  // Determine display price (holiday deal takes precedence if active)
  const displayPrice = hasHolidayDiscount ? holidayDeal.discounted_price : product.price;

  // Render stars based on rating (placeholder; adjust if you add a rating field)
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
      const addToCartResponse = await api.post(`/api/cart/`, {
        product_id: product.id,
        quantity: 1,
      });
      console.log(addToCartResponse.data, 'cart response');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
    } finally {
      setFetchDisabled(false); // Re-enable button after request completes
    }
  };

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
          {/* Display discount badge: Holiday deal takes precedence */}
          {hasHolidayDiscount ? (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              Deal -{holidayDeal.discount_percentage}%
            </span>
          ) : hasRegularDiscount ? (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              -{regularDiscountPercentage}%
            </span>
          ) : null}
        </div>
        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(4.5)} {/* Placeholder; replace with actual rating */}
            <span className="text-sm text-gray-600">(4.5)</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Show discounted price if holiday deal, otherwise regular price/discount */}
            {hasHolidayDiscount ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  Ksh {displayPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  Ksh {product.price}
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-green-600">
                  Ksh {displayPrice}
                </span>
                {hasRegularDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    Ksh {product.old_price}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between text-white text-sm space-x-2 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={fetchDisabled}
              className="bg-green-500 p-2 rounded-xl hover:bg-green-600 disabled:bg-gray-400"
            >
              {fetchDisabled ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button
              disabled={completeDisabled}
              className="bg-green-500 p-2 rounded-xl hover:bg-green-600 disabled:bg-gray-400"
            >
              {completeDisabled ? 'Complete' : 'View Product'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;