import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ============================================
// AUTHENTICATION HELPERS
// ============================================

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string, username: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || username,
      }
    }
  })
  if (error) throw error
  return data
}

// ============================================
// STORAGE HELPERS
// ============================================

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)
  
  return publicUrl
}

export const getFileUrl = (bucket: string, path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}

// ============================================
// PRODUCT HELPERS
// ============================================

export const getProducts = async (filters?: {
  categoryId?: number
  featured?: boolean
  search?: string
  limit?: number
  offset?: number
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, title, slug)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, title, slug),
      reviews:product_reviews(id, rating, comment, user:profiles(username, image), created_at)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export const getProductsWithDeals = async () => {
  const { data, error } = await supabase
    .from('products_with_deals')
    .select('*')

  if (error) throw error
  return data
}

// ============================================
// CATEGORY HELPERS
// ============================================

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

export const getCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export const getCategoryById = async (id: number) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export const getCategoryByIdOrSlug = async (identifier: string | number) => {
  // Check if identifier is a number (ID) or string (slug)
  const isId = !isNaN(Number(identifier))
  
  if (isId) {
    return getCategoryById(Number(identifier))
  } else {
    return getCategoryBySlug(String(identifier))
  }
}

// ============================================
// HOLIDAY DEALS HELPERS
// ============================================

export const getActiveHolidayDeals = async () => {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('holiday_deals')
    .select(`
      *,
      product_deals(
        product:products(
          *,
        ),
        discounted_price
      )
    `)
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data
}

export const getHolidayDealBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('holiday_deals')
    .select(`
      *,
      product_deals(
        product:products(
          *,
          category:categories(id, title, slug),
        ),
        discounted_price
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

// ============================================
// CART HELPERS (Guest & Authenticated)
// ============================================

// Guest cart stored in localStorage
const GUEST_CART_KEY = 'guest_cart'

export interface GuestCartItem {
  product_id: number
  quantity: number
  size?: string
  color?: string
}

export const getGuestCart = (): GuestCartItem[] => {
  const cart = localStorage.getItem(GUEST_CART_KEY)
  return cart ? JSON.parse(cart) : []
}

export const setGuestCart = (cart: GuestCartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
}

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY)
}

export const addToGuestCart = (item: GuestCartItem) => {
  const cart = getGuestCart()
  const existingIndex = cart.findIndex(
    i => i.product_id === item.product_id && i.size === item.size && i.color === item.color
  )

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity
  } else {
    cart.push(item)
  }

  setGuestCart(cart)
  return cart
}

export const removeFromGuestCart = (productId: number, size?: string, color?: string) => {
  const cart = getGuestCart()
  const filtered = cart.filter(
    i => !(i.product_id === productId && i.size === size && i.color === color)
  )
  setGuestCart(filtered)
  return filtered
}

export const updateGuestCartItem = (productId: number, quantity: number, size?: string, color?: string) => {
  const cart = getGuestCart()
  const index = cart.findIndex(
    i => i.product_id === productId && i.size === size && i.color === color
  )

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = quantity
    }
  }

  setGuestCart(cart)
  return cart
}

// Authenticated user cart in Supabase
export const getUserCart = async (userId: string) => {
  // Get or create cart
  let { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (cartError && cartError.code === 'PGRST116') {
    // Cart doesn't exist, create one
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (createError) throw createError
    cart = newCart
  } else if (cartError) {
    throw cartError
  }

  // Get cart items with product details using the view
  const { data, error } = await supabase
    .from('cart_details')
    .select('*')
    .eq('cart_id', cart!.id)

  if (error) throw error
  return { cart: cart!, items: data || [] }
}

export const addToUserCart = async (userId: string, item: Omit<GuestCartItem, 'product_id'> & { productId: number }) => {
  // Get or create cart
  let { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!cart) {
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (createError) throw createError
    cart = newCart
  }

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', item.productId)
    .eq('size', item.size || null)
    .eq('color', item.color || null)
    .maybeSingle()

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + item.quantity })
      .eq('id', existingItem.id)

    if (error) throw error
  } else {
    // Insert new item
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      })

    if (error) throw error
  }

  return getUserCart(userId)
}

export const updateUserCartItem = async (cartItemId: number, quantity: number) => {
  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)

    if (error) throw error
  }
}

export const removeFromUserCart = async (cartItemId: number) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) throw error
}

export const clearUserCart = async (userId: string) => {
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (cart) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error
  }
}

// Merge guest cart into user cart on login
export const mergeGuestCartToUser = async (userId: string) => {
  const guestCart = getGuestCart()

  for (const item of guestCart) {
    await addToUserCart(userId, {
      productId: item.product_id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })
  }

  clearGuestCart()
}

// ============================================
// ORDER HELPERS
// ============================================

export const createOrder = async (orderData: {
  userId?: string
  items: Array<{ productId: number; quantity: number; size?: string; color?: string }>
  shippingAddressId?: number
  paymentMethodId?: number
  notes?: string
  subtotal: number
  shippingCost?: number
  tax?: number
  discount?: number
}) => {
  console.log('Creating order with data:', orderData)
  
  // Validate items
  const invalidItems = orderData.items.filter(item => !item.productId || typeof item.productId !== 'number')
  if (invalidItems.length > 0) {
    console.error('Invalid items found:', invalidItems)
    throw new Error('Invalid product IDs in cart items')
  }
  
  const totalAmount = orderData.subtotal + (orderData.shippingCost || 0) + (orderData.tax || 0) - (orderData.discount || 0)

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.userId || null,
      order_number: orderNumber,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      total_amount: totalAmount,
      shipping_address_id: orderData.shippingAddressId || null,
      payment_method_id: orderData.paymentMethodId || null,
      notes: orderData.notes || null,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select()
    .single()

  if (orderError) {
    console.error('Order creation error:', orderError)
    throw orderError
  }

  console.log('Order created:', order)

  // Fetch product details for each item
  const productIds = orderData.items.map(item => item.productId)
  console.log('Fetching products:', productIds)
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .in('id', productIds)

  if (productsError) {
    console.error('Products fetch error:', productsError)
    throw productsError
  }

  console.log('Products fetched:', products)

  // Create order items with product details
  const orderItems = orderData.items.map(item => {
    const product = products?.find((p: any) => p.id === item.productId) as any
    const productImage = product?.images?.[0]?.image || product?.image || null
    
    if (!product) {
      console.warn(`Product not found for ID: ${item.productId}`)
    }
    
    return {
      order_id: (order as any).id,
      product_id: item.productId,
      product_title: product?.title || 'Unknown Product',
      product_image: productImage,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      price: product?.price || 0,
      discount_applied: 0,
    }
  })

  console.log('Inserting order items:', orderItems)

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Order items insert error:', itemsError)
    throw itemsError
  }

  console.log('Order items created successfully')

  // Clear cart if user is authenticated
  if (orderData.userId) {
    await clearUserCart(orderData.userId)
  } else {
    // Clear guest cart
    clearGuestCart()
  }

  return order
}

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(id, title, image, slug)
      ),
      shipping_address:shipping_addresses(*),
      payment_method:payment_methods(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getOrderByNumber = async (orderNumber: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(
          id,
          title,
          image,
          slug,
        )
      ),
      shipping_address:shipping_addresses(*),
      payment_method:payment_methods(*)
    `)
    .eq('order_number', orderNumber)
    .single()

  if (error) throw error
  return data
}

export const getOrderById = async (orderId: number) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(
          id,
          title,
          price,
          image,
          slug,
        )
      ),
      shipping_address:shipping_addresses(*),
      payment_method:payment_methods(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

// ============================================
// PROFILE HELPERS
// ============================================

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  
  // If no profile exists, create a default one
  if (!data) {
    const { data: userData } = await supabase.auth.getUser()
    const email = userData?.user?.email || ''
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: email.split('@')[0] || 'user',
        full_name: null,
        bio: null,
        phone: null,
        image: null,
        verified: false,
      })
      .select()
      .single()
    
    if (createError) throw createError
    return newProfile
  }
  
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// SHIPPING ADDRESS HELPERS
// ============================================

export const getShippingAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data
}

export const createShippingAddress = async (userId: string, address: {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  isDefault?: boolean
}) => {
  const { data, error } = await supabase
    .from('shipping_addresses')
    .insert({
      user_id: userId,
      full_name: address.fullName,
      phone: address.phone,
      address_line1: address.addressLine1,
      address_line2: address.addressLine2 || null,
      city: address.city,
      state: address.state || null,
      postal_code: address.postalCode || null,
      country: address.country,
      is_default: address.isDefault || false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateShippingAddress = async (addressId: number, address: {
  fullName?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  isDefault?: boolean
}) => {
  const updates: Record<string, any> = {}
  if (address.fullName !== undefined) updates.full_name = address.fullName
  if (address.phone !== undefined) updates.phone = address.phone
  if (address.addressLine1 !== undefined) updates.address_line1 = address.addressLine1
  if (address.addressLine2 !== undefined) updates.address_line2 = address.addressLine2
  if (address.city !== undefined) updates.city = address.city
  if (address.state !== undefined) updates.state = address.state
  if (address.postalCode !== undefined) updates.postal_code = address.postalCode
  if (address.country !== undefined) updates.country = address.country
  if (address.isDefault !== undefined) updates.is_default = address.isDefault

  const { data, error } = await supabase
    .from('shipping_addresses')
    .update(updates)
    .eq('id', addressId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteShippingAddress = async (addressId: number) => {
  const { error } = await supabase
    .from('shipping_addresses')
    .delete()
    .eq('id', addressId)

  if (error) throw error
}

// ============================================
// PAYMENT METHOD HELPERS
// ============================================

export const getPaymentMethods = async (userId: string) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data
}

export const createPaymentMethod = async (userId: string, method: {
  methodType: string
  phoneNumber: string
  lastFour: string
  isDefault?: boolean
}) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      method_type: method.methodType,
      phone_number: method.phoneNumber,
      last_four: method.lastFour,
      is_default: method.isDefault || false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePaymentMethod = async (methodId: number, method: {
  methodType?: string
  phoneNumber?: string
  lastFour?: string
  isDefault?: boolean
}) => {
  const updates: Record<string, any> = {}
  if (method.methodType !== undefined) updates.method_type = method.methodType
  if (method.phoneNumber !== undefined) updates.phone_number = method.phoneNumber
  if (method.lastFour !== undefined) updates.last_four = method.lastFour
  if (method.isDefault !== undefined) updates.is_default = method.isDefault

  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', methodId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePaymentMethod = async (methodId: number) => {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', methodId)

  if (error) throw error
}

// ============================================
// REVIEW HELPERS
// ============================================

export const getProductReviews = async (productId: number) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      *,
      user:profiles(username, image)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      product:products(id, title, image, slug)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createReview = async (userId: string, review: {
  productId: number
  rating: number
  comment: string
}) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      user_id: userId,
      product_id: review.productId,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export const deleteProduct = async (productId: number) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error
}

export const createProduct = async (productData: {
  title: string
  description?: string
  price: number
  stock_count: number
  category_id: number
  is_active: boolean
  image?: string
  images?: string[]
}) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      title: productData.title,
      description: productData.description || null,
      price: productData.price,
      stock_count: productData.stock_count,
      category_id: productData.category_id,
      is_active: productData.is_active,
      image: productData.image || null,
      images: productData.images || [],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProduct = async (productId: number, updates: Database['public']['Tables']['products']['Update']) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateOrderStatus = async (orderId: number, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAllProducts = async () => {
  console.log('getAllProducts: Starting fetch...')
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, title, slug)
    `)
    .order('created_at', { ascending: false })

  console.log('getAllProducts: Response', { data, error, count: data?.length })
  if (error) {
    console.error('getAllProducts: Error details', error)
    throw error
  }
  return data
}

export const getAllOrders = async () => {
  console.log('getAllOrders: Starting fetch...')
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_user_id_fkey(id, username, full_name),
      shipping_addresses!orders_shipping_address_id_fkey(*),
      payment_methods!orders_payment_method_id_fkey(*),
      order_items(*)
    `)
    .order('created_at', { ascending: false })

  console.log('getAllOrders: Response', { data, error, count: data?.length })
  if (error) {
    console.error('getAllOrders: Error details', error)
    throw error
  }
  return data
}

export default supabase
