import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  CreditCard,
  LayoutDashboard,
  Shield,
  Leaf
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  const navigation = user ? [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Financeiro", href: "/financial" },
    { name: "Animais", href: "/animals" },
    { name: "Planejamento", href: "/planning" },
    { name: "ESG", href: "/esg" },
    { name: "Relatórios", href: "/reports" },
  ] : [
    { name: "Funcionalidades", href: "/#features" },
    { name: "Preços", href: "/pricing" },
    { name: "Contato", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 cursor-pointer">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="font-bold text-xl hidden sm:inline-block">Oryum Tauros</span>
          <span className="font-bold text-xl sm:hidden">Oryum</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`transition-colors hover:text-foreground/80 ${
                isActive(item.href)
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline-block">{user.name || "Usuário"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription" className="flex items-center w-full cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Assinatura
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </a>
              <Link href="/pricing">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Começar Grátis
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-8">
              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-green-100 text-green-900 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{user.name || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    
                    {user.role === "admin" && (
                      <Link href="/admin">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Painel Admin
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/subscription">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Assinatura
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <a href={getLoginUrl()}>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Entrar
                      </Button>
                    </a>
                    <Link href="/pricing">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Começar Grátis
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
