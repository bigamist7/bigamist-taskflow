
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogOut, Moon, Sun, CheckSquare, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function Header() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão terminada com sucesso!');
    } catch (error) {
      toast.error('Erro ao terminar sessão');
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-soft">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gestão Inteligente
              </p>
            </div>
          </div>

          {/* User Info e Controles */}
          <div className="flex items-center gap-3">
            {/* Welcome Message */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-accent/30 rounded-lg">
              <User className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">
                {currentUser?.email?.split('@')[0]}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
            >
              {theme === 'light' ? 
                <Moon className="h-4 w-4" /> : 
                <Sun className="h-4 w-4" />
              }
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Terminar sessão"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
