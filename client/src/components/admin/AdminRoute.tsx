import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/lib/supabase'

interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  phone: string | null
  image: string | null
  verified: boolean
  role: string
  created_at: string
  updated_at: string
}

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const userProfile = await getProfile(user.id) as Profile
          console.log('Admin Route Check:', {
            userId: user.id,
            userEmail: user.email,
            profile: userProfile,
            role: userProfile?.role,
            hasProfile: !!userProfile,
            isAdmin: userProfile?.role === 'admin'
          })
          setProfile(userProfile)
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('Admin Route Check: No user logged in')
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'admin') {
    console.log('Admin Route: Access Denied', {
      hasUser: !!user,
      hasProfile: !!profile,
      role: profile?.role,
      reason: !user ? 'No user' : !profile ? 'No profile' : profile.role !== 'admin' ? 'Not admin role' : 'Unknown'
    })
    return <Navigate to="/admin" replace />
  }

  console.log('Admin Route: Access Granted')
  return <>{children}</>
}

export default AdminRoute
