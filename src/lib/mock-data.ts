export type Category = "women" | "men" | "kids" | "ethnic" | "footwear" | "accessories";

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: Category;
  subcategory: string;
  price: number;
  mrp: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviewCount: number;
  description: string;
  material: string;
  tags: string[];
  stock: number;
  trending?: boolean;
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PRODUCTS: Product[] = [
  {
    id: "p1", slug: "linen-wrap-dress-sand", title: "Linen Wrap Dress", brand: "Maison Aria",
    category: "women", subcategory: "Dresses", price: 2499, mrp: 3999,
    images: [img("1595777457583-95e059d581b8"), img("1490481651871-ab68de25d43d")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Sand", hex: "#d9c4a7" }, { name: "Ivory", hex: "#f4ecdd" }],
    rating: 4.6, reviewCount: 128,
    description: "A softly draped wrap dress in breathable European linen. Cut to skim the body with an adjustable tie waist.",
    material: "100% European Linen", tags: ["summer", "linen", "dress"], stock: 24, trending: true,
  },
  {
    id: "p2", slug: "oversized-cotton-shirt-white", title: "Oversized Poplin Shirt", brand: "Studio Nord",
    category: "women", subcategory: "Shirts", price: 1899, mrp: 2799,
    images: [img("1521572163474-6864f9cf17ab"), img("1594633312681-425c7b97ccd1")],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "White", hex: "#ffffff" }, { name: "Sky", hex: "#c8d9e6" }],
    rating: 4.4, reviewCount: 89,
    description: "Crisp cotton poplin shirt with a relaxed, oversized silhouette and mother-of-pearl buttons.",
    material: "100% Organic Cotton", tags: ["shirt", "cotton", "essential"], stock: 40,
  },
  {
    id: "p3", slug: "high-rise-wide-leg-jeans", title: "High-Rise Wide Leg Jeans", brand: "North Denim",
    category: "women", subcategory: "Jeans", price: 2999, mrp: 4499,
    images: [img("1541099649105-f69ad21f3246"), img("1584370848010-d7fe6bc767ec")],
    sizes: ["24", "26", "28", "30", "32"],
    colors: [{ name: "Indigo", hex: "#2a3a5a" }, { name: "Washed", hex: "#7d8ba5" }],
    rating: 4.7, reviewCount: 210,
    description: "Rigid Japanese selvedge denim with a high rise and a clean, floor-grazing wide leg.",
    material: "98% Cotton, 2% Elastane", tags: ["denim", "jeans"], stock: 30, trending: true,
  },
  {
    id: "p4", slug: "cashmere-crew-oat", title: "Cashmere Crew Sweater", brand: "Maison Aria",
    category: "women", subcategory: "Knitwear", price: 5499, mrp: 7999,
    images: [img("1434389677669-e08b4cac3105"), img("1515886657613-9f3515b0c78f")],
    sizes: ["XS", "S", "M", "L"],
    colors: [{ name: "Oat", hex: "#d6c8ac" }, { name: "Charcoal", hex: "#3a3a3a" }],
    rating: 4.8, reviewCount: 174,
    description: "Pure Mongolian cashmere in a timeless crew neck. Buttery soft, ribbed at the cuffs and hem.",
    material: "100% Grade-A Cashmere", tags: ["knit", "cashmere", "winter"], stock: 15,
  },
  {
    id: "p5", slug: "tailored-wool-blazer-espresso", title: "Tailored Wool Blazer", brand: "Studio Nord",
    category: "women", subcategory: "Outerwear", price: 6499, mrp: 8999,
    images: [img("1591047139829-d91aecb6caea"), img("1548624313-0396c75e4b1a")],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Espresso", hex: "#3d2b1f" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.5, reviewCount: 62,
    description: "Single-breasted blazer in Italian virgin wool with a sharp shoulder and soft canvas.",
    material: "Italian Virgin Wool", tags: ["blazer", "wool"], stock: 12, trending: true,
  },
  {
    id: "p6", slug: "silk-slip-skirt-bronze", title: "Bias Silk Slip Skirt", brand: "Aurelie",
    category: "women", subcategory: "Skirts", price: 3299, mrp: 4999,
    images: [img("1583496661160-fb5886a0aaaa"), img("1509631179647-0177331693ae")],
    sizes: ["XS", "S", "M", "L"],
    colors: [{ name: "Bronze", hex: "#8a6a3e" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.3, reviewCount: 44,
    description: "Fluid bias-cut silk slip skirt with a delicate hem. Falls beautifully.",
    material: "100% Mulberry Silk", tags: ["silk", "skirt"], stock: 20,
  },
  {
    id: "p7", slug: "linen-shirt-mens-sage", title: "Relaxed Linen Shirt", brand: "Coastline",
    category: "men", subcategory: "Shirts", price: 2199, mrp: 3299,
    images: [img("1596755094514-f87e34085b2c"), img("1602810318383-e386cc2a3ccf")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Sage", hex: "#a8b39a" }, { name: "White", hex: "#ffffff" }],
    rating: 4.5, reviewCount: 92,
    description: "Airy linen shirt with a soft camp collar and a relaxed body.",
    material: "100% Linen", tags: ["linen", "shirt"], stock: 35, trending: true,
  },
  {
    id: "p8", slug: "slim-chinos-stone", title: "Slim Chinos", brand: "Coastline",
    category: "men", subcategory: "Trousers", price: 2499, mrp: 3499,
    images: [img("1624378439575-d8705ad7ae80"), img("1594938298603-c8148c4dae35")],
    sizes: ["30", "32", "34", "36", "38"],
    colors: [{ name: "Stone", hex: "#c7b89b" }, { name: "Navy", hex: "#1e2a44" }],
    rating: 4.4, reviewCount: 156,
    description: "Garment-washed cotton chinos with a modern slim leg and clean finish.",
    material: "98% Cotton, 2% Elastane", tags: ["chinos"], stock: 50,
  },
  {
    id: "p9", slug: "merino-crew-mens-navy", title: "Merino Crew Sweater", brand: "North Fjord",
    category: "men", subcategory: "Knitwear", price: 3999, mrp: 5499,
    images: [img("1620799140408-edc6dcb6d633"), img("1600185365483-26d7a4cc7519")],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Navy", hex: "#1e2a44" }, { name: "Camel", hex: "#c69f6c" }],
    rating: 4.7, reviewCount: 118,
    description: "Fine-gauge Australian merino wool crew, breathable and temperature-regulating.",
    material: "100% Merino Wool", tags: ["knit", "wool"], stock: 22,
  },
  {
    id: "p10", slug: "wool-overcoat-camel", title: "Longline Wool Overcoat", brand: "Studio Nord",
    category: "men", subcategory: "Outerwear", price: 8999, mrp: 12999,
    images: [img("1544022613-e87ca75a784a"), img("1591047139756-eb1f8bcc1e75")],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Camel", hex: "#c69f6c" }, { name: "Charcoal", hex: "#3a3a3a" }],
    rating: 4.8, reviewCount: 74,
    description: "Notched-lapel overcoat in a wool-cashmere blend, fully lined for winter warmth.",
    material: "80% Wool, 20% Cashmere", tags: ["coat", "wool"], stock: 8, trending: true,
  },
  {
    id: "p11", slug: "raw-denim-mens", title: "Raw Selvedge Denim", brand: "North Denim",
    category: "men", subcategory: "Jeans", price: 3499, mrp: 4999,
    images: [img("1542272604-787c3835535d"), img("1473966968600-fa801b56a76a")],
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Raw Indigo", hex: "#1e2a4a" }],
    rating: 4.6, reviewCount: 88,
    description: "13.5oz Japanese selvedge denim, unwashed and built to wear in beautifully.",
    material: "100% Cotton", tags: ["denim"], stock: 26,
  },
  {
    id: "p12", slug: "kids-cotton-tee-set", title: "Organic Cotton Tee Set", brand: "Little Nord",
    category: "kids", subcategory: "Sets", price: 999, mrp: 1499,
    images: [img("1519689680058-324335c77eba"), img("1471286174890-9c112ffca5b4")],
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"],
    colors: [{ name: "Cream", hex: "#f4ecdd" }, { name: "Rust", hex: "#b56342" }],
    rating: 4.5, reviewCount: 41,
    description: "Two-piece set in GOTS-certified organic cotton, made for play.",
    material: "100% Organic Cotton", tags: ["kids", "set"], stock: 60,
  },
  {
    id: "p13", slug: "kids-linen-dress-pink", title: "Girls Linen Sundress", brand: "Little Nord",
    category: "kids", subcategory: "Dresses", price: 1299, mrp: 1899,
    images: [img("1518831959646-742c3a14ebf7"), img("1596870230751-ebdfce98ec42")],
    sizes: ["2Y", "4Y", "6Y", "8Y"],
    colors: [{ name: "Blush", hex: "#e8bfbf" }],
    rating: 4.7, reviewCount: 33,
    description: "Breezy linen sundress with wooden buttons and pocket detail.",
    material: "100% Linen", tags: ["kids", "dress"], stock: 25,
  },
  {
    id: "p14", slug: "banarasi-silk-saree", title: "Banarasi Silk Saree", brand: "Aarna",
    category: "ethnic", subcategory: "Sarees", price: 7999, mrp: 11999,
    images: [img("1610030469668-8e4dcd5cf7fd"), img("1596704017254-9b121068fb31")],
    sizes: ["Free"],
    colors: [{ name: "Ruby", hex: "#8a1e2b" }, { name: "Emerald", hex: "#1e5a44" }],
    rating: 4.8, reviewCount: 96,
    description: "Handwoven Banarasi silk saree with pure zari motifs. Comes with unstitched blouse piece.",
    material: "Pure Silk with Zari", tags: ["saree", "silk", "ethnic"], stock: 10, trending: true,
  },
  {
    id: "p15", slug: "cotton-kurta-set-men", title: "Cotton Kurta Set", brand: "Aarna",
    category: "ethnic", subcategory: "Kurtas", price: 2799, mrp: 3999,
    images: [img("1621786030484-4c855eed6974"), img("1622519407650-3df9883f76a5")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Ivory", hex: "#f4ecdd" }, { name: "Indigo", hex: "#2a3a5a" }],
    rating: 4.5, reviewCount: 67,
    description: "Hand-block printed cotton kurta with matching pyjama.",
    material: "100% Cotton", tags: ["kurta", "ethnic"], stock: 30,
  },
  {
    id: "p16", slug: "anarkali-suit-emerald", title: "Anarkali Suit Set", brand: "Aarna",
    category: "ethnic", subcategory: "Suits", price: 5499, mrp: 7999,
    images: [img("1583391733956-6c78276477e2"), img("1594736797933-d0a01ba2fe65")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Emerald", hex: "#1e5a44" }, { name: "Wine", hex: "#5a1e2b" }],
    rating: 4.6, reviewCount: 52,
    description: "Floor-length anarkali with intricate thread embroidery, paired with churidar and dupatta.",
    material: "Georgette, Silk Lining", tags: ["anarkali", "ethnic"], stock: 14,
  },
  {
    id: "p17", slug: "leather-loafers-cognac", title: "Leather Penny Loafers", brand: "Atelier Paso",
    category: "footwear", subcategory: "Loafers", price: 4999, mrp: 6999,
    images: [img("1533867617858-e7b97e060509"), img("1638247025967-b4e38f787b76")],
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: [{ name: "Cognac", hex: "#8a5a2e" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.7, reviewCount: 143,
    description: "Hand-finished full-grain leather loafers with a leather sole.",
    material: "Full-Grain Leather", tags: ["shoes", "leather"], stock: 20,
  },
  {
    id: "p18", slug: "white-leather-sneakers", title: "Minimal Leather Sneakers", brand: "Atelier Paso",
    category: "footwear", subcategory: "Sneakers", price: 3999, mrp: 5499,
    images: [img("1542291026-7eec264c27ff"), img("1600185365926-3a2ce3cdb9eb")],
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: [{ name: "White", hex: "#ffffff" }, { name: "Bone", hex: "#e8e0d0" }],
    rating: 4.5, reviewCount: 218,
    description: "Clean-line leather sneakers on a cupsole. Everyday quiet luxury.",
    material: "Nappa Leather", tags: ["shoes", "sneakers"], stock: 45, trending: true,
  },
  {
    id: "p19", slug: "suede-ankle-boots", title: "Suede Ankle Boots", brand: "Atelier Paso",
    category: "footwear", subcategory: "Boots", price: 5499, mrp: 7499,
    images: [img("1608256246200-53e635b5b65f"), img("1543163521-1bf539c55dd2")],
    sizes: ["5", "6", "7", "8", "9"],
    colors: [{ name: "Taupe", hex: "#8a7a6a" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.6, reviewCount: 71,
    description: "Sculpted-heel ankle boots in Italian suede.",
    material: "Italian Suede", tags: ["boots"], stock: 16,
  },
  {
    id: "p20", slug: "leather-tote-camel", title: "Structured Leather Tote", brand: "Casa Loro",
    category: "accessories", subcategory: "Bags", price: 6499, mrp: 8999,
    images: [img("1584917865442-de89df76afd3"), img("1590874103328-eac38a683ce7")],
    sizes: ["One"],
    colors: [{ name: "Camel", hex: "#c69f6c" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.7, reviewCount: 165,
    description: "Structured tote in vegetable-tanned leather with a suede-lined interior.",
    material: "Vegetable-Tanned Leather", tags: ["bag", "leather"], stock: 18, trending: true,
  },
  {
    id: "p21", slug: "silk-scarf-print", title: "Printed Silk Scarf", brand: "Aurelie",
    category: "accessories", subcategory: "Scarves", price: 1899, mrp: 2799,
    images: [img("1601924994987-69e26d50dc26"), img("1601925260368-ae2f83cf8b7f")],
    sizes: ["Square 90cm"],
    colors: [{ name: "Multi", hex: "#c8a06e" }],
    rating: 4.4, reviewCount: 38,
    description: "Hand-rolled silk twill scarf with an archive floral print.",
    material: "100% Silk Twill", tags: ["scarf", "silk"], stock: 30,
  },
  {
    id: "p22", slug: "leather-belt-tan", title: "Bridle Leather Belt", brand: "Casa Loro",
    category: "accessories", subcategory: "Belts", price: 1499, mrp: 1999,
    images: [img("1553062407-98eeb64c6a62"), img("1624222247344-550fb60ae8f7")],
    sizes: ["30", "32", "34", "36", "38"],
    colors: [{ name: "Tan", hex: "#a87a4a" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.5, reviewCount: 55,
    description: "Solid-brass buckle on English bridle leather. Ages beautifully.",
    material: "English Bridle Leather", tags: ["belt", "leather"], stock: 40,
  },
  {
    id: "p23", slug: "gold-hoop-earrings", title: "Slim Gold Hoops", brand: "Aurelie",
    category: "accessories", subcategory: "Jewellery", price: 2299, mrp: 2999,
    images: [img("1611085583191-a3b181a88401"), img("1599643477877-530eb83abc8e")],
    sizes: ["25mm", "35mm"],
    colors: [{ name: "Gold", hex: "#d4af37" }],
    rating: 4.6, reviewCount: 102,
    description: "18k gold-vermeil hoops with a soft brushed finish.",
    material: "18k Gold Vermeil on Sterling", tags: ["jewellery"], stock: 50,
  },
  {
    id: "p24", slug: "cashmere-scarf-charcoal", title: "Cashmere Scarf", brand: "Maison Aria",
    category: "accessories", subcategory: "Scarves", price: 3499, mrp: 4999,
    images: [img("1520903920243-00d872a2d1c9"), img("1544441893-675973e31985")],
    sizes: ["One"],
    colors: [{ name: "Charcoal", hex: "#3a3a3a" }, { name: "Oat", hex: "#d6c8ac" }],
    rating: 4.7, reviewCount: 61,
    description: "Woven Mongolian cashmere scarf with a soft fringed edge.",
    material: "100% Cashmere", tags: ["scarf", "cashmere"], stock: 22,
  },
  {
    id: "p25", slug: "trench-coat-women-stone", title: "Classic Trench Coat", brand: "Studio Nord",
    category: "women", subcategory: "Outerwear", price: 7499, mrp: 10999,
    images: [img("1548624313-0396c75e4b1a"), img("1591047139756-eb1f8bcc1e75")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Stone", hex: "#c7b89b" }, { name: "Black", hex: "#0a0a0a" }],
    rating: 4.6, reviewCount: 84,
    description: "Water-repellent cotton gabardine trench with double-breasted closure.",
    material: "Cotton Gabardine", tags: ["trench", "coat"], stock: 12,
  },
  {
    id: "p26", slug: "leather-crossbody-black", title: "Leather Crossbody Bag", brand: "Casa Loro",
    category: "accessories", subcategory: "Bags", price: 4499, mrp: 5999,
    images: [img("1548036328-c9fa89d128fa"), img("1590874103328-eac38a683ce7")],
    sizes: ["One"],
    colors: [{ name: "Black", hex: "#0a0a0a" }, { name: "Cognac", hex: "#8a5a2e" }],
    rating: 4.5, reviewCount: 79,
    description: "Compact crossbody in soft nappa with an adjustable strap.",
    material: "Nappa Leather", tags: ["bag"], stock: 28,
  },
  {
    id: "p27", slug: "boys-denim-jacket", title: "Boys Denim Jacket", brand: "Little Nord",
    category: "kids", subcategory: "Outerwear", price: 1799, mrp: 2499,
    images: [img("1596870230751-ebdfce98ec42"), img("1519689680058-324335c77eba")],
    sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"],
    colors: [{ name: "Washed Indigo", hex: "#6a7a95" }],
    rating: 4.4, reviewCount: 27,
    description: "Classic trucker jacket sized for kids, in soft washed denim.",
    material: "100% Cotton Denim", tags: ["kids", "denim"], stock: 30,
  },
  {
    id: "p28", slug: "wool-scarf-tartan", title: "Tartan Wool Scarf", brand: "North Fjord",
    category: "accessories", subcategory: "Scarves", price: 1699, mrp: 2299,
    images: [img("1520903920243-00d872a2d1c9"), img("1544441893-675973e31985")],
    sizes: ["One"],
    colors: [{ name: "Green Tartan", hex: "#1e5a44" }, { name: "Red Tartan", hex: "#8a1e2b" }],
    rating: 4.3, reviewCount: 32,
    description: "Brushed lambswool scarf woven in a classic tartan.",
    material: "100% Lambswool", tags: ["scarf", "wool"], stock: 25,
  },
  {
    id: "p29", slug: "cotton-shorts-mens", title: "Cotton Twill Shorts", brand: "Coastline",
    category: "men", subcategory: "Shorts", price: 1499, mrp: 1999,
    images: [img("1591195853828-11db59a44f6b"), img("1624378439575-d8705ad7ae80")],
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Khaki", hex: "#8a7a4a" }, { name: "Olive", hex: "#5a6a3a" }],
    rating: 4.4, reviewCount: 61,
    description: "Garment-dyed twill shorts with a mid rise and clean 7\" inseam.",
    material: "100% Cotton", tags: ["shorts"], stock: 55,
  },
  {
    id: "p30", slug: "midi-tea-dress-floral", title: "Midi Tea Dress", brand: "Aurelie",
    category: "women", subcategory: "Dresses", price: 2799, mrp: 3999,
    images: [img("1572804013309-59a88b7e92f1"), img("1490481651871-ab68de25d43d")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Rose Floral", hex: "#c8a0a0" }],
    rating: 4.5, reviewCount: 118,
    description: "Softly gathered midi in floaty viscose with a delicate floral print.",
    material: "LENZING™ ECOVERO™ Viscose", tags: ["dress", "floral"], stock: 20,
  },
];

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "women", label: "Women" },
  { slug: "men", label: "Men" },
  { slug: "kids", label: "Kids" },
  { slug: "ethnic", label: "Ethnic" },
  { slug: "footwear", label: "Footwear" },
  { slug: "accessories", label: "Accessories" },
];

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function relatedProducts(product: Product, n = 4) {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, n);
}

export function trendingProducts() {
  return PRODUCTS.filter((p) => p.trending);
}

export function discountPct(p: Product) {
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}

export const MOCK_REVIEWS = [
  { id: "r1", name: "Priya S.", rating: 5, date: "2 weeks ago", comment: "Fabric feels luxurious, and the fit runs true to size. Absolutely in love." },
  { id: "r2", name: "Aditya M.", rating: 4, date: "1 month ago", comment: "Great quality for the price. Colour is very close to the pictures." },
  { id: "r3", name: "Neha K.", rating: 5, date: "3 weeks ago", comment: "Third piece from this brand — quality is consistently excellent." },
];

export type OrderStatus = "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export interface MockOrder {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: { productId: string; size: string; qty: number; price: number }[];
  address: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-10284",
    date: "2026-07-12",
    status: "Delivered" as const,
    total: 5498,
    items: [
      { productId: "p1", size: "M", qty: 1, price: 2499 },
      { productId: "p18", size: "8", qty: 1, price: 2999 },
    ],
    address: "Priya Sharma, 12 Rosewood Lane, Bandra West, Mumbai 400050",
  },
  {
    id: "ORD-10312",
    date: "2026-07-18",
    status: "Shipped" as const,
    total: 2799,
    items: [{ productId: "p30", size: "S", qty: 1, price: 2799 }],
    address: "Priya Sharma, 12 Rosewood Lane, Bandra West, Mumbai 400050",
  },
  {
    id: "ORD-10339",
    date: "2026-07-20",
    status: "Placed" as const,
    total: 6498,
    items: [
      { productId: "p4", size: "S", qty: 1, price: 5499 },
      { productId: "p22", size: "32", qty: 1, price: 999 },
    ],
    address: "Priya Sharma, 12 Rosewood Lane, Bandra West, Mumbai 400050",
  },
];

export const MOCK_USER = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
};

export const MOCK_ADDRESSES = [
  {
    id: "a1", name: "Priya Sharma", phone: "+91 98765 43210",
    line: "12 Rosewood Lane, Apt 4B", city: "Mumbai", state: "Maharashtra",
    pincode: "400050", landmark: "Near Linking Road", isDefault: true,
  },
  {
    id: "a2", name: "Priya Sharma (Office)", phone: "+91 98765 43210",
    line: "One BKC, Level 14", city: "Mumbai", state: "Maharashtra",
    pincode: "400051", landmark: "Bandra Kurla Complex", isDefault: false,
  },
];
