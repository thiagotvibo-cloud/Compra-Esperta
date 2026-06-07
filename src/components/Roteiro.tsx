import React, { useMemo } from 'react';
import { AppContextType, Market } from '../types';
import { Store, BadgePercent, AlertCircle, TrendingDown } from 'lucide-react';
import { formatMoney, formatItemName } from '../utils';

export const Roteiro: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, markets, promotions } = context;

  const marketRankings = useMemo(() => {
    const listItems = items.filter(i => !i.isBought);
    if (listItems.length === 0 || markets.length === 0) return null;

    const PRECO_MEDIO_PADRAO_GLOBAL = 12.00;
    const hoje = new Date().toISOString().split('T')[0];
    const ofertasAtivas = promotions.filter(o => !o.expiryDate || o.expiryDate >= hoje);

    const resultadosPorMercado = markets.map(mercado => {
      let totalEstimado = 0;
      let totalSemOferta = 0;
      let itensCobertos = 0;
      let itensDetalhados: any[] = [];

      listItems.forEach(item => {
        const oferta = ofertasAtivas.find(o =>
          o.marketId === mercado.id &&
          o.itemName.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        let precoUnitario;
        let fonte;

        if (oferta) {
          precoUnitario = oferta.price / oferta.qty;
          fonte = 'oferta';
          itensCobertos++;
        } else {
          // Preço médio ou global (simplificado usando global default por enquanto)
          precoUnitario = PRECO_MEDIO_PADRAO_GLOBAL;
          fonte = 'estimado';
          totalSemOferta += precoUnitario * item.qty;
        }

        const subtotalItem = precoUnitario * item.qty;
        totalEstimado += subtotalItem;

        itensDetalhados.push({
          nome: item.name,
          quantidade: item.qty,
          unidade: item.unit,
          precoUnitario: precoUnitario,
          subtotal: subtotalItem,
          fonte: fonte
        });
      });

      return {
        mercadoId: mercado.id,
        mercadoNome: mercado.name,
        totalEstimado: parseFloat(totalEstimado.toFixed(2)),
        totalSemOferta: parseFloat(totalSemOferta.toFixed(2)),
        itensCobertos: itensCobertos,
        totalItens: listItems.length,
        percentualCobertura: Math.round((itensCobertos / listItems.length) * 100),
        itensDetalhados: itensDetalhados
      };
    });

    resultadosPorMercado.sort((a, b) => a.totalEstimado - b.totalEstimado);

    const vencedor = resultadosPorMercado[0];
    if (!vencedor) return null;

    const segundo = resultadosPorMercado[1];
    const economiaEstimada = segundo ? parseFloat((segundo.totalEstimado - vencedor.totalEstimado).toFixed(2)) : 0;
    const percentualEconomia = segundo ? Math.round((economiaEstimada / segundo.totalEstimado) * 100) : 0;

    return {
      destinoVencedor: vencedor.mercadoNome,
      destinoVencedorId: vencedor.mercadoId,
      totalProjetadoVencedor: vencedor.totalEstimado,
      economiaEstimada: economiaEstimada,
      percentualEconomia: percentualEconomia,
      rankingCompleto: resultadosPorMercado,
      vencedor
    };
  }, [items, markets, promotions]);

  return (
    <div className="pb-28 bg-soft-bg dark:bg-black min-h-screen">
      {/* HEADER */}
      <div className="bg-sky-400 rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 geometric-bg relative">
         <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
              Inteligência de Mercado
            </h2>
         </div>
      </div>

      <div className="px-4 lg:px-6 -mt-10 relative z-20">

      {!marketRankings ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 shadow-sm flex flex-col items-center">
          <Store size={48} className="opacity-20 mb-4" strokeWidth={1.5} />
          <p className="font-semibold text-[15px] max-w-[200px]">Cadastre promoções na aba Ofertas para ver o comparativo de preços.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* BEST OPTION BENTO BOX */}
          <div className="bg-sky-500 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-10 -top-10 opacity-20"><Store size={150} /></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-sky-100 mb-1">Melhor Opção</h3>
            <div className="text-[32px] font-bold tracking-tight leading-none mb-4">{marketRankings.destinoVencedor}</div>
            <div className="space-y-2">
              <div className="font-semibold text-[16px] bg-white/20 p-3 rounded-2xl flex justify-between">
                <span>Cesta estimada:</span>
                <span>{formatMoney(marketRankings.totalProjetadoVencedor)}</span>
              </div>
              {marketRankings.economiaEstimada > 0 && (
                <div className="text-[14px] font-bold flex items-center gap-2 text-sky-100">
                  <TrendingDown size={18} className="text-yellow-300" />
                  Economia: {formatMoney(marketRankings.economiaEstimada)} ({marketRankings.percentualEconomia}%)
                </div>
              )}
              <div className="text-[12px] font-medium text-sky-100 flex items-center gap-2 pt-1 border-t border-white/20 mt-2">
                <BadgePercent size={14} /> 
                Cobertura: {marketRankings.vencedor.itensCobertos} de {marketRankings.vencedor.totalItens} itens com oferta
              </div>
            </div>
          </div>

          <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-2">Comparativo Completo</h3>

          {marketRankings.rankingCompleto.map((ranking, index) => {
             // Calculate percentage for progress bar based on the most expensive one
             const mx = marketRankings.rankingCompleto[marketRankings.rankingCompleto.length - 1].totalEstimado;
             const width = mx > 0 ? (ranking.totalEstimado / mx) * 100 : 100;

             return (
              <div key={ranking.mercadoId} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm mb-4">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-[13px] ${index===0 ? 'bg-sky-100 text-sky-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {index + 1}
                     </div>
                     <span className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100">{ranking.mercadoNome}</span>
                   </div>
                   <div className="font-bold text-[16px] text-sky-600 dark:text-sky-400">
                     {formatMoney(ranking.totalEstimado)}
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${index===0 ? 'bg-sky-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} style={{ width: `${width}%` }} />
                   </div>
                   <span className="text-[11px] font-bold text-zinc-400">{Math.round(width)}%</span>
                </div>

                {/* Sublist */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                   {ranking.itensDetalhados.filter(i => i.fonte === 'oferta').length > 0 && (
                      <div className="mb-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                           <BadgePercent size={12} /> Com Oferta
                         </span>
                         {ranking.itensDetalhados.filter(i => i.fonte === 'oferta').map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[13px] py-1">
                             <div className="font-semibold text-zinc-700 dark:text-zinc-300">{formatItemName(item.nome)} ({item.quantidade}{item.unidade})</div>
                             <div className="font-bold text-green-600 dark:text-green-400">{formatMoney(item.subtotal)}</div>
                           </div>
                         ))}
                      </div>
                   )}
                   {ranking.itensDetalhados.filter(i => i.fonte === 'estimado').length > 0 && (
                      <div className="pt-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                           <AlertCircle size={12} /> Sem oferta — estimado
                         </span>
                         {ranking.itensDetalhados.filter(i => i.fonte === 'estimado').map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[13px] py-1 opacity-70">
                             <div className="font-medium text-zinc-600 dark:text-zinc-400">{formatItemName(item.nome)}</div>
                             <div className="font-semibold text-zinc-500">{formatMoney(item.subtotal)}</div>
                           </div>
                         ))}
                      </div>
                   )}
                </div>

              </div>
             );
          })}

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl flex gap-3 text-yellow-800 dark:text-yellow-600">
             <AlertCircle size={20} className="shrink-0 mt-0.5" />
             <p className="text-[12px] font-medium">Itens sem oferta foram estimados com preço médio. Valores com fonte "estimado" são aproximações.</p>
          </div>

        </div>
      )}
      </div>
    </div>
  );
};
