export interface ProductData {
  id: string;
  name: string;
  description: string;
  category?: string;
  details: {
    label: string;
    value: string;
  }[];
}

const products: Record<string, ProductData> = {
  "custom-textile": {
    id: "custom-textile",
    name: "Custom Textile",
    description:
      "Premium custom-dimension textile. Enter your desired width and height to get an instant price quote.",
    details: [
      { label: "Material", value: "Premium polyester blend" },
      { label: "Dimensions", value: "10–200 cm (width & height)" },
      { label: "Production time", value: "3–5 business days" },
      { label: "Finish", value: "Hemmed edges, ready to use" },
      { label: "Care", value: "Machine washable at 30 °C" },
    ],
  },
  "venetian-blinds-25mm": {
    id: "10373715755274",
    name: "Venetian Blinds 25mm",
    description:
      "Classic 25mm venetian blinds made to measure. Enter your desired width and height to get an instant price quote.",
    details: [
      { label: "Slat width", value: "25 mm" },
      { label: "Material", value: "Aluminium" },
      { label: "Dimensions", value: "10–200 cm (width & height)" },
      { label: "Production time", value: "3–5 business days" },
      { label: "Mounting", value: "Inside or outside recess" },
      { label: "Care", value: "Wipe clean with damp cloth" },
    ],
  },
  "white-rollerblind": {
    id: "white-rollerblind",
    name: "White Rollerblind",
    category: "rollerblinds",
    description:
      "Clean white rollerblind made to measure. Enter your desired width and height to get an instant price quote.",
    details: [
      { label: "Slat material", value: "Fabric" },
      { label: "Color", value: "White" },
      { label: "Dimensions", value: "10–200 cm (width & height)" },
      { label: "Production time", value: "3–5 business days" },
      { label: "Mounting", value: "Inside or outside recess" },
      { label: "Operation", value: "Chain-operated" },
      { label: "Care", value: "Wipe clean with damp cloth" },
    ],
  },
  "black-rollerblind": {
    id: "black-rollerblind",
    name: "Black Rollerblind",
    category: "rollerblinds",
    description:
      "Sleek black rollerblind made to measure. Enter your desired width and height to get an instant price quote.",
    details: [
      { label: "Slat material", value: "Fabric" },
      { label: "Color", value: "Black" },
      { label: "Dimensions", value: "10–200 cm (width & height)" },
      { label: "Production time", value: "3–5 business days" },
      { label: "Mounting", value: "Inside or outside recess" },
      { label: "Operation", value: "Chain-operated" },
      { label: "Blackout", value: "Yes - blocks 99% of light" },
      { label: "Care", value: "Wipe clean with damp cloth" },
    ],
  },
};

export function getProduct(productId: string): ProductData | undefined {
  return products[productId];
}

export function getAllProductIds(): string[] {
  return Object.keys(products);
}

export function getProductsByCategory(category: string): ProductData[] {
  return Object.values(products).filter(
    (product) => product.category === category
  );
}
