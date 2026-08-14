export const products = [
  {
    id: 'p1',
    type: 'product',
    name: 'Studio Signal Tee',
    price: 38,
    description: 'Heavyweight cotton tee with the Sonny Tech Studio crosshair mark.',
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
    name: 'Automation Fundamentals',
    price: 129,
    description: 'A self-paced course on designing reliable business-process automations.',
  },
  {
    id: 'c2',
    type: 'course',
    name: 'Production-Grade React',
    price: 249,
    description: 'Deep dive into the patterns we use to ship and maintain real production apps.',
  },
];

export function getProductById(id) {
  return products.find((product) => product.id === id);
}
