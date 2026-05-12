export type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export const EMPTY_FORM: ShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Sri Lanka',
};

export type PaymentMethod = 'payhere' | 'cod';

export type CheckoutStep = 1 | 2 | 3;