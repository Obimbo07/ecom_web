import { useEffect, useState } from 'react'
import { Package, Search, Filter, Eye, X, MapPin, CreditCard, Phone, Mail } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface OrderItem {
  id: number
  product_title: string
  product_image: string | null
  quantity: number
  price: number
  size?: string | null
  color?: string | null
  discount_applied?: number
}

interface ShippingAddress {
  id: number
  address_line1: string
  address_line2?: string | null
  city: string
  state?: string | null
  postal_code: string
  country: string
  phone: string
  recipient_name?: string | null
}

interface PaymentMethod {
  id: number
  method_type: string
  phone_number?: string | null
  last_four?: string | null
  provider?: string | null
}

interface Order {
  id: number
  order_number: string
  total_amount: number
  subtotal: number
  tax?: number
  shipping_cost?: number
  discount?: number
  status: string
  payment_status: string
  notes?: string | null
  tracking_number?: string | null
  created_at: string
  updated_at: string
  profiles?: { 
    id: string
    username: string
    full_name: string | null
    image?: string | null
  } | null
  order_items?: OrderItem[]
  shipping_addresses?: ShippingAddress | null
  payment_methods?: PaymentMethod | null
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...')
      const data = await getAllOrders()
      console.log('Orders fetched:', data)
      console.log('Orders count:', data?.length || 0)
      setOrders(data as any)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.profiles?.full_name || order.profiles?.username || 'Guest'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    KES {order.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none z-50 text-gray-900 hover:text-gray-700">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {selectedOrder && (
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-black">
                  Order Details - {selectedOrder.order_number}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Payment: {selectedOrder.payment_status}
                  </span>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Customer & Shipping Info */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-black">Name:</span>{' '}
                        {selectedOrder.profiles?.full_name || selectedOrder.profiles?.username || 'Guest Customer'}
                      </p>
                      {selectedOrder.profiles?.username && (
                        <p className="text-gray-700">
                          <span className="font-medium text-black">Username:</span> @{selectedOrder.profiles.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_addresses && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        Shipping Address
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        {selectedOrder.shipping_addresses.recipient_name && (
                          <p className="font-medium text-black">{selectedOrder.shipping_addresses.recipient_name}</p>
                        )}
                        <p>{selectedOrder.shipping_addresses.address_line1}</p>
                        {selectedOrder.shipping_addresses.address_line2 && (
                          <p>{selectedOrder.shipping_addresses.address_line2}</p>
                        )}
                        <p>
                          {selectedOrder.shipping_addresses.city}
                          {selectedOrder.shipping_addresses.state && `, ${selectedOrder.shipping_addresses.state}`}
                        </p>
                        <p>{selectedOrder.shipping_addresses.postal_code}, {selectedOrder.shipping_addresses.country}</p>
                        <p className="flex items-center gap-1 mt-2">
                          <Phone className="h-3 w-3" />
                          {selectedOrder.shipping_addresses.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {selectedOrder.payment_methods && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        Payment Method
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p className="capitalize font-medium text-black">
                          {selectedOrder.payment_methods.method_type.replace('_', ' ')}
                        </p>
                        {selectedOrder.payment_methods.phone_number && (
                          <p>Phone: {selectedOrder.payment_methods.phone_number}</p>
                        )}
                        {selectedOrder.payment_methods.last_four && (
                          <p>Card: **** **** **** {selectedOrder.payment_methods.last_four}</p>
                        )}
                        {selectedOrder.payment_methods.provider && (
                          <p>Provider: {selectedOrder.payment_methods.provider}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tracking & Notes */}
                  {(selectedOrder.tracking_number || selectedOrder.notes) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-3">Additional Information</h3>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.tracking_number && (
                          <p className="text-gray-700">
                            <span className="font-medium text-black">Tracking #:</span> {selectedOrder.tracking_number}
                          </p>
                        )}
                        {selectedOrder.notes && (
                          <p className="text-gray-700">
                            <span className="font-medium text-black">Notes:</span> {selectedOrder.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Order Items & Summary */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                        selectedOrder.order_items.map((item) => (
                          <div key={item.id} className="flex gap-3 bg-white p-3 rounded border border-gray-200">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black text-sm">{item.product_title}</p>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.size && <span className="mr-2">Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Quantity: {item.quantity}</p>
                              <p className="text-sm font-semibold text-black mt-1">
                                KES {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>KES {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedOrder.shipping_cost && selectedOrder.shipping_cost > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Shipping:</span>
                          <span>KES {selectedOrder.shipping_cost.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOrder.tax && selectedOrder.tax > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Tax:</span>
                          <span>KES {selectedOrder.tax.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOrder.discount && selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-KES {selectedOrder.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-black text-lg">
                          <span>Total:</span>
                          <span>KES {selectedOrder.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium text-black">Created:</span>{' '}
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium text-black">Last Updated:</span>{' '}
                        {new Date(selectedOrder.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrdersManagement
