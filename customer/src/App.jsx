import { useMemo, useState } from "react";

import WelcomeScreen from "./components/WelcomeScreen";
import MenuHeader from "./components/MenuHeader";
import CategoryTabs from "./components/CategoryTabs";
import FoodCard from "./components/FoodCard";
import CartBar from "./components/CartBar";
import FoodDetails from "./components/FoodDetails";
import CartDrawer from "./components/CartDrawer";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderStatus from "./components/OrderStatus";
import {
  restaurant,
  categories,
  menuItems,
} from "./data/menu";

export default function App() {
  const [showWelcome, setShowWelcome] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [cart, setCart] = useState([]);

  const [activeScreen, setActiveScreen] =
    useState("menu");

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [showOrderStatus, setShowOrderStatus] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState(null);

  const [orderStatus, setOrderStatus] =
    useState(0);

  const tableNumber = 12;

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(
      (item) =>
        item.category === selectedCategory
    );
  }, [selectedCategory]);

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
              ...cartItem,
              quantity:
                cartItem.quantity +
                (item.quantity || 1),
            }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: item.quantity || 1,
        },
      ];
    });
  };

  if (showWelcome) {
    return (
      <WelcomeScreen
        tableNumber={tableNumber}
        onContinue={() => setShowWelcome(false)}
      />
    );
  }

  const updateCartQuantity = (item, change) => {
    setCart((currentCart) => {
      return currentCart
        .map((cartItem) => {
          if (cartItem.id !== item.id) {
            return cartItem;
          }

          return {
            ...cartItem,
            quantity:
              cartItem.quantity + change,
          };
        })
        .filter(
          (cartItem) => cartItem.quantity > 0
        );
    });
  };

  const removeFromCart = (item) => {
    setCart((currentCart) =>
      currentCart.filter(
        (cartItem) => cartItem.id !== item.id
      )
    );
  };

  const placeOrder = () => {
    const generatedOrderNumber =
      Math.floor(1000 + Math.random() * 9000);

    setOrderNumber(generatedOrderNumber);
    setActiveScreen("menu");
    setOrderPlaced(true);
    setOrderStatus(0);
  };



  if (orderPlaced && !showOrderStatus) {
  const total = cart.reduce(
    (sum, item) =>
      sum +
      (item.unitPrice ?? item.price ?? 0) *
      item.quantity,
    0
  );

  const tax = Math.round(total * 0.05);

  return (
    <OrderConfirmation
      orderNumber={orderNumber}
      total={total + tax}
      onViewOrder={() =>
        setShowOrderStatus(true)
      }
    />
  );
}

if (showOrderStatus) {
  return (
    <OrderStatus
      orderNumber={orderNumber}
      currentStep={orderStatus}
      onBackToMenu={() => {
        setShowOrderStatus(false);
        setOrderPlaced(false);
        setCart([]);
      }}
    />
  );
}

  if (activeScreen === "cart") {
    return (
      <CartDrawer
        cart={cart}
        onBack={() => setActiveScreen("menu")}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onPlaceOrder={placeOrder}
      />
    );
  }

  return (
    <main className="app">
      <MenuHeader
        restaurantName={restaurant.name}
        tableNumber={tableNumber}
      />

      <section className="hero">
        <p className="eyebrow">
          GOOD EVENING 👋
        </p>

        <h1>
          What would
          <br />
          you like today?
        </h1>
      </section>

      <div className="search-box">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Search dishes..."
        />
      </div>

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <section className="menu-section">
        <div className="section-heading">
          <div>
            <span>OUR MENU</span>

            <h2>
              {selectedCategory === "All"
                ? "Chef's Picks"
                : selectedCategory}
            </h2>
          </div>
        </div>

        <div className="food-list">
          {filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onAdd={addToCart}
              onOpenDetails={setSelectedItem}
            />
          ))}
        </div>
      </section>

      <CartBar
        cart={cart}
        onOpen={() => setActiveScreen("cart")}
      />

      <FoodDetails
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />

    </main>
  );
}