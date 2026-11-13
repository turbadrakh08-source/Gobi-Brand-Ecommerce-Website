import clientPromise from "@/lib/mongodb";

export async function setupProductIndexes() {
  const client = await clientPromise;
  const db = client.db("gobi-brands");

  await db.collection("products").createIndex(
    { sku: 1 },
    {
      unique: true,
      partialFilterExpression: {
        sku: { $type: "string" },
      },
      name: "unique_product_sku",
    },
  );

  console.log("Product SKU index created successfully.");
}
