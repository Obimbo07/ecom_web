import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { FaStar, FaShoppingCart, FaEye, FaEllipsisH, FaCheck } from 'react-icons/fa';
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
import { addToGuestCart, addToUserCart } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number | null;
  image: string | null;
  images: string[] | null;
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
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const [fetchDisabled, setFetchDisabled] = useState(false);

  // Regular discount (old_price vs price)
  const hasRegularDiscount = product.old_price !== null && product.old_price > product.price;
  const regularDiscountPercentage = hasRegularDiscount && product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  // Display price
  const displayPrice = product.price;

  // Get primary image (main image) or first from images array
  const primaryImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
  
  // Get all images for carousel (combine main image with additional images)
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || [])
  ];

  // Render stars based on rating (placeholder; can be enhanced with actual ratings)
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
      if (user) {
        await addToUserCart(user.id, {
          productId: product.id,
          quantity: 1,
        });
      } else {
        addToGuestCart({
          product_id: product.id,
          quantity: 1,
        });
      }
      // Success - button will show checkmark for 2 seconds
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setTimeout(() => setFetchDisabled(false), 2000);
    }
  };

  return (
    <Card className="border-none overflow-hidden p-0 shadow-lg hover:]]-xl transition-shadow">
      <CardContent className="p-0">
        <div className="w-full h-48 bg-gray-200 relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
          {hasRegularDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              -{regularDiscountPercentage}%
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-green-600">
              Ksh {displayPrice.toLocaleString()}
            </span>
            {hasRegularDiscount && (
              <span className="text-sm text-gray-500 line-through">
                Ksh {product.old_price?.toLocaleString()}
              </span>
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
                        {/* All images - primary first, then additional */}
                        {allImages.map((imageUrl, index) => (
                          <CarouselItem key={index}>
                            <img
                              src={imageUrl}
                              alt={`${product.title} view ${index + 1}`}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </CarouselItem>
                          ))}
                      </CarouselContent>
                      {product.images && product.images.length > 1 && (
                        <>
                          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
                          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
                        </>
                      )}
                    </Carousel>
                  </div>

                  {/* Pricing and Discount */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-lg font-bold text-green-600">
                      Ksh {displayPrice.toLocaleString()}
                    </span>
                    {hasRegularDiscount && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          Ksh {product.old_price?.toLocaleString()}
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                          -{regularDiscountPercentage}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(4.5)}
                    <span className="text-sm text-gray-600">(4.5)</span>
                  </div>

                  {/* Stock info */}
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${product.stock_count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock_count > 0 ? `In Stock (${product.stock_count} available)` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">Description</h4>
                    <div className="text-sm text-gray-600 mt-2">
                      {product.description ? parse(product.description) : 'No description available'}
                    </div>
                  </div>

                  {/* Specifications */}
                  {product.specifications && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Specifications</h4>
                      <div className="text-sm text-gray-600 mt-2">
                        {parse(product.specifications)}
                      </div>
                    </div>
                  )}
                </div>
                <DrawerFooter className="flex bg-white flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={fetchDisabled || product.stock_count === 0}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                    aria-label={fetchDisabled ? 'Product added to cart' : 'Add product to cart'}
                  >
                    {fetchDisabled ? (
                      <>
                        <FaEllipsisH className="text-white text-lg animate-pulse" />
                        <FaCheck className="text-white text-lg" />
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="text-white text-lg" />
                        <span>Add to Cart</span>
                      </>
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