import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, TrendingDown, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  category: z.enum(["racao", "petisco", "higiene", "brinquedo", "acessorio", "medicamento"]),
  sku: z.string().trim().max(50, "SKU deve ter no máximo 50 caracteres").regex(/^[A-Za-z0-9-]*$/, "SKU deve conter apenas letras, números e hífens").optional().or(z.literal("")),
  barcode: z.string().trim().max(50, "Código de barras deve ter no máximo 50 caracteres").regex(/^[0-9]*$/, "Código de barras deve conter apenas números").optional().or(z.literal("")),
  cost_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Preço de custo deve ser maior que zero"),
  sale_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Preço de venda deve ser maior que zero"),
  stock_quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Quantidade deve ser um número positivo"),
  min_stock_quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Estoque mínimo deve ser um número positivo"),
});

const Estoque = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "racao",
    sku: "",
    cost_price: "",
    sale_price: "",
    stock_quantity: "0",
    min_stock_quantity: "5",
    expiry_date: "",
    barcode: "",
  });

  useEffect(() => {
    if (user) {
      loadPetShopAndProducts();
    }
  }, [user]);

  const loadPetShopAndProducts = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (petShop) {
      setPetShopId(petShop.id);
      await loadProducts(petShop.id);
    }
  };

  const loadProducts = async (shopId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("pet_shop_id", shopId)
      .order("name");

    if (!error && data) {
      setProducts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      productSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    
    const { error } = await supabase.from("products").insert({
      ...formData,
      pet_shop_id: petShopId,
      cost_price: parseFloat(formData.cost_price),
      sale_price: parseFloat(formData.sale_price),
      stock_quantity: parseInt(formData.stock_quantity),
      min_stock_quantity: parseInt(formData.min_stock_quantity),
    });

    if (error) {
      toast.error("Erro ao cadastrar produto");
    } else {
      toast.success("Produto cadastrado com sucesso!");
      setIsDialogOpen(false);
      loadProducts(petShopId);
      setFormData({
        name: "",
        description: "",
        category: "racao",
        sku: "",
        cost_price: "",
        sale_price: "",
        stock_quantity: "0",
        min_stock_quantity: "5",
        expiry_date: "",
        barcode: "",
      });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_quantity);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos e estoque</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>Preencha as informações do produto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="racao">Ração</SelectItem>
                      <SelectItem value="petisco">Petisco</SelectItem>
                      <SelectItem value="higiene">Higiene</SelectItem>
                      <SelectItem value="brinquedo">Brinquedo</SelectItem>
                      <SelectItem value="acessorio">Acessório</SelectItem>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU/Código</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    maxLength={50}
                    pattern="[A-Za-z0-9-]*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    maxLength={50}
                    pattern="[0-9]*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Preço de Custo *</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="999999.99"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Preço de Venda *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="999999.99"
                    required
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    max="999999"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock_quantity">Estoque Mínimo *</Label>
                  <Input
                    id="min_stock_quantity"
                    type="number"
                    min="0"
                    max="999999"
                    required
                    value={formData.min_stock_quantity}
                    onChange={(e) => setFormData({ ...formData, min_stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Produto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-destructive">
                    {product.stock_quantity} unidades (mín: {product.min_stock_quantity})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>{filteredProducts.length} produtos</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-primary">R$ {product.sale_price.toFixed(2)}</p>
                  <div className={`flex items-center gap-2 text-sm ${
                    product.stock_quantity <= product.min_stock_quantity
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}>
                    <Package className="h-4 w-4" />
                    {product.stock_quantity} un.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;