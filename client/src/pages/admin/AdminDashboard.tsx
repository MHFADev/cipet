import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface Stats {
  totalProjects: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
  });

  const statCards = [
    {
      title: "Total Proyek",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      description: "Item portofolio",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Pesanan",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      description: "Semua pesanan",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pesanan Menunggu",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      description: "Menunggu tindakan",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Pesanan Selesai",
      value: stats?.completedOrders ?? 0,
      icon: CheckCircle,
      description: "Berhasil diselesaikan",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Selamat datang di Admin Panel Cipet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Aksi yang sering digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="/admin/projects" 
                className="block p-3 border border-border hover-elevate active-elevate-2"
                data-testid="link-quick-projects"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Kelola Proyek</div>
                    <div className="text-sm text-muted-foreground">Tambah, edit, atau hapus item portofolio</div>
                  </div>
                </div>
              </a>
              <a 
                href="/admin/orders" 
                className="block p-3 border border-border hover-elevate active-elevate-2"
                data-testid="link-quick-orders"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Lihat Pesanan</div>
                    <div className="text-sm text-muted-foreground">Periksa dan kelola pesanan pelanggan</div>
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Info Sistem</CardTitle>
              <CardDescription>Status aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500"></span>
                  <span className="text-green-500 font-medium">Online</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Database</span>
                <span className="text-foreground font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Versi</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
