import { IShippingAddress, IOrderItem } from '../types';

export interface ShippingCalculationParams {
  items: IOrderItem[];
  subtotal: number;
  shippingAddress: IShippingAddress;
}

/**
 * Isolated shipping calculation service.
 * Allows evolving rules based on weight, pin code zones, order value, or couriers.
 */
export const shippingService = {
  calculateShipping(params: ShippingCalculationParams): number {
    // Current rule: ₹0 baseline pending courier rate integration.
    // In future phases, evaluate params.shippingAddress.pincode, totalWeight, or subtotal.
    return 0;
  },
};
