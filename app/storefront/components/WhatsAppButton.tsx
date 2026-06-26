"use client";

import { buildWhatsappLink, STORE_NAME } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const href = buildWhatsappLink(
    `Hello ${STORE_NAME}! 👋 I'd like to ask about your wigs.`
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M16.04 4C9.95 4 5 8.95 5 15.04c0 1.95.51 3.84 1.47 5.51L5 28l7.62-1.43c1.6.87 3.4 1.33 5.23 1.33h.01c6.09 0 11.04-4.95 11.04-11.04C28.9 8.99 22.13 4 16.04 4zm0 20.2h-.01c-1.6 0-3.17-.43-4.55-1.25l-.33-.19-3.38.89.9-3.3-.21-.34a9.06 9.06 0 0 1-1.39-4.82c0-5.02 4.09-9.1 9.12-9.1 2.44 0 4.73.95 6.45 2.68a9.06 9.06 0 0 1 2.67 6.44c0 5.03-4.08 9.04-9.08 9.04zm5-6.78c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.62.14-.18.27-.71.89-.87 1.07-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.84.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.52-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.18-.52-.32z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
