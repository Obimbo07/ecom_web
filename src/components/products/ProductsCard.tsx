import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { FaStar, FaShoppingCart, FaEye, FaEllipsisH, FaCheck } from 'react-icons/fa'; // Added FaEllipsisH and FaCheck
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import parse from 'html-react-parser';

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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [fetchDisabled, setFetchDisabled] = useState(false);

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
      // Keep the button in the "success" state for a short time before resetting
      setTimeout(() => setFetchDisabled(false), 2000);
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
          {(hasHolidayDiscount || hasRegularDiscount) && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              {hasHolidayDiscount ? `Deal -${holidayDeal.discount_percentage}%` : `Deal -${regularDiscountPercentage}%`}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-2 mt-2">
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
              className="bg-green-500 p-2 rounded-xl hover:bg-green-600 disabled:bg-gray-400 w-full flex items-center justify-center space-x-2"
              aria-label={fetchDisabled ? 'Product added to cart' : 'Add product to cart'}
            >
              {fetchDisabled ? (
                <>
                  <FaEllipsisH className="text-white text-lg animate-pulse" />
                  <FaCheck className="text-white text-lg" />
                </>
              ) : (
                <FaShoppingCart className="text-white text-lg hover:text-gray-200 transition-colors" />
              )}
            </button>
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  className="bg-green-500 p-2 rounded-xl hover:bg-green-600 w-full flex items-center justify-center space-x-2"
                  aria-label="View product details"
                >
                  <FaEye className="text-white text-lg hover:text-gray-200 transition-colors" />
                
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[80vh] overflow-y-auto bg-white">
                <DrawerHeader>
                  <DrawerTitle className="text-xl">{product.title}</DrawerTitle>
                </DrawerHeader>
                <div className="px-8">
                  {/* Product Image with Navigation Arrows */}
                  <div className="relative">
                    <Carousel className="w-full max-w-md mx-auto">
                      <CarouselContent>
                        {product.image && (
                          <CarouselItem>
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </CarouselItem>
                        )}
                        {product.additional_images.map((img) => (
                          <CarouselItem key={img.id}>
                            {img.image ? (
                              <img
                                src={img.image}
                                alt={`${product.title} additional image`}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                                No image available
                              </div>
                            )}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
                      <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
                    </Carousel>
                  </div>

                  {/* Pricing and Discount */}
                  <div className="flex items-center gap-2">
                    {hasHolidayDiscount ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          Ksh {displayPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          Ksh {product.price}
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                          Deal -{holidayDeal.discount_percentage}%
                        </span>
                      </>
                    ) : hasRegularDiscount ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          Ksh {displayPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          Ksh {product.old_price}
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                          -{regularDiscountPercentage}%
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-green-600">
                        Ksh {displayPrice}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {renderStars(4.5)}
                    <span className="text-sm text-gray-600">(4.5)</span>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-md font-semibold">Description</h4>
                    <div className="text-sm text-gray-600">
                      {parse(product.description || 'No description available')}
                    </div>
                  </div>
                </div>
                <DrawerFooter className="flex bg-white flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={fetchDisabled}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 flex items-center justify-center space-x-2"
                    aria-label={fetchDisabled ? 'Product added to cart' : 'Add product to cart'}
                  >
                    {fetchDisabled ? (
                      <>
                        <FaEllipsisH className="text-white text-lg animate-pulse" />
                        <FaCheck className="text-white text-lg" />
                      </>
                    ) : (
                      <FaShoppingCart className="text-white text-lg hover:text-gray-200 transition-colors" />
                    )}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Close
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;