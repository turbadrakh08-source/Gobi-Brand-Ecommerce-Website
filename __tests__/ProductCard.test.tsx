import { render, screen, fireEvent } from "@testing-library/react";
import { StoreProvider, useStore } from "@/app/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
// Mock Next.js Image because we don't need image optimization in Jest.
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, ...imageProps } = props;

    return <img {...imageProps} />;
  },
}));
const testProduct = {
  _id: "product-123",
  name: "Cashmere Sweater",
  price: 199,
  currency: "EUR",
  images: ["/sweater.webp"],
  colors: ["Black", "Grey"],
};

// This component lets our tests see the real cart and wishlist state.
function StoreStatus() {
  const { cart, wishlist } = useStore();

  return (
    <div>
      <span data-testid="cart-count">
        {cart.reduce((total, item) => total + item.quantity, 0)}
      </span>

      <span data-testid="wishlist-count">{wishlist.length}</span>
    </div>
  );
}

function renderProductCard() {
  return render(
    <StoreProvider>
      <ProductCard product={testProduct} />
      <StoreStatus />
    </StoreProvider>,
  );
}

describe("ProductCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("displays product information", () => {
    renderProductCard();

    expect(screen.getByText("Cashmere Sweater")).toBeInTheDocument();
    expect(screen.getByText("€199.00")).toBeInTheDocument();
    expect(screen.getByText("Black · Grey")).toBeInTheDocument();
  });

  test("adds product to wishlist when heart is clicked", () => {
    renderProductCard();

    const wishlistButton = screen.getByRole("button", {
      name: "Add to wishlist",
    });

    fireEvent.click(wishlistButton);

    expect(screen.getByTestId("wishlist-count")).toHaveTextContent("1");

    expect(
      screen.getByRole("button", {
        name: "Remove from wishlist",
      }),
    ).toBeInTheDocument();
  });

  test("removes product from wishlist when heart is clicked again", () => {
    renderProductCard();

    fireEvent.click(screen.getByRole("button", { name: "Add to wishlist" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Remove from wishlist" }),
    );

    expect(screen.getByTestId("wishlist-count")).toHaveTextContent("0");
  });

  test("adds product to cart when shopping bag is clicked", () => {
    renderProductCard();

    const cartButton = screen.getByRole("button", {
      name: "Add to cart",
    });

    fireEvent.click(cartButton);

    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
  });

  test("increases quantity when the same product is added twice", () => {
    renderProductCard();

    const cartButton = screen.getByRole("button", {
      name: "Add to cart",
    });

    fireEvent.click(cartButton);
    fireEvent.click(cartButton);

    expect(screen.getByTestId("cart-count")).toHaveTextContent("2");
  });
});
