import React from 'react';
import { Gift, TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

export interface RedemptionEntry {
  id: string;
  code: string;
  status: 'active' | 'used' | 'expired' | string;
  created_at: string;
  redeemed_at: string | null;
  reward: {
    id: string;
    name: string;
    cost_points: number;
  };
}

interface RedemptionsHistoryProps {
  entries: RedemptionEntry[];
  loading: boolean;
}

export function RedemptionsHistory({ entries, loading }: RedemptionsHistoryProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base = 'text-xs px-2 py-1 rounded-full bg-white/20 text-white';
    switch (status) {
      case 'active':
        return <span className={base}>Ativo</span>;
      case 'used':
        return <span className={base}>Utilizado</span>;
      case 'expired':
        return <span className={base}>Expirado</span>;
      default:
        return <span className={base}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-3 bg-white/20 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-white/20 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5" />
        Meus resgates
      </h3>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200">Você ainda não resgatou recompensas</p>
          <p className="text-purple-300 text-sm mt-2">
            Quando trocar seus pontos, os resgates aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {entries.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/20 text-purple-300">
                  {r.status === 'used' ? <CheckCircle2 className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {r.reward?.name ?? 'Recompensa'}
                  </p>
                  <p className="text-purple-200 text-xs">
                    {r.status === 'used'
                      ? `Utilizado em ${formatDate(r.redeemed_at)}`
                      : `Resgatado em ${formatDate(r.created_at)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white text-sm font-semibold">
                    {r.reward?.cost_points?.toLocaleString('pt-BR') ?? 0} pts
                  </div>
                  <div className="text-purple-200 text-xs font-mono">
                    {r.code || '—'}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
