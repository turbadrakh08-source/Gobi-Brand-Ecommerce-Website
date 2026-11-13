"use client";

import { useStore } from "@/app/context/StoreContext";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";

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

import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.success) {
          setProducts(
            data.products.filter((product: Product) =>
              wishlist.includes(product._id),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [wishlist]);

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-32 sm:px-8 sm:pt-36">
      {/* Page heading */}
      <AnnouncementBar />
      <Navbar />
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-light tracking-tight sm:text-7xl">
          My Wishlist
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          Your favourite pieces, all in one place.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-20 text-center text-sm text-neutral-500">
          Loading your wishlist...
        </p>
      )}

      {/* Empty wishlist */}
      {!loading && wishlist.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart size={42} strokeWidth={1} />

          <h2 className="mt-5 text-xl font-light">Your wishlist is empty</h2>

          <p className="mt-2 text-sm text-neutral-500">
            Save your favourite products and find them here later.
          </p>

          <a
            href="/"
            className="mt-7 border border-black px-8 py-3 text-xs tracking-widest transition-colors hover:bg-black hover:text-white"
          >
            CONTINUE SHOPPING
          </a>
        </div>
      )}

      {/* Wishlist products */}
      {!loading && wishlist.length > 0 && products.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product._id} className="min-w-0">
              {/* Image */}
              <div className="group relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-contain cursor-pointer transition-transform duration-700 ease-in-out group-hover:scale-105"
                  />
                )}

                <button
                  onClick={() => toggleWishlist(product._id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-black hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 cursor-pointer"
                >
                  <Trash2 size={17} strokeWidth={1.5} />
                </button>
              </div>

              {/* Product information */}
              <div className="mt-3">
                <h2 className="text-sm text-neutral-900">{product.name}</h2>

                <p className="mt-2 text-sm">
                  {product.currency === "EUR" ? "€" : ""}
                  {product.price.toFixed(2)}
                </p>

                {/* Add to cart */}
                <button
                  onClick={() =>
                    addToCart({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      currency: product.currency,
                      images: product.images,
                    })
                  }
                  className="mt-4 cursor-pointer flex w-full items-center justify-center gap-2 border border-black py-3 text-xs tracking-widest transition-all duration-300 hover:bg-black hover:text-white"
                >
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  ADD TO BAG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && wishlist.length > 0 && products.length === 0 && (
        <p className="py-16 text-center text-sm text-neutral-500">
          Your saved products could not be found.
        </p>
      )}
    </main>
  );
  console.log("Saved wishlist items:", wishlist);
}
