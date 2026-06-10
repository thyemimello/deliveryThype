import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Plus, Trash2, Save, X, QrCode, Download, Table2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Table } from "@shared/schema";

function tableUrl(number: string) {
  return `${window.location.origin}/mesa/${encodeURIComponent(number)}`;
}

function TableQrCard({ table, onDelete, deleting }: { table: Table; onDelete: () => void; deleting: boolean }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const { toast } = useToast();
  const url = tableUrl(table.number);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 400, margin: 2, errorCorrectionLevel: "H" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [url]);

  const handleDownloadPdf = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 1, errorCorrectionLevel: "H" });
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const qrSize = 110;
      const qrX = (pageWidth - qrSize) / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.text("Cafe Encanto", pageWidth / 2, 35, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text("Aponte a camera para o cardapio digital", pageWidth / 2, 48, { align: "center" });

      doc.addImage(dataUrl, "PNG", qrX, 60, qrSize, qrSize);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.text(`Mesa ${table.number}`, pageWidth / 2, 190, { align: "center" });

      if (table.name) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(18);
        doc.text(table.name, pageWidth / 2, 202, { align: "center" });
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(120);
      doc.text("Faca seu pedido direto pelo celular", pageWidth / 2, 220, { align: "center" });

      doc.save(`mesa-${table.number}-qrcode.pdf`);
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
  };

  return (
    <Card data-testid={`table-card-${table.id}`}>
      <CardContent className="flex flex-col items-center p-4 text-center">
        <div className="mb-3 flex w-full items-start justify-between">
          <div className="text-left">
            <p className="text-lg font-semibold" data-testid={`text-table-number-${table.id}`}>Mesa {table.number}</p>
            {table.name && <p className="text-sm text-muted-foreground">{table.name}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
            disabled={deleting}
            data-testid={`button-delete-table-${table.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3 flex h-44 w-44 items-center justify-center rounded-lg border bg-white p-2">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR Code Mesa ${table.number}`} className="h-full w-full" data-testid={`img-qr-${table.id}`} />
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button className="w-full gap-2" onClick={handleDownloadPdf} data-testid={`button-download-pdf-${table.id}`}>
            <Download className="h-4 w-4" /> Baixar PDF
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full gap-2" data-testid={`button-open-table-${table.id}`}>
              <ExternalLink className="h-4 w-4" /> Abrir comanda
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function TablesTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ["/api/admin/tables"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tables", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao carregar mesas");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { number: string; name: string | null }) => {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar mesa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tables"] });
      setNewNumber("");
      setNewName("");
      setShowAdd(false);
      toast({ title: "Mesa criada!" });
    },
    onError: (err: Error) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao remover mesa");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tables"] });
      toast({ title: "Mesa removida!" });
    },
    onError: () => toast({ title: "Erro ao remover mesa", variant: "destructive" }),
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Mesas & QR Codes</h2>
          <p className="text-sm text-muted-foreground">
            Configure as mesas, gere o QR Code de cada uma e exporte em PDF para imprimir.
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2" data-testid="button-add-table">
          <Plus className="h-4 w-4" /> Nova Mesa
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="mb-3 font-medium">Adicionar Mesa</h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label className="text-sm">Número / Identificação *</Label>
                <Input
                  placeholder="Ex: 1, 12, Varanda 3"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  data-testid="input-new-table-number"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Apelido (opcional)</Label>
                <Input
                  placeholder="Ex: Área externa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-testid="input-new-table-name"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!newNumber.trim()) {
                      toast({ title: "Informe o número da mesa", variant: "destructive" });
                      return;
                    }
                    createMutation.mutate({ number: newNumber.trim(), name: newName.trim() || null });
                  }}
                  disabled={createMutation.isPending}
                  data-testid="button-save-table"
                >
                  <Save className="mr-1 h-4 w-4" /> Salvar
                </Button>
                <Button variant="outline" onClick={() => { setShowAdd(false); setNewNumber(""); setNewName(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
        </div>
      ) : tables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Table2 className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium">Nenhuma mesa configurada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie uma mesa para gerar o QR Code que os clientes vão escanear.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <TableQrCard
              key={table.id}
              table={table}
              deleting={deleteMutation.isPending}
              onDelete={() => { if (window.confirm(`Remover a Mesa ${table.number}?`)) deleteMutation.mutate(table.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
