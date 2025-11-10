import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm group-[.toaster]:animate-spring",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:transition-all group-[.toast]:hover:scale-105",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/90 group-[.toast]:transition-all",
          closeButton: "group-[.toast]:border-border group-[.toast]:bg-background group-[.toast]:hover:bg-muted group-[.toast]:transition-all",
          success: "group-[.toast]:border-accent group-[.toast]:text-accent-foreground",
          error: "group-[.toast]:border-destructive group-[.toast]:text-destructive-foreground",
          warning: "group-[.toast]:border-warning group-[.toast]:text-warning-foreground",
          info: "group-[.toast]:border-info group-[.toast]:text-info-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
