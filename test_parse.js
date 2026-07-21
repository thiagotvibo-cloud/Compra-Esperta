const PRODUCT_CATALOG = [{name: 'a', subcategories: [{name: 'b', items: ['c']}]}];

const res = PRODUCT_CATALOG.flatMap(cat => cat.subcategories.flatMap(sub => sub.items.map(item => ({ name: item, category: cat.name, searchKey: item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") }))));

console.log(res);
