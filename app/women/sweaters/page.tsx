"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  currency: string;
  images: string[];
  colors?: string[];
};

const PRODUCTS_PER_PAGE = 8;

export default function WomenSweatersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to load products");
        }

        const womenSweaters = data.products.filter(
          (product: Product) =>
            product.category === "Sweaters" && product.gender === "Women",
        );

        setProducts(womenSweaters);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const displayedProducts = products.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-white px-5 pt-32 pb-16 sm:px-8 sm:pt-36">
      <AnnouncementBar />
      <Navbar />

      <h1 className="pt-6 text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl">
        Women&apos;s Cashmere Sweaters
      </h1>

      <p className="mt-4 text-base text-neutral-700">
        Where timeless design meets premium Mongolian cashmere — sweaters made
        to move through every part of your day.
      </p>

      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Showing{" "}
          {products.length === 0 ? 0 : (page - 1) * PRODUCTS_PER_PAGE + 1}
          {"–"}
          {Math.min(page * PRODUCTS_PER_PAGE, products.length)}
          {" of "}
          {products.length} products
        </p>

        <select className="cursor-pointer rounded-lg border border-neutral-200 px-4 py-3 text-sm">
          <option>Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="py-20 text-center">Loading sweaters...</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center">No women&apos;s sweaters found.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="cursor-pointer disabled:opacity-30"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`cursor-pointer border-b pb-2 ${
                      page === pageNumber
                        ? "border-black"
                        : "border-transparent text-neutral-500"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="cursor-pointer disabled:opacity-30"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
