import { useState } from "react";
import { Phone, Check } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Newsletter() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/whatsapp-contacts", { phone, name: name || null });
      setIsSubmitted(true);
      toast({
        title: "Contato salvo!",
        description: "Entraremos em contato pelo WhatsApp com ofertas exclusivas.",
      });
      setTimeout(() => {
        setPhone("");
        setName("");
        setIsSubmitted(false);
      }, 3000);
    } catch {
      toast({
        title: "Erro ao salvar contato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-muted/50 py-16 md:py-24" data-testid="section-whatsapp-contact">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/10">
            <SiWhatsapp className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl md:text-4xl">
            Receba Ofertas pelo WhatsApp
          </h2>
          <p className="mt-3 text-muted-foreground">
            Deixe seu número e receba promoções, lançamentos e ofertas exclusivas direto no seu WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-contact-name"
              />
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="(47) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10"
                  data-testid="input-contact-phone"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              disabled={isSubmitted || isLoading}
              data-testid="button-contact-submit"
            >
              {isSubmitted ? (
                <>
                  <Check className="h-4 w-4" />
                  Enviado
                </>
              ) : (
                <>
                  <SiWhatsapp className="h-4 w-4" />
                  {isLoading ? "Enviando..." : "Quero Receber Ofertas"}
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Seu número será usado apenas para envio de ofertas. Sem spam.
          </p>
        </div>
      </div>
    </section>
  );
}
