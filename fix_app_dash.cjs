const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Dashboard to imports
if (!code.includes('import { Dashboard }')) {
  code = code.replace('import { MenuExtra } from "./components/MenuExtra";', 'import { MenuExtra } from "./components/MenuExtra";\nimport { Dashboard } from "./components/Dashboard";');
}

// 2. Add LayoutDashboard to lucide-react imports
if (!code.includes('LayoutDashboard')) {
  code = code.replace('Map,', 'Map,\n  LayoutDashboard,');
}

// 3. Add to the activeTab type
if (code.includes('useState<"lista" | "roteiro" | "promocoes" | "compras" | "config">')) {
  code = code.replace(
    'useState<"lista" | "roteiro" | "promocoes" | "compras" | "config">',
    'useState<"lista" | "roteiro" | "promocoes" | "compras" | "config" | "dashboard">'
  );
} else if (code.includes('useState<"lista" | "roteiro" | "promocoes" | "compras" | "config" | "dashboard">')) {
    // already there
} else {
    // fallback
    code = code.replace(
    'useState<"lista" | "roteiro" | "promocoes" | "compras" | "config">("lista");',
    'useState<"lista" | "roteiro" | "promocoes" | "compras" | "config" | "dashboard">("lista");'
  );
}

// 4. Desktop Nav
if (!code.includes('activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")')) {
    const desktopNavBtn = '<NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={28} />} label="Painel" />';
    code = code.replace('<div className="flex flex-col gap-4 w-full px-2">', '<div className="flex flex-col gap-4 w-full px-2">\n            ' + desktopNavBtn);
}

// 5. Render view
if (!code.includes('activeTab === "dashboard" && <Dashboard context={context} />')) {
    code = code.replace('{activeTab === "lista" && <ListaCompras context={context} />}', '{activeTab === "dashboard" && <Dashboard context={context} />}\n              {activeTab === "lista" && <ListaCompras context={context} />}');
}

// 6. Mobile Nav (grid-cols-3 -> grid-cols-4)
if (code.includes('grid-cols-3')) {
    code = code.replace('grid-cols-3 w-full', 'grid-cols-4 w-full');
}

if (!code.includes('icon={<LayoutDashboard size={24} />}')) {
    const mobileNavBtn = '<NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={24} />} label="Painel" />';
    code = code.replace('<NavButton\n              active={activeTab === "lista"}', mobileNavBtn + '\n            <NavButton\n              active={activeTab === "lista"}');
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated for Dashboard');
