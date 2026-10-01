import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Sanitizes and trims string fields in the request body.
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = value.trim();
      }
    }
  }
  next();
}

/**
 * Validates Order Creation payload
 */
export function validateCreateOrder(req: Request, res: Response, next: NextFunction) {
  const { customer, shippingAddress, items } = req.body;
  const errors: string[] = [];

  // Customer
  if (!customer || typeof customer !== 'object') {
    errors.push('Customer details are required.');
  } else {
    if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push('Valid customer email address is required.');
    }
    const cleanPhone = String(customer.phone || '').replace(/[\s-]/g, '');
    if (!cleanPhone || !/^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      errors.push('Valid 10-digit mobile number is required.');
    }
  }

  // Shipping Address
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address details are required.');
  } else {
    if (!shippingAddress.fullName || shippingAddress.fullName.length > 100) {
      errors.push('Recipient full name is required (max 100 chars).');
    }
    if (!shippingAddress.addressLine1 || shippingAddress.addressLine1.length > 250) {
      errors.push('Address Line 1 is required (max 250 chars).');
    }
    if (!shippingAddress.city || shippingAddress.city.length > 80) {
      errors.push('City is required.');
    }
    if (!shippingAddress.state || shippingAddress.state.length > 80) {
      errors.push('State is required.');
    }
    if (!shippingAddress.pincode || !/^[1-9][0-9]{5}$/.test(shippingAddress.pincode)) {
      errors.push('Valid 6-digit Indian PIN code is required.');
    }
  }

  // Items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item.');
  } else {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId || typeof it.productId !== 'string') {
        errors.push(`Item at index ${i} has an invalid productId.`);
      }
      const qty = Number(it.quantity);
      if (isNaN(qty) || qty <= 0 || qty > 1000) {
        errors.push(`Item at index ${i} has an invalid quantity (must be between 1 and 1000).`);
      }
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed for order creation.', 400, errors);
  }

  next();
}

/**
 * Validates Wholesale Enquiry payload
 */
export function validateWholesaleEnquiry(req: Request, res: Response, next: NextFunction) {
  const { fullName, businessName, phone, email, city, state, businessType, productInterest } = req.body;
  const errors: string[] = [];

  if (!fullName || fullName.length > 100) errors.push('Full name is required (max 100 chars).');
  if (!businessName || businessName.length > 150) errors.push('Business / company name is required (max 150 chars).');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
  
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
  if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 15) {
    errors.push('Valid contact phone number is required.');
  }

  if (!city || city.length > 80) errors.push('City is required.');
  if (!state || state.length > 80) errors.push('State is required.');
  if (!businessType) errors.push('Business type is required.');

  if (!productInterest || (!Array.isArray(productInterest) && typeof productInterest !== 'string')) {
    errors.push('Product interest selection is required.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed for wholesale enquiry.', 400, errors);
  }

  next();
}

/**
 * Validates Contact Enquiry payload
 */
export function validateContactEnquiry(req: Request, res: Response, next: NextFunction) {
  const { fullName, email, enquiryType, message } = req.body;
  const errors: string[] = [];

  if (!fullName || fullName.length > 100) errors.push('Full name is required (max 100 chars).');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
  if (!enquiryType) errors.push('Enquiry type is required.');
  if (!message || message.length > 3000) errors.push('Message is required (max 3000 chars).');

  if (errors.length > 0) {
    return sendError(res, 'Validation failed for contact message.', 400, errors);
  }

  next();
}
