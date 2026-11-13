"use client";

import Image from "next/image";
import { useStore } from "@/app/context/StoreContext";
import { Heart, ShoppingBag } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  colors?: string[];
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, addToCart, toggleWishlist } = useStore();

  const isWishlisted = wishlist.includes(product._id);

  function handleAddToCart() {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      images: product.images,
    });
  }

  return (
    <div className="group min-w-0 cursor-pointer">
      {/* Product image */}
      <div className="group/image relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain transition-transform duration-700 ease-in-out group-hover/image:scale-105"
          />
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 translate-y-2 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover/image:translate-y-0 group-hover/image:opacity-100 hover:bg-black hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={19}
            strokeWidth={1.5}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 z-10 flex h-12 w-12 translate-y-2 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover/image:translate-y-0 group-hover/image:opacity-100 hover:bg-black hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100"
          aria-label="Add to cart"
        >
          <ShoppingBag size={19} strokeWidth={1.5} />
        </button>
      </div>

      {/* Product information */}
      <div className="mt-3">
        <h2 className="text-sm leading-5 text-neutral-900">{product.name}</h2>

        <p className="mt-2 text-sm text-neutral-900">
          {product.currency === "EUR" ? "€" : ""}
          {product.price.toFixed(2)}
        </p>

        {product.colors && product.colors.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            {product.colors.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
