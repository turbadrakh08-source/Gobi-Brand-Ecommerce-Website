"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  currency: string;
  stock: number;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Could not load products");
        }

        setProducts(data.products);
      } catch (error) {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function handleDelete(productId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      );

      alert("Product deleted successfully!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the product.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">GOBI Brands Admin Dashboard</h1>

        <p className="mt-2 text-gray-600">Manage your store products here.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="mt-2 text-gray-500">
              {products.length} products in your store.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Categories</h2>
            <p className="mt-2 text-gray-500">
              Manage your product categories.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="mt-2 text-gray-500">View customer orders.</p>
          </div>
        </div>

        <section className="mt-10 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold">Product List</h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading products...</p>
          ) : error ? (
            <p className="mt-4 text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="mt-4 text-gray-500">No products found.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{product.gender}</td>
                      <td className="p-3">
                        {product.price} {product.currency}
                      </td>
                      <td className="p-3">{product.stock}</td>
                      <td className="p-3 text-center align-middle">
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
