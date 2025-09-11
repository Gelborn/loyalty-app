import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { PointsLedgerEntry } from '../types';

interface PointsHistoryProps {
  entries: PointsLedgerEntry[];
  loading: boolean;
  /** Quando true, lista ocupa a altura do pai (sem max-h fixa). */
  expand?: boolean;
}

export function PointsHistory({ entries, loading, expand = false }: PointsHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatReason = (reason: string) => {
    if (reason.startsWith('order:')) {
      return 'Compra realizada';
    } else if (reason.startsWith('refund:')) {
      return 'Estorno';
    } else if (reason.startsWith('redeem:')) {
      return 'Resgate de recompensa';
    }
    return reason;
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

  // Scroll container: mantém max-h-64 por padrão; expande quando expand = true
  const scrollClasses = expand
    ? 'h-full max-h-none min-h-0 overflow-y-auto'
    : 'max-h-64 overflow-y-auto';

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${expand ? 'h-full' : ''}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Histórico de Pontos
      </h3>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200">Você ainda não tem lançamentos</p>
          <p className="text-purple-300 text-sm mt-2">
            Seus pontos de compras aparecerão aqui
          </p>
        </div>
      ) : (
        <div className={`space-y-3 ${scrollClasses}`}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    entry.delta_points > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {entry.delta_points > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <p className="text-white text-sm font-medium">
                    {formatReason(entry.reason)}
                  </p>
                  <p className="text-purple-200 text-xs">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>

              <div
                className={`font-semibold ${
                  entry.delta_points > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {entry.delta_points > 0 ? '+' : ''}
                {entry.delta_points.toLocaleString('pt-BR')} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
