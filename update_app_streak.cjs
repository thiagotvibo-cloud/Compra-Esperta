const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[settings, setSettings\] = useState<Settings>\(\{ budget: 0, darkMode: false \}\);/,
  `const [settings, setSettings] = useState<Settings>({ budget: 0, darkMode: false, streak: 0, totalSaved: 0, lastActiveDate: '', purchaseCount: 0 });`
);

// update settings upsert in fetchData
content = content.replace(
  /setSettings\(\{ budget: sData.budget, darkMode: sData.dark_mode \}\);/,
  `setSettings({ budget: sData.budget || 0, darkMode: sData.dark_mode || false, streak: sData.streak || 0, totalSaved: Number(sData.total_saved) || 0, lastActiveDate: sData.last_active_date || '', purchaseCount: sData.purchase_count || 0 });
          
          // Lógica de Streak
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const dbLastActive = sData.last_active_date || '';
          
          if (dbLastActive !== today) {
            handleSetSettings(prev => ({
              ...prev,
              streak: dbLastActive === yesterday ? (sData.streak || 0) + 1 : (dbLastActive ? 1 : 0),
              lastActiveDate: today
            }));
          }`
);

content = content.replace(
  /\{ onConflict: 'user_id' \}\);/,
  `{ onConflict: 'user_id' });`
);

content = content.replace(
  /await supabase.from\('settings'\).upsert\(\{ budget: 0, dark_mode: false, user_id: session.user.id \}/,
  `await supabase.from('settings').upsert({ budget: 0, dark_mode: false, streak: 0, total_saved: 0, last_active_date: new Date().toISOString().split('T')[0], purchase_count: 0, user_id: session.user.id }`
);

// syncSettings
content = content.replace(
  /budget: newSettings.budget,\n\s*dark_mode: newSettings.darkMode\n/,
  `budget: newSettings.budget,
        dark_mode: newSettings.darkMode,
        streak: newSettings.streak,
        total_saved: newSettings.totalSaved,
        last_active_date: newSettings.lastActiveDate,
        purchase_count: newSettings.purchaseCount\n`
);

fs.writeFileSync('src/App.tsx', content);
