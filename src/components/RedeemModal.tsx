import React, { useState, useEffect } from 'react';
import { X, Gift, Loader2, Star } from 'lucide-react';
import { Reward, RedeemResponse, ErrorResponse } from '../types';
import { supabase } from '../lib/supabase';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onRedeemSuccess: (code: string) => void;
  currentPoints: number;
}

export function RedeemModal({ isOpen, onClose, onToast, onRedeemSuccess, currentPoints }: RedeemModalProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRewards();
    }
  }, [isOpen]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, cost_points, discount_type, discount_value')
        .eq('active', true)
        .order('cost_points', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      onToast('Erro ao carregar recompensas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        onToast('Sessão expirada. Faça login novamente', 'error');
        return;
      }

      const response = await fetch(
        'https://dmlkqxsjhdxnrthpugqg.supabase.co/functions/v1/app/redeem',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reward_id: rewardId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorData = result as ErrorResponse;
        
        switch (response.status) {
          case 400:
            if (errorData.error === 'Not enough points') {
              onToast('Pontos insuficientes para esta recompensa', 'error');
            } else if (errorData.error === 'Invalid reward') {
              onToast('Recompensa inválida', 'error');
            } else {
              onToast(errorData.error, 'error');
            }
            break;
          case 401:
            onToast('Sessão expirada. Faça login novamente', 'error');
            break;
          case 404:
            onToast('Membro não encontrado. Entre em contato com o suporte', 'error');
            break;
          case 500:
          case 502:
            onToast('Erro interno. Tente novamente mais tarde', 'error');
            break;
          default:
            onToast('Erro desconhecido', 'error');
        }
        return;
      }

      const successData = result as RedeemResponse;
      onRedeemSuccess(successData.code);
      onClose();
      
    } catch (error) {
      onToast('Erro de conexão. Tente novamente', 'error');
    } finally {
      setRedeeming(null);
    }
  };

  const formatDiscount = (reward: Reward) => {
    if (reward.discount_type === 'percentage') {
      return `${reward.discount_value}% OFF`;
    } else {
      return `R$ ${reward.discount_value.toFixed(2)} OFF`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-violet-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Resgatar Pontos
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-200 text-sm mt-2">
            Você tem <strong>{currentPoints} pontos</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-200">Nenhuma recompensa disponível no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => {
                const canRedeem = currentPoints >= reward.cost_points;
                const isRedeeming = redeeming === reward.id;
                
                return (
                  <div
                    key={reward.id}
                    className={`bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 ${
                      canRedeem ? 'hover:bg-white/15' : 'opacity-50'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{reward.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{reward.cost_points}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm">
                        {formatDiscount(reward)}
                      </span>
                      
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canRedeem || isRedeeming}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          canRedeem
                            ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                        } flex items-center gap-2`}
                      >
                        {isRedeeming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Resgatar'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}