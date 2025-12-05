import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DOMPurify from "dompurify";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Facebook, Twitter, Linkedin } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { useToast } from "@/hooks/use-toast";
import { useBlogImages } from "@/hooks/useSiteImages";

// Função para parsear datas em português brasileiro (ex: "20 Dez 2024")
const parseBrazilianDate = (dateStr: string): Date | null => {
  const months: Record<string, number> = {
    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
  };
  
  const parts = dateStr.toLowerCase().trim().split(' ');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const monthKey = parts[1].substring(0, 3);
  const month = months[monthKey];
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  
  return new Date(year, month, day);
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = getBlogPostBySlug(slug || "");
  const { images: blogImages } = useBlogImages();

  useEffect(() => {
    if (!post) {
      toast({
        title: "Artigo não encontrado",
        description: "O artigo que você procura não existe ou foi removido.",
        variant: "destructive",
      });
      navigate("/blog");
    }
  }, [post, navigate, toast]);

  if (!post) {
    return null;
  }

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post.title;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado!",
      description: "O link do artigo foi copiado para a área de transferência.",
    });
  };

  // Parse da data para SEO - com fallback seguro
  const parsedDate = parseBrazilianDate(post.date);
  const publishedTimeISO = parsedDate ? parsedDate.toISOString() : new Date().toISOString();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${post.title} - Blog EasyPet`}
        description={post.excerpt}
        url={`${window.location.origin}/blog/${post.slug}`}
        image={blogImages[post.slug] || post.image}
        type="article"
        article={{
          publishedTime: publishedTimeISO,
          author: post.author.name,
          tags: post.tags,
        }}
      />
      <Navigation />

      {/* Hero Image */}
      <section className="relative h-[60vh] overflow-hidden">
        <img 
          src={blogImages[post.slug] || post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </section>

      {/* Article Content */}
      <article className="relative -mt-40 px-4 pb-24" id="main-content">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            Voltar para o blog
          </Link>

          <Card className="border-2 border-border shadow-2xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              {/* Header */}
              <div className="space-y-6">
                <Badge variant="outline" className="text-base px-4 py-1">
                  {post.category}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Author & Meta */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.author.name}</div>
                      <div className="text-sm text-muted-foreground">{post.author.role}</div>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-12 hidden md:block" />
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <time dateTime={publishedTimeISO}>{post.date}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {post.readTime}
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-muted-foreground">Compartilhar:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare('facebook')}
                      className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      aria-label="Compartilhar no Facebook"
                    >
                      <Facebook className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare('twitter')}
                      className="hover:bg-sky-500 hover:text-white hover:border-sky-500"
                      aria-label="Compartilhar no Twitter"
                    >
                      <Twitter className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare('linkedin')}
                      className="hover:bg-blue-700 hover:text-white hover:border-blue-700"
                      aria-label="Compartilhar no LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare('whatsapp')}
                      className="hover:bg-green-600 hover:text-white hover:border-green-600"
                      aria-label="Compartilhar no WhatsApp"
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      aria-label="Copiar link"
                    >
                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-ul:my-6 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(post.content, {
                    ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'br', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'target', 'rel']
                  })
                }}
              />

              {/* Tags */}
              <div className="pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20">
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-2xl font-bold">Pronto para transformar sua clínica?</h3>
                  <p className="text-muted-foreground">
                    Teste gratuitamente todas as funcionalidades que mencionamos neste artigo
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="px-8 font-bold">
                      Começar teste grátis de 14 dias
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-24" aria-labelledby="related-posts-heading">
              <h2 id="related-posts-heading" className="text-3xl font-bold mb-8">Artigos relacionados</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                    <Card className="border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={blogImages[relatedPost.slug] || relatedPost.image} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-6 space-y-3">
                        <Badge variant="outline" className="text-xs">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;