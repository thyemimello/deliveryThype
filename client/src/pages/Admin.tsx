import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, LogOut, Coffee, Save, X, Eye, EyeOff, Phone, MessageCircle, Search, UserPlus, Send, CheckSquare, Square, Percent, ShoppingBag, ChefHat, Bike, CheckCircle, Package, Clock, RefreshCw, QrCode, Store, Image as ImageIcon, Upload, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TablesTab } from "@/components/TablesTab";
import type { Product, WhatsappContact, Order, OrderItem } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  subcategory: string;
  volume: string;
  region: string;
  grape: string;
  country: string;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  featured: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  originalPrice: null,
  category: "cafes",
  subcategory: "",
  volume: "",
  region: "",
  grape: "",
  country: "",
  images: [""],
  inStock: true,
  isNew: false,
  isSale: false,
  featured: false,
};

const statusConfig: Record<string, { label: string; color: string; icon: any; next?: string; nextLabel?: string }> = {
  recebido: { label: "Recebido", color: "bg-yellow-500", icon: Package, next: "preparando", nextLabel: "Iniciar Preparo" },
  preparando: { label: "Preparando", color: "bg-blue-500", icon: ChefHat, next: "a_caminho", nextLabel: "Saiu para Entrega" },
  a_caminho: { label: "A Caminho", color: "bg-orange-500", icon: Bike, next: "entregue", nextLabel: "Confirmar Entrega" },
  pronto: { label: "Pronto", color: "bg-green-500", icon: CheckCircle, next: "entregue", nextLabel: "Confirmar Retirada" },
  entregue: { label: "Entregue", color: "bg-green-700", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-500", icon: X },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

function buildWhatsAppLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length <= 11 ? `55${digits}` : digits;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login falhou");
      }
      const data = await response.json();
      localStorage.setItem("admin-token", data.token);
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="admin-login">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Coffee className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Painel Administrativo</CardTitle>
          <p className="text-sm text-muted-foreground">Café Encanto</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required data-testid="input-admin-username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required data-testid="input-admin-password" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-admin-login">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <Link href="/">
            <Button variant="ghost" className="mt-3 w-full gap-2 text-muted-foreground" data-testid="button-back-to-store">
              <Store className="h-4 w-4" />
              Voltar ao cardápio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel, isPending }: { product?: Product; onSave: (data: ProductFormData) => void; onCancel: () => void; isPending: boolean }) {
  const [form, setForm] = useState<ProductFormData>(
    product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      subcategory: product.subcategory || "",
      volume: product.volume || "",
      region: product.region || "",
      grape: product.grape || "",
      country: product.country || "",
      images: product.images.length > 0 ? product.images : [""],
      inStock: product.inStock ?? true,
      isNew: product.isNew ?? false,
      isSale: product.isSale ?? false,
      featured: product.featured ?? false,
    } : emptyForm
  );

  const updateField = (field: keyof ProductFormData, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, images: form.images.filter((img) => img.trim() !== "") };
    if (data.images.length === 0) data.images = ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"];
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Nome do Produto</Label>
          <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} required data-testid="input-product-name" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Descrição</Label>
          <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} required data-testid="input-product-description" />
        </div>
        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <Input type="number" step="0.01" value={form.price} onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)} required data-testid="input-product-price" />
        </div>
        <div className="space-y-2">
          <Label>Preço Original (R$)</Label>
          <Input type="number" step="0.01" value={form.originalPrice || ""} onChange={(e) => updateField("originalPrice", e.target.value ? parseFloat(e.target.value) : null)} placeholder="Deixe vazio se não tiver desconto" data-testid="input-product-original-price" />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
            <SelectTrigger data-testid="select-product-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cafes">Cafés Especiais</SelectItem>
              <SelectItem value="doces">Doces & Sobremesas</SelectItem>
              <SelectItem value="salgados">Salgados & Lanches</SelectItem>
              <SelectItem value="bebidas">Bebidas Frias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tamanho / Porção</Label>
          <Input value={form.volume} onChange={(e) => updateField("volume", e.target.value)} placeholder="Ex: 250ml, 100g" data-testid="input-product-volume" />
        </div>
        <div className="space-y-2">
          <Label>Subcategoria</Label>
          <Input value={form.subcategory} onChange={(e) => updateField("subcategory", e.target.value)} placeholder="Ex: espresso, bolo..." data-testid="input-product-subcategory" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>URL da Imagem</Label>
          {form.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={img} onChange={(e) => { const newImages = [...form.images]; newImages[idx] = e.target.value; updateField("images", newImages); }} placeholder="https://..." data-testid={`input-product-image-${idx}`} />
              {form.images.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => updateField("images", form.images.filter((_, i) => i !== idx))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => updateField("images", [...form.images, ""])} data-testid="button-add-image">
            <Plus className="mr-1 h-3 w-3" /> Adicionar Imagem
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2"><Switch checked={form.inStock} onCheckedChange={(v) => updateField("inStock", v)} data-testid="switch-in-stock" /><Label>Disponível</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.isNew} onCheckedChange={(v) => updateField("isNew", v)} data-testid="switch-is-new" /><Label>Novidade</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.isSale} onCheckedChange={(v) => updateField("isSale", v)} data-testid="switch-is-sale" /><Label>Promoção</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => updateField("featured", v)} data-testid="switch-featured" /><Label>Mais Pedido</Label></div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-form">Cancelar</Button>
        <Button type="submit" disabled={isPending} className="gap-2" data-testid="button-save-product">
          <Save className="h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function OrdersTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Status atualizado!" });
    },
    onError: () => toast({ title: "Erro ao atualizar status", variant: "destructive" }),
  });

  const filtered = filterStatus === "todos" ? orders : orders.filter((o) => o.status === filterStatus);

  const newOrdersCount = orders.filter((o) => o.status === "recebido").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            Pedidos
            {newOrdersCount > 0 && (
              <Badge className="bg-red-500 text-white">{newOrdersCount} novos</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">Gerencie e acompanhe todos os pedidos</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} data-testid="button-refresh-orders">
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["todos", "recebido", "preparando", "a_caminho", "entregue", "cancelado"].map((s) => (
          <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)} data-testid={`filter-order-${s}`}>
            {s === "todos" ? "Todos" : statusConfig[s]?.label || s}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium">Nenhum pedido encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Os pedidos aparecerão aqui assim que forem feitos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const st = statusConfig[order.status] || statusConfig.recebido;
            const StIcon = st.icon;
            return (
              <Card key={order.id} data-testid={`order-card-${order.id}`} className={order.status === "recebido" ? "border-yellow-400" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${st.color} text-white`}>
                        <StIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <Badge className={`${st.color} text-white border-0 text-xs`}>{st.label}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {order.orderType === "delivery" ? "🚴 Delivery" : order.orderType === "mesa" ? `🪑 Mesa ${order.tableNumber}` : "🏪 Balcão"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        {order.customerAddress && <p className="text-xs text-muted-foreground">📍 {order.customerAddress}</p>}
                        {order.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                      <a href={`/pedido/${order.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        Rastrear pedido →
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 rounded-md bg-muted/50 p-3">
                    <div className="space-y-1">
                      {(order.items as OrderItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-xs text-muted-foreground border-t pt-2">Obs: {order.notes}</p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {st.next && (
                      <Button size="sm" className="gap-1" onClick={() => updateStatusMutation.mutate({ id: order.id, status: st.next! })} disabled={updateStatusMutation.isPending} data-testid={`button-advance-${order.id}`}>
                        <CheckCircle className="h-3 w-3" /> {st.nextLabel}
                      </Button>
                    )}
                    {order.status === "preparando" && order.orderType === "mesa" && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pronto" })} disabled={updateStatusMutation.isPending}>
                        <CheckCircle className="h-3 w-3" /> Pronto para Retirada
                      </Button>
                    )}
                    {order.status !== "entregue" && order.status !== "cancelado" && (
                      <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => { if (window.confirm("Cancelar este pedido?")) updateStatusMutation.mutate({ id: order.id, status: "cancelado" }); }} data-testid={`button-cancel-${order.id}`}>
                        <X className="h-3 w-3" /> Cancelar
                      </Button>
                    )}
                    <a href={buildWhatsAppLink(order.customerPhone, `Olá ${order.customerName}! Sobre o seu pedido #${order.id.slice(0, 8).toUpperCase()} na Café Encanto:`)} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1" data-testid={`button-whatsapp-order-${order.id}`}>
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "contacts" | "orders" | "tables" | "campaign">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [campaignText, setCampaignText] = useState("");
  const [campaignImageUrl, setCampaignImageUrl] = useState<string | null>(null);
  const [campaignImagePreview, setCampaignImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem("admin-token");
    if (savedToken) {
      fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${savedToken}` } })
        .then((res) => { if (res.ok) setToken(savedToken); else localStorage.removeItem("admin-token"); })
        .catch(() => localStorage.removeItem("admin-token"));
    }
  }, []);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!token,
  });

  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery<WhatsappContact[]>({
    queryKey: ["/api/admin/whatsapp-contacts"],
    enabled: !!token && (activeTab === "contacts" || activeTab === "campaign"),
    queryFn: async () => { const res = await apiRequest("GET", "/api/admin/whatsapp-contacts"); return res.json(); },
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/admin/whatsapp-contacts/${id}`); return res.json(); },
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-contacts"] });
      setSelectedContacts((prev) => { const next = new Set(prev); next.delete(deletedId); return next; });
      toast({ title: "Contato removido!" });
    },
    onError: () => toast({ title: "Erro ao remover contato", variant: "destructive" }),
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: { phone: string; name: string | null }) => { const res = await apiRequest("POST", "/api/admin/whatsapp-contacts", data); return res.json(); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-contacts"] });
      setNewContactPhone(""); setNewContactName(""); setShowAddContact(false);
      toast({ title: "Contato adicionado!" });
    },
    onError: () => toast({ title: "Erro ao adicionar contato", variant: "destructive" }),
  });

  const [sendQueue, setSendQueue] = useState<{ phones: string[]; message: string; index: number } | null>(null);

  const openNextWhatsApp = (phones: string[], message: string, index: number) => {
    if (index >= phones.length) { setSendQueue(null); toast({ title: "Todas as mensagens foram enviadas!" }); return; }
    window.open(`https://wa.me/${phones[index]}?text=${message}`, "_blank");
    if (index + 1 >= phones.length) { setSendQueue(null); toast({ title: "Todas as mensagens foram enviadas!" }); }
    else setSendQueue({ phones, message, index: index + 1 });
  };

  const getSelectedPhones = () => contacts.filter((c) => selectedContacts.has(c.id)).map((c) => { const d = c.phone.replace(/\D/g, ""); return d.length <= 11 ? `55${d}` : d; });

  const handleCampaignImage = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Selecione um arquivo de imagem", variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: "Imagem muito grande (máx. 10MB)", variant: "destructive" }); return; }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await apiRequest("POST", "/api/admin/upload", { image: reader.result });
        const data = await res.json();
        setCampaignImageUrl(data.url);
        setCampaignImagePreview(reader.result as string);
        toast({ title: "Imagem carregada!" });
      } catch {
        toast({ title: "Erro ao enviar imagem", variant: "destructive" });
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => { setUploadingImage(false); toast({ title: "Erro ao ler imagem", variant: "destructive" }); };
    reader.readAsDataURL(file);
  };

  const handleSendCampaign = () => {
    const phones = getSelectedPhones();
    if (phones.length === 0) { toast({ title: "Selecione pelo menos um contato", variant: "destructive" }); return; }
    if (!campaignText.trim() && !campaignImageUrl) { toast({ title: "Adicione um texto ou uma imagem", variant: "destructive" }); return; }
    const parts: string[] = [];
    if (campaignText.trim()) parts.push(campaignText.trim());
    if (campaignImageUrl) parts.push(`${window.location.origin}${campaignImageUrl}`);
    const message = encodeURIComponent(parts.join("\n\n"));
    openNextWhatsApp(phones, message, 0);
  };

  const handleSendCatalog = () => {
    const phones = getSelectedPhones();
    if (phones.length === 0) { toast({ title: "Selecione pelo menos um contato", variant: "destructive" }); return; }
    const message = encodeURIComponent(`Olá! Confira nosso cardápio completo:\n${window.location.origin}/produtos\n\nCafé Encanto - Itajaí, SC`);
    openNextWhatsApp(phones, message, 0);
  };

  const handleSendPromo = () => {
    const phones = getSelectedPhones();
    if (phones.length === 0) { toast({ title: "Selecione pelo menos um contato", variant: "destructive" }); return; }
    const message = encodeURIComponent(`Olá! Temos ofertas especiais para você!\nConfira nossas promoções:\n${window.location.origin}/promocoes\n\nAproveite! ☕ Café Encanto`);
    openNextWhatsApp(phones, message, 0);
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => { const res = await apiRequest("POST", "/api/admin/products", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); setShowForm(false); toast({ title: "Produto criado com sucesso!" }); },
    onError: () => toast({ title: "Erro ao criar produto", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => { const res = await apiRequest("PATCH", `/api/admin/products/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); setEditingProduct(null); setShowForm(false); toast({ title: "Produto atualizado!" }); },
    onError: () => toast({ title: "Erro ao atualizar produto", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const res = await apiRequest("DELETE", `/api/admin/products/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Produto removido!" }); },
    onError: () => toast({ title: "Erro ao remover produto", variant: "destructive" }),
  });

  const { data: settings } = useQuery<{ popularMode: string }>({
    queryKey: ["/api/settings"],
  });
  const popularMode = settings?.popularMode || "manual";

  const settingsMutation = useMutation({
    mutationFn: async (mode: "manual" | "auto") => { const res = await apiRequest("PATCH", "/api/admin/settings", { popularMode: mode }); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/settings"] }); toast({ title: "Modo de 'Mais Pedidos' atualizado!" }); },
    onError: () => toast({ title: "Erro ao atualizar modo", variant: "destructive" }),
  });

  const handleLogout = async () => {
    if (token) await fetch("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("admin-token");
    setToken(null);
  };

  const categoryNames: Record<string, string> = {
    cafes: "Cafés", doces: "Doces", salgados: "Salgados", bebidas: "Bebidas",
  };

  if (!token) return <LoginForm onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-background" data-testid="admin-panel">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-xl font-semibold">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">{products.length} itens</Badge>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-admin-view-store">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Ver loja</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-4">
          {[
            { key: "orders", label: "Pedidos", icon: ShoppingBag },
            { key: "products", label: "Cardápio", icon: Coffee },
            { key: "tables", label: "Mesas", icon: QrCode },
            { key: "contacts", label: "Contatos", icon: MessageCircle },
            { key: "campaign", label: "Campanha", icon: Megaphone },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              data-testid={`tab-${key}`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        {activeTab === "orders" && token && <OrdersTab token={token} />}

        {activeTab === "tables" && token && <TablesTab token={token} />}

        {activeTab === "contacts" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Contatos WhatsApp</h2>
                <p className="text-sm text-muted-foreground">Gerencie contatos e envie mensagens</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => refetchContacts()} className="gap-2" data-testid="button-refresh-contacts">
                  <RefreshCw className="h-4 w-4" /> Atualizar
                </Button>
                <Button onClick={() => setShowAddContact(!showAddContact)} className="gap-2" data-testid="button-add-contact">
                  <UserPlus className="h-4 w-4" /> Novo Contato
                </Button>
              </div>
            </div>

            {showAddContact && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h3 className="mb-3 font-medium">Adicionar Contato</h3>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <Label className="text-sm">WhatsApp *</Label>
                      <Input placeholder="(47) 99999-9999" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} data-testid="input-new-contact-phone" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm">Nome (opcional)</Label>
                      <Input placeholder="Nome do contato" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} data-testid="input-new-contact-name" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { if (!newContactPhone.trim()) { toast({ title: "Informe o número", variant: "destructive" }); return; } createContactMutation.mutate({ phone: newContactPhone.trim(), name: newContactName.trim() || null }); }} disabled={createContactMutation.isPending} data-testid="button-save-contact">
                        <Save className="mr-1 h-4 w-4" /> Salvar
                      </Button>
                      <Button variant="outline" onClick={() => { setShowAddContact(false); setNewContactPhone(""); setNewContactName(""); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedContacts.size > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border bg-muted/50 p-3">
                <span className="text-sm font-medium">{selectedContacts.size} selecionado(s)</span>
                <Separator orientation="vertical" className="h-5" />
                <Button size="sm" variant="outline" className="gap-1" onClick={handleSendCatalog} disabled={!!sendQueue} data-testid="button-send-catalog"><Send className="h-3 w-3" /> Enviar Cardápio</Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleSendPromo} disabled={!!sendQueue} data-testid="button-send-promo"><Percent className="h-3 w-3" /> Enviar Promoção</Button>
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => setSelectedContacts(new Set())} data-testid="button-clear-selection"><X className="h-3 w-3" /> Limpar</Button>
              </div>
            )}

            {sendQueue && sendQueue.index < sendQueue.phones.length && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-green-600/30 bg-green-600/5 p-3">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Enviado {sendQueue.index} de {sendQueue.phones.length}</span>
                <Button size="sm" className="gap-1" onClick={() => openNextWhatsApp(sendQueue.phones, sendQueue.message, sendQueue.index)} data-testid="button-send-next"><Send className="h-3 w-3" /> Próximo contato</Button>
                <Button size="sm" variant="outline" onClick={() => setSendQueue(null)} data-testid="button-cancel-send">Cancelar</Button>
              </div>
            )}

            {contactsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="flex items-center gap-4 p-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div></CardContent></Card>)}</div>
            ) : contacts.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center p-12 text-center"><MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-lg font-medium">Nenhum contato ainda</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 pb-1">
                  <button onClick={() => selectedContacts.size === contacts.length ? setSelectedContacts(new Set()) : setSelectedContacts(new Set(contacts.map(c => c.id)))} className="text-muted-foreground" data-testid="button-select-all-contacts">
                    {selectedContacts.size === contacts.length ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                  </button>
                  <span className="text-xs text-muted-foreground">{selectedContacts.size === contacts.length ? "Desmarcar todos" : "Selecionar todos"}</span>
                </div>
                {contacts.map((contact) => (
                  <Card key={contact.id} data-testid={`contact-${contact.id}`}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <button onClick={() => { setSelectedContacts((prev) => { const next = new Set(prev); if (next.has(contact.id)) next.delete(contact.id); else next.add(contact.id); return next; }); }} data-testid={`checkbox-contact-${contact.id}`}>
                        {selectedContacts.has(contact.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/10"><Phone className="h-5 w-5 text-green-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" data-testid={`text-contact-phone-${contact.id}`}>{contact.phone}</p>
                        {contact.name && <p className="text-sm text-muted-foreground truncate">{contact.name}</p>}
                        {contact.createdAt && <p className="text-xs text-muted-foreground">{new Date(contact.createdAt).toLocaleDateString("pt-BR")}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1" data-testid={`button-whatsapp-${contact.id}`}><MessageCircle className="h-3 w-3" /> Conversar</Button>
                        </a>
                        <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={() => { if (window.confirm("Remover este contato?")) deleteContactMutation.mutate(contact.id); }} data-testid={`button-delete-contact-${contact.id}`}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "campaign" && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Campanha WhatsApp</h2>
              <p className="text-sm text-muted-foreground">Envie uma imagem e/ou um texto para os contatos selecionados</p>
            </div>

            <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
              A imagem é enviada como um link com pré-visualização. O WhatsApp não permite anexar o arquivo automaticamente, então o cliente toca no link para ver a imagem.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <h3 className="font-medium">Imagem</h3>
                  {campaignImagePreview ? (
                    <div className="space-y-2">
                      <img src={campaignImagePreview} alt="Prévia da campanha" className="max-h-64 w-full rounded-md object-contain bg-muted" data-testid="img-campaign-preview" />
                      <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={() => { setCampaignImageUrl(null); setCampaignImagePreview(null); }} data-testid="button-remove-campaign-image">
                        <X className="h-3 w-3" /> Remover imagem
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-muted-foreground hover:bg-muted/50" data-testid="label-upload-campaign-image">
                      {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                      <span className="text-sm">{uploadingImage ? "Enviando..." : "Clique para enviar uma imagem"}</span>
                      <span className="text-xs">PNG, JPG, WEBP ou GIF (máx. 10MB)</span>
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCampaignImage(f); e.target.value = ""; }} data-testid="input-campaign-image" />
                    </label>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-4">
                  <h3 className="font-medium">Mensagem (opcional)</h3>
                  <Textarea rows={8} placeholder="Escreva a mensagem que será enviada junto com a imagem..." value={campaignText} onChange={(e) => setCampaignText(e.target.value)} data-testid="input-campaign-text" />
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button className="gap-2" onClick={handleSendCampaign} disabled={!!sendQueue || uploadingImage} data-testid="button-send-campaign">
                <Send className="h-4 w-4" /> Enviar para {selectedContacts.size} selecionado(s)
              </Button>
              {selectedContacts.size > 0 && (
                <Button variant="outline" className="gap-1 text-destructive" onClick={() => setSelectedContacts(new Set())} data-testid="button-clear-campaign-selection"><X className="h-3 w-3" /> Limpar seleção</Button>
              )}
            </div>

            {sendQueue && sendQueue.index < sendQueue.phones.length && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-green-600/30 bg-green-600/5 p-3">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Enviado {sendQueue.index} de {sendQueue.phones.length}</span>
                <Button size="sm" className="gap-1" onClick={() => openNextWhatsApp(sendQueue.phones, sendQueue.message, sendQueue.index)} data-testid="button-campaign-send-next"><Send className="h-3 w-3" /> Próximo contato</Button>
                <Button size="sm" variant="outline" onClick={() => setSendQueue(null)} data-testid="button-campaign-cancel-send">Cancelar</Button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-2 font-medium">Selecione os contatos</h3>
              {contactsLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : contacts.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center justify-center p-12 text-center"><MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-lg font-medium">Nenhum contato ainda</p><p className="text-sm text-muted-foreground">Os números aparecem aqui quando os clientes fazem pedidos.</p></CardContent></Card>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 pb-1">
                    <button onClick={() => selectedContacts.size === contacts.length ? setSelectedContacts(new Set()) : setSelectedContacts(new Set(contacts.map(c => c.id)))} className="text-muted-foreground" data-testid="button-campaign-select-all">
                      {selectedContacts.size === contacts.length ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                    </button>
                    <span className="text-xs text-muted-foreground">{selectedContacts.size === contacts.length ? "Desmarcar todos" : "Selecionar todos"}</span>
                  </div>
                  {contacts.map((contact) => (
                    <Card key={contact.id} data-testid={`campaign-contact-${contact.id}`}>
                      <CardContent className="flex items-center gap-3 p-3">
                        <button onClick={() => { setSelectedContacts((prev) => { const next = new Set(prev); if (next.has(contact.id)) next.delete(contact.id); else next.add(contact.id); return next; }); }} data-testid={`campaign-checkbox-contact-${contact.id}`}>
                          {selectedContacts.has(contact.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                        </button>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600/10"><Phone className="h-4 w-4 text-green-600" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{contact.phone}</p>
                          {contact.name && <p className="text-sm text-muted-foreground truncate">{contact.name}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Cardápio</h2>
                <p className="text-sm text-muted-foreground">Adicione, edite ou remova itens do cardápio</p>
              </div>
              <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="gap-2" data-testid="button-new-product">
                <Plus className="h-4 w-4" /> Novo Item
              </Button>
            </div>

            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Categoria "Mais Pedidos"</h3>
                  <p className="text-sm text-muted-foreground">
                    {popularMode === "manual"
                      ? "Modo manual: você escolhe os itens marcados como \"Mais Pedido\"."
                      : "Modo automático: ordena pelos itens mais vendidos (histórico de pedidos)."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={popularMode === "manual" ? "default" : "outline"}
                    onClick={() => settingsMutation.mutate("manual")}
                    disabled={settingsMutation.isPending}
                    data-testid="button-popular-manual"
                  >
                    Manual
                  </Button>
                  <Button
                    size="sm"
                    variant={popularMode === "auto" ? "default" : "outline"}
                    onClick={() => settingsMutation.mutate("auto")}
                    disabled={settingsMutation.isPending}
                    data-testid="button-popular-auto"
                  >
                    Automático
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar no cardápio..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" data-testid="input-admin-search" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[{ value: "all", label: "Todos" }, { value: "cafes", label: "Cafés" }, { value: "doces", label: "Doces" }, { value: "salgados", label: "Salgados" }, { value: "bebidas", label: "Bebidas" }, { value: "promo", label: "Promoções" }].map((filter) => (
                  <Button key={filter.value} variant={filterCategory === filter.value ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(filter.value)} data-testid={`filter-${filter.value}`}>
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {(() => {
              const filtered = products.filter((p) => {
                const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = filterCategory === "all" || (filterCategory === "promo" ? p.isSale : p.category === filterCategory);
                return matchesSearch && matchesFilter;
              });

              return isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-4"><div className="flex gap-4"><Skeleton className="h-20 w-16 rounded-md" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div></CardContent></Card>)}</div>
              ) : filtered.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center justify-center p-12 text-center"><Search className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-lg font-medium">Nenhum item encontrado</p></CardContent></Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((product) => (
                    <Card key={product.id} data-testid={`admin-product-${product.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <h3 className="font-medium line-clamp-1" data-testid={`text-admin-product-name-${product.id}`}>{product.name}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <Badge variant="secondary" className="text-xs">{categoryNames[product.category] || product.category}</Badge>
                              {product.isNew && <Badge className="bg-primary text-primary-foreground text-xs">Novo</Badge>}
                              {product.isSale && <Badge variant="destructive" className="text-xs">Promo</Badge>}
                              {product.featured && <Badge className="bg-amber-500 text-white text-xs">Mais Pedido</Badge>}
                              {!product.inStock && <Badge variant="outline" className="text-xs text-muted-foreground">Indisponível</Badge>}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-semibold text-sm">{formatPrice(product.price)}</span>
                              {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setShowForm(true); }} className="gap-1" data-testid={`button-edit-${product.id}`}>
                            <Pencil className="h-3 w-3" /> Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { if (window.confirm(`Remover "${product.name}"?`)) deleteMutation.mutate(product.id); }} className="gap-1 text-destructive" data-testid={`button-delete-${product.id}`}>
                            <Trash2 className="h-3 w-3" /> Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingProduct ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSave={(data) => { if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data }); else createMutation.mutate(data); }}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
