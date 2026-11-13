"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cardigans");
  const [gender, setGender] = useState("Women");
  const [price, setPrice] = useState("169");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("6");
  const [sizes, setSizes] = useState("S, M, L, XL, XXL");
  const [colors, setColors] = useState("Black, Navy, Grey");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setUploading(true);

    try {
      let imageUrl = "";

      // 1. Upload the selected image to Cloudinary
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Image upload failed");
        }

        imageUrl = uploadData.imageUrl;
      }

      // 2. Save product details and image URL in MongoDB
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          gender,
          price: Number(price),
          currency: "EUR",
          description,
          stock: Number(stock),
          sizes: sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean),
          colors: colors
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean),
          images: imageUrl ? [imageUrl] : [],
          featured: false,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add product");
      }

      alert("Product added successfully!");
      window.location.href = "/admin/products/new";
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="mt-2 text-gray-600">
          Enter the details of your new product.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow"
        >
          <div>
            <label className="mb-2 block font-medium">Product name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border p-3"
              placeholder="Essential Crewneck Cashmere Sweater"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option>Sweaters</option>
                <option>Cardigans</option>
                <option>Hoodies</option>
                <option>T-shirts</option>
                <option>Pants</option>
                <option>Hats</option>
                <option>Scarves & Shawls</option>
                <option>Gloves</option>
                <option>Socks</option>
                <option>Coats</option>
                <option>Blazers</option>
                <option>Jackets</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option>Men</option>
                <option>Women</option>
                <option>Unisex</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Price (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-lg border p-3"
                placeholder="169.68"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Stock quantity</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border p-3"
              placeholder="Describe your product..."
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Available sizes</label>
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="S, M, L, XL, XXL"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Available colors</label>
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Black, Navy, Grey"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Product image</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);

                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  setImagePreview("");
                }
              }}
              className="w-full rounded-lg border p-3"
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product preview"
                className="mt-4 h-40 w-40 rounded-lg object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}
