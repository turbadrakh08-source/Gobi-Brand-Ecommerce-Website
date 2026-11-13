"use client";

import { useState } from "react";

const categories = ["BESTSELLERS", "CASHMERETECH", "COATS"];

const products = [
  {
    name: "V-Neck Cashmere Sweater",
    price: "€199",
    category: "BESTSELLERS",
    image: "/images/HomePage/NewArrivals/BestSellers/1.webp",
  },
  {
    name: "Classic Cashmere Sweater",
    price: "€189",
    category: "BESTSELLERS",
    image: "/images/HomePage/NewArrivals/BestSellers/2.webp",
  },
  {
    name: "Cashmere Turtleneck",
    price: "€229",
    category: "BESTSELLERS",
    image: "/images/HomePage/NewArrivals/BestSellers/3.webp",
  },
  {
    name: "Cashmere Cardigan",
    price: "€219",
    category: "BESTSELLERS",
    image: "/images/HomePage/NewArrivals/BestSellers/4.webp",
  },
  {
    name: "CashmereTech Light Western Jacket in Black",
    price: "€383",
    category: "CASHMERETECH",
    image: "/images/HomePage/NewArrivals/CashmereTech/1.webp",
  },
  {
    name: "CashmereTech Light Western Jacket in Olive Branch",
    price: "€383",
    category: "CASHMERETECH",
    image: "/images/HomePage/NewArrivals/CashmereTech/2.webp",
  },
  {
    name: "CashmereTech Light Western Jacket in Gustard",
    price: "€383",
    category: "CASHMERETECH",
    image: "/images/HomePage/NewArrivals/CashmereTech/3.webp",
  },
  {
    name: "CashmereTech Light Western Jacket in Stone Brown",
    price: "€383",
    category: "CASHMERETECH",
    image: "/images/HomePage/NewArrivals/CashmereTech/4.webp",
  },
  {
    name: "Cashmere Oval-Sleeve Long Coat in Black",
    price: "€1386",
    category: "COATS",
    image: "/images/HomePage/NewArrivals/Coats/1.webp",
  },
  {
    name: "Cashmere Hooded Duffle Coat in Black",
    price: "€984",
    category: "COATS",
    image: "/images/HomePage/NewArrivals/Coats/2.webp",
  },
  {
    name: "Cashmere Wrap Coat with Belt in Black",
    price: "€1130",
    category: "COATS",
    image: "/images/HomePage/NewArrivals/Coats/3.webp",
  },
  {
    name: "Natural Color Cashmere Wrap Coat with Belt in Taupe",
    price: "€1130",
    category: "COATS",
    image: "/images/HomePage/NewArrivals/Coats/4.webp",
  },
];

export default function NewArrivals() {
  const [activeCategory, setActiveCategory] = useState("BESTSELLERS");

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
      {/* Heading */}
      <h2 className="text-center text-4xl font-light tracking-tight sm:text-5xl">
        New arrivals
      </h2>

      {/* Category tabs */}
      <div className="mt-10 flex justify-center gap-8 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 cursor-pointer border-b-2 px-3 py-3 text-sm tracking-widest transition-colors duration-200 ${
              activeCategory === category
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:border-neutral-400 hover:text-black"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="mt-8 grid grid-cols-2 gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {products
          .filter((product) => product.category === activeCategory)
          .map((product) => (
            <article key={product.name} className="min-w-0">
              <div className="aspect-[3/4] overflow-hidden bg-[#f1f1ef]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="px-2 py-4">
                <h3 className="text-sm">{product.name}</h3>
                <p className="mt-2 text-sm text-neutral-600">{product.price}</p>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
