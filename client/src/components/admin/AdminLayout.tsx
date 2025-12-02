import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, LogOut, FolderTree, Users, Gift, Star, Ticket, BarChart3, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Holiday Deals', href: '/admin/deals', icon: Gift },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Ticket },
  ]

  const isActive = (path: string) => {
    if (path === '/admin/analytics' && location.pathname === '/admin') return true
    return location.pathname === path
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200 lg:block hidden">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Management Dashboard</p>
        </div>
        
        {/* Mobile header inside sidebar */}
        <div className="p-6 border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Menu</h1>
              <p className="text-xs text-gray-500 mt-1">Navigation</p>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Spacer for mobile header */}
        <div className="h-16 lg:hidden" />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
