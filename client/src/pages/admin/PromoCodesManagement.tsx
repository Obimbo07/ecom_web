import { useEffect, useState } from 'react'
import { Ticket, Plus, Edit, Trash2, X, Search } from 'lucide-react'
import { getAllPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

interface PromoCode {
  id: number
  code: string
  description?: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number | null
  max_discount?: number | null
  usage_limit?: number | null
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

const PromoCodesManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPromo, setCurrentPromo] = useState<PromoCode | null>(null)
  
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [minOrderAmount, setMinOrderAmount] = useState(0)
  const [maxDiscount, setMaxDiscount] = useState(0)
  const [usageLimit, setUsageLimit] = useState(0)
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      const data = await getAllPromoCodes()
      setPromoCodes(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentPromo(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (promo: PromoCode) => {
    setIsEditMode(true)
    setCurrentPromo(promo)
    setCode(promo.code)
    setDescription(promo.description || '')
    setDiscountType(promo.discount_type)
    setDiscountValue(promo.discount_value)
    setMinOrderAmount(promo.min_order_amount || 0)
    setMaxDiscount(promo.max_discount || 0)
    setUsageLimit(promo.usage_limit || 0)
    setValidFrom(promo.valid_from.split('T')[0])
    setValidUntil(promo.valid_until.split('T')[0])
    setIsActive(promo.is_active)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this promo code?')) return
    try {
      await deletePromoCode(id)
      setPromoCodes(promoCodes.filter(p => p.id !== id))
    } catch (error) {
      alert('Failed to delete promo code')
    }
  }

  const resetForm = () => {
    setCode('')
    setDescription('')
    setDiscountType('percentage')
    setDiscountValue(0)
    setMinOrderAmount(0)
    setMaxDiscount(0)
    setUsageLimit(0)
    setValidFrom('')
    setValidUntil('')
    setIsActive(true)
  }

  const handleSubmit = async () => {
    if (!code.trim() || !validFrom || !validUntil || discountValue <= 0) {
      alert('Please fill required fields')
      return
    }

    setSubmitting(true)
    try {
      const promoData = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrderAmount || undefined,
        max_discount: maxDiscount || undefined,
        usage_limit: usageLimit || undefined,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: new Date(validUntil).toISOString(),
        is_active: isActive
      }

      if (isEditMode && currentPromo) {
        await updatePromoCode(currentPromo.id, promoData)
        fetchPromoCodes()
      } else {
        await createPromoCode(promoData)
        fetchPromoCodes()
      }

      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      alert('Failed to save promo code')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPromoCodes = promoCodes.filter(promo =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-600 mt-2">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Promo Code
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPromoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-blue-600">{promo.code}</p>
                      {promo.description && <p className="text-sm text-gray-600">{promo.description}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">
                      {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `KES ${promo.discount_value}`}
                    </p>
                    {promo.min_order_amount && <p className="text-xs text-gray-600">Min: KES {promo.min_order_amount}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.usage_count}/{promo.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{new Date(promo.valid_from).toLocaleDateString()}</div>
                    <div>{new Date(promo.valid_until).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(promo)} className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogClose className="absolute right-4 top-4"><X className="h-4 w-4" /></DialogClose>
          <DialogHeader><DialogTitle className="text-2xl font-bold">{isEditMode ? 'Edit Promo Code' : 'Add Promo Code'}</DialogTitle></DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-lg" placeholder="SUMMER2025" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Value *</label>
                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                <input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount</label>
                <input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit (0 = unlimited)</label>
              <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valid From *</label>
                <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid Until *</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
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

export default PromoCodesManagement
