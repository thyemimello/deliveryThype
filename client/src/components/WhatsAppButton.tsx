import { SiWhatsapp } from "react-icons/si";

export function WhatsAppButton() {
  const phoneNumber = "5547988140013";
  const message = "Olá! Vim pelo site Café Encanto e gostaria de mais informações.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      data-testid="button-whatsapp"
      aria-label="Contato via WhatsApp"
    >
      <SiWhatsapp className="h-7 w-7" />
    </a>
  );
}
