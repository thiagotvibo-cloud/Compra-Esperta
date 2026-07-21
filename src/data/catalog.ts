export interface CatalogSubCategory { name: string; items: string[];
} export interface CatalogCategory { name: string; icon: string; subcategories: CatalogSubCategory[];
} export const PRODUCT_CATALOG: CatalogCategory[] = [ { name:"Açougue e Aves", icon:"🥩", subcategories: [ { name:"Açougue - Bovinos", items: [
"Acém","Alcatra","Bife Ancho","Bife de Chorizo","Capa de Filé","Carne Moída (1ª e 2ª)","Chuleta","Contrafilé","Costela Minga","Costela Ripa","Coxão Duro (Chã de Fora)","Coxão Mole (Chã de Dentro)","Cupim","Fígado Bovino","Filé Mignon","Fraldinha","Lagarto","Maminha","Músculo","Paleta","Patinho","Peito Bovino","Picanha","Rabada","T-Bone","Hambúrguer (Fresco)" ]
}, { name:"Açougue - Suínos", items: [
"Bacon","Barriga (Panceta)","Bisteca Suína","Copa Lombo","Costelinha Suína","Filé Mignon Suíno","Joelho","Linguiça Calabresa","Linguiça de Pernil","Linguiça Toscana","Lombo Suíno","Orelha/Pé/Rabo (Pertences para Feijoada)","Pernil Suíno","Picanha Suína","Toucinho" ]
}, { name:"Açougue - Aves e Outros", items: [
"Asa de Frango","Codorna","Coração de Frango","Coxa de Frango","Coxinha da Asa (Drumet)","Fígado de Frango","Filé de Peito de Frango","Frango a Passarinho","Frango Inteiro","Meio da Asa (Tulipa)","Moela","Pato","Peito de Frango com osso","Peru","Sassami (Filezinho)","Sobrecoxa" ]
} ]
}, { name:"Peixaria", icon:"🐟", subcategories: [ { name:"Peixaria e Frutos do Mar", items: [
"Atum","Bacalhau","Cação","Calamar/Lula","Camarão","Caranguejo/Siri","Corvina","Dourada","Filé de Merluza","Filé de Pescada","Filé de Tilápia","Mexilhão/Marisco","Pintado","Polvo","Salmão","Sardinha Fresca","Tambaqui" ]
} ]
}, { name:"Hortifruti", icon:"🥦", subcategories: [ { name:"Hortifruti - Frutas", items: [
"Abacate","Abacaxi","Ameixa","Banana (Maçã/Nanica/Prata/da Terra)","Caqui","Coco (Seco/Verde)","Figo","Goiaba","Kiwi","Laranja (Lima/Pera)","Limão (Siciliano/Tahiti)","Maçã (Fuji/Gala/Verde)","Mamão (Formosa/Papaya)","Manga (Palmer/Tommy)","Maracujá","Melancia","Melão","Morango","Pera","Pêssego","Tangerina/Mexerica","Uva (Niágara/Rubi/Thompson)" ]
}, { name:"Hortifruti - Legumes, Verduras e Ovos", items: [
"Abóbora","Abobrinha","Alface (Americana/Crespa/Lisa)","Alho","Alho-poró","Batata (Asterix/Doce/Inglesa/Salsa)","Berinjela","Beterraba","Brócolis","Cebola (Branca/Roxa)","Cenoura","Cheiro-Verde (Salsa/Cebolinha)","Chuchu","Couve","Couve-flor","Espinafre","Gengibre","Inhame","Mandioca (Macaxeira)","Milho Verde","Ovos (Brancos/Caipira/Codorna)","Pepino","Pimentão (Amarelo/Vermelho/Verde)","Quiabo","Repolho","Rúcula","Tomate (Carmem/Cereja/Italiano)","Vagem" ]
} ]
}, { name:"Laticínios e Frios", icon:"🧀", subcategories: [ { name:"Laticínios e Frios", items: [
"Creme de Leite","Iogurte (Grego/Natural/Saborizado)","Leite (Desnatado/Integral/Sem Lactose)","Leite Condensado","Leite Fermentado","Leite Vegetal (Amêndoas/Aveia/Soja)","Manteiga (Com/Sem Sal)","Margarina","Nata","Queijo Brie/Camembert","Queijo Coalho","Queijo Gorgonzola","Queijo Minas Frescal/Padrão","Queijo Mussarela","Queijo Parmesão (Inteiro/Ralado)","Queijo Prato","Queijo Provolone","Requeijão","Apresuntado","Copa","Linguiça Calabresa","Mortadela","Patê","Peito de Peru","Presunto","Salame","Salsicha","Massa de Pastel","Massa de Lasanha","Massa de Pizza" ]
} ]
}, { name:"Congelados", icon:"🧊", subcategories: [ { name:"Congelados - Salgados e Refeições", items: [
"Batata Frita Congelada","Cebola Congelada","Empanados (Nuggets)","Esfirra Congelada","Hambúrguer","Lasanha Congelada","Mandioca Congelada","Misto Quente Congelado","Pão de Queijo Congelado","Pizza Congelada","Polenta Congelada","Pratos Prontos Congelados","Salgadinhos de Festa" ]
}, { name:"Congelados - Massas e Outros", items: [
"Açaí","Carne Seca Desfiada (Congelada)","Ervilha Congelada","Frutas Vermelhas Congeladas","Legumes Congelados","Polpa de Fruta","Sorvete" ]
} ]
}, { name:"Mercearia", icon:"🍚", subcategories: [ { name:"Mercearia - Grãos e Farináceos", items: [
"Açúcar (Cristal/Mascavo/Refinado)","Adoçante","Arroz (Arbóreo/Branco/Integral/Parboilizado)","Aveia (Flocos/Farinha)","Azeite de Oliva","Farinha de Mandioca","Farinha de Milho (Fubá)","Farinha de Rosca","Farinha de Trigo","Feijão (Branco/Carioca/Fradinho/Preto)","Milho para Pipoca","Óleo (Canola/Girassol/Milho/Soja)","Polenta","Sal (Grosso/Himalaia/Refinado)","Tapioca" ]
}, { name:"Mercearia - Massas e Molhos", items: [
"Extrato de Tomate","Macarrão (Espaguete/Lasanha/Ninho/Parafuso/Penne)","Macarrão Instantâneo","Massa Fresca (Nhoque/Ravioli)","Molho Branco","Molho de Tomate Pronto" ]
}, { name:"Mercearia - Condimentos e Conservas", items: [
"Azeitona","Caldo em Cubos","Ketchup","Champignon","Cominho","Ervilha em Conserva","Louro","Maionese","Milho em Conserva","Molho de Alho","Molho de Pimenta","Molho Inglês","Molho Shoyu","Mostarda","Orégano","Palmito","Picles","Pimenta-do-reino","Sardinha/Atum em Lata","Vinagre (Álcool/Balsâmico/Maçã)" ]
} ]
}, { name:"Padaria, Biscoitos e Doces", icon:"🥖", subcategories: [ { name:"Padaria, Biscoitos e Doces", items: [
"Achocolatado em Pó","Amendoim","Biscoito Água e Sal","Biscoito de Polvilho","Biscoito Maisena/Maria","Biscoito Recheado","Biscoito Waffer","Bolo Pronto","Café (Cápsula/Grão/Pó/Solúvel)","Castanhas/Nozes","Cereal Matinal","Chá (Caixa/Sachê)","Chocolate (Barra/Caixa)","Creme de Avelã","Doce de Leite","Fermento Biológico","Fermento em Pó","Gelatina","Granola","Granulado","Leite Condensado","Mistura para Bolo","Pão (de Forma/Francês/Integral/Hot Dog)","Pão de Hambúrguer","Pão de Queijo","Salgadinhos (Snacks/Chips)","Torrada" ]
} ]
}, { name:"Bebidas", icon:"🧃", subcategories: [ { name:"Bebidas", items: [
"Água de Coco","Água Mineral (Com/Sem Gás)","Bebida Energética","Cachaça","Cerveja","Espumante","Gin","Refrigerante","Suco (Caixa/Concentrado/Pó)","Vinho (Branco/Seco/Suave/Tinto)","Vodca","Whisky" ]
} ]
}, { name:"Higiene e Limpeza", icon:"🧼", subcategories: [ { name:"Limpeza e Utilidades Domésticas", items: [
"Água Sanitária","Álcool (Gel/Líquido)","Amaciante","Cera","Desengordurante","Desinfetante","Detergente","Esponja de Aço","Esponja Sintética","Fósforo","Inseticida","Limpa Vidros","Limpador Multiuso","Pano de Chão/Pano de Prato","Purificador de Ar","Rodo","Sabão em Barra","Sabão em Pó","Sabão Líquido","Saco de Lixo","Vassoura","Copo/Prato/Talher Descartável","Filme de PVC","Guardanapo","Papel Alumínio","Papel Manteiga","Papel Toalha" ]
}, { name:"Higiene Pessoal", items: [
"Absorvente","Algodão","Aparelho de Barbear","Condicionador","Cotonete","Creme de Barbear","Creme Dental","Desodorante (Aerosol/Roll-on)","Enxaguante Bucal","Escova de Dentes","Fio Dental","Hidratante Corporal","Papel Higiênico (Folha Dupla/Simples)","Preservativo","Protetor Solar","Sabonete (Barra/Líquido)","Shampoo" ]
} ]
}, { name:"Bebês", icon:"🍼", subcategories: [ { name:"Bebês", items: [
"Fralda Descartável","Fórmula Infantil (Leite em Pó)","Lenço Umedecido Infantil","Pomada para Assaduras","Sabonete Infantil","Shampoo Infantil" ]
} ]
}, { name:"Pet Shop", icon:"🐾", subcategories: [ { name:"Pet Shop", items: [
"Areia Higiênica para Gatos","Ossos/Petiscos","Ração para Cães (Seca/Úmida)","Ração para Gatos (Seca/Úmida)","Tapete Higiênico" ]
} ]
}
];
