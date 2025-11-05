import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Layers } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { useToast } from "@/hooks/use-toast";

const BlogCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryName, setCategoryName] = useState("");

  // Convert URL slug to category name
  const categoryMap: Record<string, string> = {
    "gestao": "Gestão",
    "tecnologia": "Tecnologia",
    "marketing": "Marketing",
    "crm": "CRM"
  };

  useEffect(() => {
    if (!category || !categoryMap[category]) {
      toast({
        title: "Categoria não encontrada",
        description: "A categoria que você procura não existe.",
        variant: "destructive",
      });
      navigate("/blog");
      return;
    }
    setCategoryName(categoryMap[category]);
  }, [category, navigate, toast]);

  const filteredPosts = blogPosts.filter(
    post => post.category.toLowerCase() === categoryName.toLowerCase()
  );

  if (!categoryName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${categoryName} - Blog PetHub | Artigos sobre ${categoryName}`}
        description={`Confira todos os artigos sobre ${categoryName} no blog do PetHub. Dicas, insights e estratégias para sua clínica veterinária.`}
        url={`https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/blog/categoria/${category}`}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-4"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para o blog
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-semibold">
              <Layers className="h-4 w-4" aria-hidden="true" />
              Categoria
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              {categoryName}
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="py-6 px-4 border-b border-border">
        <div className="container mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{categoryName}</span>
          </nav>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-24 space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Layers className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Nenhum artigo encontrado</h2>
              <p className="text-muted-foreground">
                Ainda não temos artigos nesta categoria. Confira outras categorias ou volte em breve!
              </p>
              <Link to="/blog">
                <Badge variant="outline" className="text-base px-6 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  Ver todos os artigos
                </Badge>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card 
                    className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer h-full animate-fade-in hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        width="400"
                        height="300"
                      />
                      {post.featured && (
                        <Badge className="absolute top-4 left-4 bg-primary text-white">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">
                        {post.category}
                      </Badge>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {post.readTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogCategory;
