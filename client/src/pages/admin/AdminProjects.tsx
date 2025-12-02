import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Project, insertProjectSchema, serviceCategories } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, ExternalLink, FolderKanban, Upload, Sparkles } from "lucide-react";
import AdminLayout from "./AdminLayout";

const projectFormSchema = insertProjectSchema.extend({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  imageUrl: z.string().min(1, "Gambar wajib diupload"),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function AdminProjects() {
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/admin/projects'],
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      category: "graphicDesign",
      imageUrl: "",
      featured: false,
      order: 0,
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload gagal');
      }
      
      const data = await response.json();
      form.setValue('imageUrl', data.imageUrl);
      setPreviewImage(data.imageUrl);
      toast({ title: "Berhasil", description: "Gambar berhasil diupload" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengupload gambar", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTranslate = async () => {
    const title = form.getValues('title');
    const description = form.getValues('description');
    
    if (!title && !description) {
      toast({ title: "Info", description: "Isi judul dan deskripsi terlebih dahulu" });
      return;
    }
    
    setIsTranslating(true);
    try {
      const translateText = async (text: string) => {
        if (!text) return "";
        const response = await fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Translate gagal');
        const data = await response.json();
        return data.translated;
      };
      
      const [titleEn, descriptionEn] = await Promise.all([
        title ? translateText(title) : "",
        description ? translateText(description) : "",
      ]);
      
      form.setValue('titleEn', titleEn);
      form.setValue('descriptionEn', descriptionEn);
      toast({ title: "Berhasil", description: "Teks berhasil diterjemahkan ke Inggris" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menerjemahkan teks", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return apiRequest('POST', '/api/admin/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Berhasil", description: "Proyek berhasil dibuat" });
      setIsDialogOpen(false);
      form.reset();
      setPreviewImage(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal membuat proyek", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProjectFormData> }) => {
      return apiRequest('PATCH', `/api/admin/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Berhasil", description: "Proyek berhasil diperbarui" });
      setIsDialogOpen(false);
      setEditingProject(null);
      form.reset();
      setPreviewImage(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui proyek", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Berhasil", description: "Proyek berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus proyek", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setPreviewImage(project.imageUrl);
    form.reset({
      title: project.title,
      titleEn: project.titleEn || "",
      description: project.description,
      descriptionEn: project.descriptionEn || "",
      category: project.category,
      imageUrl: project.imageUrl,
      featured: project.featured ?? false,
      order: project.order ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setPreviewImage(null);
    form.reset({
      title: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      category: "graphicDesign",
      imageUrl: "",
      featured: false,
      order: 0,
    });
    setIsDialogOpen(true);
  };

  const categoryLabels: Record<string, string> = {
    graphicDesign: "Desain Grafis",
    academicHelp: "Joki Tugas",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-projects-title">Proyek</h1>
            <p className="text-muted-foreground mt-1">Kelola proyek portofolio</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} data-testid="button-add-project">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Proyek
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Proyek" : "Tambah Proyek Baru"}</DialogTitle>
                <DialogDescription>
                  {editingProject ? "Perbarui detail proyek" : "Isi detail proyek di bawah ini"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Proyek</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul proyek" data-testid="input-title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Deskripsi singkat proyek" data-testid="input-description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center gap-2 p-3 bg-muted/50 border">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground flex-1">Terjemahkan otomatis ke Bahasa Inggris</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      data-testid="button-translate"
                    >
                      {isTranslating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Terjemahkan
                    </Button>
                  </div>

                  {(form.watch('titleEn') || form.watch('descriptionEn')) && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 space-y-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Hasil Terjemahan:</p>
                      {form.watch('titleEn') && (
                        <p className="text-sm"><strong>Judul:</strong> {form.watch('titleEn')}</p>
                      )}
                      {form.watch('descriptionEn') && (
                        <p className="text-sm"><strong>Deskripsi:</strong> {form.watch('descriptionEn')}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {categoryLabels[cat] || cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urutan Tampil</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              data-testid="input-order"
                              value={field.value ?? 0}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gambar Proyek</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                              data-testid="input-file-upload"
                            />
                            <div 
                              className="border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-sm text-muted-foreground">Mengupload...</p>
                                </div>
                              ) : previewImage ? (
                                <div className="space-y-3">
                                  <img 
                                    src={previewImage} 
                                    alt="Preview" 
                                    className="max-h-40 mx-auto object-contain"
                                  />
                                  <p className="text-sm text-muted-foreground">Klik untuk mengganti gambar</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">Klik untuk upload gambar</p>
                                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (Max 5MB)</p>
                                </div>
                              )}
                            </div>
                            <Input type="hidden" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 border p-4">
                        <div>
                          <FormLabel>Proyek Unggulan</FormLabel>
                          <p className="text-sm text-muted-foreground">Tampilkan proyek ini secara menonjol</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" data-testid="button-cancel">Batal</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-project"
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {editingProject ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Proyek</CardTitle>
            <CardDescription>
              {isLoading ? "Memuat..." : `${projects?.length || 0} proyek`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Unggulan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                      <TableCell>
                        <div className="h-12 w-12 bg-muted overflow-hidden flex items-center justify-center">
                          {project.imageUrl ? (
                            <img 
                              src={project.imageUrl} 
                              alt={project.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {project.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categoryLabels[project.category] || project.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.featured ? (
                          <Badge>Unggulan</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleEdit(project)}
                            data-testid={`button-edit-${project.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <a 
                            href={project.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="icon" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                data-testid={`button-delete-${project.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Proyek?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Proyek "{project.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(project.id)}
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
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada proyek</p>
                <p className="text-sm">Klik "Tambah Proyek" untuk membuat proyek pertama</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
