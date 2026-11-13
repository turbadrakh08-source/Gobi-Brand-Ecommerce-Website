"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileArchive,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";

type PreviewProduct = {
  sku: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  currency: string;
  description: string;
  stock: number | "";
  sizes: string[];
  colors: string[];
  featured: boolean;
  image: string;
  imageUrl: string | null;
  error?: string;
};

export default function BulkUploadPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<string[]>([]);

  // Clean up temporary image URLs when the preview changes
  // or when the component is removed.
  useEffect(() => {
    return () => {
      previewProducts.forEach((product) => {
        if (product.imageUrl) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [previewProducts]);

  function handleExcelChange(file: File | null) {
    setExcelFile(file);
    setPreviewReady(false);
    setPreviewProducts([]);
    setErrors([]);
  }

  function handleZipChange(file: File | null) {
    setZipFile(file);
    setPreviewReady(false);
    setPreviewProducts([]);
    setErrors([]);
  }

  async function handlePreview() {
    if (!excelFile || !zipFile) {
      setErrors(["Please select both Excel and ZIP files."]);
      return;
    }

    setLoading(true);
    setErrors([]);
    setPreviewProducts([]);
    setPreviewReady(false);

    const temporaryUrls: string[] = [];

    try {
      // STEP 1: Read Excel file
      const excelBuffer = await excelFile.arrayBuffer();

      const workbook = XLSX.read(excelBuffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("Your Excel file does not contain a worksheet.");
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        { defval: "" },
      );

      if (rows.length === 0) {
        throw new Error("Your Excel worksheet is empty.");
      }

      // STEP 2: Read ZIP file
      const zipBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipBuffer);

      // Create a lookup table using image filenames.
      const imageFiles = new Map<string, JSZip.JSZipObject>();

      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          const fileName = relativePath.split("/").pop()?.toLowerCase();

          if (fileName) {
            imageFiles.set(fileName, file);
          }
        }
      });

      // STEP 3: Match Excel rows with ZIP images
      const foundErrors: string[] = [];
      const products: PreviewProduct[] = [];
      const usedImages = new Set<string>();
      const seenSkus = new Set<string>();
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];

        const name = String(row.Name ?? "").trim();
        const sku = String(row.SKU ?? "").trim();
        const category = String(row.Category ?? "").trim();
        const gender = String(row.Gender ?? "").trim();
        const image = String(row.Image ?? "").trim();

        const price = Number(row.Price);

        const rowErrors: string[] = [];
        if (!sku) {
          rowErrors.push("Missing SKU");
        } else if (seenSkus.has(sku.toLowerCase())) {
          rowErrors.push(`Duplicate SKU in Excel: ${sku}`);
        } else {
          seenSkus.add(sku.toLowerCase());
        }
        if (!name) rowErrors.push("Missing product name");
        if (!category) rowErrors.push("Missing category");
        if (!gender) rowErrors.push("Missing gender");
        if (!image) rowErrors.push("Missing image filename");

        if (
          row.Price === "" ||
          row.Price === null ||
          row.Price === undefined ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          rowErrors.push("Invalid price");
        }

        const normalizedImage = image.split("/").pop()?.toLowerCase() ?? "";

        const imageFile = normalizedImage
          ? imageFiles.get(normalizedImage)
          : undefined;

        let imageUrl: string | null = null;

        if (!imageFile && image) {
          rowErrors.push(`Image "${image}" was not found in ZIP`);
        }

        if (imageFile) {
          const extension = normalizedImage.split(".").pop()?.toLowerCase();

          const mimeTypes: Record<string, string> = {
            webp: "image/webp",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
          };

          const mimeType = mimeTypes[extension ?? ""];

          if (!mimeType) {
            rowErrors.push(`Unsupported image format: ${image}`);
          } else {
            const blob = await imageFile.async("blob");

            const imageBlob = new Blob([blob], {
              type: mimeType,
            });

            imageUrl = URL.createObjectURL(imageBlob);
            temporaryUrls.push(imageUrl);
            usedImages.add(normalizedImage);
          }
        }

        const product: PreviewProduct = {
          sku: String(row.SKU ?? "").trim(),
          name,
          category,
          gender,
          price,
          currency: String(row.Currency || "EUR").trim(),
          description: String(row.Description ?? "").trim(),
          stock:
            row.Stock === "" || row.Stock === undefined
              ? ""
              : Number(row.Stock),
          sizes: String(row.Sizes ?? "")
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean),
          colors: String(row.Colors ?? "")
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean),
          featured:
            row.Featured === true ||
            String(row.Featured).toLowerCase() === "true",
          image,
          imageUrl,
          error: rowErrors.length > 0 ? rowErrors.join(", ") : undefined,
        };

        if (rowErrors.length > 0) {
          foundErrors.push(`Row ${index + 2}: ${rowErrors.join(", ")}`);
        }

        products.push(product);
      }

      // STEP 4: Find unused images in ZIP
      const unusedImages = [...imageFiles.keys()].filter(
        (fileName) => !usedImages.has(fileName),
      );

      if (unusedImages.length > 0) {
        foundErrors.push(`Unused ZIP images: ${unusedImages.join(", ")}`);
      }

      setPreviewProducts(products);
      setErrors(foundErrors);
      setPreviewReady(true);
    } catch (error) {
      temporaryUrls.forEach((url) => URL.revokeObjectURL(url));

      console.error("Preview error:", error);

      setErrors([
        error instanceof Error
          ? error.message
          : "Something went wrong while reading your files.",
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!previewReady || invalidProducts.length > 0) {
      alert("Please fix all preview errors before importing.");
      return;
    }

    if (!excelFile || !zipFile || validProducts.length === 0) {
      alert("Please select your Excel and ZIP files and preview them first.");
      return;
    }

    const confirmed = window.confirm(
      `Import ${validProducts.length} products to MongoDB?`,
    );

    if (!confirmed) return;

    setImportLoading(true);
    setImportResults([]);

    const results: string[] = [];

    try {
      // Read ZIP again to access original image files.
      const zipBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipBuffer);

      const imageFiles = new Map<string, JSZip.JSZipObject>();

      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          const fileName = relativePath.split("/").pop()?.toLowerCase();

          if (fileName) {
            imageFiles.set(fileName, file);
          }
        }
      });

      // Import products one by one.
      for (const product of validProducts) {
        try {
          const fileName = product.image.split("/").pop()?.toLowerCase();

          const imageFile = fileName ? imageFiles.get(fileName) : undefined;

          if (!imageFile) {
            throw new Error(`Image not found: ${product.image}`);
          }

          const extension = fileName?.split(".").pop()?.toLowerCase();

          const mimeTypes: Record<string, string> = {
            webp: "image/webp",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
          };

          const mimeType = mimeTypes[extension ?? ""];

          if (!mimeType) {
            throw new Error("Unsupported image format");
          }

          // Extract image from ZIP.
          const blob = await imageFile.async("blob");

          const imageToUpload = new File([blob], fileName!, { type: mimeType });

          // Upload image to Cloudinary.
          const formData = new FormData();
          formData.append("file", imageToUpload);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadData.imageUrl) {
            throw new Error(
              uploadData.message || "Cloudinary image upload failed",
            );
          }

          // Save product and Cloudinary image URL to MongoDB.
          const productResponse = await fetch("/api/products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sku: product.sku,
              name: product.name,
              category: product.category,
              gender: product.gender,
              price: product.price,
              currency: product.currency,
              description: product.description,
              stock: product.stock === "" ? 0 : product.stock,
              sizes: product.sizes,
              colors: product.colors,
              featured: product.featured,
              images: [uploadData.imageUrl],
            }),
          });

          const productData = await productResponse.json();

          if (!productResponse.ok) {
            throw new Error(productData.message || "Failed to save product");
          }

          results.push(`✓ ${product.sku} — Imported successfully`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          results.push(`✗ ${product.sku} — ${message}`);
        }

        setImportResults([...results]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      results.push(`Import stopped: ${message}`);
      setImportResults([...results]);
    } finally {
      setImportLoading(false);
    }
  }

  const validProducts = previewProducts.filter((product) => !product.error);

  const invalidProducts = previewProducts.filter((product) => product.error);

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <h1 className="text-3xl font-light tracking-tight">
          Bulk Product Upload
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          Upload an Excel spreadsheet and a ZIP folder containing your product
          images.
        </p>

        {/* File upload sections */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Excel upload */}
          <div className="rounded-xl border border-neutral-200 p-6">
            <FileSpreadsheet size={30} className="text-green-700" />

            <h2 className="mt-4 font-medium">Excel file</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Select your product spreadsheet (.xlsx).
            </p>

            <input
              type="file"
              accept=".xlsx"
              className="mt-5 block w-full text-sm"
              onChange={(e) => handleExcelChange(e.target.files?.[0] ?? null)}
            />

            {excelFile && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                <span className="truncate text-sm">{excelFile.name}</span>

                <button
                  type="button"
                  onClick={() => handleExcelChange(null)}
                  aria-label="Remove Excel file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* ZIP upload */}
          <div className="rounded-xl border border-neutral-200 p-6">
            <FileArchive size={30} className="text-amber-700" />

            <h2 className="mt-4 font-medium">Images ZIP file</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Select your numbered product images (.zip).
            </p>

            <input
              type="file"
              accept=".zip"
              className="mt-5 block w-full text-sm"
              onChange={(e) => handleZipChange(e.target.files?.[0] ?? null)}
            />

            {zipFile && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                <span className="truncate text-sm">{zipFile.name}</span>

                <button
                  type="button"
                  onClick={() => handleZipChange(null)}
                  aria-label="Remove ZIP file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg bg-neutral-50 p-5">
          <h3 className="font-medium">Image naming instructions</h3>

          <p className="mt-2 text-sm text-neutral-600">
            Each image filename must match the Image column in Excel. For
            example: 1.webp, 2.webp, 3.webp, and so on.
          </p>
        </div>

        {/* Preview button */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={!excelFile || !zipFile || loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <Upload size={18} />

          {loading ? "Reading files..." : "Preview Products"}
        </button>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-2 font-medium text-red-800">
              <AlertCircle size={20} />
              Please check the following
            </div>

            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview results */}
        {previewReady && (
          <div className="mt-12">
            <h2 className="text-2xl font-light">Product Preview</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Total products</p>
                <p className="mt-2 text-2xl font-medium">
                  {previewProducts.length}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-700">Valid products</p>
                <p className="mt-2 text-2xl font-medium text-green-800">
                  {validProducts.length}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-700">Products with errors</p>
                <p className="mt-2 text-2xl font-medium text-red-800">
                  {invalidProducts.length}
                </p>
              </div>
            </div>

            {/* Product cards */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {previewProducts.map((product, index) => (
                <div
                  key={`${product.sku}-${index}`}
                  className="overflow-hidden rounded-lg border border-neutral-200"
                >
                  <div className="relative aspect-[3/4] bg-neutral-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                        <ImageIcon size={32} />
                        <span className="text-xs">Image missing</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-center gap-1 text-xs">
                      {product.error ? (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertCircle size={14} />
                          Needs attention
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-700">
                          <CheckCircle2 size={14} />
                          Matched
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-sm font-medium">
                      {product.name || "Unnamed product"}
                    </h3>

                    <p className="mt-1 text-xs text-neutral-500">
                      {product.category} · {product.gender}
                    </p>

                    <p className="mt-2 text-sm">
                      {product.currency} {product.price.toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Image: {product.image || "Not specified"}
                    </p>

                    {product.error && (
                      <p className="mt-2 text-xs leading-5 text-red-600">
                        {product.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Final status */}
            <div className="mt-8 rounded-lg border border-neutral-200 p-5">
              {invalidProducts.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={19} />
                  All products passed the preview checks!
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Please fix the errors before importing your products.
                </p>
              )}

              <p className="mt-3 text-xs text-neutral-500">
                This is only a preview. No products have been uploaded to
                Cloudinary or saved in MongoDB yet.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={
                !previewReady ||
                invalidProducts.length > 0 ||
                validProducts.length === 0 ||
                importLoading
              }
              className="mt-6 w-full rounded-lg bg-black px-6 py-4 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {importLoading
                ? "Importing products..."
                : `Import ${validProducts.length} Products`}
            </button>

            {importResults.length > 0 && (
              <div className="mt-6 rounded-lg border border-neutral-200 p-5">
                <h3 className="font-medium">Import Results</h3>

                <ul className="mt-3 space-y-2 text-sm">
                  {importResults.map((result, index) => (
                    <li
                      key={index}
                      className={
                        result.startsWith("✓")
                          ? "text-green-700"
                          : "text-red-600"
                      }
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
