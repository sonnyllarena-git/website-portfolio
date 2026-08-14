export const products = [
  {
    id: 'p1',
    type: 'product',
    name: 'Sonny Signal Tee',
    price: 38,
    description: 'Heavyweight cotton tee with the Sonny crosshair mark.',
  },
  {
    id: 'p2',
    type: 'product',
    name: 'Orbital Enamel Pin',
    price: 14,
    description: 'Hard enamel pin, glow-in-the-dark nucleus.',
  },
  {
    id: 'c1',
    type: 'course',
    name: 'Signal Design Fundamentals',
    price: 129,
    description: 'A self-paced course on glitch aesthetics and motion design.',
  },
  {
    id: 'c2',
    type: 'course',
    name: 'Advanced Interface Rituals',
    price: 249,
    description: 'Deep dive into orbital loaders, grid systems, and chromatic UI.',
  },
];

export function getProductById(id) {
  return products.find((product) => product.id === id);
}
