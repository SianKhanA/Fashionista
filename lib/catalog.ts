export type Category = "Saree" | "Kameez" | "Three Piece" | "Kurti" | "Accessories";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  material: string;
  occasion: string;
  colour: string;
  sizes: string[];
  images: string[];
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  details: string[];
};

type BaseProduct = Omit<Product, "id" | "slug" | "colour" | "price" | "reviews"> & {
  key: string;
  basePrice: number;
  colours: readonly string[];
};

const bases: BaseProduct[] = [
  { key:"nokshi-jamdani",name:"Nokshi Jamdani Saree",category:"Saree",basePrice:6850,material:"Cotton Jamdani",occasion:"Festive",colours:["Deep Maroon","Ivory","Indigo","Rose Pink","Olive","Black"],sizes:["Free Size"],images:["/products/saree-1.jpg","/products/saree-2.jpg","/products/saree-3.jpg"],rating:4.9,badge:"Bestseller",description:"A light, graceful Jamdani saree woven with heritage-inspired geometric motifs.",details:["12 haat saree","Unstitched blouse piece included","Handloom weave","Dry clean recommended"]},
  { key:"shonali-katan",name:"Shonali Katan Saree",category:"Saree",basePrice:7900,material:"Silk Blend",occasion:"Wedding",colours:["Antique Gold","Ruby","Emerald","Midnight Blue","Plum","Ivory"],sizes:["Free Size"],images:["/products/saree-4.jpg","/products/saree-5.jpg","/products/saree-6.jpg"],rating:4.8,badge:"Occasion Edit",description:"A lustrous Katan saree designed for weddings, receptions and joyful evenings.",details:["12 haat saree","Matching blouse piece","Soft silk-blend finish","Dry clean only"]},
  { key:"dhakai-muslin",name:"Dhakai Muslin Saree",category:"Saree",basePrice:5450,material:"Muslin",occasion:"Daywear",colours:["Cloud White","Powder Blue","Dusty Rose","Sage","Lilac","Sand"],sizes:["Free Size"],images:["/products/saree-7.jpg","/products/saree-2.jpg","/products/saree-1.jpg"],rating:4.7,description:"Airy muslin with delicate woven detail for effortless warm-weather dressing.",details:["12 haat saree","Feather-light drape","Blouse piece included","Gentle hand wash"]},
  { key:"meghdoot-kameez",name:"Meghdoot Muslin Kameez",category:"Kameez",basePrice:3450,material:"Muslin",occasion:"Everyday",colours:["Coral","Sky Blue","Mint","Lilac","Ivory","Navy"],sizes:["S","M","L","XL","XXL"],images:["/products/muslin-kameez.jpg","/products/party-kameez.jpg","/products/kurti.jpg"],rating:4.8,badge:"New",description:"An embroidered muslin kameez set with a soft, breathable finish.",details:["Kameez and dupatta","Lined body","Three-quarter sleeve","Model wears size M"]},
  { key:"nilanjona-kameez",name:"Nilanjona Embroidered Kameez",category:"Kameez",basePrice:3950,material:"Cotton",occasion:"Festive",colours:["Royal Blue","Teal","Wine","Black","Rust","Bottle Green"],sizes:["S","M","L","XL","XXL"],images:["/products/party-kameez.jpg","/products/muslin-kameez.jpg","/products/kurti.jpg"],rating:4.7,description:"Rich tonal embroidery meets an easy silhouette for intimate celebrations.",details:["Kameez and dupatta","Cotton lining","Side pockets","Model wears size M"]},
  { key:"bokul-kameez",name:"Bokul Block-Print Kameez",category:"Kameez",basePrice:2850,material:"Cotton",occasion:"Everyday",colours:["Marigold","Indigo","Rose","Sage","Terracotta","Charcoal"],sizes:["S","M","L","XL","XXL"],images:["/products/kurti.jpg","/products/muslin-kameez.jpg","/products/party-kameez.jpg"],rating:4.6,description:"Hand-block-inspired florals on breathable cotton for everyday comfort.",details:["Kameez only","Side pockets","Relaxed cut","Machine wash cold"]},
  { key:"gulbahar-three-piece",name:"Gulbahar Three-Piece",category:"Three Piece",basePrice:4250,material:"Organza Blend",occasion:"Festive",colours:["Blush","Pistachio","Lilac","Champagne","Aqua","Peach"],sizes:["S","M","L","XL","XXL"],images:["/products/muslin-kameez.jpg","/products/party-kameez.jpg","/products/kurti.jpg"],rating:4.9,badge:"Bestseller",description:"A feminine three-piece set with floral threadwork and a fluid dupatta.",details:["Kameez, trouser and dupatta","Partially lined","Straight fit","Model wears size M"]},
  { key:"chandni-three-piece",name:"Chandni Evening Three-Piece",category:"Three Piece",basePrice:4950,material:"Chiffon Blend",occasion:"Party",colours:["Midnight","Silver","Wine","Emerald","Black","Mauve"],sizes:["S","M","L","XL"],images:["/products/party-kameez.jpg","/products/muslin-kameez.jpg","/products/kurti.jpg"],rating:4.8,description:"Soft shimmer and fine embroidery for dinners, daawats and festive nights.",details:["Kameez, trouser and dupatta","Fully lined body","Hand-finished details","Dry clean recommended"]},
  { key:"shiuli-three-piece",name:"Shiuli Cotton Three-Piece",category:"Three Piece",basePrice:3150,material:"Cotton",occasion:"Daywear",colours:["Ivory","Rose","Blue","Sage","Mustard","Plum"],sizes:["S","M","L","XL","XXL"],images:["/products/muslin-kameez.jpg","/products/kurti.jpg","/products/party-kameez.jpg"],rating:4.6,description:"Soft cotton separates created for workdays, visits and unhurried weekends.",details:["Kameez, trouser and dupatta","Breathable cotton","Side pockets","Machine wash cold"]},
  { key:"alpona-kurti",name:"Alpona Everyday Kurti",category:"Kurti",basePrice:1850,material:"Cotton",occasion:"Everyday",colours:["Forest","Maroon","Indigo","Ochre","Black","Teal"],sizes:["S","M","L","XL","XXL"],images:["/products/kurti.jpg","/products/muslin-kameez.jpg","/products/party-kameez.jpg"],rating:4.7,badge:"Everyday Favourite",description:"A comfortable cotton kurti finished with delicate tonal motifs.",details:["Kurti only","Relaxed fit","Side pockets","Machine wash cold"]},
  { key:"nodi-kurti",name:"Nodi A-Line Kurti",category:"Kurti",basePrice:2150,material:"Linen Blend",occasion:"Workwear",colours:["Ocean","Sand","Rosewood","Sage","Ivory","Charcoal"],sizes:["S","M","L","XL","XXL"],images:["/products/kurti.jpg","/products/party-kameez.jpg","/products/muslin-kameez.jpg"],rating:4.6,description:"Clean lines and an airy linen blend make this an easy workday staple.",details:["Kurti only","A-line silhouette","Side pockets","Model wears size M"]},
  { key:"kantha-tote",name:"Kantha Stitch Tote",category:"Accessories",basePrice:1450,material:"Cotton Canvas",occasion:"Everyday",colours:["Maroon","Indigo","Mustard","Black","Rose","Olive"],sizes:["One Size"],images:["/products/jewellery.jpg","/products/saree-3.jpg","/products/saree-6.jpg"],rating:4.7,description:"A roomy canvas tote highlighted with colourful Kantha-inspired stitchwork.",details:["Zip closure","Inner pocket","Cotton canvas","Spot clean only"]},
  { key:"nakshi-jhumka",name:"Nakshi Jhumka",category:"Accessories",basePrice:1250,material:"Brass",occasion:"Festive",colours:["Antique Gold","Silver","Rose Gold","Oxidised","Pearl","Copper"],sizes:["One Size"],images:["/products/jewellery.jpg","/products/saree-4.jpg","/products/saree-1.jpg"],rating:4.8,badge:"Gift Pick",description:"Statement jhumkas with an antique finish, designed to complement deshi silhouettes.",details:["Pair of earrings","Nickel-free posts","Lightweight","Keep away from perfume and water"]},
  { key:"reshmi-dupatta",name:"Reshmi Woven Dupatta",category:"Accessories",basePrice:1650,material:"Silk Blend",occasion:"Festive",colours:["Ruby","Emerald","Ivory","Midnight","Rose","Gold"],sizes:["One Size"],images:["/products/saree-5.jpg","/products/saree-2.jpg","/products/saree-7.jpg"],rating:4.7,description:"A fluid woven dupatta with a softly luminous border.",details:["2.5 metre length","Finished edges","Silk blend","Dry clean recommended"]},
  { key:"jamdani-scarf",name:"Jamdani Motif Scarf",category:"Accessories",basePrice:1150,material:"Cotton",occasion:"Everyday",colours:["Ivory","Indigo","Rose","Black","Sage","Maroon"],sizes:["One Size"],images:["/products/saree-2.jpg","/products/saree-1.jpg","/products/saree-5.jpg"],rating:4.6,description:"A light cotton scarf with tiny Jamdani-inspired motifs.",details:["70 × 180 cm","Soft cotton","Finished edges","Gentle hand wash"]},
  { key:"purnima-anarkali",name:"Purnima Anarkali Kameez",category:"Kameez",basePrice:5650,material:"Silk Blend",occasion:"Wedding",colours:["Wine","Emerald","Midnight","Champagne","Plum","Ruby"],sizes:["S","M","L","XL"],images:["/products/party-kameez.jpg","/products/muslin-kameez.jpg","/products/saree-4.jpg"],rating:4.9,badge:"Limited",description:"A sweeping Anarkali silhouette with refined embroidery and a celebration-ready drape.",details:["Kameez and dupatta","Full lining","Flared silhouette","Dry clean only"]},
];

const priceSteps = [0, 150, -100, 250, 80, 320];
export const products: Product[] = bases.flatMap((base) =>
  base.colours.map((colour, index) => ({
    id: `${base.key}-${index + 1}`,
    slug: `${base.key}-${colour.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: `${base.name} — ${colour}`,
    category: base.category,
    price: base.basePrice + priceSteps[index],
    compareAt: index === 2 ? base.basePrice + 550 : undefined,
    material: base.material,
    occasion: base.occasion,
    colour,
    sizes: base.sizes,
    images: base.images,
    rating: base.rating,
    reviews: 18 + ((index * 17 + base.key.length) % 93),
    badge: index === 0 ? base.badge : undefined,
    description: base.description,
    details: base.details,
  })),
);

export const categories: Category[] = ["Saree","Kameez","Three Piece","Kurti","Accessories"];
export const materials = [...new Set(products.map((product) => product.material))].sort();
export const occasions = [...new Set(products.map((product) => product.occasion))].sort();
export const featuredProducts = products.filter((product) => product.badge).slice(0, 8);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", { style:"currency", currency:"BDT", maximumFractionDigits:0 }).format(amount);
}

export function calculateShipping(subtotal: number, division: string) {
  if (subtotal >= 5000) return 0;
  return division === "Dhaka" ? 80 : 130;
}
