import { ArrowLeft, ArrowRight, Clock3, ReceiptText } from "lucide-react";

const statusLabels = {
  PENDING: "Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
};

export default function OrderHistory({ orders, onBack, onTrackOrder }) {
  return (
    <main className="app order-history-screen">
      <header className="order-history-header">
        <button className="cart-back" onClick={onBack} aria-label="Back to menu">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p>YOUR TABLE ORDERS</p>
          <h1>Order history</h1>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="order-history-empty">
          <ReceiptText size={28} />
          <h2>No orders yet</h2>
          <p>Your orders from this table will appear here.</p>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => {
            const itemSummary = (order.items || []).map((item) =>
              `${item.quantity} × ${item.nameSnapshot || item.name}${item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ""}`
            ).join(" · ");
            const date = order.placedAt || order.createdAt;

            return (
              <article className="order-history-item" key={order.id}>
                <div className="order-history-item-heading">
                  <div>
                    <h2>Order #{order.orderNumber}</h2>
                    <p className="order-history-date">
                      <Clock3 size={13} />
                      {date ? new Date(date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recent order"}
                    </p>
                  </div>
                  <span className={`order-history-status ${String(order.status || "PENDING").toLowerCase()}`}>
                    {statusLabels[order.status] || order.status || "Received"}
                  </span>
                </div>

                <p className="order-history-summary">{itemSummary || "Order details unavailable"}</p>

                <div className="order-history-item-footer">
                  <strong>₹{Math.round((order.totalMinor || 0) / 100)}</strong>
                  <button type="button" onClick={() => onTrackOrder(order)}>
                    Track order
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}