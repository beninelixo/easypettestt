import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			'plan-gold': {
  				primary: 'hsl(var(--plan-gold-primary))',
  				secondary: 'hsl(var(--plan-gold-secondary))',
  				accent: 'hsl(var(--plan-gold-accent))',
  				foreground: 'hsl(var(--plan-gold-foreground))'
  			},
  			'plan-platinum': {
  				primary: 'hsl(var(--plan-platinum-primary))',
  				secondary: 'hsl(var(--plan-platinum-secondary))',
  				accent: 'hsl(var(--plan-platinum-accent))',
  				foreground: 'hsl(var(--plan-platinum-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'zoom-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.8)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-5px)'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px hsl(var(--primary) / 0.4)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--secondary) / 0.4)'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			},
  			'shine': {
  				'0%': {
  					left: '-100%'
  				},
  				'100%': {
  					left: '100%'
  				}
  			},
  			'spring': {
  				'0%': {
  					transform: 'scale(0) rotate(-10deg)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.05) rotate(2deg)'
  				},
  				'100%': {
  					transform: 'scale(1) rotate(0deg)',
  					opacity: '1'
  				}
  			},
  			'spring-out': {
  				'0%': {
  					transform: 'scale(1) rotate(0deg)',
  					opacity: '1'
  				},
  				'50%': {
  					transform: 'scale(1.05) rotate(-2deg)'
  				},
  				'100%': {
  					transform: 'scale(0.9) rotate(5deg)',
  					opacity: '0'
  				}
  			},
  			'tilt': {
  				'0%, 100%': {
  					transform: 'rotateY(0deg) rotateX(0deg)'
  				},
  				'25%': {
  					transform: 'rotateY(2deg) rotateX(-2deg)'
  				},
  				'75%': {
  					transform: 'rotateY(-2deg) rotateX(2deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'slide-in': 'slide-in 0.4s ease-out',
  			'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-left': 'slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-right': 'slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scale-in': 'scale-in 0.3s ease-out',
  			'zoom-in': 'zoom-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
  			'shimmer': 'shimmer 3s ease-in-out infinite',
  			'shine': 'shine 2s ease-in-out infinite',
  			'spring': 'spring 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'spring-out': 'spring-out 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'tilt': 'tilt 10s ease-in-out infinite'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			serif: [
  				'Lora',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'Space Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
