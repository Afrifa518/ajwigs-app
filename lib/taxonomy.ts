import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUBCATEGORY_GROUPS,
} from "@/app/storefront/catalog";

export type TaxOption = { id?: string; value: string; label: string };
export type TaxGroup = { id?: string; label: string; options: TaxOption[] };
export type Taxonomy = { categories: TaxOption[]; groups: TaxGroup[] };

/** Static fallback so the storefront/admin still work if the API is empty/unreachable. */
export const FALLBACK_TAXONOMY: Taxonomy = {
  categories: PRODUCT_CATEGORIES,
  groups: PRODUCT_SUBCATEGORY_GROUPS,
};

type TaxonomyResponse = {
  success?: boolean;
  categories?: TaxOption[];
  groups?: TaxGroup[];
};

/** Loads the admin-managed taxonomy, falling back to the static catalog. */
export const fetchTaxonomy = async (): Promise<Taxonomy> => {
  try {
    const res = await fetch("/api/taxonomy/list", { cache: "no-store" });
    const data = (await res.json()) as TaxonomyResponse;
    if (
      data?.success &&
      Array.isArray(data.categories) &&
      Array.isArray(data.groups) &&
      (data.categories.length > 0 || data.groups.length > 0)
    ) {
      return { categories: data.categories, groups: data.groups };
    }
  } catch {
    /* ignore — fall back to static catalog */
  }
  return FALLBACK_TAXONOMY;
};
