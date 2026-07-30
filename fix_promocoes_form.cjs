const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

if (!code.includes('const [showAdvanced, setShowAdvanced] = useState(false);')) {
    code = code.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [showAdvanced, setShowAdvanced] = useState(false);');
}

if (!code.includes('showAdvanced')) {
    const fieldsToHideRegex = /(<div>\s*<label className="block text-\[11px\] font-semibold mb-1\.5 text-zinc-500 dark:text-zinc-400">\s*Validade[^]*?<\/textarea>\s*<\/div>\s*<\/div>)/;
    
    // Instead of complex regex replacing, let's just do a simpler search and replace if we can find the labels
    if (code.includes('Validade (Opcional)')) {
        const replaceAdvanced = `
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Validade (Opcional)
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Observações (Opcional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Leve 3 pague 2"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-zinc-400 font-medium text-[14px]"
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-2"
              >
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                {showAdvanced ? "Ocultar opcionais" : "Mostrar campos opcionais"}
              </button>
        `;
        
        // Let's first read the file to see exactly how Validade and Obs are rendered
    }
}
