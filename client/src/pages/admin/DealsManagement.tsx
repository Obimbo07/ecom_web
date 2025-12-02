import { useEffect, useState } from 'react'
import { Gift, Plus, Edit, Trash2, X, Search } from 'lucide-react'
import { getAllDeals, createDeal, updateDeal, deleteDeal, uploadFile } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

interface Deal {
  deal_id: string
  name: string
  description?: string | null
  discount_percentage: number
  start_date: string
  end_date: string
  is_active: boolean
  image?: string | null
  created_at: string
}

const DealsManagement = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const data = await getAllDeals()
      setDeals(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentDeal(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (deal: Deal) => {
    setIsEditMode(true)
    setCurrentDeal(deal)
    setName(deal.name)
    setDescription(deal.description || '')
    setDiscountPercentage(deal.discount_percentage)
    setStartDate(deal.start_date.split('T')[0])
    setEndDate(deal.end_date.split('T')[0])
    setIsActive(deal.is_active)
    setImagePreview(deal.image || '')
    setIsModalOpen(true)
  }

  const handleDelete = async (deal_id: string) => {
    if (!confirm('Delete this deal?')) return
    try {
      await deleteDeal(deal_id)
      setDeals(deals.filter(d => d.deal_id !== deal_id))
    } catch (error) {
      alert('Failed to delete deal')
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setDiscountPercentage(10)
    setStartDate('')
    setEndDate('')
    setIsActive(true)
    setImageFile(null)
    setImagePreview('')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !startDate || !endDate) {
      alert('Please fill required fields')
      return
    }

    setSubmitting(true)
    try {
      let imageUrl = imagePreview
      if (imageFile) {
        imageUrl = await uploadFile('deals', `deal-${Date.now()}-${imageFile.name}`, imageFile)
      }

      const dealData = {
        name: name.trim(),
        description: description.trim() || undefined,
        discount_percentage: discountPercentage,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_active: isActive,
        image: imageUrl || undefined
      }

      if (isEditMode && currentDeal) {
        await updateDeal(currentDeal.deal_id, dealData)
        fetchDeals()
      } else {
        await createDeal(dealData)
        fetchDeals()
      }

      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      alert('Failed to save deal')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDeals = deals.filter(deal =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holiday Deals</h1>
          <p className="text-gray-600 mt-2">Manage promotional deals and offers</p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <div key={deal.deal_id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {deal.image && <img src={deal.image} alt={deal.name} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{deal.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${deal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {deal.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {deal.description && <p className="text-sm text-gray-600 mb-3">{deal.description}</p>}
              <div className="text-2xl font-bold text-green-600 mb-3">{deal.discount_percentage}% OFF</div>
              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <p>Start: {new Date(deal.start_date).toLocaleDateString()}</p>
                <p>End: {new Date(deal.end_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(deal)} variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />Edit
                </Button>
                <Button onClick={() => handleDelete(deal.deal_id)} variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No deals found</p>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogClose className="absolute right-4 top-4"><X className="h-4 w-4" /></DialogClose>
          <DialogHeader><DialogTitle className="text-2xl font-bold">{isEditMode ? 'Edit Deal' : 'Add New Deal'}</DialogTitle></DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Percentage *</label>
              <input type="number" min="1" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="w-full px-3 py-2 border rounded-lg" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')} className="w-full px-3 py-2 border rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DealsManagement
