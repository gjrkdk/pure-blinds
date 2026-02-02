export interface ProductData {
  id: string;
  name: string;
  description: string;
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
};

export function getProduct(productId: string): ProductData | undefined {
  return products[productId];
}

export function getAllProductIds(): string[] {
  return Object.keys(products);
}
