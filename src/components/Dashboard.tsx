import React, { useState, useEffect } from 'react';
import { User, Star, Gift, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoyaltyMember, PointsLedgerEntry } from '../types';
import { PointsHistory } from './PointsHistory';
import { RedeemModal } from './RedeemModal';
import { RedemptionsHistory, RedemptionEntry } from './RedemptionsHistory';
import { RedeemCodeModal } from './RedeemCodeModal';

interface DashboardProps {
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type TabKey = 'history' | 'redemptions';

export function Dashboard({ onToast }: DashboardProps) {
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<PointsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [redemptions, setRedemptions] = useState<RedemptionEntry[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>('history');

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

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

      // Membro
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

      // Saldo
      const { data: balanceData, error: balanceError } = await supabase
        .from('member_balances')
        .select('points')
        .eq('member_id', memberData.id)
        .single();
      if (!balanceError && balanceData) setBalance(balanceData.points);

      // Histórico + Resgates
      await Promise.all([
        loadHistory(memberData.id),
        loadRedemptions(memberData.id),
      ]);
    } catch {
      onToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (memberId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('points_ledger')
        .select('id, member_id, delta_points, reason, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) setHistory(data);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadRedemptions = async (memberId: string) => {
    setRedemptionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select(`
          id,
          member_id,
          reward_id,
          discount_code,
          status,
          created_at,
          reward:rewards ( id, name, cost_points )
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const mapped: RedemptionEntry[] = data.map((r: any) => ({
          id: r.id,
          code: r.discount_code ?? '',
          status: r.status ?? 'active',
          created_at: r.created_at,
          redeemed_at: null,
          reward: r.reward
            ? { id: r.reward.id, name: r.reward.name, cost_points: r.reward.cost_points ?? 0 }
            : { id: r.reward_id, name: 'Recompensa', cost_points: 0 },
        }));
        setRedemptions(mapped);
      }
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRedeemSuccess = (code: string) => {
    setRedeemCode(code);            // abre o modal com o código
    onToast('Recompensa resgatada com sucesso!', 'success');
    if (member) loadMemberData();   // recarrega saldo/histórico
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
              <p className="text-purple-200 text-sm">
                Membro desde {new Date(member?.created_at || '').toLocaleDateString('pt-BR')}
              </p>
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

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-white/20 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Histórico de Pontos
            </button>
            <button
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'redemptions'
                  ? 'bg-white/20 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
              onClick={() => setActiveTab('redemptions')}
            >
              Meus resgates
            </button>
          </div>
        </div>

        {/* Conteúdo da tab */}
        {activeTab === 'history' ? (
          <PointsHistory entries={history} loading={historyLoading} />
        ) : (
          <RedemptionsHistory entries={redemptions} loading={redemptionsLoading} />
        )}
      </div>

      {/* Modais */}
      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onToast={onToast}
        onRedeemSuccess={handleRedeemSuccess}
        currentPoints={balance}
      />

      <RedeemCodeModal
        isOpen={!!redeemCode}
        code={redeemCode}
        onClose={() => setRedeemCode(null)}
        onToast={onToast}
      />
    </div>
  );
}
