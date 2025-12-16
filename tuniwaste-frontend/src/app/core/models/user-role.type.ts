export type UserRole = 'generator' | 'buyer' | 'admin';

export const USER_ROLES: Record<Exclude<UserRole, 'admin'>, string> = {
  generator: 'Seller / Waste Generator',
  buyer: 'Buyer / Recycler',
};

