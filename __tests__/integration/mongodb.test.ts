import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";

import { MongoClient, ObjectId } from "mongodb";

describe("MongoDB Integration", () => {
  let client: MongoClient;
  let testProductId: ObjectId | null = null;

  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI;

    if (!uri) {
      throw new Error("MONGODB_TEST_URI is missing");
    }

    client = new MongoClient(uri);
    await client.connect();

    if (client.db().databaseName !== "test") {
      throw new Error("Integration tests must use the test database!");
    }
  });

  afterAll(async () => {
    if (testProductId) {
      await client
        .db("test")
        .collection("gobi-brands-testing")
        .deleteOne({ _id: testProductId });
    }

    await client.close();
  });

  test("should insert and retrieve a product", async () => {
    const products = client.db("test").collection("gobi-brands-testing");

    const product = {
      name: "Integration Test Sweater",
      price: 199,
      currency: "EUR",
    };

    const result = await products.insertOne(product);
    testProductId = result.insertedId;

    const savedProduct = await products.findOne({
      _id: result.insertedId,
    });

    expect(savedProduct).not.toBeNull();
    expect(savedProduct?.name).toBe("Integration Test Sweater");
    expect(savedProduct?.price).toBe(199);
  });
});
