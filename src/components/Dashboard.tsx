import React, { useState, useEffect } from 'react';
import { User, Star, Gift, LogOut, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoyaltyMember, MemberBalance, PointsLedgerEntry } from '../types';
import { PointsHistory } from './PointsHistory';
import { RedeemModal } from './RedeemModal';

interface DashboardProps {
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function Dashboard({ onToast }: DashboardProps) {
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<PointsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        onToast('Sessão expirada', 'error');
        return;
      }

      // Get member data
      const { data: memberData, error: memberError } = await supabase
        .from('loyalty_members')
        .select('id, email, user_id, created_at')
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        onToast('Email não tem pontos ainda', 'error');
        await supabase.auth.signOut();
        return;
      }

      setMember(memberData);

      // Get balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('member_balances')
        .select('points')
        .eq('member_id', memberData.id)
        .single();

      if (!balanceError && balanceData) {
        setBalance(balanceData.points);
      }

      // Get history
      loadHistory(memberData.id);

    } catch (error) {
      onToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (memberId: string) => {
    setHistoryLoading(true);
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('points_ledger')
        .select('id, member_id, delta_points, reason, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!historyError && historyData) {
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRedeemSuccess = (code: string) => {
    setRedeemCode(code);
    onToast('Recompensa resgatada com sucesso!', 'success');
    // Reload data after successful redemption
    if (member) {
      loadMemberData();
    }
  };

  const handleCopyCode = async () => {
    if (redeemCode) {
      try {
        await navigator.clipboard.writeText(redeemCode);
        setCopiedCode(true);
        onToast('Código copiado!', 'success');
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        onToast('Erro ao copiar código', 'error');
      }
    }
  };

  const refreshData = () => {
    if (member) {
      loadMemberData();
      onToast('Dados atualizados', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Loyalty App</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* User Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{member?.email}</p>
              <p className="text-purple-200 text-sm">Membro desde {new Date(member?.created_at || '').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Points Balance */}
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-300" />
              <h2 className="text-lg font-semibold">Seus Pontos</h2>
            </div>
          </div>
          
          <div className="text-3xl font-bold mb-4">{balance.toLocaleString('pt-BR')} pts</div>
          
          <button
            onClick={() => setShowRedeemModal(true)}
            className="w-full bg-white/20 backdrop-blur text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            Troque seus pontos
          </button>
        </div>

        {/* Redeem Code Display */}
        {redeemCode && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Código de Desconto
            </h3>
            
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
              <p className="text-2xl font-mono font-bold text-center tracking-wider">
                {redeemCode}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCopyCode}
                className="flex-1 bg-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {copiedCode ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copiedCode ? 'Copiado!' : 'Copiar código'}
              </button>
              <button
                onClick={() => setRedeemCode(null)}
                className="bg-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                Fechar
              </button>
            </div>
            
            <p className="text-sm text-white/80 text-center mt-3">
              Use este código no checkout para aplicar seu desconto
            </p>
          </div>
        )}

        {/* Points History */}
        <PointsHistory entries={history} loading={historyLoading} />
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onToast={onToast}
        onRedeemSuccess={handleRedeemSuccess}
        currentPoints={balance}
      />
    </div>
  );
}