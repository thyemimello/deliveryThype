import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X, ShoppingBag, Truck, QrCode, MapPin, User, Phone, CreditCard, Banknote, ArrowLeft, Check, Loader2 } from "lucide-react";
import { SiWhatsapp, SiPix } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, tableNumber } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"info" | "payment">("info");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "entrega" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [foundReturning, setFoundReturning] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
    cep: "",
    addressStreet: "",
    addressNeighborhood: "",
    addressCity: "",
    addressNumber: "",
    addressComplement: "",
  });

  const paymentLabels: Record<"pix" | "cartao" | "entrega", string> = {
    pix: "Pix",
    cartao: "Cartão",
    entrega: "Na entrega",
  };

  const isMesa = !!tableNumber;
  const checkoutType: "delivery" | "mesa" = isMesa ? "mesa" : "delivery";

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  };

  const formatCep = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const buildAddress = (a: {
    addressStreet: string; addressNumber: string; addressComplement: string;
    addressNeighborhood: string; addressCity: string; cep: string;
  }) => {
    const line1 = [a.addressStreet, a.addressNumber].map((s) => s.trim()).filter(Boolean).join(", ");
    const parts = [line1, a.addressComplement, a.addressNeighborhood, a.addressCity].map((s) => s.trim()).filter(Boolean);
    let result = parts.join(" - ");
    if (a.cep.trim()) result += `${result ? " - " : ""}CEP ${a.cep.trim()}`;
    return result;
  };

  const updateAddress = (patch: Partial<typeof form>) => {
    setForm((prev) => {
      const merged = { ...prev, ...patch };
      return { ...merged, customerAddress: buildAddress(merged) };
    });
  };

  const fetchCep = async (digits: string) => {
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast({ title: "CEP não encontrado", description: "Confira o número ou preencha o endereço manualmente.", variant: "destructive" });
        return;
      }
      setForm((prev) => {
        const merged = {
          ...prev,
          addressStreet: data.logradouro || prev.addressStreet,
          addressNeighborhood: data.bairro || "",
          addressCity: [data.localidade, data.uf].filter(Boolean).join("/"),
        };
        return { ...merged, customerAddress: buildAddress(merged) };
      });
      toast({ title: "Endereço encontrado! 📍", description: "Agora preencha o número e o complemento." });
    } catch {
      toast({ title: "Erro ao buscar o CEP", variant: "destructive" });
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (value: string) => {
    const masked = formatCep(value);
    updateAddress({ cep: masked });
    if (masked.replace(/\D/g, "").length === 8) fetchCep(masked.replace(/\D/g, ""));
  };

  useEffect(() => {
    if (isMesa) return;
    const digits = form.customerPhone.replace(/\D/g, "");
    if (digits.length < 8) {
      setFoundReturning(false);
      return;
    }
    let cancelled = false;
    setLookingUp(true);
    const handle = setTimeout(async () => {
      try {
        const res = await apiRequest("GET", `/api/orders/lookup?phone=${encodeURIComponent(form.customerPhone)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data && (data.customerName || data.customerAddress)) {
          setForm((prev) => {
            const merged = {
              ...prev,
              customerName: prev.customerName.trim() || data.customerName || "",
              addressStreet: prev.addressStreet.trim() || data.customerAddress || "",
            };
            return { ...merged, customerAddress: buildAddress(merged) };
          });
          if (!foundReturning) {
            setFoundReturning(true);
            toast({ title: "Bem-vindo de volta! 👋", description: "Preenchemos seus dados do último pedido." });
          }
        } else {
          setFoundReturning(false);
        }
      } catch {
        // silent — lookup is a convenience, not required
      } finally {
        if (!cancelled) setLookingUp(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(handle);
      setLookingUp(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customerPhone, isMesa]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const total = items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId);
    return acc + (product?.price || 0) * item.quantity;
  }, 0);

  const handleOpenCheckout = () => {
    closeCart();
    setCheckoutStep("info");
    setPaymentMethod(null);
    setCheckoutOpen(true);
  };

  const validateInfo = () => {
    if (!form.customerName.trim()) {
      toast({ title: "Preencha seu nome", variant: "destructive" });
      return false;
    }
    if (checkoutType === "delivery" && !form.customerPhone.trim()) {
      toast({ title: "Preencha o telefone", variant: "destructive" });
      return false;
    }
    if (checkoutType === "delivery" && !form.addressStreet.trim()) {
      toast({ title: "Informe a rua / logradouro", variant: "destructive" });
      return false;
    }
    if (checkoutType === "delivery" && !form.addressNumber.trim() && !/\d/.test(form.addressStreet)) {
      toast({ title: "Informe o número do endereço", variant: "destructive" });
      return false;
    }
    if (checkoutType === "delivery" && !form.customerAddress.trim()) {
      toast({ title: "Informe o endereço de entrega", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateInfo()) return;
    setCheckoutStep("payment");
  };

  const handleWhatsAppOnly = () => {
    const phoneNumber = "5547988140013";
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        message += `${item.quantity}x ${product.name} - ${formatPrice(product.price * item.quantity)}\n`;
      }
    });
    message += `\nTotal: ${formatPrice(total)}`;
    message += "\n\nAguardo confirmação!";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    clearCart();
    closeCart();
  };

  const handleSubmitOrder = async () => {
    if (!validateInfo()) return;
    if (checkoutType === "delivery" && !paymentMethod) {
      toast({ title: "Escolha a forma de pagamento", variant: "destructive" });
      return;
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || "",
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/orders", {
        customerName: form.customerName,
        customerPhone: form.customerPhone || "Mesa",
        customerAddress: checkoutType === "delivery" ? form.customerAddress : null,
        tableNumber: checkoutType === "mesa" ? tableNumber : null,
        orderType: checkoutType,
        paymentMethod: checkoutType === "delivery" ? paymentMethod : null,
        items: orderItems,
        total,
        notes: form.notes || null,
      });
      const order = await res.json();

      if (checkoutType === "mesa") {
        const phoneNumber = "5547988140013";
        let message = `Olá! Novo pedido #${order.id.slice(0, 8).toUpperCase()}\n\n`;
        message += `👤 ${form.customerName}\n`;
        if (form.customerPhone) message += `📱 ${form.customerPhone}\n`;
        message += `🪑 Mesa ${tableNumber}\n`;
        message += `\n`;
        orderItems.forEach((item) => {
          message += `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`;
        });
        message += `\nTotal: ${formatPrice(total)}`;
        if (form.notes) message += `\nObs: ${form.notes}`;

        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
      }

      toast({
        title: "Pedido confirmado!",
        description: "Acompanhe o status do seu pedido em tempo real.",
      });

      clearCart();
      setCheckoutOpen(false);
      setForm({ customerName: "", customerPhone: "", customerAddress: "", notes: "", cep: "", addressStreet: "", addressNeighborhood: "", addressCity: "", addressNumber: "", addressComplement: "" });
      setLocation(`/pedido/${order.id}`);
    } catch {
      toast({ title: "Erro ao enviar pedido", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg" data-testid="drawer-cart">
          <SheetHeader className="px-1">
            <SheetTitle className="flex items-center gap-2 font-serif text-xl">
              <ShoppingBag className="h-5 w-5" />
              Seu Pedido
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium" data-testid="text-empty-cart">Seu carrinho está vazio</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione itens do cardápio para continuar
                </p>
              </div>
              <Button onClick={closeCart} asChild>
                <Link href="/produtos" data-testid="link-continue-shopping">
                  Ver Cardápio
                </Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex-1 space-y-4 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-24 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {items.map((item, index) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={`${item.productId}-${index}`} className="flex gap-4" data-testid={`cart-item-${item.productId}`}>
                        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-1">
                            <div>
                              <h4 className="font-medium line-clamp-1" data-testid={`text-cart-item-name-${item.productId}`}>{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.volume}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)} data-testid={`button-remove-${item.productId}`}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity - 1)} data-testid={`button-decrease-${item.productId}`}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.productId}`}>{item.quantity}</span>
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity + 1)} data-testid={`button-increase-${item.productId}`}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-semibold" data-testid={`text-item-total-${item.productId}`}>{formatPrice(product.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="space-y-4 pt-4">
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-subtotal">{formatPrice(total)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-cart-total">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button className="w-full gap-2" size="lg" onClick={handleOpenCheckout} data-testid="button-checkout">
                  {isMesa ? <QrCode className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  {isMesa ? "Enviar Pedido da Mesa" : "Finalizar Entrega"}
                </Button>
                {!isMesa && (
                  <Button variant="outline" className="w-full gap-2" size="lg" onClick={handleWhatsAppOnly} data-testid="button-checkout-whatsapp">
                    <SiWhatsapp className="h-5 w-5" />
                    Apenas WhatsApp
                  </Button>
                )}
                <Button variant="ghost" className="w-full" onClick={clearCart} data-testid="button-clear-cart">
                  Limpar Carrinho
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {isMesa ? "Pedido na Mesa" : checkoutStep === "payment" ? "Forma de pagamento" : "Finalizar Entrega"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {(isMesa || checkoutStep === "info") && (
              isMesa ? (
                <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3" data-testid="badge-mesa-context">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Mesa {tableNumber}</p>
                    <p className="text-xs text-muted-foreground">O pedido será levado até você. O pagamento é feito depois, ao fechar a comanda.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3" data-testid="badge-delivery-context">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Entrega (Delivery)</p>
                    <p className="text-xs text-muted-foreground">Receba seu pedido no endereço informado.</p>
                  </div>
                </div>
              )
            )}

            {(isMesa || checkoutStep === "info") && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerPhone">
                    Telefone / WhatsApp {isMesa && <span className="text-muted-foreground">(opcional)</span>}
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerPhone"
                      placeholder="(47) 99999-9999"
                      className="pl-9 pr-9"
                      value={form.customerPhone}
                      inputMode="numeric"
                      onChange={(e) => setForm({ ...form, customerPhone: formatPhone(e.target.value) })}
                      data-testid="input-customer-phone"
                    />
                    {lookingUp && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {!isMesa && (
                    <p className="mt-1 text-xs text-muted-foreground" data-testid="text-phone-hint">
                      {foundReturning
                        ? "✓ Encontramos seu cadastro — confira os dados abaixo."
                        : "Já pediu antes? Informe seu telefone e preenchemos o resto."}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerName">Nome completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerName"
                      placeholder="Seu nome"
                      className="pl-9"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      data-testid="input-customer-name"
                    />
                  </div>
                </div>

                {!isMesa && (
                  <>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cep"
                          inputMode="numeric"
                          placeholder="00000-000"
                          className="pl-9 pr-9"
                          value={form.cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          data-testid="input-customer-cep"
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Digite o CEP para buscar o endereço automaticamente.</p>
                    </div>

                    <div>
                      <Label htmlFor="addressStreet">Rua / Logradouro</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="addressStreet"
                          placeholder="Rua, avenida..."
                          className="pl-9"
                          value={form.addressStreet}
                          onChange={(e) => updateAddress({ addressStreet: e.target.value })}
                          data-testid="input-customer-street"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="addressNumber">Número</Label>
                        <Input
                          id="addressNumber"
                          inputMode="numeric"
                          placeholder="123"
                          className="mt-1"
                          value={form.addressNumber}
                          onChange={(e) => updateAddress({ addressNumber: e.target.value })}
                          data-testid="input-customer-number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressComplement">Complemento</Label>
                        <Input
                          id="addressComplement"
                          placeholder="Apto, bloco..."
                          className="mt-1"
                          value={form.addressComplement}
                          onChange={(e) => updateAddress({ addressComplement: e.target.value })}
                          data-testid="input-customer-complement"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="addressNeighborhood">Bairro</Label>
                        <Input
                          id="addressNeighborhood"
                          placeholder="Bairro"
                          className="mt-1"
                          value={form.addressNeighborhood}
                          onChange={(e) => updateAddress({ addressNeighborhood: e.target.value })}
                          data-testid="input-customer-neighborhood"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressCity">Cidade</Label>
                        <Input
                          id="addressCity"
                          placeholder="Cidade"
                          className="mt-1"
                          value={form.addressCity}
                          onChange={(e) => updateAddress({ addressCity: e.target.value })}
                          data-testid="input-customer-city"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: sem cebola, ponto da carne..."
                    className="mt-1"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            )}

            {!isMesa && checkoutStep === "payment" && (
              <div className="space-y-2">
                <Label>Como você quer pagar?</Label>
                <div className="grid gap-2">
                  {([
                    { key: "pix", label: "Pix", desc: "Pagamento instantâneo", icon: SiPix },
                    { key: "cartao", label: "Cartão", desc: "Crédito ou débito", icon: CreditCard },
                    { key: "entrega", label: "Na entrega", desc: "Pague ao receber o pedido", icon: Banknote },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${paymentMethod === key ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}
                      data-testid={`button-payment-${key}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      {paymentMethod === key && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paymentMethod === "entrega"
                    ? "Você pagará diretamente ao entregador."
                    : "O pagamento online estará disponível em breve no checkout."}
                </p>
              </div>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {isMesa ? (
              <Button className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#22c35c]" size="lg" onClick={handleSubmitOrder} disabled={submitting} data-testid="button-confirm-order">
                <SiWhatsapp className="h-5 w-5" />
                {submitting ? "Enviando..." : "Confirmar via WhatsApp"}
              </Button>
            ) : checkoutStep === "info" ? (
              <Button className="w-full gap-2" size="lg" onClick={handleContinueToPayment} data-testid="button-continue-payment">
                <CreditCard className="h-5 w-5" />
                Ir para pagamento
              </Button>
            ) : (
              <div className="space-y-2">
                <Button className="w-full gap-2" size="lg" onClick={handleSubmitOrder} disabled={submitting} data-testid="button-confirm-order">
                  <Check className="h-5 w-5" />
                  {submitting ? "Enviando..." : "Confirmar pedido"}
                </Button>
                <Button variant="ghost" className="w-full gap-2" onClick={() => setCheckoutStep("info")} data-testid="button-back-info">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
