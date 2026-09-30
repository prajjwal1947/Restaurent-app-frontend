import { FileDown, Printer, X } from "lucide-react";
import { useState } from "react";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
}).format(amount || 0);

export default function BillModal({ order, restaurant, onClose }) {
  const subtotal = (order.subtotalMinor ?? 0) / 100;
  const [taxName, setTaxName] = useState("GST");
  const [taxRate, setTaxRate] = useState(() => subtotal > 0
    ? ((order.taxMinor || 0) / order.subtotalMinor) * 100
    : 0);
  const [serviceRate, setServiceRate] = useState(0);
  const [discount, setDiscount] = useState((order.discountMinor || 0) / 100);
  const safeTaxRate = Math.min(Math.max(Number(taxRate) || 0, 0), 100);
  const safeServiceRate = Math.min(Math.max(Number(serviceRate) || 0, 0), 100);
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const taxableSubtotal = subtotal - safeDiscount;
  const serviceCharge = Math.round(taxableSubtotal * safeServiceRate) / 100;
  const tax = Math.round((taxableSubtotal + serviceCharge) * safeTaxRate) / 100;
  const total = taxableSubtotal + serviceCharge + tax;
  const placedAt = new Date(order.placedAt || order.createdAt);
  const invoiceNumber = `INV-${placedAt.toISOString().slice(0, 10).replaceAll("-", "")}-${String(order.orderNumber).padStart(4, "0")}`;

  return (
    <div className="bill-modal-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="bill-modal" role="dialog" aria-modal="true" aria-labelledby="bill-modal-title">
        <header className="bill-modal-header no-print">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#e86a33]">Order #{order.orderNumber}</p>
            <h2 id="bill-modal-title" className="mt-1 text-xl font-bold text-gray-900">Generate bill</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close bill preview" className="rounded-lg p-2 text-gray-500 hover:bg-orange-50">
            <X size={19} />
          </button>
        </header>

        <div className="bill-modal-body">
          <section className="bill-settings no-print" aria-label="Bill adjustments">
            <label>
              <span>Tax label</span>
              <input value={taxName} onChange={(event) => setTaxName(event.target.value)} maxLength={24} />
            </label>
            <label>
              <span>Tax rate (%)</span>
              <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} />
            </label>
            <label>
              <span>Service charge (%)</span>
              <input type="number" min="0" max="100" step="0.01" value={serviceRate} onChange={(event) => setServiceRate(event.target.value)} />
            </label>
            <label>
              <span>Discount (₹)</span>
              <input type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} />
            </label>
          </section>

          <article className="invoice-print-area" aria-label="Printable invoice">
            <div className="invoice-heading">
              <div>
                <p className="invoice-kicker">TAX INVOICE</p>
                <h1>{restaurant?.name || "Restaurant"}</h1>
                {[restaurant?.address, restaurant?.city].filter(Boolean).length > 0 && (
                  <p>{[restaurant.address, restaurant.city].filter(Boolean).join(", ")}</p>
                )}
                {restaurant?.phone && <p>{restaurant.phone}</p>}
                {restaurant?.email && <p>{restaurant.email}</p>}
              </div>
              <div className="invoice-number-block">
                <strong>{invoiceNumber}</strong>
                <span>{placedAt.toLocaleString()}</span>
              </div>
            </div>

            <div className="invoice-order-meta">
              <span><strong>Order</strong> #{order.orderNumber}</span>
              <span><strong>Table</strong> {order.table}</span>
              <span><strong>Status</strong> {order.status}</span>
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const lineTotal = item.lineTotal ?? item.price * item.quantity;
                  const unitTotal = item.quantity ? lineTotal / item.quantity : lineTotal;
                  const extras = (item.addOns || []).map((addOn) => addOn.name).join(", ");
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.variantName && <span className="invoice-item-detail">{item.variantName}</span>}
                        {extras && <span className="invoice-item-detail">Add-ons: {extras}</span>}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{money(unitTotal)}</td>
                      <td>{money(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="invoice-totals">
              <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
              {safeDiscount > 0 && <div><span>Discount</span><span>- {money(safeDiscount)}</span></div>}
              {serviceCharge > 0 && <div><span>Service charge ({safeServiceRate}%)</span><span>{money(serviceCharge)}</span></div>}
              <div><span>{taxName || "Tax"} ({safeTaxRate}%)</span><span>{money(tax)}</span></div>
              <div className="invoice-grand-total"><strong>Total due</strong><strong>{money(total)}</strong></div>
            </div>

            <p className="invoice-thanks">Thank you for dining with us.</p>
          </article>
        </div>

        <footer className="bill-modal-footer no-print">
          <p>Use the print dialog to print or choose “Save as PDF”.</p>
          <button type="button" onClick={onClose} className="bill-secondary-button">Close</button>
          <button type="button" onClick={() => window.print()} className="bill-primary-button">
            <Printer size={16} />
            <FileDown size={16} />
            Print / PDF
          </button>
        </footer>
      </section>
    </div>
  );
}