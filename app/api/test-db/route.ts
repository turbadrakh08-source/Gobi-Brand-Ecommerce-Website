import { getMongoClient } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await getMongoClient();
    await client.db("gobi-brands").command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "Connected to MongoDB successfully!",
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return NextResponse.json(
      { success: false, message: "Database connection failed" },
      { status: 500 },
    );
  }
}
