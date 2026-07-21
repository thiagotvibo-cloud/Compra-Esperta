const fs = require('fs');
let content = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

if (!content.includes('const [scaleTotal, setScaleTotal]')) {
  // Add state for scale
  content = content.replace(
    /const totalSpent = activeItems\.reduce[^\n]+\n[^\n]+\n/,
    match => match + `
  const [scaleTotal, setScaleTotal] = useState(false);
  const prevTotalRef = useRef(totalSpent);
  useEffect(() => {
    if (totalSpent !== prevTotalRef.current) {
      setScaleTotal(true);
      const t = setTimeout(() => setScaleTotal(false), 150);
      prevTotalRef.current = totalSpent;
      return () => clearTimeout(t);
    }
  }, [totalSpent]);
`
  );
  
  // Apply scale class
  content = content.replace(
    /<span className="money-value">\{formatMoney\(totalSpent\)\}<\/span>/g,
    `<span className={\`money-value transition-transform duration-150 inline-block \${scaleTotal ? 'scale-[1.06]' : 'scale-100'}\`}>{formatMoney(totalSpent)}</span>`
  );
}

// Press feedback on buttons
content = content.replace(
  /active:scale-95/g,
  'active:scale-[0.97] transition-transform duration-150'
);

fs.writeFileSync('src/components/ModoCompra.tsx', content);
