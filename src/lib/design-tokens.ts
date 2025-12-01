/**
 * Design Tokens padronizados para todo o sistema EasyPet
 * Use estes tokens para manter consistência visual em todas as páginas
 */

export const DESIGN_TOKENS = {
  // Gradientes principais
  gradients: {
    primary: "bg-gradient-to-r from-primary via-accent to-secondary",
    primarySubtle: "bg-gradient-to-r from-primary/10 to-secondary/10",
    hero: "bg-gradient-to-b from-background to-muted",
    card: "bg-gradient-to-br from-card to-muted/50",
    gold: "bg-gradient-to-r from-amber-500 to-yellow-600",
    platinum: "bg-gradient-to-r from-slate-400 to-slate-600",
    dark: "bg-gradient-to-br from-slate-900 to-slate-800",
    success: "bg-gradient-to-r from-green-500 to-emerald-600",
    danger: "bg-gradient-to-r from-red-500 to-rose-600",
  },

  // Estilos de Card
  cardStyles: {
    base: "rounded-xl border border-border bg-card shadow-sm",
    hover: "hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
    interactive: "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all",
    borderAccent: "border-l-4 border-l-primary/50 hover:border-l-primary",
    glass: "backdrop-blur-sm bg-white/80 dark:bg-slate-900/80",
    elevated: "shadow-lg hover:shadow-xl transition-shadow",
  },

  // Estilos de Botão
  buttonStyles: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    ghost: "hover:bg-muted hover:text-foreground",
    outline: "border border-input bg-background hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-green-600 text-white hover:bg-green-700",
    gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90",
  },

  // Estilos de texto
  textStyles: {
    heading: "font-bold tracking-tight",
    subheading: "font-medium text-muted-foreground",
    body: "text-foreground",
    muted: "text-muted-foreground",
    link: "text-primary hover:underline cursor-pointer",
    gradient: "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
  },

  // Tamanhos de texto responsivos
  headingSizes: {
    h1: "text-3xl md:text-4xl lg:text-5xl",
    h2: "text-2xl md:text-3xl lg:text-4xl",
    h3: "text-xl md:text-2xl lg:text-3xl",
    h4: "text-lg md:text-xl",
    h5: "text-base md:text-lg",
  },

  // Sombras
  shadows: {
    soft: "shadow-sm",
    medium: "shadow-md",
    large: "shadow-lg",
    xl: "shadow-xl",
    glow: "shadow-[0_0_60px_rgba(0,200,150,0.3)]",
    primary: "shadow-[0_10px_40px_rgba(0,180,160,0.2)]",
  },

  // Animações
  animations: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    slideDown: "animate-slide-down",
    scaleIn: "animate-scale-in",
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
  },

  // Transições
  transitions: {
    fast: "transition-all duration-150",
    normal: "transition-all duration-300",
    slow: "transition-all duration-500",
    smooth: "transition-all duration-300 ease-in-out",
    bounce: "transition-all duration-500 ease-bounce",
  },

  // Espaçamentos padrão
  spacing: {
    section: "py-16 md:py-24",
    container: "px-4 md:px-6 lg:px-8",
    card: "p-4 md:p-6",
    cardLarge: "p-6 md:p-8",
  },

  // Bordas arredondadas
  radius: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  },

  // Estados interativos
  states: {
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
    loading: "opacity-70 cursor-wait",
    active: "ring-2 ring-primary ring-offset-2",
    focus: "focus:ring-2 focus:ring-primary focus:ring-offset-2",
    error: "border-destructive focus:ring-destructive",
  },

  // Badges e tags
  badges: {
    default: "px-2.5 py-0.5 text-xs font-medium rounded-full",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    primary: "bg-primary/10 text-primary",
  },

  // Grid layouts
  grids: {
    cards2: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
    cards3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    cards4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
    stats: "grid grid-cols-2 md:grid-cols-4 gap-4",
  },
};

/**
 * Classes combinadas para componentes comuns
 */
export const COMPONENT_CLASSES = {
  // Page wrapper
  pageWrapper: "min-h-screen bg-background",
  
  // Page container
  pageContainer: "container mx-auto px-4 py-6 md:py-8",
  
  // Page header
  pageHeader: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6",
  
  // Page title
  pageTitle: "text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
  
  // Section
  section: "space-y-4 md:space-y-6",
  
  // Card estatística
  statCard: `
    rounded-xl border border-border bg-card p-4 md:p-6
    hover:shadow-lg hover:border-primary/20 
    transition-all duration-300
  `,
  
  // Form container
  formContainer: "space-y-4 max-w-md mx-auto",
  
  // Form field
  formField: "space-y-2",
  
  // Input base
  inputBase: "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary",
  
  // Button row
  buttonRow: "flex flex-col sm:flex-row gap-2 sm:gap-3",
  
  // Empty state
  emptyState: "text-center py-12 text-muted-foreground",
  
  // Loading state
  loadingState: "flex items-center justify-center py-12",
  
  // Error state
  errorState: "text-center py-12 text-destructive",
};

export default DESIGN_TOKENS;
