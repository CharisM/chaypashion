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
  { id: 1,  img: "/D1.jpg",  name: "Classic Floral Dress",      price: 899,  category: "Dress", description: "A timeless floral dress perfect for casual outings and summer days.",                sizes: ["XS","S","M","L","XL"] },
  { id: 2,  img: "/D2.jpg",  name: "Elegant Wrap Dress",        price: 1099, category: "Dress", description: "A flattering wrap-style dress that suits both day and evening wear.",              sizes: ["XS","S","M","L","XL"] },
  { id: 3,  img: "/D3.jpg",  name: "Boho Maxi Dress",           price: 1199, category: "Dress", description: "Flowy bohemian maxi dress with intricate patterns for a free-spirited look.",      sizes: ["S","M","L","XL"] },
  { id: 4,  img: "/D4.jpg",  name: "Mini Sundress",             price: 799,  category: "Dress", description: "Light and breezy mini sundress ideal for warm weather and beach trips.",           sizes: ["XS","S","M","L"] },
  { id: 5,  img: "/D5.jpg",  name: "Ruffle Hem Dress",          price: 949,  category: "Dress", description: "Charming ruffle hem dress with a feminine silhouette perfect for any occasion.",   sizes: ["XS","S","M","L","XL"] },
  { id: 6,  img: "/D6.jpg",  name: "Off-Shoulder Dress",        price: 1049, category: "Dress", description: "Trendy off-shoulder dress that highlights your neckline with effortless style.",    sizes: ["XS","S","M","L"] },
  { id: 7,  img: "/D7.jpg",  name: "Flowy Chiffon Dress",       price: 1149, category: "Dress", description: "Lightweight chiffon dress that moves beautifully and keeps you cool all day.",     sizes: ["S","M","L","XL"] },
  { id: 8,  img: "/D8.jpg",  name: "Bodycon Midi Dress",        price: 1299, category: "Dress", description: "Sleek bodycon midi dress that hugs your curves for a confident, polished look.",   sizes: ["XS","S","M","L","XL"] },
  { id: 9,  img: "/D9.jpg",  name: "Linen Shirt Dress",         price: 899,  category: "Dress", description: "Casual linen shirt dress perfect for relaxed days out or weekend getaways.",       sizes: ["XS","S","M","L","XL"] },
  { id: 10, img: "/D10.jpg", name: "Printed Wrap Midi Dress",   price: 1099, category: "Dress", description: "Vibrant printed wrap midi dress that flatters all body types with ease.",          sizes: ["S","M","L","XL"] },
  { id: 11, img: "/WD1.jpg", name: "Fossil Townsman Watch",      price: 4999, category: "Watch", description: "Elegant rose gold Fossil chronograph with a mother-of-pearl dial and crystal bezel.", sizes: ["One Size"] },
  { id: 12, img: "/WD2.jpg", name: "Fossil Neutra Chronograph", price: 5499, category: "Watch", description: "Two-tone gold and silver Fossil watch with a crystal-paved bezel and light blue dial.",  sizes: ["One Size"] },
  { id: 13, img: "/WD3.jpg", name: "Fossil Carlie Mini Watch",  price: 3999, category: "Watch", description: "Sparkling gold Fossil Carlie with crystal-encrusted bezel and champagne dial.",        sizes: ["One Size"] },
  { id: 14, img: "/WD4.jpg", name: "Fossil Gen 6 Smartwatch",   price: 8999, category: "Watch", description: "Luxurious gold Fossil Gen 6 smartwatch with Roman numerals and AMOLED display.",      sizes: ["One Size"] },
  { id: 15, img: "/W1.jpg",  name: "Fossil Minimalist Watch",   price: 3499, category: "Watch", description: "Clean and minimal Fossil watch with a slim profile and leather strap.",              sizes: ["One Size"] },
  { id: 16, img: "/W2.jpg",  name: "Fossil Sport Watch",        price: 4299, category: "Watch", description: "Bold Fossil sport watch with a stainless steel case and silicone band.",             sizes: ["One Size"] },
  { id: 17, img: "/W3.jpg",  name: "Fossil Heritage Watch",     price: 5999, category: "Watch", description: "Classic Fossil heritage watch with a vintage-inspired dial and leather strap.",     sizes: ["One Size"] },
  { id: 18, img: "/W4.jpg",  name: "Fossil Rose Gold Watch",    price: 4799, category: "Watch", description: "Elegant rose gold Fossil watch with a mesh bracelet and sunray dial.",             sizes: ["One Size"] },
  { id: 19, img: "/W5.jpg",  name: "Fossil Hybrid Smartwatch",  price: 6499, category: "Watch", description: "Fossil hybrid smartwatch combining classic analog looks with smart notifications.",  sizes: ["One Size"] },
  { id: 20, img: "/W6.jpg",  name: "Fossil Commuter Watch",     price: 3999, category: "Watch", description: "Versatile Fossil commuter watch with a clean dial and stainless steel bracelet.",   sizes: ["One Size"] },
  { id: 21, img: "/W7.jpg",  name: "Fossil Scarlette Watch",    price: 4499, category: "Watch", description: "Feminine Fossil Scarlette with a crystal-set case and three-hand movement.",        sizes: ["One Size"] },
  { id: 22, img: "/W8.jpg",  name: "Fossil Nate Chronograph",   price: 5299, category: "Watch", description: "Bold Fossil Nate chronograph with an oversized case and tachymeter bezel.",         sizes: ["One Size"] },
  { id: 23, img: "/W9.jpg",  name: "Fossil Jacqueline Watch",   price: 4199, category: "Watch", description: "Graceful Fossil Jacqueline with a mother-of-pearl dial and slim bracelet.",         sizes: ["One Size"] },
  { id: 24, img: "/W10.jpg", name: "Fossil Grant Watch",        price: 4899, category: "Watch", description: "Sophisticated Fossil Grant with a chronograph function and leather strap.",         sizes: ["One Size"] },
  { id: 25, img: "/SCRUB1.jpg", name: "Herborist Brightening Scrub",  price: 699, category: "Herborist Scrub", description: "Herborist brightening scrub that gently exfoliates and evens skin tone.",                sizes: ["50ml","100ml","200ml"] },
  { id: 26, img: "/SCRUB2.jpg", name: "Herborist Deep Clean Scrub",   price: 749, category: "Herborist Scrub", description: "Deep cleansing Herborist scrub that removes impurities and unclogs pores.",             sizes: ["50ml","100ml","200ml"] },
  { id: 27, img: "/SCRUB3.jpg", name: "Herborist Herbal Body Scrub",  price: 849, category: "Herborist Scrub", description: "Nourishing herbal body scrub infused with traditional Chinese botanical extracts.",      sizes: ["100ml","200ml"] },
];
