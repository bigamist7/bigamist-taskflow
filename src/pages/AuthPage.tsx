
import React, { useState } from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { CheckSquare, Sparkles } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header com design melhorado */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <CheckSquare className="h-10 w-10 text-white drop-shadow-lg" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">TaskFlow</h1>
          </div>
          <p className="text-white/90 text-lg font-medium drop-shadow">
            Gerencie as suas tarefas de forma simples e eficiente
          </p>
          <div className="mt-4 h-1 w-24 bg-white/30 rounded-full mx-auto"></div>
        </div>

        {/* Formulário com efeito glass */}
        <div className="glass-effect rounded-2xl p-8 shadow-soft-lg animate-fade-in">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-sm">
          Uma plataforma moderna para gestão de tarefas
        </div>
      </div>
    </div>
  );
}
