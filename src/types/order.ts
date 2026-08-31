export interface StoreHours {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  isActive: boolean;
  preOrderEnabled?: boolean;
  preOrderLeadHours?: number;
  preOrderMaxDays?: number;
  customDomain?: string;
  logoUrl?: string | null;
  stripeEnabled?: boolean;
  stripePublishableKey?: string | null;
  hours?: StoreHours[];
  reservationEnabled?: boolean;
  requireReservationApproval?: boolean;
  allowReservationDeposit?: boolean;
  defaultDepositAmount?: number | null;
  reservationCancellationHours?: number;
  maxPartySize?: number;
  giftCardEnabled?: boolean;
  giftCardValidityMonths?: number | null;
}

export interface ReservationAvailability {
  success: boolean;
  availableSlots: string[];
}

export interface ReservationCreateBody {
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  notes?: string;
}

export interface ReservationCreateResult {
  reservationId: string;
  status: string;
  reservationDate: string;
  partySize: number;
  depositRequired: boolean;
  depositAmount: number | null;
  paymentRequired: boolean;
}

export interface ReservationConfirmation extends ReservationCreateResult {
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface Modifier {
  id: string;
  name: string;
  eatInPrice: number;
  price: number;
  isDefault: boolean;
  displayOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  displayOrder: number;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  eatInPrice: number;
  price: number;
  taxRate: number;
  imageUrl?: string;
  preparationTime?: number;
  isAvailable: boolean;
  isInStoreOnly: boolean;
  displayOrder: number;
  modifierGroups: ModifierGroup[];
  allergens: Allergen[];
}

export interface Allergen {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Subcategory {
  id: string | null;
  name: string;
  displayOrder: number;
  menuItems: MenuItem[];
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  colorCode?: string;
  subcategories: Subcategory[];
}

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  modifierGroupId: string;
  modifierGroupName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  imageUrl?: string;
  basePrice: number;
  taxRate: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderType = 'EAT_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface DeliveryDetails {
  address: string;
  postcode: string;
  deliveryZoneId?: string;
  deliveryFee?: number;
  minOrderValue?: number;
}

export interface Cart {
  storeId: string;
  items: CartItem[];
  orderType: OrderType;
  tableNumber?: string;
  deliveryDetails?: DeliveryDetails;
  scheduledAt?: string;
}

export interface CustomerAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Order {
  id: string;
  orderNumber?: string;
  orderType: string;
  orderStatus: string;
  totalAmount: number;
  paymentType?: string;
  createdAt: string;
  scheduledAt?: string;
  deliveryAddress?: string;
  deliveryPostcode?: string;
  items?: OrderLineItem[];
  customer?: { name?: string; email?: string; phone?: string };
}

export interface OrderLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers: { modifierName: string; price: number }[];
}

export interface GuestOrder {
  id: string;
  status: string;
  orderType: string;
  estimatedTime?: number | null;
  scheduledAt?: string | null;
  items: Array<{ name: string; quantity: number; price: number; notes?: string | null; modifiers: Array<{ modifierGroupName: string; modifierName: string }> }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress?: string | null;
  notes?: string | null;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

export interface DeliveryZoneCheck {
  eligible: boolean;
  postcode?: string | null;
  sector?: string | null;
  zone?: {
    id: string;
    name: string;
    colour?: string | null;
    deliveryFee: number;
    minOrderValue: number;
    estimatedMins: number;
  };
  reason?: string | null;
}
