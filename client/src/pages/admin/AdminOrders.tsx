import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Order, orderStatuses } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Loader2, ShoppingCart, Phone, Calendar, DollarSign, FileText } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  inProgress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  inProgress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const serviceLabels: Record<string, string> = {
  graphicDesign: "Desain Grafis",
  academicHelp: "Joki Tugas",
  flyer: "Flyer & Brosur",
  poster: "Poster",
  socialMedia: "Media Sosial",
  uiux: "Desain UI/UX",
  essay: "Makalah / Essay",
  ppt: "PowerPoint",
  resume: "Resume / Ringkasan",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Order> }) => {
      return apiRequest(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Berhasil", description: "Pesanan berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui pesanan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/orders/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Berhasil", description: "Pesanan berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus pesanan", variant: "destructive" });
    },
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setNotes(order.notes || "");
    setIsDetailOpen(true);
  };

  const handleStatusChange = (orderId: number, status: string) => {
    updateMutation.mutate({ id: orderId, data: { status } });
  };

  const handleSaveNotes = () => {
    if (selectedOrder) {
      updateMutation.mutate({ 
        id: selectedOrder.id, 
        data: { notes } 
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-orders-title">Pesanan</h1>
          <p className="text-muted-foreground mt-1">Kelola pesanan pelanggan</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Pesanan</CardTitle>
            <CardDescription>
              {isLoading ? "Memuat..." : `${orders?.length || 0} pesanan`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.name}</div>
                          <div className="text-sm text-muted-foreground">{order.contact}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{serviceLabels[order.serviceCategory] || order.serviceCategory}</div>
                          <div className="text-sm text-muted-foreground">{serviceLabels[order.subService] || order.subService}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">Rp {order.budget}</span>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className={`w-32 ${statusColors[order.status]}`} data-testid={`select-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orderStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {statusLabels[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleViewOrder(order)}
                              data-testid={`button-view-${order.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  data-testid={`button-delete-${order.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Pesanan #{order.id} dari {order.name} akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(order.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pesanan</p>
                <p className="text-sm">Pesanan dari website akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan #{selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Dibuat: {selectedOrder && format(new Date(selectedOrder.createdAt), "dd MMMM yyyy, HH:mm")}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Info Klien</span>
                    </div>
                    <p className="font-medium">{selectedOrder.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.contact}</p>
                  </div>
                  <div className="p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Budget</span>
                    </div>
                    <p className="font-medium text-lg">Rp {selectedOrder.budget}</p>
                  </div>
                  <div className="p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Tenggat Waktu</span>
                    </div>
                    <p className="font-medium">{selectedOrder.deadline}</p>
                  </div>
                  <div className="p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm font-medium">Layanan</span>
                    </div>
                    <p className="font-medium">{serviceLabels[selectedOrder.serviceCategory]}</p>
                    <p className="text-sm text-muted-foreground">{serviceLabels[selectedOrder.subService]}</p>
                  </div>
                </div>

                <div className="p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Deskripsi Proyek</span>
                  <p className="mt-2 whitespace-pre-wrap">{selectedOrder.topic}</p>
                </div>

                <div className="p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => {
                      handleStatusChange(selectedOrder.id, value);
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger className={`mt-2 w-full ${statusColors[selectedOrder.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Catatan Internal</span>
                  <Textarea 
                    className="mt-2"
                    placeholder="Tambahkan catatan tentang pesanan ini..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-notes"
                  />
                  <Button 
                    className="mt-2" 
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-notes"
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Simpan Catatan
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" data-testid="button-close-detail">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
