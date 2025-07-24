import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa'; // For star ratings
import api from '@/api';
import { useAuth } from '@/context/AuthContext';

// types/review.ts (or wherever you manage your types)
interface Review {
    id: number;
    user: string;
    product: number; // Product ID; consider adding product_title if updated serializer
    rating: number; // 1 to 5 based on RATING choices
    review_text: string | null; // Optional review text
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    is_approved: boolean;
}


const Reviews = () => {
    const [reviews, setReviews] = useState<Review []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchReviews();
    }, [isAuthenticated, navigate]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('api/users/reviews/');
            if (response.data.message === 'No reviews found') {
                setReviews([]);
            } else {
                setReviews(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch reviews. Please try again later.');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | number | Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="text-center py-10">
                    <p className="text-gray-600">Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchReviews}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">My Product Reviews</h2>
            {reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600">You haven't written any reviews yet.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Shop Products
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-lg shadow-md p-4"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Product ID: {review.product}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                        {renderStars(review.rating)}
                                        <span className="ml-2 text-gray-600">
                                            {review.rating}/5
                                        </span>
                                    </div>
                                    {review.review_text && (
                                        <p className="mt-2 text-gray-700">
                                            {review.review_text}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Created: {formatDate(review.created_at)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Updated: {formatDate(review.updated_at)}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm ${
                                            review.is_approved
                                                ? 'text-green-500'
                                                : 'text-orange-500'
                                        }`}
                                    >
                                        {review.is_approved
                                            ? 'Approved'
                                            : 'Pending Approval'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;