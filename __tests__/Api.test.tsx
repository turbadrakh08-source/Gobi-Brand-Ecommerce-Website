/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-require-imports */
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";

// ==========================================
// 1. MOCK PRODUCT DATA
// ==========================================

const fakeProducts = [
  {
    _id: "123",
    name: "Cashmere Sweater",
    price: 199,
    currency: "EUR",
  },
  {
    _id: "456",
    name: "Cashmere Hoodie",
    price: 249,
    currency: "EUR",
  },
];

// ==========================================
// 2. MOCK MONGODB FUNCTIONS
// ==========================================

const mockToArray = jest.fn<() => Promise<typeof fakeProducts>>();

const mockFind = jest.fn();

const mockInsertOne =
  jest.fn<
    (product: Record<string, unknown>) => Promise<{ insertedId: string }>
  >();

const mockFindOne = jest.fn<() => Promise<{ sku: string } | null>>();

const mockDeleteOne =
  jest.fn<
    (filter: Record<string, unknown>) => Promise<{ deletedCount: number }>
  >();

const mockUpdateOne =
  jest.fn<
    (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
    ) => Promise<{ matchedCount: number }>
  >();

const mockCollection = jest.fn();
const mockDb = jest.fn();

mockToArray.mockResolvedValue(fakeProducts);
mockFind.mockReturnValue({ toArray: mockToArray });

mockCollection.mockReturnValue({
  find: mockFind,
  findOne: mockFindOne,
  insertOne: mockInsertOne,
  deleteOne: mockDeleteOne,
  updateOne: mockUpdateOne,
});

mockDb.mockReturnValue({
  collection: mockCollection,
});
jest.mock("@/lib/mongodb", () => ({
  __esModule: true,
  getMongoClient: jest
    .fn<() => Promise<{ db: typeof mockDb }>>()
    .mockResolvedValue({
      db: mockDb,
    }),
}));
// ==========================================
// 3. MOCK AUTHENTICATION
// ==========================================

const mockVerifyAdmin = jest.fn<() => Promise<boolean>>();

jest.mock("@/lib/auth", () => ({
  verifyAdmin: mockVerifyAdmin,
}));

// ==========================================
// 4. IMPORT API ROUTES
// ==========================================

const { GET, POST } = require("@/app/api/products/route");

const { DELETE, PUT } = require("@/app/api/products/[id]/route");

// ==========================================
// 5. MAIN TEST GROUP
// ==========================================

describe("Products API", () => {
  // Reset mocks before every test
  beforeEach(() => {
    mockToArray.mockClear();
    mockInsertOne.mockClear();
    mockFindOne.mockClear();
    mockDeleteOne.mockClear();
    mockUpdateOne.mockClear();
    mockVerifyAdmin.mockClear();

    // Default successful responses
    mockVerifyAdmin.mockResolvedValue(true);

    mockToArray.mockResolvedValue(fakeProducts);

    mockInsertOne.mockResolvedValue({
      insertedId: "new-product-123",
    });

    mockFindOne.mockResolvedValue(null);

    mockDeleteOne.mockResolvedValue({
      deletedCount: 1,
    });

    mockUpdateOne.mockResolvedValue({
      matchedCount: 1,
    });
  });

  // ========================================
  // GET TESTS
  // ========================================

  describe("GET /api/products", () => {
    test("returns products successfully", async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.products).toHaveLength(2);
      expect(body.products[0].name).toBe("Cashmere Sweater");
    });
  });

  // ========================================
  // POST TESTS
  // ========================================

  describe("POST /api/products", () => {
    const newProduct = {
      name: "Wool Coat",
      price: 299,
      currency: "EUR",
      sku: "WOOL-001",
    };

    test("admin can add a product successfully", async () => {
      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Product added successfully");

      expect(mockInsertOne).toHaveBeenCalled();

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Wool Coat",
          price: 299,
          currency: "EUR",
          sku: "WOOL-001",
        }),
      );
    });

    test("non-admin cannot add a product", async () => {
      mockVerifyAdmin.mockResolvedValue(false);

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Unauthorized");

      expect(mockInsertOne).not.toHaveBeenCalled();
    });

    test("rejects duplicate SKU", async () => {
      mockFindOne.mockResolvedValue({
        sku: "WOOL-001",
      });

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toContain("already exists");

      expect(mockInsertOne).not.toHaveBeenCalled();
    });

    test("returns 500 when database insertion fails", async () => {
      mockInsertOne.mockRejectedValue(new Error("Database unavailable"));

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Failed to add product");
    });
  });

  // ========================================
  // DELETE TESTS
  // ========================================

  describe("DELETE /api/products/[id]", () => {
    const productId = "507f1f77bcf86cd799439011";

    test("admin can delete a product successfully", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: productId }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Product deleted successfully");

      expect(mockDeleteOne).toHaveBeenCalled();
    });

    test("rejects an invalid product ID", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/products/invalid-id",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "invalid-id" }),
      });

      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Invalid product ID");

      expect(mockDeleteOne).not.toHaveBeenCalled();
    });

    test("returns 404 when product does not exist", async () => {
      mockDeleteOne.mockResolvedValue({
        deletedCount: 0,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: productId }),
      });

      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Product not found");
    });

    test("unauthorized user cannot delete a product", async () => {
      mockVerifyAdmin.mockResolvedValue(false);

      const request = new NextRequest(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: productId }),
      });

      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Unauthorized");

      expect(mockDeleteOne).not.toHaveBeenCalled();
    });

    test("returns 500 when database deletion fails", async () => {
      mockDeleteOne.mockRejectedValue(new Error("Database unavailable"));

      const request = new NextRequest(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: productId }),
      });

      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Failed to delete product");
    });
  });
});

// ========================================
// PUT TESTS
// ========================================

describe("PUT /api/products/[id]", () => {
  const productId = "507f1f77bcf86cd799439011";

  const updatedProduct = {
    name: "Updated Cashmere Sweater",
    price: 229,
    currency: "EUR",
  };

  test("admin can update a product successfully", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: productId }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Product updated successfully");

    expect(mockUpdateOne).toHaveBeenCalled();

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      {
        $set: expect.objectContaining({
          name: "Updated Cashmere Sweater",
          price: 229,
          currency: "EUR",
          updatedAt: expect.any(Date),
        }),
      },
    );
  });

  test("rejects an invalid product ID", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products/invalid-id",
      {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "invalid-id" }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid product ID");

    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  test("returns 404 when product does not exist", async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 0,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: productId }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Product not found");
  });

  test("unauthorized user cannot update a product", async () => {
    mockVerifyAdmin.mockResolvedValue(false);

    const request = new NextRequest(
      `http://localhost:3000/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: productId }),
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Unauthorized");

    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  test("returns 500 when database update fails", async () => {
    mockUpdateOne.mockRejectedValue(new Error("Database unavailable"));
    mockVerifyAdmin.mockResolvedValue(true);

    const request = new NextRequest(
      `http://localhost:3000/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: productId }),
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Failed to update product");
  });
});
