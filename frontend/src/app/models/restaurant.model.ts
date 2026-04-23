export interface MenuItem {
  id:    string;
  name:  string;
  desc:  string;
  price: number;
  icon:  string;
}

export interface Restaurant {
  id:      string;
  name:    string;
  cuisine: string;
  rating:  number;
  icon:    string;
  emoji:   string;
  items:   MenuItem[];
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'sakura',
    name: 'Sakura Japanese',
    cuisine: 'Culinária Japonesa',
    rating: 4.8,
    icon: 'bi-moon-stars',
    emoji: '🍱',
    items: [
      { id: 's1', name: 'Sashimi de Salmão',  desc: '8 fatias de salmão fresco',                    price: 42.90, icon: 'bi-water' },
      { id: 's2', name: 'Dragon Roll',         desc: 'Camarão tempurá, abacate, tobiko',              price: 38.50, icon: 'bi-star' },
      { id: 's3', name: 'Missoshiru',          desc: 'Sopa miso tradicional com tofu e wakame',       price: 12.00, icon: 'bi-cup-hot' },
      { id: 's4', name: 'Edamame',             desc: 'Vagem de soja cozida com sal',                  price: 15.90, icon: 'bi-circle' },
      { id: 's5', name: 'Gyoza (6 un.)',       desc: 'Pastel japonês frito recheado com porco',       price: 22.00, icon: 'bi-box' },
    ],
  },
  {
    id: 'napoli',
    name: 'Napoli Pizza',
    cuisine: 'Pizzaria Italiana',
    rating: 4.5,
    icon: 'bi-fire',
    emoji: '🍕',
    items: [
      { id: 'n1', name: 'Margherita',         desc: 'Molho de tomate, mozzarella, manjericão',        price: 35.00, icon: 'bi-circle' },
      { id: 'n2', name: 'Pepperoni',          desc: 'Molho de tomate, mozzarella, pepperoni',         price: 39.90, icon: 'bi-circle-fill' },
      { id: 'n3', name: 'Quattro Stagioni',   desc: 'Presunto, cogumelos, alcachofra, azeitonas',     price: 44.50, icon: 'bi-grid' },
      { id: 'n4', name: 'Calzone',            desc: 'Pizza fechada com ricota e presunto',            price: 41.00, icon: 'bi-moon' },
    ],
  },
  {
    id: 'toscana',
    name: 'Toscana Italiana',
    cuisine: 'Culinária Italiana',
    rating: 4.6,
    icon: 'bi-award',
    emoji: '🍝',
    items: [
      { id: 't1', name: 'Tagliatelle Bolognese', desc: 'Massa fresca com ragù de carne bovina',       price: 48.00, icon: 'bi-layers' },
      { id: 't2', name: 'Risotto ai Porcini',    desc: 'Arroz arbóreo, cogumelos, parmesão',          price: 52.00, icon: 'bi-dot' },
      { id: 't3', name: 'Osso Buco',             desc: 'Jarrete de vitela braseado, gremolata',       price: 65.00, icon: 'bi-trophy' },
      { id: 't4', name: 'Tiramisù',              desc: 'Sobremesa clássica de mascarpone e café',     price: 24.00, icon: 'bi-cup' },
      { id: 't5', name: 'Bruschetta al Pomodoro', desc: 'Pão grelhado com tomate, alho e manjericão', price: 18.00, icon: 'bi-egg' },
    ],
  },
  {
    id: 'oceano',
    name: 'Oceano Azul',
    cuisine: 'Frutos do Mar',
    rating: 4.7,
    icon: 'bi-tsunami',
    emoji: '🦞',
    items: [
      { id: 'o1', name: 'Lagosta Grelhada',      desc: 'Lagosta com manteiga de ervas e limão siciliano', price: 120.00, icon: 'bi-brightness-high' },
      { id: 'o2', name: 'Camarão na Moranga',    desc: 'Camarão cremoso em abóbora com catupiry',         price:  68.00, icon: 'bi-hexagon-fill' },
      { id: 'o3', name: 'Caldeirada de Peixe',   desc: 'Peixe do dia com legumes, tomate e azeite',       price:  54.00, icon: 'bi-droplet-fill' },
      { id: 'o4', name: 'Polvo à Lagareiro',     desc: 'Polvo assado com batatas ao murro e azeite',      price:  78.00, icon: 'bi-asterisk' },
      { id: 'o5', name: 'Ostras Frescas (6 un.)', desc: 'Ostras geladas com limão e molho tabasco',       price:  45.00, icon: 'bi-shield-fill' },
      { id: 'o6', name: 'Risoto de Camarão',     desc: 'Arroz arbóreo, camarão, parmesão e manjericão',   price:  58.00, icon: 'bi-grid-fill' },
    ],
  },
];
