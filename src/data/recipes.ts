export interface Recipe {
  nome: string;
  ingredientes: string[];
  tempo: string;
  motivo: string;
  instrucoes: string[];
}

export const recipesDatabase: Recipe[] = [
  {
    nome: "Arroz de Forno Cremoso",
    ingredientes: ["Arroz", "Queijo", "Presunto", "Creme de leite", "Milho"],
    tempo: "25 min",
    motivo: "Reaproveitamento perfeito para aquele arroz que sobrou.",
    instrucoes: ["Misture o arroz com o creme de leite.", "Adicione o presunto e o milho.", "Coloque em um refratário e cubra com queijo.", "Asse até gratinar."]
  },
  {
    nome: "Omelete Reforçado",
    ingredientes: ["Ovo", "Tomate", "Cebola", "Carne"],
    tempo: "10 min",
    motivo: "Rápido, nutritivo e ajuda a limpar restos da geladeira.",
    instrucoes: ["Bata os ovos com sal.", "Misture tomate, cebola e carne.", "Frite em frigideira untada.", "Doure dos dois lados."]
  },
  {
    nome: "Macarrão Alho e Óleo",
    ingredientes: ["Macarrão", "Alho", "Azeite", "Sal"],
    tempo: "15 min",
    motivo: "Econômico e usa o básico da despensa.",
    instrucoes: ["Cozinhe o macarrão.", "Refogue o alho no azeite.", "Misture o macarrão.", "Acerte o sal."]
  },
  {
    nome: "Sopa de Legumes Simples",
    ingredientes: ["Batata", "Cenoura", "Cebola", "Macarrão", "Cebolinha"],
    tempo: "30 min",
    motivo: "Aproveita legumes que estão passando do ponto.",
    instrucoes: ["Pique os legumes.", "Refogue a cebola.", "Cozinhe os legumes em água.", "Adicione o macarrão no final."]
  },
  {
    nome: "Bife Acebolado com Fritas",
    ingredientes: ["Carne", "Cebola", "Batata", "Óleo", "Sal"],
    tempo: "30 min",
    motivo: "Clássico brasileiro fácil de fazer.",
    instrucoes: ["Frite as batatas.", "Grelhe os bifes.", "Na mesma panela, refogue a cebola.", "Sirva tudo junto."]
  },
  {
    nome: "Frango Grelhado com Salada",
    ingredientes: ["Frango", "Alface", "Tomate", "Limão"],
    tempo: "20 min",
    motivo: "Refeição leve e saudável.",
    instrucoes: ["Tempere o frango com limão e sal.", "Grelhe os filés.", "Lave as folhas e pique o tomate.", "Sirva o frango com a salada."]
  },
  {
    nome: "Strogonoff de Frango",
    ingredientes: ["Frango", "Creme de leite", "Molho de tomate", "Cebola", "Batata palha"],
    tempo: "30 min",
    motivo: "Rende bastante e todo mundo gosta.",
    instrucoes: ["Refogue a cebola e doure o frango.", "Adicione o molho de tomate.", "Desligue e misture o creme de leite.", "Sirva com batata palha."]
  },
  {
    nome: "Purê de Batata com Carne Moída",
    ingredientes: ["Batata", "Manteiga", "Leite", "Carne moída", "Molho de tomate"],
    tempo: "40 min",
    motivo: "Prato reconfortante e econômico.",
    instrucoes: ["Cozinhe e amasse as batatas, misturando com leite e manteiga.", "Refogue a carne moída.", "Adicione o molho na carne.", "Sirva o purê com a carne."]
  },
  {
    nome: "Salada de Maionese",
    ingredientes: ["Batata", "Cenoura", "Ovo", "Maionese", "Milho"],
    tempo: "30 min",
    motivo: "Aproveita vegetais cozidos e ovos.",
    instrucoes: ["Cozinhe a batata, cenoura e ovos.", "Pique tudo em cubos.", "Misture o milho.", "Envolva com a maionese e gele."]
  },
  {
    nome: "Farofa de Ovo",
    ingredientes: ["Farinha de mandioca", "Ovo", "Cebola", "Manteiga"],
    tempo: "10 min",
    motivo: "Acompanhamento rápido e muito barato.",
    instrucoes: ["Derreta a manteiga e refogue a cebola.", "Adicione os ovos e mexa.", "Coloque a farinha aos poucos.", "Tempere com sal."]
  },
  {
    nome: "Bolo de Cenoura",
    ingredientes: ["Cenoura", "Ovo", "Óleo", "Açúcar", "Farinha de trigo", "Fermento", "Chocolate"],
    tempo: "50 min",
    motivo: "Sobremesa ou lanche clássico que usa cenouras.",
    instrucoes: ["Bata cenoura, óleo e ovos no liquidificador.", "Misture com açúcar e farinha.", "Asse por 40 min.", "Faça uma calda de chocolate e jogue por cima."]
  },
  {
    nome: "Misto Quente de Forno",
    ingredientes: ["Pão de forma", "Presunto", "Queijo", "Tomate", "Orégano"],
    tempo: "15 min",
    motivo: "Lanche rápido para usar pão e frios.",
    instrucoes: ["Monte camadas de pão, presunto, queijo e tomate.", "Salpique orégano.", "Leve ao forno até o queijo derreter.", "Corte e sirva."]
  },
  {
    nome: "Tapioca com Queijo",
    ingredientes: ["Goma de tapioca", "Queijo", "Manteiga"],
    tempo: "5 min",
    motivo: "Café da manhã sem glúten e prático.",
    instrucoes: ["Peneire a goma na frigideira quente.", "Espere unir.", "Vire, passe manteiga e coloque o queijo.", "Dobre e sirva."]
  },
  {
    nome: "Macarronada com Salsicha",
    ingredientes: ["Macarrão", "Salsicha", "Molho de tomate", "Cebola"],
    tempo: "20 min",
    motivo: "O almoço salvador de fim de mês.",
    instrucoes: ["Cozinhe o macarrão.", "Corte a salsicha em rodelas e refogue com cebola.", "Junte o molho de tomate.", "Misture ao macarrão."]
  },
  {
    nome: "Sopa de Feijão com Macarrão",
    ingredientes: ["Feijão", "Macarrão", "Cebola", "Alho"],
    tempo: "20 min",
    motivo: "Aproveita o caldo e o feijão que sobraram.",
    instrucoes: ["Bata parte do feijão no liquidificador.", "Refogue alho e cebola.", "Junte o caldo, água e o macarrão.", "Cozinhe até o macarrão amolecer."]
  },
  {
    nome: "Frango Assado com Batatas",
    ingredientes: ["Frango", "Batata", "Maionese", "Alho"],
    tempo: "60 min",
    motivo: "Refeição completa em uma assadeira só.",
    instrucoes: ["Tempere o frango e as batatas com alho e maionese.", "Coloque numa assadeira.", "Asse até dourar bem.", "Sirva."]
  },
  {
    nome: "Arroz Doce",
    ingredientes: ["Arroz", "Leite", "Leite condensado", "Canela"],
    tempo: "30 min",
    motivo: "Doce tradicional com ingredientes simples.",
    instrucoes: ["Cozinhe o arroz na água.", "Adicione o leite e o leite condensado.", "Cozinhe até engrossar.", "Polvilhe canela."]
  },
  {
    nome: "Ovos Mexidos Cremosos",
    ingredientes: ["Ovo", "Manteiga", "Creme de leite", "Sal"],
    tempo: "5 min",
    motivo: "Café da manhã de hotel em casa.",
    instrucoes: ["Derreta a manteiga.", "Coloque os ovos batidos.", "Mexa devagar e desligue o fogo.", "Misture um pouco de creme de leite."]
  },
  {
    nome: "Sanduíche Natural de Frango",
    ingredientes: ["Pão de forma", "Frango", "Maionese", "Cenoura", "Alface"],
    tempo: "15 min",
    motivo: "Lanche fresco para aproveitar sobras de frango.",
    instrucoes: ["Desfie o frango.", "Misture com maionese e cenoura ralada.", "Passe no pão.", "Adicione a alface e feche."]
  },
  {
    nome: "Carne de Panela",
    ingredientes: ["Carne", "Batata", "Cenoura", "Cebola", "Alho"],
    tempo: "50 min",
    motivo: "Carne macia com vegetais nutritivos.",
    instrucoes: ["Doure a carne com cebola e alho.", "Cozinhe na pressão com água.", "Adicione batata e cenoura e cozinhe mais.", "Sirva com o caldo."]
  },
  {
    nome: "Panqueca de Carne Moída",
    ingredientes: ["Carne moída", "Farinha de trigo", "Leite", "Ovo", "Molho de tomate"],
    tempo: "40 min",
    motivo: "Rende bastante e fica delicioso.",
    instrucoes: ["Bata leite, farinha e ovo no liquidificador.", "Faça discos finos na frigideira.", "Recheie com carne moída.", "Cubra com molho."]
  },
  {
    nome: "Bife à Milanesa",
    ingredientes: ["Carne", "Farinha de rosca", "Ovo", "Óleo"],
    tempo: "30 min",
    motivo: "Bife crocante e saboroso.",
    instrucoes: ["Tempere a carne.", "Passe no ovo batido e depois na farinha.", "Frite em óleo quente.", "Escorra bem."]
  },
  {
    nome: "Escondidinho de Frango",
    ingredientes: ["Batata", "Frango", "Creme de leite", "Queijo"],
    tempo: "40 min",
    motivo: "Aproveita restos de frango.",
    instrucoes: ["Faça um purê de batatas.", "Desfie e refogue o frango.", "Coloque o frango em um refratário, cubra com o purê e o queijo.", "Gratine no forno."]
  },
  {
    nome: "Salada de Repolho",
    ingredientes: ["Repolho", "Cenoura", "Limão", "Azeite", "Sal"],
    tempo: "10 min",
    motivo: "Salada fresca, barata e durável.",
    instrucoes: ["Fatie o repolho bem fino.", "Rale a cenoura.", "Misture e tempere com limão, azeite e sal.", "Sirva gelado."]
  },
  {
    nome: "Torta de Frango de Liquidificador",
    ingredientes: ["Frango", "Farinha de trigo", "Leite", "Ovo", "Óleo", "Milho"],
    tempo: "50 min",
    motivo: "Usa frango e itens básicos da despensa.",
    instrucoes: ["Bata a massa no liquidificador.", "Despeje metade na forma.", "Adicione o recheio de frango e milho.", "Cubra com o resto da massa e asse."]
  },
  {
    nome: "Pão com Ovo",
    ingredientes: ["Pão francês", "Ovo", "Manteiga"],
    tempo: "5 min",
    motivo: "O clássico salvador de fomes rápidas.",
    instrucoes: ["Frite o ovo na manteiga.", "Abra o pão.", "Coloque o ovo dentro e aproveite."]
  },
  {
    nome: "Cuscuz com Ovo",
    ingredientes: ["Flocão de milho", "Ovo", "Manteiga", "Sal"],
    tempo: "15 min",
    motivo: "Refeição nordestina barata e nutritiva.",
    instrucoes: ["Umedeça o flocão com sal e água.", "Cozinhe no cuscuzeiro.", "Sirva com ovo frito e manteiga."]
  },
  {
    nome: "Salpicão Simples",
    ingredientes: ["Frango", "Cenoura", "Milho", "Maionese", "Batata palha"],
    tempo: "20 min",
    motivo: "Perfeito para dias quentes.",
    instrucoes: ["Desfie o frango.", "Misture com cenoura, milho e maionese.", "Gele bem.", "Cubra com batata palha ao servir."]
  },
  {
    nome: "Peixe Grelhado",
    ingredientes: ["Peixe", "Limão", "Alho", "Azeite"],
    tempo: "20 min",
    motivo: "Refeição leve e rápida.",
    instrucoes: ["Tempere os filés de peixe com limão e alho.", "Aqueça o azeite na frigideira.", "Grelhe os filés dos dois lados.", "Sirva imediatamente."]
  },
  {
    nome: "Brigadeiro",
    ingredientes: ["Leite condensado", "Chocolate", "Manteiga"],
    tempo: "15 min",
    motivo: "Doce rápido para matar a vontade.",
    instrucoes: ["Misture tudo na panela.", "Mexa sem parar em fogo baixo.", "Desligue quando desgrudar do fundo.", "Coma de colher ou enrole."]
  },
  {
    nome: "Vinagrete",
    ingredientes: ["Tomate", "Cebola", "Pimentão", "Vinagre", "Azeite"],
    tempo: "10 min",
    motivo: "Acompanhamento clássico.",
    instrucoes: ["Pique tomate, cebola e pimentão em cubinhos.", "Misture em uma tigela.", "Tempere com vinagre, azeite e sal.", "Sirva com carnes ou pães."]
  },
  {
    nome: "Suco Refrescante",
    ingredientes: ["Laranja", "Limão", "Açúcar", "Água"],
    tempo: "5 min",
    motivo: "Bebida natural.",
    instrucoes: ["Esprema as frutas.", "Misture com água e açúcar a gosto.", "Sirva com gelo."]
  }
];
