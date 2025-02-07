import { User } from '@/database/models/user';

import { stripe } from '../clients';

export const createCustomer = async (sub: string, paymentMethodId: string) => {
  try {
    const customer = await stripe.customers.create({
      metadata: {
        sub,
      },
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  } catch (error) {
    throw error;
  }
};

export const chargeCustomer = async (
  customerId: string,
  amount: number,
  currency: string = 'usd',
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

export const chargeAllSubscribedUsers = async (amount: number) => {
    try {
        const customers = await User.find();

        for (const customer of customers) {
            switch (customer.subscription?.type) {
                case 'free':
                    break;
                case 'basic':
                    await chargeCustomer(customer.stripeCustomerId, amount);
                    break;
                case 'premium':
                    await chargeCustomer(customer.stripeCustomerId, amount * 2);
                    break;
                case 'enterprise':
                    await chargeCustomer(customer.stripeCustomerId, amount * 3);
                    break;
            }
        }
    } catch (error) {
        throw error;
    }
};