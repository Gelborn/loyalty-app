import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function Login({ onToast }: LoginProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        if (error.status === 422 || error.message.includes('Signups not allowed') || error.message.includes('signup')) {
          onToast('Email não tem pontos ainda', 'error');
        } else {
          onToast(error.message, 'error');
        }
      } else {
        setStep('otp');
        onToast('Código enviado para seu email', 'success');
      }
    } catch (error) {
      onToast('Erro ao enviar código', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        if (error.message.includes('Token has expired')) {
          onToast('Código expirado. Solicite um novo código', 'error');
        } else if (error.message.includes('Token not found')) {
          onToast('Código inválido', 'error');
        } else {
          onToast(error.message, 'error');
        }
      }
      // Success is handled by auth state change
    } catch (error) {
      onToast('Erro ao verificar código', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (!error) {
        onToast('Novo código enviado', 'success');
      }
    } catch (error) {
      onToast('Erro ao reenviar código', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Loyalty App</h1>
          <p className="text-purple-200">Entre com seu email para acessar seus pontos</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Enviar código
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-purple-200 mb-2">
                  Código de verificação
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-purple-200 mt-2 text-center">
                  Código enviado para <strong>{email}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verificar código'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-purple-200 hover:text-white text-sm underline transition-colors"
                >
                  Reenviar código
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-purple-200 hover:text-white text-sm transition-colors"
                >
                  ← Voltar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}