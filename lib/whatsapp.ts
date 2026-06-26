// Business WhatsApp number. Set NEXT_PUBLIC_WHATSAPP_NUMBER to the store's
// real WhatsApp line (international format, digits only — e.g. 233XXXXXXXXX).
// Falls back to the number on record until configured.
const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233509687490";

export const WHATSAPP_NUMBER = RAW_NUMBER.replace(/[^0-9]/g, "");

export const STORE_NAME = "El-ROI Lux Hairs";

/** Builds a wa.me deep link with a pre-filled message. */
export const buildWhatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
