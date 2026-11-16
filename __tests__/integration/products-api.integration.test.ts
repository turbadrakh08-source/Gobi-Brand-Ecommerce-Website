import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import { closeMongoConnection } from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { POST, GET } from "@/app/api/products/route";
import { verifyAdmin } from "@/lib/auth";

import { PUT, DELETE } from "@/app/api/products/[id]/route";

// Allow admin access during integration tests.
jest.mock("@/lib/auth", () => ({
  verifyAdmin: jest.fn<() => Promise<boolean>>(),
}));
describe("Products API Integration", () => {
  let client: MongoClient;
  let testProductId: ObjectId | null = null;

  const testProduct = {
    name: "Integration Test Sweater",
    sku: "TEST-SWEATER-001",
    price: 199,
    currency: "EUR",
  };

  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI;

    if (!uri) {
      throw new Error("MONGODB_TEST_URI is missing");
    }

    client = new MongoClient(uri);
    await client.connect();

    if (client.db().databaseName !== "test") {
      throw new Error("Wrong database! Expected test.");
    }

    const collection = client.db("test").collection("gobi-brands-testing");

    // Remove only our uniquely identified test product.
    await collection.deleteMany({
      sku: testProduct.sku,
    });

    jest.mocked(verifyAdmin).mockResolvedValue(true);
  });

  afterAll(async () => {
    if (client) {
      if (testProductId) {
        await client
          .db("test")
          .collection("gobi-brands-testing")
          .deleteOne({ _id: testProductId });
      }

      await client.close();
      await closeMongoConnection();
    }
  });

  test("POST should create a product in MongoDB", async () => {
    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testProduct),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.productId).toBeDefined();

    testProductId = new ObjectId(data.productId);

    const savedProduct = await client
      .db("test")
      .collection("gobi-brands-testing")
      .findOne({ _id: testProductId });

    expect(savedProduct).not.toBeNull();
    expect(savedProduct?.name).toBe(testProduct.name);
  });

  test("GET should retrieve products from MongoDB", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(
      data.products.some(
        (product: { sku: string }) => product.sku === testProduct.sku,
      ),
    ).toBe(true);
  });
  test("PUT should update a product in MongoDB", async () => {
    if (!testProductId) {
      throw new Error("Test product has not been created");
    }

    const updatedProduct = {
      name: "Updated Integration Test Sweater",
      price: 249,
      currency: "EUR",
    };

    const request = new NextRequest(
      `http://localhost:3000/api/products/${testProductId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: testProductId.toString() }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const savedProduct = await client
      .db("test")
      .collection("gobi-brands-testing")
      .findOne({ _id: testProductId });

    expect(savedProduct?.name).toBe(updatedProduct.name);
    expect(savedProduct?.price).toBe(249);
  });
  test("DELETE should remove a product from MongoDB", async () => {
    if (!testProductId) {
      throw new Error("Test product has not been created");
    }

    const idToDelete = testProductId;

    const request = new NextRequest(
      `http://localhost:3000/api/products/${idToDelete}`,
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: idToDelete.toString() }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const deletedProduct = await client
      .db("test")
      .collection("gobi-brands-testing")
      .findOne({ _id: idToDelete });

    expect(deletedProduct).toBeNull();

    // It has already been deleted; afterAll doesn't need to delete it again.
    testProductId = null;
  });
});
