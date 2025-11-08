import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  const categories = ["Todos", "Gestão", "Tecnologia", "Marketing", "CRM"];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Blog - EasyPet | Dicas e Insights para Clínicas Veterinárias e Pet Shops"
        description="Acesse nosso blog com conteúdo exclusivo sobre gestão veterinária, marketing digital, tecnologia pet e dicas práticas para aumentar o faturamento da sua clínica."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/blog"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Conteúdo Exclusivo
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Blog <span className="text-primary">EasyPet</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Insights, tendências e dicas práticas para transformar sua clínica veterinária
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 border-b border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const categorySlug = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return (
                <Link 
                  key={category} 
                  to={category === "Todos" ? "/blog" : `/blog/categoria/${categorySlug}`}
                >
                  <Button
                    variant={category === "Todos" ? "default" : "outline"}
                    className="rounded-full px-6"
                    aria-label={`Filtrar por ${category}`}
                  >
                    {category}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {blogPosts.filter(p => p.featured).map((post) => (
        <section key={post.id} className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <Link to={`/blog/${post.slug}`}>
              <Card className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-[300px] lg:h-auto overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      width="800"
                      height="600"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary text-white">
                      Destaque
                    </Badge>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-4">
                      {post.category}
                    </Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex items-center text-primary font-semibold group-hover:gap-4 transition-all duration-300">
                      Ler artigo completo
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      ))}

      {/* Blog Grid */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Últimos artigos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(p => !p.featured).map((post, index) => (
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
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-10 py-6 text-lg font-semibold">
              Carregar mais artigos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary via-secondary to-primary">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white">
            Receba conteúdos exclusivos
          </h2>
          <p className="text-lg text-white/90">
            Assine nossa newsletter e receba semanalmente dicas, novidades e cases de sucesso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-4">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white"
            />
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 rounded-full font-bold">
              Inscrever
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
