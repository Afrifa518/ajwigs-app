export type CatalogOption = {
  value: string;
  label: string;
};

export type CatalogGroup = {
  label: string;
  options: CatalogOption[];
};

export const PRODUCT_CATEGORIES: CatalogOption[] = [
  { value: "Frontal", label: "Frontal" },
  { value: "Closure", label: "Closure" },
  { value: "Straight", label: "Straight Wig" },
];

export const PRODUCT_SUBCATEGORY_GROUPS: CatalogGroup[] = [
  {
    label: "Short Wigs",
    options: [
      { value: "Pixie Cut", label: "Pixie Cut (4-6 inches)" },
      { value: "Bob", label: "Bob (6-8 inches)" },
      { value: "Short Bob", label: "Short Bob (8-10 inches)" },
    ],
  },
  {
    label: "Medium Wigs",
    options: [
      { value: "Shoulder-length", label: "Shoulder-length (10-12 inches)" },
      { value: "Chin-length", label: "Chin-length (12-14 inches)" },
      { value: "Mid-length", label: "Mid-length (14-16 inches)" },
    ],
  },
  {
    label: "Long Wigs",
    options: [
      { value: "Long Bob", label: "Long Bob (16-18 inches)" },
      { value: "Shoulder-grazing", label: "Shoulder-grazing (18-20 inches)" },
      { value: "Medium Long", label: "Medium Long (20-22 inches)" },
      { value: "Long", label: "Long (22-24 inches)" },
    ],
  },
  {
    label: "Extra Long Wigs",
    options: [
      { value: "Extra Long", label: "Extra Long (24-26 inches)" },
      { value: "Ultra Long", label: "Ultra Long (26-30 inches)" },
      { value: "Specialty", label: "Specialty (30-36 inches)" },
    ],
  },
];

export const PRODUCT_SUBCATEGORIES: CatalogOption[] = PRODUCT_SUBCATEGORY_GROUPS.flatMap(
  (g) => g.options
);
