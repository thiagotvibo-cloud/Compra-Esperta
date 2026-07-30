const fs = require('fs');

let content = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

const splitToken = '  return (\n    <div className="pb-36 bg-transparent min-h-screen">';
const parts = content.split(splitToken);
if (parts.length !== 2) {
  console.log("Failed to split ModoCompra.tsx");
  process.exit(1);
}

const headerPart = parts[0];

const newRender = `      <PageHeader 
        title="Comprar" 
        subtitle={\`\${boughtItemsCount} de \${totalItemsCount} itens no carrinho\`}
      />

      <div className="px-6 pt-4 pb-2">
        <div className={\`rounded-3xl p-5 border shadow-sm transition-colors duration-500 flex flex-col \${budgetPercent >= 100 ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50' : totalSpent > 0 ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'}\`}>
          
          <div className="mb-4 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-sm rounded-xl flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-zinc-800/80">
            <Store className={\`\${budgetPercent >= 100 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}\`} size={16} />
            <select
              value={shoppingMarketId}
              onChange={(e) => handleMarketSelect(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none text-slate-800 dark:text-slate-200"
            >
              <option value="" className="text-zinc-900 dark:text-zinc-100">
                -- Selecione o Mercado --
              </option>
              {markets.map((m) => (
                <option className="text-zinc-900 dark:text-zinc-100" key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className={\`text-[12px] font-semibold mb-1 \${budgetPercent >= 100 ? 'text-red-700 dark:text-red-400' : totalSpent > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                Valor no Carrinho
              </div>
              <div className={\`text-[36px] font-bold tracking-tight leading-none \${budgetPercent >= 100 ? 'text-red-800 dark:text-red-300' : totalSpent > 0 ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}\`}>
                <span className="text-[20px] font-semibold mr-1 opacity-80">R$</span>
                <span className={\`money-value transition-transform duration-150 inline-block \${scaleTotal ? "scale-[1.06]" : "scale-100"}\`}>
                  {totalSpent.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              
              {settings.budget > 0 && (
                <div className={\`text-[13px] font-medium mt-1 \${budgetPercent >= 100 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                  de R$ {settings.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · {budgetPercent > 100 ? (
                    <span className="font-bold">Estourou {Math.round(budgetPercent - 100)}%</span>
                  ) : (
                    <span>{Math.round(budgetPercent)}%</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className={\`text-[11px] font-semibold mb-1 \${budgetPercent >= 100 ? 'text-red-700 dark:text-red-400' : totalSpent > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                No Carrinho
              </div>
              <div className={\`text-[28px] font-bold leading-none \${budgetPercent >= 100 ? 'text-red-800 dark:text-red-300' : totalSpent > 0 ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}\`}>
                {boughtItemsCount}
                <span className={\`text-[16px] font-medium opacity-80 ml-1 \${budgetPercent >= 100 ? 'text-red-700 dark:text-red-400' : totalSpent > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                  /{totalItemsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 relative mt-4">
        {/* AVULSO ADD */}
        {showAvulso && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-zinc-800 mb-6 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
            <div className="flex-1 bg-slate-50 dark:bg-zinc-950 rounded-2xl relative flex items-center border border-slate-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-green-500 transition-shadow">
              <span className="absolute left-4 font-bold text-slate-400">R$</span>
              <input
                autoFocus
                type="tel"
                value={avulsoVal}
                onChange={(e) => {
                  let val = e.target.value.replace(/\\D/g, "");
                  val = (Number(val) / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                  setAvulsoVal(val);
                }}
                className="w-full bg-transparent pl-10 pr-2 py-3 outline-none font-bold text-[18px] text-slate-900 dark:text-slate-100"
                onKeyDown={(e) => e.key === "Enter" && handleAvulsoAdd()}
              />
            </div>
            <button
              onClick={handleAvulsoAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all"
            >
              Adicionar
            </button>
          </div>
        )}

        {/* ITEMS LIST */}
        <div className="flex flex-col gap-6">
          {Object.entries<Item[]>(itemsByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, catItems]) => {
              const catSubtotal = catItems.reduce(
                (acc, item) =>
                  acc +
                  (typeof item.actualPrice === "number" ? item.actualPrice : 0) *
                    (typeof item.qty === "number" ? item.qty : 1),
                0,
              );
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-[14px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-2">
                      <span className="text-[16px]">{CATEGORY_EMOJI_UPDATED[category] || "🛒"}</span> {category}
                    </h3>
                    <div className="flex-1 border-t border-slate-200 dark:border-zinc-800"></div>
                    {catSubtotal > 0 && (
                      <div className="text-[13px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        R$ {catSubtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2.5">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className={\`p-3 rounded-2xl border transition-all duration-300 ease-out flex gap-3 items-center \${
                          item.isBought
                            ? "bg-slate-50 dark:bg-zinc-950/50 border-transparent opacity-60"
                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm"
                        }\`}
                      >
                        <button
                          onClick={() => toggleBought(item.id)}
                          className={\`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all mt-0.5 \${
                            item.isBought
                              ? "bg-green-600 border-none"
                              : "bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700"
                          }\`}
                        >
                          {item.isBought && <Check size={20} strokeWidth={3} className="text-white" />}
                        </button>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={\`text-[15px] font-bold leading-tight flex-1 min-w-0 break-words \${
                                item.isBought ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
                              }\`}
                            >
                              {item.name}
                            </div>
                            
                            {!item.isBought && (
                              <button
                                onClick={() => markNotFound(item.id)}
                                title="Não achei"
                                className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0 mt-1 cursor-pointer transition-transform hover:scale-125"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <div className={\`flex items-center rounded-lg p-0.5 \${item.isBought ? "opacity-70" : ""}\`}>
                              {["kg", "l"].includes(item.unit.toLowerCase()) ? (
                                <input
                                  disabled={item.isBought}
                                  type="tel"
                                  value={getQtyDisplayValue(item.qty, item.unit)}
                                  onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                  className="w-[50px] bg-transparent text-center text-[14px] font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                                />
                              ) : (
                                <>
                                  <button
                                    disabled={item.isBought}
                                    onClick={() => updateQtyExplicit(item.id, Math.max(0, item.qty - 1))}
                                    className="p-1 text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-zinc-800 rounded-md"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    disabled={item.isBought}
                                    type="tel"
                                    value={getQtyDisplayValue(item.qty, item.unit)}
                                    onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                    className="w-6 bg-transparent text-center text-[14px] font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                                  />
                                  <button
                                    disabled={item.isBought}
                                    onClick={() => updateQtyExplicit(item.id, item.qty + 1)}
                                    className="p-1 text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-zinc-800 rounded-md"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </>
                              )}
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1">
                                {item.unit}
                              </span>
                            </div>

                            <div className="text-slate-300 dark:text-slate-600 font-semibold text-xs">×</div>

                            <div className="relative flex-1 max-w-[120px]">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                R$
                              </span>
                              <input
                                disabled={item.isBought}
                                type="tel"
                                value={getPriceDisplayValue(item.actualPrice || 0)}
                                onChange={(e) => handlePriceInput(item.id, e.target.value)}
                                placeholder="0,00"
                                className={\`w-full pl-6 pr-2 py-1.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 text-[14px] transition-colors \${
                                  item.isBought
                                    ? "bg-transparent text-slate-500 dark:text-slate-400"
                                    : "bg-slate-50 dark:bg-zinc-950 text-green-700 dark:text-green-500"
                                }\`}
                              />
                            </div>
                          </div>

                          {!item.isBought &&
                            promotions.filter(
                              (p) =>
                                p.itemName.toLowerCase().trim() === item.name.toLowerCase().trim(),
                            ).length > 0 && (
                              <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 dark:border-zinc-800 pt-2">
                                {promotions
                                  .filter(
                                    (p) =>
                                      p.itemName.toLowerCase().trim() === item.name.toLowerCase().trim(),
                                  )
                                  .sort((a, b) => {
                                    if (a.marketId === shoppingMarketId && b.marketId !== shoppingMarketId) return -1;
                                    if (b.marketId === shoppingMarketId && a.marketId !== shoppingMarketId) return 1;
                                    return a.price / a.qty - b.price / b.qty;
                                  })
                                  .map((promo, idx) => {
                                    const market = markets.find((m) => m.id === promo.marketId);
                                    const precoUnitario = promo.price / promo.qty;
                                    const isCurrentMarket = promo.marketId === shoppingMarketId;

                                    return (
                                      <div
                                        key={idx}
                                        className={\`flex justify-between items-center px-2 py-1.5 rounded-md border \${
                                          isCurrentMarket
                                            ? "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/30"
                                            : "bg-transparent border-slate-200 dark:border-zinc-800"
                                        }\`}
                                      >
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          <Store
                                            size={12}
                                            className={\`shrink-0 \${isCurrentMarket ? "text-green-600" : "text-slate-400"}\`}
                                          />
                                          <span className={\`text-[11px] font-bold truncate \${isCurrentMarket ? "text-green-700 dark:text-green-400" : "text-slate-500"}\`}>
                                            {market?.name || "Mercado"}
                                          </span>
                                        </div>
                                        <div className={\`text-[11px] font-bold shrink-0 \${isCurrentMarket ? "text-green-700 dark:text-green-400" : "text-slate-500"}\`}>
                                          <span className="money-value">{formatMoney(precoUnitario)}</span>
                                          <span className={\`text-[9px] font-medium \${isCurrentMarket ? "text-green-600/80" : "text-slate-400"}\`}>
                                            /{item.unit}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* NOT FOUND SECTION */}
        {items.filter((i) => i.notFound).length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800">
            <h3 className="text-[12px] font-bold text-orange-500 mb-3 px-2 flex items-center gap-2">
              Itens Não Encontrados ({items.filter((i) => i.notFound).length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {items
                .filter((i) => i.notFound)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setItems(
                        items.map((i) =>
                          i.id === item.id ? { ...i, notFound: false } : i,
                        ),
                      )
                    }
                    className="text-[13px] font-medium max-w-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-2 hover:bg-orange-100 transition-colors"
                  >
                    <span className="line-through opacity-70 flex-1 min-w-0 break-words text-left">
                      {item.name}
                    </span>
                    <Plus size={14} className="shrink-0" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* FLOAT BUTTON FINALIZAR COMPRA */}
      <div className="fixed bottom-24 left-0 w-full flex justify-center z-40 pointer-events-none px-4">
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="pointer-events-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3.5 rounded-full font-bold text-[15px] shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ShoppingBag size={18} /> Finalizar Compra
        </button>
      </div>

      {/* CONFIRM FINISH PURCHASE MODAL */}
      {showFinishConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowFinishConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-zinc-800">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Finalizar e Salvar?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Sua compra será salva no histórico e os itens do carrinho atual serão desmarcados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={finishPurchase}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-colors"
              >
                Sim, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {purchaseSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1"
            >
              Compra Finalizada!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 dark:text-slate-400 font-medium mb-8"
            >
              no {purchaseSummary.marketName}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-zinc-800"
            >
              <div className="text-center mb-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Total da Compra
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                  <span className="money-value">
                    {formatMoney(purchaseSummary.total)}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Itens comprados</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {purchaseSummary.itemCount}
                  </span>
                </div>
                {purchaseSummary.economy > 0 && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500 dark:text-slate-400">💰 Economia</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      <span className="money-value">
                        {formatMoney(purchaseSummary.economy)}
                      </span>
                    </span>
                  </div>
                )}
                {context.settings.budget > 0 && purchaseSummary.total < context.settings.budget && (
                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-center mt-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      🎯 Ficou <span className="money-value text-slate-900 dark:text-slate-100">{formatMoney(context.settings.budget - purchaseSummary.total)}</span> abaixo do orçamento!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => {
                setPurchaseSummary(null);
                setItems(
                  items.map((i) => ({
                    ...i,
                    isBought: false,
                    actualPrice: 0,
                    notFound: false,
                  })),
                );
                setShowFinishConfirm(false);
                context.setActiveTab("lista");
              }}
              className="mt-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-12 rounded-full text-lg active:scale-[0.97] transition-transform shadow-lg"
            >
              Voltar para Lista
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ModoCompra.tsx', headerPart + splitToken + "\n" + newRender);
console.log("Rewrote ModoCompra.tsx render");
