import { supabase } from "@/lib/supabase";

export type Product = {
  id: number;
  img: string;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  description: string;
  sizes: string[];
  measurements?: { bust: string; waist: string; length: string };
  variants?: { color: string; img: string }[];
};

type ProductRow = {
  id?: number | string | null;
  img?: string | null;
  image?: string | null;
  image_url?: string | null;
  name?: string | null;
  price?: number | string | null;
  salePrice?: number | string | null;
  sale_price?: number | string | null;
  category?: string | null;
  description?: string | null;
  sizes?: string[] | string | null;
  measurements?: Product["measurements"] | string | null;
  variants?: Product["variants"] | string | null;
};

export const products: Product[] = [
  { id: 1,  img: "/D1.jpg", name: "Classic Floral Dress",   price: 200,  category: "Dress", description: "A timeless floral dress perfect for casual outings and summer days.",              sizes: ["Free Size"], measurements: { bust: "86–90 cm", waist: "70–74 cm", length: "92 cm" } },
  { id: 2,  img: "/D2.jpg", name: "Elegant Wrap Dress",     price: 220, category: "Dress", description: "A flattering wrap-style dress that suits both day and evening wear.",            sizes: ["Free Size"], measurements: { bust: "88–92 cm", waist: "72–76 cm", length: "95 cm" } },
  { id: 3,  img: "/D3.jpg", name: "Boho Maxi Dress",        price: 250, category: "Dress", description: "Flowy bohemian maxi dress with intricate patterns for a free-spirited look.",    sizes: ["Free Size"], measurements: { bust: "90–94 cm", waist: "74–78 cm", length: "130 cm" } },
  { id: 4,  img: "/D4.jpg", name: "Mini Sundress",          price: 210,  category: "Dress", description: "Light and breezy mini sundress ideal for warm weather and beach trips.",         sizes: ["Free Size"], measurements: { bust: "84–88 cm", waist: "68–72 cm", length: "78 cm" } },
  { id: 5,  img: "/D5.jpg", name: "Ruffle Hem Dress",       price: 230,  category: "Dress", description: "Charming ruffle hem dress with a feminine silhouette perfect for any occasion.", sizes: ["Free Size"], measurements: { bust: "86–90 cm", waist: "70–74 cm", length: "88 cm" } },
  { id: 6,  img: "/D6.jpg", name: "Off-Shoulder Dress",     price: 240, category: "Dress", description: "Trendy off-shoulder dress that highlights your neckline with effortless style.",  sizes: ["Free Size"], measurements: { bust: "88–92 cm", waist: "72–76 cm", length: "90 cm" } },
  { id: 7,  img: "/D7.jpg", name: "Flowy Chiffon Dress",    price: 260, category: "Dress", description: "Lightweight chiffon dress that moves beautifully and keeps you cool all day.",   sizes: ["Free Size"], measurements: { bust: "90–94 cm", waist: "74–78 cm", length: "100 cm" } },
  { id: 8,  img: "/D8.jpg", name: "Bodycon Midi Dress",     price: 280, category: "Dress", description: "Sleek bodycon midi dress that hugs your curves for a confident, polished look.", sizes: ["Free Size"], measurements: { bust: "84–88 cm", waist: "68–72 cm", length: "105 cm" } },

  { id: 11, img: "/WD1.jpg", name: "Fossil Townsman Watch", price: 4999, category: "Watch", description: "Elegant Fossil Townsman chronograph with a mother-of-pearl dial and crystal bezel. Available in multiple colors.", sizes: ["One Size"], variants: [
    { color: "Rose Gold", img: "/WD1.jpg" },
    { color: "Silver",    img: "/WD2.jpg" },
  ]},
  { id: 15, img: "/W1.jpg", name: "Fossil Neutra Watch", price: 3499, salePrice: 2974, category: "Watch", description: "The Fossil Neutra features a clean minimalist design with a slim case and genuine leather strap. Available in multiple colors.", sizes: ["One Size"], variants: [
    { color: "Silver / White", img: "/W1.jpg" },
    { color: "Gold / Brown",   img: "/W2.jpg" },
  ]},
  { id: 17, img: "/W3.jpg", name: "Fossil Carlie Watch", price: 5999, category: "Watch", description: "The Fossil Carlie is an elegant timepiece with a vintage-inspired dial and a beautiful mesh or leather bracelet. Available in multiple colors.", sizes: ["One Size"], variants: [
    { color: "Rose Gold / Mesh", img: "/W3.jpg" },
    { color: "Gold / Leather",   img: "/W4.jpg" },
  ]},
  { id: 22, img: "/W8.jpg", name: "Coach Bracelet Watch", price: 5299, category: "Watch", description: "Elegant Coach bracelet-style watch with a crystal-set case and refined design. Available in multiple colors.", sizes: ["One Size"], variants: [
    { color: "Silver / Crystal", img: "/W8.jpg" },
    { color: "Gold / Pearl",     img: "/W9.jpg" },
  ]},
  { id: 30, img: "/FWW1.jpg", name: "Fossil Water Resistant Watch", price: 5999, category: "Watch", description: "Durable Fossil Water Resistant watch built for everyday wear with a sleek design and reliable water resistance. Available in multiple colors.", sizes: ["One Size"], variants: [
    { color: "Black",     img: "/FWW1.jpg" },
    { color: "Silver",    img: "/FWW2.jpg" },
    { color: "Rose Gold", img: "/FWW3.jpg" },
  ]},

  { id: 25, img: "/SCRUB1.jpg", name: "Herborist Body Scrub", price: 699, category: "Herborist Scrub", description: "Herborist body scrub that gently exfoliates, brightens, and deeply cleanses the skin. Available in multiple variants.", sizes: ["50ml","100ml","200ml"], variants: [
    { color: "Brightening", img: "/SCRUB1.jpg" },
    { color: "Deep Clean",  img: "/SCRUB2.jpg" },
    { color: "Herbal",      img: "/SCRUB3.jpg" },
  ]},
  { id: 28, img: "/oil.jpg",       name: "Hair Oil",   price: 599, category: "Herborist Scrub", description: "Nourishing body oil that deeply moisturizes and leaves skin soft and glowing.",        sizes: ["50ml","100ml"] },
  { id: 29, img: "/glutasoap.jpg", name: "Gluta Soap", price: 299, category: "Herborist Scrub", description: "Whitening gluta soap that brightens skin tone and removes dark spots effectively.",   sizes: ["1 bar","3 bars"] },
];

const fallbackById = new Map(products.map((product) => [product.id, product]));

const parseNumber = (value: number | string | null | undefined): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const parseStringArray = (value: string[] | string | null | undefined, fallback: string[]): string[] => {
  if (Array.isArray(value)) {
    const clean = value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    return clean.length > 0 ? clean : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
        return clean.length > 0 ? clean : fallback;
      }
    } catch {}

    const split = trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    return split.length > 0 ? split : fallback;
  }

  return fallback;
};

const parseMeasurements = (
  value: Product["measurements"] | string | null | undefined,
  fallback?: Product["measurements"]
): Product["measurements"] | undefined => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          bust: String(parsed.bust ?? fallback?.bust ?? ""),
          waist: String(parsed.waist ?? fallback?.waist ?? ""),
          length: String(parsed.length ?? fallback?.length ?? ""),
        };
      }
    } catch {}
  }
  return fallback;
};

const parseVariants = (
  value: Product["variants"] | string | null | undefined,
  fallback?: Product["variants"]
): Product["variants"] | undefined => {
  const normalize = (input: unknown): Product["variants"] | undefined => {
    if (!Array.isArray(input)) return undefined;

    const variants = input
      .filter((item): item is { color?: unknown; img?: unknown; image?: unknown; image_url?: unknown } => !!item && typeof item === "object")
      .map((item) => {
        const color = typeof item.color === "string" ? item.color : "";
        const img = typeof item.img === "string"
          ? item.img
          : typeof item.image === "string"
          ? item.image
          : typeof item.image_url === "string"
          ? item.image_url
          : "";

        if (!color || !img) return null;
        return { color, img };
      })
      .filter((item): item is { color: string; img: string } => item !== null);

    return variants.length > 0 ? variants : fallback;
  };

  if (Array.isArray(value)) return normalize(value);
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return normalize(JSON.parse(value));
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const normalizeProductRow = (row: ProductRow): Product | null => {
  const id = parseNumber(row.id);
  if (id === undefined) return null;

  const fallback = fallbackById.get(id);
  const price = parseNumber(row.price) ?? fallback?.price;
  if (price === undefined) return null;

  return {
    id,
    img: row.img ?? row.image ?? row.image_url ?? fallback?.img ?? "",
    name: row.name ?? fallback?.name ?? `Product ${id}`,
    price,
    salePrice: parseNumber(row.salePrice ?? row.sale_price) ?? fallback?.salePrice,
    category: row.category ?? fallback?.category ?? "Uncategorized",
    description: row.description ?? fallback?.description ?? "",
    sizes: parseStringArray(row.sizes, fallback?.sizes ?? ["One Size"]),
    measurements: parseMeasurements(row.measurements, fallback?.measurements),
    variants: parseVariants(row.variants, fallback?.variants),
  };
};

export const getProductsFromSupabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });

  if (error) {
    console.warn("Supabase products fetch failed, using fallback catalog.", error.message);
    return products;
  }

  const normalized = (data ?? [])
    .map((row) => normalizeProductRow(row as ProductRow))
    .filter((product): product is Product => product !== null);

  return normalized.length > 0 ? normalized : products;
};

export const getProductByIdFromSupabase = async (id: number): Promise<Product | undefined> => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.warn(`Supabase product fetch failed for product ${id}, using fallback item.`, error.message);
    return fallbackById.get(id);
  }

  return normalizeProductRow((data ?? {}) as ProductRow) ?? fallbackById.get(id);
};
