import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("gobi-brands");

    const products = await db.collection("products").find({}).toArray();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const product = await request.json();

    const client = await clientPromise;
    const db = client.db("gobi-brands");

    // Check for duplicate SKU when one is provided
    if (product.sku) {
      const existingProduct = await db.collection("products").findOne({
        sku: product.sku,
      });

      if (existingProduct) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with SKU ${product.sku} already exists`,
          },
          { status: 409 },
        );
      }
    }

    const result = await db.collection("products").insertOne({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      productId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding product:", error);

    return NextResponse.json(
      { success: false, message: "Failed to add product" },
      { status: 500 },
    );
  }
}
