const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

// Add state for showAdvanced
if (!code.includes('const [showAdvanced, setShowAdvanced] = useState(false);')) {
    code = code.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [showAdvanced, setShowAdvanced] = useState(false);');
}

const lines = code.split('\n');

const replacement = `
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Anotação
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Marca Ype..."
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium placeholder-zinc-400 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Validade
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-zinc-900 dark:text-zinc-100 text-[14px]"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-center -mt-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="text-[11px] font-bold text-green-700 dark:text-green-500 flex items-center gap-1 uppercase tracking-wider py-1 px-3 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAdvanced ? "Ocultar Opcionais" : "Mostrar Opcionais"}
                </button>
              </div>
`;

lines.splice(345 - 1, 376 - 345, replacement);

code = lines.join('\n');
fs.writeFileSync('src/components/Promocoes.tsx', code);
console.log('Promocoes.tsx advanced fields updated via exact lines');

