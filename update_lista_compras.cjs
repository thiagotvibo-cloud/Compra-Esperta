const fs = require('fs');
let content = fs.readFileSync('src/components/ListaCompras.tsx', 'utf8');

// Header Scroll Shrink
if (!content.includes('const [scrolled, setScrolled]')) {
  content = content.replace(
    /const calculateExpectedTotal = \(\) => {/,
    `const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateExpectedTotal = () => {`
  );
  
  // Replace the header div classes
  content = content.replace(
    /className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-b-3xl pt-\[calc\(env\(safe-area-inset-top\)\+20px\)\] pb-14 px-6 text-center text-white shadow-primary z-10"/,
    `className={\`bg-gradient-to-br from-emerald-500 to-teal-400 rounded-b-3xl px-6 text-center text-white shadow-primary z-10 transition-all duration-300 \${scrolled ? 'pt-[calc(env(safe-area-inset-top)+8px)] pb-3' : 'pt-[calc(env(safe-area-inset-top)+20px)] pb-14'}\`}`
  );
  
  // Hide elements when scrolled
  content = content.replace(
    /className="text-\[11px\] font-semibold uppercase tracking-widest text-emerald-100 mb-1"/,
    `className={\`text-[11px] font-semibold uppercase tracking-widest text-emerald-100 mb-1 transition-all duration-300 \${scrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : ''}\`}`
  );
  content = content.replace(
    /className="mt-6"/,
    `className={\`transition-all duration-300 \${scrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'mt-6'}\`}`
  );
}

// Button press feedback
content = content.replace(
  /className="px-6 py-3 bg-soft-primary text-white font-semibold rounded-full shadow-sm hover:bg-soft-primary-hover transition-colors"/,
  'className="px-6 py-3 bg-soft-primary text-white font-semibold rounded-full shadow-sm hover:bg-soft-primary-hover transition-colors active:scale-[0.97]"'
);

// Item added feedback (type: spring)
content = content.replace(
  /initial={{ opacity: 0, x: -20 }}/,
  'initial={{ opacity: 0, x: -40, scale: 0.8 }}'
);
content = content.replace(
  /animate={{ opacity: 1, x: 0 }}/,
  'animate={{ opacity: 1, x: 0, scale: 1 }}'
);
content = content.replace(
  /transition={{ duration: 0.2 }}/,
  'transition={{ type: "spring", bounce: 0.3 }}'
);


fs.writeFileSync('src/components/ListaCompras.tsx', content);
