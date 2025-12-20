import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export const getStripe = () => {
  if (stripeSingleton) return stripeSingleton;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing env STRIPE_SECRET_KEY");
  }

  stripeSingleton = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  return stripeSingleton;
};
