const fs = require('fs');
let content = fs.readFileSync('src/components/ListaCompras.tsx', 'utf8');

const streakUI = `
      {/* STREAK GAMIFICATION */}
      {settings.streak > 0 && (
        <div className="mx-4 mt-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-md">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80">Sua Sequência</div>
            <div className="text-2xl font-bold">
              🔥 {settings.streak} dia{settings.streak !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80">Economia Total</div>
            <div className="text-xl font-bold">
              <span className="money-value">{formatMoney(settings.totalSaved)}</span>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('STREAK GAMIFICATION')) {
  // Replace the first '</div>' after the shortcut buttons
  content = content.replace(
    /\{\/\* MAIN LIST \*\/\}/,
    streakUI + '\n      {/* MAIN LIST */}'
  );
}

fs.writeFileSync('src/components/ListaCompras.tsx', content);
