export interface CatalogSubCategory {
  name: string;
  items: string[];
}

export interface CatalogCategory {
  name: string;
  icon: string;
  subcategories: CatalogSubCategory[];
}

export const PRODUCT_CATALOG: CatalogCategory[] = [
  {
    name: "Açougue e Aves",
    icon: "🥩",
    subcategories: [
      {
        name: "Carnes e Aves",
        items: [
          "Acém", "Alcatra", "Ancho", "Assado de Tira", "Bacon", "Bisteca Bov.", "Bisteca Suína",
          "Carne Moída (1ª/2ª)", "Chorizo", "Chuleta", "Contrafilé", "Coração de Frango", "Costela Bov.",
          "Costelinha Suína", "Coxa/Sobrecoxa", "Coxão Duro", "Coxão Mole", "Cupim", "Fígado",
          "Filé de Peito", "Filé Mignon", "Fraldinha", "Frango Inteiro", "Lagarto",
          "Linguiça (Calabresa/Toscana/Pernil)", "Lombo Suíno", "Maminha", "Músculo", "Panceta",
          "Patinho", "Peito Bov.", "Pernil", "Picanha (Bov./Suína)", "Sassami", "T-Bone"
        ]
      }
    ]
  },
  {
    name: "Peixaria",
    icon: "🐟",
    subcategories: [
      {
        name: "Peixes e Frutos do Mar",
        items: [
          "Atum", "Bacalhau", "Cação", "Camarão", "Dourada", "Filé de Merluza",
          "Filé de Pescada", "Filé de Tilápia", "Lula", "Polvo", "Salmão", "Sardinha"
        ]
      }
    ]
  },
  {
    name: "Hortifruti",
    icon: "🥦",
    subcategories: [
      {
        name: "Frutas",
        items: [
          "Abacate", "Abacaxi", "Ameixa", "Banana (Prata/Nanica/da Terra)", "Caqui", "Coco", "Figo",
          "Goiaba", "Kiwi", "Laranja (Pera/Lima)", "Limão (Tahiti/Siciliano)", "Maçã (Gala/Fuji/Verde)",
          "Mamão (Formosa/Papaya)", "Manga (Palmer/Tommy)", "Maracujá", "Melancia", "Melão", "Morango",
          "Pera", "Pêssego", "Tangerina (Mexerica/Ponkan)", "Uva (Niágara/Rubi/Thompson)"
        ]
      },
      {
        name: "Legumes, Verduras e Ovos",
        items: [
          "Abóbora", "Abobrinha", "Alface (Crespa/Americana)", "Alho", "Batata (Inglesa/Doce/Salsa/Asterix)",
          "Berinjela", "Beterraba", "Brócolis", "Cebola (Branca/Roxa)", "Cenoura", "Cheiro-Verde", "Chuchu",
          "Couve", "Couve-flor", "Gengibre", "Inhame", "Mandioca", "Milho Verde", "Ovos (Branco/Vermelho/Codorna)",
          "Pepino", "Pimentão (Verde/Amarelo/Vermelho)", "Quiabo", "Repolho", "Rúcula",
          "Tomate (Carmem/Cereja/Italiano)", "Vagem"
        ]
      }
    ]
  },
  {
    name: "Laticínios",
    icon: "🧀",
    subcategories: [
      {
        name: "Leites, Queijos e Derivados",
        items: [
          "Creme de Leite (Fresquinho/Caixinha)", "Iogurte (Natural/Sabor/Grego)", 
          "Leite (Integral/Desnatado/Sem Lactose)", "Leite Condensado", "Leite Fermentado", 
          "Manteiga (Com/Sem Sal)", "Margarina", "Nata", 
          "Queijo (Mussarela/Prato/Minas/Parmesão/Provolone/Gorgonzola/Brie)", "Requeijão"
        ]
      }
    ]
  },
  {
    name: "Frios e Embutidos",
    icon: "🥓",
    subcategories: [
      {
        name: "Embutidos",
        items: [
          "Apresuntado", "Copa", "Mortadela (Defumada/Italiana)", "Patê", "Peito de Peru",
          "Presunto (Magro/Parma)", "Salame (Hamburguês/Italiano)", "Salsicha (Viena/Frango/Tradicional)"
        ]
      }
    ]
  },
  {
    name: "Mercearia Básica",
    icon: "🍚",
    subcategories: [
      {
        name: "Grãos e Farináceos",
        items: [
          "Açúcar (Refinado/Cristal/Mascavo)", "Adoçante", "Arroz (Branco/Parboilizado/Integral/Arbóreo)",
          "Aveia", "Azeite", "Farinha de Mandioca", "Farinha de Milho (Fubá)", "Farinha de Rosca",
          "Farinha de Trigo", "Feijão (Carioca/Preto/Branco/Fradinho)", "Milho para Pipoca",
          "Óleo (Soja/Girassol/Milho)", "Sal (Refinado/Grosso/Himalaia)", "Tapioca"
        ]
      }
    ]
  },
  {
    name: "Mercearia Complementar",
    icon: "🍝",
    subcategories: [
      {
        name: "Massas e Molhos",
        items: [
          "Extrato de Tomate", "Macarrão (Espaguete/Penne/Parafuso/Lasanha/Ninho)", "Macarrão Instantâneo",
          "Molho Branco", "Molho de Tomate (Pronto/Bolonhesa/Manjericão)", "Massa Fresca (Ravioli/Nhoque)"
        ]
      },
      {
        name: "Condimentos",
        items: [
          "Caldo em Cubos", "Catchup", "Cominho", "Louro", "Maionese", "Molho de Alho", 
          "Molho de Pimenta", "Molho Inglês", "Molho Shoyu", "Mostarda", "Orégano", 
          "Pimenta-do-reino", "Vinagre (Álcool/Maçã/Balsâmico)"
        ]
      },
      {
        name: "Enlatados e Conservas",
        items: [
          "Azeitona", "Atum em Lata", "Champignon", "Ervilha", "Milho Verde em Lata",
          "Palmito", "Picles", "Sardinha em Lata", "Seleta de Legumes"
        ]
      }
    ]
  },
  {
    name: "Padaria e Biscoitos",
    icon: "🥖",
    subcategories: [
      {
        name: "Pães e Lanches",
        items: [
          "Achocolatado", "Amendoim", "Biscoito Água e Sal", "Biscoito Maisena", "Biscoito Recheado",
          "Bolo Pronto", "Café (Pó/Grão/Cápsula)", "Castanhas", "Cereal Matinal", "Chá (Caixa/Pronto)",
          "Chocolate (Barra/Caixa)", "Creme de Avelã", "Doce de Leite", "Gelatina", "Granola",
          "Pão (Francês/Forma/Integral/Hambúrguer/Hot Dog)", "Pão de Queijo", "Salgadinhos (Snacks)", "Torrada"
        ]
      }
    ]
  },
  {
    name: "Bebidas",
    icon: "🧃",
    subcategories: [
      {
        name: "Bebidas",
        items: [
          "Água (Com/Sem Gás)", "Água de Coco", "Bebida Energética", "Cachaça", "Cerveja (Pilsen/IPA/Puro Malte)",
          "Espumante", "Gin", "Refrigerante (Cola/Guaraná/Laranja/Limão)", "Suco (Caixa/Lata/Pó/Concentrado)",
          "Vinho (Tinto/Branco/Seco/Suave)", "Vodca", "Whisky"
        ]
      }
    ]
  },
  {
    name: "Limpeza",
    icon: "🧼",
    subcategories: [
      {
        name: "Limpeza",
        items: [
          "Água Sanitária", "Álcool (Líquido/Gel)", "Amaciante", "Cera", "Desengordurante", "Desinfetante",
          "Detergente", "Esponja", "Inseticida", "Limpa Vidros", "Limpador Multiuso", "Pano de Chão",
          "Purificador de Ar", "Rodo", "Sabão em Barra", "Sabão em Pó", "Sabão Líquido", "Saco de Lixo", "Vassoura"
        ]
      }
    ]
  },
  {
    name: "Higiene Pessoal e Perfumaria",
    icon: "🧴",
    subcategories: [
      {
        name: "Higiene Pessoal",
        items: [
          "Absorvente", "Algodão", "Aparelho de Barbear", "Condicionador", "Cotonete", "Creme de Barbear",
          "Creme Dental", "Desodorante (Aerosol/Roll-on)", "Enxaguante Bucal", "Escova de Dentes", "Fio Dental",
          "Hidratante", "Lenço Umedecido Íntimo", "Papel Higiênico (Folha Simples/Dupla)", "Preservativo",
          "Protetor Solar", "Sabonete (Barra/Líquido)", "Shampoo"
        ]
      }
    ]
  },
  {
    name: "Bebês",
    icon: "🍼",
    subcategories: [
      {
        name: "Itens Infantis",
        items: [
          "Fórmula Infantil", "Fralda Descartável", "Lenço Umedecido Infantil", "Pomada para Assaduras",
          "Sabonete Infantil", "Shampoo Infantil"
        ]
      }
    ]
  },
  {
    name: "Pet Shop",
    icon: "🐾",
    subcategories: [
      {
        name: "Animais",
        items: [
          "Areia Higiênica", "Ossos/Petiscos", "Ração para Cães (Seca/Úmida)", 
          "Ração para Gatos (Seca/Úmida)", "Tapete Higiênico"
        ]
      }
    ]
  },
  {
    name: "Descartáveis e Utilidades",
    icon: "🍽️",
    subcategories: [
      {
        name: "Utilidades",
        items: [
          "Copo Plástico", "Filme de PVC", "Fósforo", "Guardanapo", "Papel Alumínio",
          "Papel Manteiga", "Papel Toalha", "Prato Descartável", "Talher Descartável"
        ]
      }
    ]
  }
];
