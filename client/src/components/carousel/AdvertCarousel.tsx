import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Banner {
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
}

// Sample banner data (replace with your actual images)
const banners: Banner[] = [
  {
    image: 'sales.jpg', // Replace with actual image URL
    title: 'Shop by brand',
    buttonText: 'Shop by Brand',
    buttonLink: '/shop',
  },
  {
    image: 'IMG-20250222-WA0105.jpg',
    title: 'WINTER COLLECTION',
    buttonText: 'Explore',
    buttonLink: '/shop/winter',
  },
  {
    image: 'images.jpeg',
    title: 'Ramadhan Collection',
    buttonText: 'Blessed Seasons',
    buttonLink: '/deals',
  },
];

export function AdvertCarousel() {
  return (
    <Carousel className="w-full h-auto">
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index} className='basis-1/2 md:basis-1/3'>
            <div
              className="relative h-90 bg-contain bg-center bg-origin-padding"
              style={{ backgroundImage: `url(${banner.image})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'c' }}
            >
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0   flex items-center justify-center">
                <div className="text-center mt-30 h-fit ">
                  <a
                    href={banner.buttonLink}
                    className="inline-block bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                  >
                    {banner.buttonText}
                  </a>
                </div>
                
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
    </Carousel>
  );
}

export default AdvertCarousel;