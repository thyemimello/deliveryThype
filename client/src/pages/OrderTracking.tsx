import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Coffee, CheckCircle, Clock, ChefHat, Bike, Package, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, OrderItem } from "@shared/schema";

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão",
  entrega: "Na entrega",
};

const statusConfig = {
  recebido: {
    label: "Pedido Recebido",
    description: "Seu pedido foi recebido e está aguardando confirmação.",
    icon: Package,
    color: "bg-yellow-500",
    step: 1,
  },
  preparando: {
    label: "Em Preparação",
    description: "Nossos baristas estão preparando seu pedido com carinho!",
    icon: ChefHat,
    color: "bg-blue-500",
    step: 2,
  },
  a_caminho: {
    label: "A Caminho",
    description: "Seu pedido saiu para entrega e está a caminho!",
    icon: Bike,
    color: "bg-orange-500",
    step: 3,
  },
  pronto: {
    label: "Pronto para Retirada",
    description: "Seu pedido está pronto! Dirija-se ao balcão.",
    icon: CheckCircle,
    color: "bg-green-500",
    step: 3,
  },
  entregue: {
    label: "Entregue",
    description: "Pedido entregue! Bom apetite e obrigado pela preferência!",
    icon: CheckCircle,
    color: "bg-green-600",
    step: 4,
  },
  cancelado: {
    label: "Cancelado",
    description: "Seu pedido foi cancelado. Entre em contato conosco.",
    icon: Clock,
    color: "bg-red-500",
    step: 0,
  },
};

const steps = [
  { key: "recebido", label: "Recebido", icon: Package },
  { key: "preparando", label: "Preparando", icon: ChefHat },
  { key: "a_caminho", label: "A Caminho", icon: Bike },
  { key: "entregue", label: "Entregue", icon: CheckCircle },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Pedido não encontrado");
      return res.json();
    },
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  const currentStatus = order ? statusConfig[order.status as keyof typeof statusConfig] : null;
  const currentStep = currentStatus?.step || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Coffee className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold">Acompanhe seu Pedido</h1>
          {order && (
            <p className="mt-2 text-muted-foreground">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Pedido não encontrado</p>
              <p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p>
            </CardContent>
          </Card>
        )}

        {order && currentStatus && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${currentStatus.color} text-white`}>
                    <currentStatus.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <Badge className={`${currentStatus.color} text-white border-0 mb-1`}>
                      {currentStatus.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.status !== "cancelado" && (
              <Card>
                <CardContent className="p-6">
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(((currentStep - 1) / 3) * 100, 100)}%` }}
                      />
                    </div>
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const done = index + 1 <= currentStep;
                      const active = index + 1 === currentStep;
                      return (
                        <div key={step.key} className="relative flex flex-col items-center gap-2" style={{ width: "25%" }}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                            done ? "border-primary bg-primary text-white" : "border-muted bg-background text-muted-foreground"
                          } ${active ? "ring-4 ring-primary/20" : ""}`}>
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <span className={`text-center text-xs font-medium ${done ? "text-primary" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Resumo do Pedido</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  {order.orderType === "delivery" && order.customerAddress && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entrega</span>
                      <span className="font-medium text-right max-w-[60%]">{order.customerAddress}</span>
                    </div>
                  )}
                  {order.orderType === "mesa" && order.tableNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mesa</span>
                      <span className="font-medium">{order.tableNumber}</span>
                    </div>
                  )}
                  {order.orderType === "delivery" && order.paymentMethod && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pagamento</span>
                      <span className="font-medium" data-testid="text-payment-method">
                        {paymentLabels[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4 space-y-2">
                  {(order.items as OrderItem[]).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                    <span className="font-medium">Obs:</span> {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              Esta página atualiza automaticamente a cada 15 segundos
            </p>

            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" className="gap-2" data-testid="button-back-menu">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao cardápio
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
