import { useEffect, useMemo, useState } from "react";

import WelcomeScreen from "./components/WelcomeScreen";
import MenuHeader from "./components/MenuHeader";
import CategoryTabs from "./components/CategoryTabs";
import FoodCard from "./components/FoodCard";
import CartBar from "./components/CartBar";
import FoodDetails from "./components/FoodDetails";
import CartDrawer from "./components/CartDrawer";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderStatus from "./components/OrderStatus";
import OrderHistory from "./components/OrderHistory";
import { createPublicOrder, getPublicMenu, getPublicOrder, getPublicOrderHistory, getPublicTrending, getTableContext, ratePublicOrder, ratePublicOrderItem, resolveMediaUrl } from "./services/api";

export default function App() {
  const tableToken = window.location.pathname.match(/^\/t\/([^/]+)/)?.[1];
  const [orderHistory, setOrderHistory] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeScreen, setActiveScreen] = useState("menu");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderRating, setOrderRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingOrderItemRatingId, setSubmittingOrderItemRatingId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [menuItems, setMenuItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tableToken) return;
    try {
      localStorage.removeItem(`restaurant-order-history:${tableToken}`);
    } catch (storageError) {
      console.warn("Unable to remove the previous local order history.", storageError);
    }
    Promise.all([
      getTableContext(tableToken),
      getPublicMenu(tableToken),
      getPublicOrderHistory(tableToken),
      getPublicTrending(tableToken).catch(() => []),
    ])
      .then(([context, menu, history, trending]) => {
        const items = (menu.items || menu).flatMap((category) =>
          Array.isArray(category.items)
            ? category.items.map((item) => normalizeMenuItem({
                ...item,
                category: item.category || category.name,
              }))
            : [normalizeMenuItem(category)]
        );
        setRestaurant(context.restaurant);
        setTableNumber(context.table.number);
        setMenuItems(items);
        setTrendingItems(trending.map(normalizeMenuItem));
        setCategories(["All", ...new Set(items.map((item) => item.category).filter(Boolean))]);
        setOrderHistory(history);
        setShowWelcome(history.length === 0);
        if (history[0]) {
          setOrderId(history[0].id);
          setOrderNumber(history[0].orderNumber);
          setOrderStatus(history[0].status || "PENDING");
          setOrderTotal(Math.round((history[0].totalMinor || 0) / 100));
          setOrderRating(history[0].rating ?? null);
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [tableToken]);

  useEffect(() => {
    if (!orderId) return undefined;
    const poll = () => getPublicOrder(orderId)
      .then((order) => {
        setOrderNumber(order.orderNumber);
        setOrderStatus(order.status);
        setOrderTotal(Math.round((order.totalMinor || 0) / 100));
        setOrderRating(order.rating ?? null);
        setOrderHistory((current) => mergeOrderHistory(current, order));
      })
      .catch((requestError) => setError(requestError.message));
    poll();
    const interval = window.setInterval(poll, 15000);
    return () => window.clearInterval(interval);
  }, [orderId]);

  const filteredItems = useMemo(() => selectedCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory),
  [menuItems, selectedCategory]);

  const addToCart = (item) => {
    setCart((currentCart) => {
      const key = getCartKey(item);
      const existing = currentCart.find((cartItem) => getCartKey(cartItem) === key);
      if (existing) {
        return currentCart.map((cartItem) => getCartKey(cartItem) === key
          ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
          : cartItem);
      }
      return [...currentCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const updateCartQuantity = (item, change) => {
    setCart((currentCart) => currentCart
      .map((cartItem) => getCartKey(cartItem) === getCartKey(item)
        ? { ...cartItem, quantity: cartItem.quantity + change }
        : cartItem)
      .filter((cartItem) => cartItem.quantity > 0));
  };

  const removeFromCart = (item) => {
    setCart((currentCart) => currentCart.filter((cartItem) => getCartKey(cartItem) !== getCartKey(item)));
  };

  const trackOrder = (order) => {
    setOrderId(order.id);
    setOrderNumber(order.orderNumber);
    setOrderStatus(order.status || "PENDING");
    setOrderTotal(Math.round((order.totalMinor || 0) / 100));
    setOrderRating(order.rating ?? null);
    setOrderPlaced(false);
    setShowOrderStatus(true);
  };

  const rateOrder = async (rating) => {
    if (!tableToken || !orderId || submittingRating) return;
    setSubmittingRating(true);
    try {
      const updated = await ratePublicOrder(tableToken, orderId, rating);
      setOrderRating(updated.rating);
      setOrderHistory((current) => mergeOrderHistory(current, updated));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const rateOrderItem = async (orderItemId, rating) => {
    if (!tableToken || !orderId || submittingOrderItemRatingId) return;
    setSubmittingOrderItemRatingId(orderItemId);
    try {
      const result = await ratePublicOrderItem(tableToken, orderId, orderItemId, rating);
      setOrderHistory((current) => current.map((order) => order.id === orderId
        ? {
            ...order,
            items: (order.items || []).map((item) => item.id === result.orderItemId
              ? { ...item, rating: result.rating }
              : item),
          }
        : order
      ));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmittingOrderItemRatingId(null);
    }
  };

  const placeOrder = async () => {
    if (placingOrder || !tableToken || cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = await createPublicOrder(tableToken, {
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          addOnIds: (item.addOns || []).map((addOn) => addOn.id),
        })),
      }, crypto.randomUUID());
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      setOrderStatus(order.status);
      setOrderTotal(Math.round((order.totalMinor || 0) / 100));
      setOrderRating(order.rating ?? null);
      setOrderHistory((current) => mergeOrderHistory(current, order));
      setOrderPlaced(true);
      setActiveScreen("menu");
      setCart([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!tableToken) return <div className="app p-8"><p>Open this menu using a table QR code.</p></div>;
  if (loading) return <div className="app p-8">Loading menu...</div>;
  if (error) return <div className="app p-8"><p>{error}</p></div>;
  if (showWelcome) return <WelcomeScreen tableNumber={tableNumber} onContinue={() => setShowWelcome(false)} />;
  if (orderPlaced && !showOrderStatus) {
    return <OrderConfirmation orderNumber={orderNumber} total={orderTotal} onViewOrder={() => setShowOrderStatus(true)} />;
  }
  if (showOrderStatus) {
    return <OrderStatus
      orderNumber={orderNumber}
      currentStep={statusToStep(orderStatus)}
      orderItems={orderHistory.find((order) => order.id === orderId)?.items || []}
      rating={orderRating}
      ratingPending={submittingRating}
      onRate={rateOrder}
      submittingOrderItemRatingId={submittingOrderItemRatingId}
      onRateOrderItem={rateOrderItem}
      onBackToMenu={() => {
        setShowOrderStatus(false);
        setOrderPlaced(false);
      }}
    />;
  }
  if (activeScreen === "history") {
    return <OrderHistory
      orders={orderHistory}
      onBack={() => setActiveScreen("menu")}
      onTrackOrder={trackOrder}
    />;
  }
  if (activeScreen === "cart") {
    return <CartDrawer
      cart={cart}
      tableNumber={tableNumber}
      onBack={() => setActiveScreen("menu")}
      onUpdateQuantity={updateCartQuantity}
      onRemove={removeFromCart}
      onPlaceOrder={placeOrder}
      placingOrder={placingOrder}
    />;
  }
  return (
    <main className="app">
      <MenuHeader
        restaurantName={restaurant.name}
        tableNumber={tableNumber}
        orderCount={orderHistory.length}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        latestOrder={orderHistory[0]}
        onTrackOrder={trackOrder}
        onOpenOrderHistory={async () => {
          try {
            setOrderHistory(await getPublicOrderHistory(tableToken));
            setActiveScreen("history");
          } catch (requestError) {
            setError(requestError.message);
          }
        }}
      />
      <section className="hero"><p className="eyebrow">GOOD EVENING</p><h1>What would<br />you like today?</h1></section>
      <div className="search-box"><span>⌕</span><input type="text" placeholder="Search dishes..." /></div>
      <CategoryTabs categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      {trendingItems.length > 0 && (
        <section className="menu-section trending-section">
          <div className="section-heading">
            <div>
              <span>MOST ORDERED IN THE LAST 30 DAYS</span>
              <h2>Trending now</h2>
            </div>
          </div>
          <div className="food-list">
            {trendingItems.map((item) => (
              <FoodCard
                key={`trending-${item.id}`}
                item={item}
                orderCount={item.orderCount}
                onAdd={addToCart}
                onOpenDetails={setSelectedItem}
              />
            ))}
          </div>
        </section>
      )}
      <section className="menu-section">
        <div className="section-heading"><div><span>OUR MENU</span><h2>{selectedCategory === "All" ? "Chef's Picks" : selectedCategory}</h2></div></div>
        <div className="food-list">{filteredItems.map((item) => <FoodCard key={item.id} item={item} onAdd={addToCart} onOpenDetails={setSelectedItem} />)}</div>
      </section>
      <CartBar cart={cart} onOpen={() => setActiveScreen("cart")} />
      <FoodDetails key={selectedItem?.id || "empty"} item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
    </main>
  );
}

function normalizeMenuItem(item) {
  const variants = (item.variants || []).map((variant) => ({
    ...variant,
    price: Math.round((variant.priceMinor || 0) / 100),
  }));
  return {
    ...item,
    variants,
    image: resolveMediaUrl(
      item.imageUrl || item.image?.url || item.image || item.photoUrl
    ),
    price: variants.length
      ? Math.min(...variants.map((variant) => variant.price))
      : Math.round((item.priceMinor || 0) / 100),
    category: item.category?.name || item.category,
    addOns: (item.addOns || []).map((addOn) => ({ ...addOn, price: Math.round((addOn.priceMinor || 0) / 100) })),
  };
}

function getCartKey(item) {
  return `${item.id}:${item.variantId || ""}:${(item.addOns || []).map((addOn) => addOn.id).sort().join(",")}`;
}

function statusToStep(status) {
  return { PENDING: 1, CONFIRMED: 1, PREPARING: 2, READY: 3, SERVED: 4, CANCELLED: 1 }[status] || 1;
}

function mergeOrderHistory(current, order) {
  return [order, ...current.filter((savedOrder) => savedOrder.id !== order.id)].slice(0, 20);
}
