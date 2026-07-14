import React, { useMemo } from 'react';
import { AppContextType, Market } from '../types';
import { Store, BadgePercent, AlertCircle, TrendingDown } from 'lucide-react';
import { formatMoney, formatItemName, normalizeStr } from '../utils';

export const Roteiro: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, markets, promotions } = context;

  const marketRankings = useMemo(() => {
    const listItems = items.filter(i => !i.isBought);
    if (listItems.length === 0 || markets.length === 0) return null;

    const PRECO_MEDIO_PADRAO_GLOBAL = 12.00;
    const hoje = new Date().toISOString().split('T')[0];
    const ofertasAtivas = promotions.filter(o => !o.expiryDate || o.expiryDate >= hoje);

    const resultadosPorMercado = markets.map(mercado => {
      let totalOfertas = 0;
      let itensCobertos = 0;
      let itensDetalhados: any[] = [];

      listItems.forEach(item => {
        const oferta = ofertasAtivas.find(o =>
          o.marketId === mercado.id &&
          normalizeStr(o.itemName) === normalizeStr(item.name)
        );

        if (oferta) {
          const precoUnitario = oferta.price / oferta.qty;
          const subtotalItem = precoUnitario * item.qty;
          totalOfertas += subtotalItem;
          itensCobertos++;

          itensDetalhados.push({
            nome: item.name,
            quantidade: item.qty,
            unidade: item.unit,
            precoUnitario: precoUnitario,
            subtotal: subtotalItem,
            fonte: 'oferta'
          });
        }
      });

      return {
        mercadoId: mercado.id,
        mercadoNome: mercado.name,
        totalEstimado: parseFloat(totalOfertas.toFixed(2)),
        itensCobertos: itensCobertos,
        totalItens: listItems.length,
        percentualCobertura: Math.round((itensCobertos / listItems.length) * 100),
        itensDetalhados: itensDetalhados
      };
    });

    // Remove mercados que não têm NENHUMA oferta para a lista atual? Ou deixa no fim?
    // Vamos deixar no fim.
    resultadosPorMercado.sort((a, b) => {
       if (b.itensCobertos !== a.itensCobertos) {
          return b.itensCobertos - a.itensCobertos; // Mais itens cobertos ganha
       }
       return a.totalEstimado - b.totalEstimado; // Menor preço ganha no desempate
    });

    const itensSemOfertaGlobal = listItems.filter(item => {
      return !ofertasAtivas.some(o => normalizeStr(o.itemName) === normalizeStr(item.name));
    });

    const vencedor = resultadosPorMercado[0];
    if (!vencedor) return null;

    return {
      destinoVencedor: vencedor.mercadoNome,
      destinoVencedorId: vencedor.mercadoId,
      totalProjetadoVencedor: vencedor.totalEstimado,
      rankingCompleto: resultadosPorMercado,
      itensSemOfertaGlobal,
      vencedor
    };
  }, [items, markets, promotions]);

  return (
    <div className="pb-28 bg-soft-bg dark:bg-zinc-900 h-full">
      {/* HEADER */}
      <div className="bg-soft-bg dark:bg-zinc-900 rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-zinc-900 dark:text-white shadow-primary z-10 geometric-bg relative">
         <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
              Roteiro de Compras
            </h2>
         </div>
      </div>

      <div className="px-4 lg:px-6 -mt-10 relative z-20">

      {!marketRankings ? (
        <div className="text-center py-12 bg-soft-bg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 shadow-sm flex flex-col items-center">
          <Store size={48} className="opacity-20 mb-4" strokeWidth={1.5} />
          <p className="font-semibold text-[15px] max-w-[200px]">Cadastre promoções na aba Ofertas para ver o comparativo de preços.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* BEST OPTION BENTO BOX */}
          <div className="bg-soft-bg dark:bg-zinc-900 rounded-3xl p-6 text-zinc-900 dark:text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-10 -top-10 opacity-20"><Store size={150} /></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Melhor Opção</h3>
            <div className="text-[32px] font-bold tracking-tight leading-none mb-4 break-words">{marketRankings.destinoVencedor}</div>
            <div className="space-y-2">
              <div className="font-semibold text-[16px] bg-white/20 p-3 rounded-2xl flex justify-between">
                <span>Total Ofertas:</span>
                <span>{formatMoney(marketRankings.totalProjetadoVencedor)}</span>
              </div>
              <div className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-2 pt-1 border-t border-white/20 mt-2">
                <BadgePercent size={14} /> 
                Cobertura: {marketRankings.vencedor.itensCobertos} de {marketRankings.vencedor.totalItens} itens com oferta
              </div>
              {marketRankings.itensSemOfertaGlobal.length > 0 && (
                <div className="text-[12px] font-medium text-yellow-200 flex items-center gap-2 pt-1">
                  ⚠️ {marketRankings.itensSemOfertaGlobal.length} itens sem oferta registrada — verifique no local
                </div>
              )}
            </div>
          </div>

          <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-2">Comparativo Completo</h3>

          {marketRankings.rankingCompleto.map((ranking, index) => {
             // Calculate percentage for progress bar based on the most expensive one
             const mx = marketRankings.rankingCompleto[marketRankings.rankingCompleto.length - 1].totalEstimado;
             const width = mx > 0 ? (ranking.totalEstimado / mx) * 100 : 100;

             return (
              <div key={ranking.mercadoId} className="bg-soft-bg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm mb-4">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-[13px] ${index===0 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {index + 1}
                     </div>
                     <span className="font-bold text-[16px] text-zinc-800 dark:text-zinc-200 truncate flex-1 min-w-0">{ranking.mercadoNome}</span>
                   </div>
                   <div className="font-bold text-[16px] text-zinc-800 dark:text-zinc-200">
                     {formatMoney(ranking.totalEstimado)}
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${index===0 ? 'bg-soft-bg dark:bg-zinc-900' : 'bg-zinc-400 dark:bg-zinc-600'}`} style={{ width: `${width}%` }} />
                   </div>
                   <span className="text-[11px] font-bold text-zinc-400">{Math.round(width)}%</span>
                </div>

                {/* Sublist */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                   {ranking.itensDetalhados.filter(i => i.fonte === 'oferta').length > 0 ? (
                      <div className="mb-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                           <BadgePercent size={12} /> Com Oferta
                         </span>
                         {ranking.itensDetalhados.filter(i => i.fonte === 'oferta').map((item, idx) => (
                           <div key={idx} className="flex justify-between items-start gap-2 text-[13px] py-1">
                             <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex-1 min-w-0 break-words">{formatItemName(item.nome)} ({item.quantidade}{item.unidade})</div>
                             <div className="font-bold text-green-600 dark:text-green-400 shrink-0">{formatMoney(item.subtotal)}</div>
                           </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-[12px] text-zinc-400 font-medium italic">
                         Nenhum item da sua lista em oferta neste mercado.
                      </div>
                   )}
                   {marketRankings.itensSemOfertaGlobal.length > 0 && (
                      <div className="pt-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                           <AlertCircle size={12} /> Sem oferta registrada
                         </span>
                         {marketRankings.itensSemOfertaGlobal.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[13px] py-1 opacity-70">
                             <div className="font-medium text-zinc-600 dark:text-zinc-400">{formatItemName(item.name)}</div>
                             <div className="font-semibold text-zinc-400 text-[10px] uppercase">Compre onde preferir</div>
                           </div>
                         ))}
                      </div>
                   )}
                 </div>

              </div>
             );
          })}

        </div>
      )}
      </div>
    </div>
  );
};
