export type Product = {
  id: number;
  img: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  { id: 1,  img: "/D1.jpg",     name: "Classic Floral Dress",   price: 899,  category: "Dress",           description: "A timeless floral dress perfect for casual outings and summer days.",                          sizes: ["XS","S","M","L","XL"] },
  { id: 2,  img: "/D2.jpg",     name: "Elegant Wrap Dress",     price: 1099, category: "Dress",           description: "A flattering wrap-style dress that suits both day and evening wear.",                        sizes: ["XS","S","M","L","XL"] },
  { id: 3,  img: "/D3.jpg",     name: "Boho Maxi Dress",        price: 1199, category: "Dress",           description: "Flowy bohemian maxi dress with intricate patterns for a free-spirited look.",                sizes: ["S","M","L","XL"] },
  { id: 4,  img: "/D4.jpg",     name: "Mini Sundress",          price: 799,  category: "Dress",           description: "Light and breezy mini sundress ideal for warm weather and beach trips.",                     sizes: ["XS","S","M","L"] },
  { id: 5,  img: "/WD1.jpg",    name: "Fossil Townsman Watch",      price: 4999, category: "Watch", description: "Elegant rose gold Fossil chronograph with a mother-of-pearl dial, crystal bezel, and three subdials.",                    sizes: ["One Size"] },
  { id: 6,  img: "/WD2.jpg",    name: "Fossil Neutra Chronograph", price: 5499, category: "Watch", description: "Two-tone gold and silver Fossil watch with a fully crystal-paved bezel, light blue dial, and chronograph subdials.",               sizes: ["One Size"] },
  { id: 7,  img: "/WD3.jpg",    name: "Fossil Carlie Mini Watch",   price: 3999, category: "Watch", description: "Sparkling gold Fossil Carlie with crystal-encrusted bezel, champagne dial, and metal link bracelet.",           sizes: ["One Size"] },
  { id: 8,  img: "/WD4.jpg",    name: "Fossil Gen 6 Smartwatch",    price: 8999, category: "Watch", description: "Luxurious gold Fossil Gen 6 smartwatch with Roman numerals, diamond markers, and AMOLED display.", sizes: ["One Size"] },
  { id: 9,  img: "/SCRUB1.jpg", name: "Herborist Brightening Scrub",   price: 699,  category: "Herborist Scrub", description: "Herborist brightening scrub that gently exfoliates and evens skin tone.",                sizes: ["50ml","100ml","200ml"] },
  { id: 10, img: "/SCRUB2.jpg", name: "Herborist Deep Clean Scrub",    price: 749,  category: "Herborist Scrub", description: "Deep cleansing Herborist scrub that removes impurities and unclogs pores.",             sizes: ["50ml","100ml","200ml"] },
  { id: 11, img: "/SCRUB3.jpg", name: "Herborist Herbal Body Scrub",   price: 849,  category: "Herborist Scrub", description: "Nourishing herbal body scrub infused with traditional Chinese botanical extracts.",      sizes: ["100ml","200ml"] },
  { id: 12, img: "/SCRUB4.jpg", name: "Herborist Glow Renewal Scrub", price: 999,  category: "Herborist Scrub", description: "Glow renewal scrub with natural enzymes for radiant and smooth skin.",                  sizes: ["50ml","100ml","200ml"] },
];
