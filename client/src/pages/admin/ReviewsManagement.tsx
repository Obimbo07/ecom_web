import { useEffect, useState } from 'react'
import { Star, Search, Check, X, Trash2 } from 'lucide-react'
import { getAllReviews, approveReview, deleteReview } from '@/lib/supabase'

interface Review {
  id: number
  rating: number
  review_text?: string | null
  is_approved: boolean
  is_verified_purchase: boolean
  created_at: string
  profile?: { username: string; full_name?: string | null; image?: string | null } | null
  products?: { title: string; image?: string | null }
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews()
      setReviews(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number, approved: boolean) => {
    try {
      await approveReview(id, approved)
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: approved } : r))
    } catch (error) {
      alert('Failed to update review')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteReview(id)
      setReviews(reviews.filter(r => r.id !== id))
    } catch (error) {
      alert('Failed to delete review')
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.products?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.profile?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && review.is_approved) ||
      (statusFilter === 'pending' && !review.is_approved)
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600 mt-2">Moderate and manage product reviews</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start gap-4">
              {review.profile?.image ? (
                <img src={review.profile.image} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{review.profile?.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">@{review.profile?.username}</p>
                    <p className="text-sm text-gray-600">{review.products?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                
                {review.review_text && (
                  <p className="mt-3 text-gray-700">{review.review_text}</p>
                )}
                
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2 ml-auto">
                    {!review.is_approved ? (
                      <button
                        onClick={() => handleApprove(review.id, true)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(review.id, false)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        <X className="h-3 w-3" /> Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      )}
    </div>
  )
}

export default ReviewsManagement
