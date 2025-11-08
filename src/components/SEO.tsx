import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export const SEO = ({
  title = 'EasyPet - Sistema Completo de Gestão para Pet Shops, Banho & Tosa e Clínicas',
  description = 'Sistema completo de gestão para seu pet shop, banho e tosa ou clínica veterinária. Agendamento inteligente, CRM, controle financeiro e muito mais. Teste grátis por 14 dias.',
  image = 'https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/og-image.jpg',
  url = 'https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com',
  type = 'website',
  article,
}: SEOProps) => {
  const siteName = 'EasyPet';
  const twitterHandle = '@easypet';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />

      {/* Article specific meta tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content={twitterHandle} />
      <meta property="twitter:creator" content={twitterHandle} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="Portuguese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="EasyPet" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: siteName,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: description,
          url: url,
          image: image,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2025-12-31',
            description: 'Teste grátis por 14 dias sem cartão de crédito',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '350',
            bestRating: '5',
            worstRating: '1',
          },
          author: {
            '@type': 'Organization',
            name: siteName,
            url: url,
          },
          provider: {
            '@type': 'Organization',
            name: siteName,
            url: url,
            logo: {
              '@type': 'ImageObject',
              url: `${url}/logo.png`,
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+55-11-99999-9999',
              contactType: 'Customer Service',
              areaServed: 'BR',
              availableLanguage: ['Portuguese'],
            },
          },
        })}
      </script>

      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteName,
          url: url,
          logo: `${url}/logo.png`,
          description: description,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'São Paulo',
            addressRegion: 'SP',
            addressCountry: 'BR',
          },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+55-11-99999-9999',
              contactType: 'Sales',
              email: 'contato@easypet.com.br',
              areaServed: 'BR',
              availableLanguage: ['Portuguese'],
            },
            sameAs: [
              'https://facebook.com/easypet',
              'https://instagram.com/easypet',
              'https://linkedin.com/company/easypet',
            ],
        })}
      </script>

      {/* Breadcrumb Schema (for internal pages) */}
      {url !== 'https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: title,
                item: url,
              },
            ],
          })}
        </script>
      )}
    </Helmet>
  );
};
