const useMemo = (fn) => fn();
const PRODUCT_CATALOG = [{name: 'a', subcategories: [{name: 'b', items: ['c']}]}];

const flatCatalog = useMemo(() => {
  return PRODUCT_CATALOG.flatMap(cat => cat.subcategories.flatMap(sub => sub.items.map(item => ({ name: item, category: cat.name, searchKey: item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") }))));
}, []);

console.log(flatCatalog);
