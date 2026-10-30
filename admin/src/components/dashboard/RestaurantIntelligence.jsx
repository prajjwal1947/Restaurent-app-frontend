import { useState } from "react";
import { ArrowUpRight, ChefHat, MapPin, MessageSquare, RefreshCw, Star, TrendingUp, Utensils } from "lucide-react";
import LocalContextPanel from "./LocalContextPanel";

const views = [
  { id: "sales", label: "Sales & demand", icon: TrendingUp },
  { id: "prep", label: "Prep plan", icon: ChefHat },
  { id: "menu", label: "Menu decisions", icon: Utensils },
  { id: "reviews", label: "Ratings", icon: Star },
  { id: "local", label: "Local context", icon: MapPin },
];

export default function RestaurantIntelligence({ data, loading, error, onRefresh, onAsk }) {
  const [view, setView] = useState("sales");
  const hasData = Boolean(data?.periods && data?.sales && data?.reviews && Array.isArray(data?.prepForecast));
  const money = (minor) => new Intl.NumberFormat(undefined, {
    style: "currency", currency: data?.currency || "INR", maximumFractionDigits: 0,
  }).format(minor / 100);
  const dateLabel = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  const changeLabel = (value) => value === null ? "No comparison baseline" : `${value > 0 ? "+" : ""}${value}% vs previous 7 days`;
  const askButton = (question) => (
    <button type="button" title={question} onClick={() => onAsk(question)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#bd4e21] hover:underline">
      <MessageSquare size={13} /> Ask assistant <ArrowUpRight size={13} />
    </button>
  );

  return (
    <section className="mt-8 scroll-mt-24 border-t border-orange-100 pt-6" aria-labelledby="restaurant-intelligence-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="restaurant-intelligence-heading" className="text-2xl font-bold text-gray-900">Restaurant intelligence</h2>
          <p className="mt-1 text-xs text-gray-500">
            {hasData ? `${dateLabel(data.periods.start7)} - ${dateLabel(data.periods.end7)} · ${data.timezone} · Complete days` : "Recent orders, demand and customer ratings"}
          </p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} title="Refresh restaurant intelligence" aria-label="Refresh restaurant intelligence" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div role="tablist" aria-label="Intelligence view" className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-b border-gray-200">
        {views.map(({ id, label, icon: Icon }) => (
          <button key={id} id={`intelligence-tab-${id}`} type="button" role="tab" aria-selected={view === id} aria-controls={`intelligence-panel-${id}`} onClick={() => setView(id)} className={`flex min-h-11 items-center gap-2 border-b-2 py-2 text-sm font-medium ${view === id ? "border-[#e86a33] text-[#bd4e21]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {!hasData ? <p className="py-10 text-sm text-gray-500" role="status">{loading ? "Loading restaurant evidence..." : "Restaurant intelligence is unavailable. Try refreshing."}</p> : (
        <div role="tabpanel" id={`intelligence-panel-${view}`} aria-labelledby={`intelligence-tab-${view}`} className="py-5">
          {view === "sales" && <>
            <dl className="grid grid-cols-2 gap-5 border-b border-gray-200 pb-5 lg:grid-cols-4">
              <div><dt className="text-xs text-gray-500">Sales · 7 days</dt><dd className="mt-1 text-xl font-semibold text-gray-900">{money(data.sales.revenue7Minor)}</dd><p className="mt-1 text-xs text-gray-500">{changeLabel(data.sales.changePercent)}</p></div>
              <div><dt className="text-xs text-gray-500">Orders · 7 days</dt><dd className="mt-1 text-xl font-semibold text-gray-900">{data.sales.orderCount7}</dd><p className="mt-1 text-xs text-gray-500">Previous period: {data.sales.previousOrderCount7}</p></div>
              <div><dt className="text-xs text-gray-500">Average ticket</dt><dd className="mt-1 text-xl font-semibold text-gray-900">{data.sales.averageTicket7Minor === null ? "Not available" : money(data.sales.averageTicket7Minor)}</dd></div>
              <div><dt className="text-xs text-gray-500">Order rating · 60 days</dt><dd className="mt-1 text-xl font-semibold text-gray-900">{data.reviews.averageRating === null ? "Not yet rated" : `${data.reviews.averageRating}/5`}</dd><p className="mt-1 text-xs text-gray-500">{data.reviews.ratingCount} ratings</p></div>
            </dl>
            <div className="mt-5 grid gap-7 lg:grid-cols-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">Best sellers · 7 days</h3>
                {data.bestSellers.length ? <ul className="mt-3 divide-y divide-gray-100">{data.bestSellers.slice(0, 5).map((item, index) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm"><span className="min-w-0 break-words text-gray-700">{index + 1}. {item.name}</span><span className="shrink-0 text-right"><strong className="font-medium text-gray-900">{item.units7} units</strong><span className="block text-xs text-gray-500">{money(item.revenue7Minor)}</span></span></li>
                ))}</ul> : <p className="py-7 text-sm text-gray-500">No product sales in the last 7 complete days.</p>}
                {askButton("What sold best this week?")}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">Sales trend · 30 days</h3>
                <div className="mt-4 flex h-28 items-end gap-1" role="img" aria-label={`Daily sales over 30 complete days. Total ${money(data.sales.revenue30Minor)}.`}>
                  {data.sales.daily.map((day) => <div key={day.date} title={`${dateLabel(day.date)}: ${money(day.revenueMinor)} · ${day.orders} orders`} className="min-w-0 flex-1 rounded-t-sm bg-emerald-600" style={{ height: `${Math.max(day.revenueMinor ? 3 : 1, (day.revenueMinor / Math.max(1, ...data.sales.daily.map((entry) => entry.revenueMinor))) * 100)}%` }} />)}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500"><span>{dateLabel(data.periods.start30)}</span><span>{dateLabel(data.periods.end30)}</span></div>
                <p className="mt-5 text-sm text-gray-700">Yesterday: <strong>{money(data.sales.yesterday.revenueMinor)}</strong> from {data.sales.yesterday.orders} orders.</p>
                <p className="mb-3 mt-1 text-xs text-gray-500">Same weekday last week: {money(data.sales.yesterday.comparisonRevenueMinor)} from {data.sales.yesterday.comparisonOrders} orders.</p>
                {askButton("Why did sales fall yesterday?")}
              </div>
            </div>
          </>}

          {view === "prep" && <>
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">Prep plan · {dateLabel(data.periods.forecastDate)}</h3>{askButton("Which food should I prepare more tomorrow?")}</div>
            <p className="mt-2 text-xs leading-5 text-gray-500">Up to 6 matching trading weekdays. Averages rounded up; no growth buffer. At least 3 samples required. Observed ranges are not guaranteed demand.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Tomorrow prep recommendations and historical evidence</caption>
                <thead className="border-b border-gray-200 text-xs text-gray-500"><tr><th scope="col" className="py-2 font-medium">Item</th><th scope="col" className="py-2 text-right font-medium">Samples</th><th scope="col" className="py-2 text-right font-medium">Average</th><th scope="col" className="py-2 text-right font-medium">Observed range</th><th scope="col" className="py-2 text-right font-medium">Prep starting point</th></tr></thead>
                <tbody className="divide-y divide-gray-100">{data.prepForecast.map((item) => <tr key={item.itemId}><td className="max-w-56 break-words py-3 pr-4 font-medium text-gray-700">{item.name}</td><td className="py-3 text-right text-gray-600">{item.sampleDays}/6</td><td className="py-3 text-right text-gray-600">{item.averageQuantity ?? "-"}</td><td className="py-3 text-right text-gray-600">{item.historicalLow === null ? "-" : `${item.historicalLow}-${item.historicalHigh}`}</td><td className="py-3 pl-4 text-right font-medium text-gray-900">{item.recommendedQuantity === null ? <span className="text-xs font-normal text-gray-500">More history needed</span> : `${item.recommendedQuantity} portions`}</td></tr>)}</tbody>
              </table>
            </div>
            {!data.prepForecast.length && <p className="py-8 text-sm text-gray-500">No available menu items to plan yet.</p>}
          </>}

          {view === "menu" && <>
            <div className="grid gap-7 lg:grid-cols-2">
              <div className="min-w-0"><h3 className="text-sm font-semibold text-gray-900">Least ordered · 30 days</h3><p className="mt-1 text-xs text-gray-500">Available items on the menu for at least 30 days</p>
                <ul className="mt-3 divide-y divide-gray-100">{data.leastOrdered.map((item) => <li key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0 break-words text-gray-700">{item.name}</span><span className="shrink-0 text-gray-600">{item.units30} units</span></li>)}</ul>
                {!data.leastOrdered.length && <p className="py-5 text-sm text-gray-500">No established menu items to compare yet.</p>}
                {askButton("Which item should I review before removing it?")}
              </div>
              <div className="min-w-0"><h3 className="text-sm font-semibold text-gray-900">Promotion candidates</h3><p className="mt-1 text-xs text-gray-500">At least 3 ratings, average 4/5 or above, and recorded sales</p>
                <ul className="mt-3 divide-y divide-gray-100">{data.promotionCandidates.map((item) => <li key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0 break-words text-gray-700">{item.name}</span><span className="shrink-0 text-right text-gray-600">{item.averageRating}/5<span className="block text-xs text-gray-500">{item.ratingCount} ratings · {item.units30} units</span></span></li>)}</ul>
                {!data.promotionCandidates.length && <p className="py-5 text-sm text-gray-500">More sales or ratings needed before suggesting a promotion.</p>}
                {askButton("What should I promote today?")}
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4"><h3 className="text-sm font-semibold text-gray-900">Overprep watch</h3><p className="mt-1 text-xs leading-5 text-gray-500">Demand fell at least 30%, from 5 or more weekly units. Review batch sizes; actual waste cannot be measured without prepared and leftover quantities.</p>
              {data.demandWarnings.length ? <ul className="mt-3 space-y-2">{data.demandWarnings.map((item) => <li key={item.id} className="break-words text-sm text-gray-700">{item.name}: {item.units7} vs {item.previousUnits7} units ({item.changePercent}%).</li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No qualifying demand declines in this period.</p>}
            </div>
          </>}

          {view === "reviews" && <>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-gray-900">Customer ratings · 60 days</h3><p className="mt-1 text-xs text-gray-500">Star ratings only. Written feedback is not collected.</p></div>{askButton("What do customer ratings tell us?")}</div>
            <ul className="mt-4 divide-y divide-gray-100">{data.reviews.products.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="min-w-0 break-words text-gray-700">{item.name}</span><span className="flex shrink-0 items-center gap-2 text-gray-700"><Star size={14} className="text-amber-600" />{item.averageRating}/5<span className="text-xs text-gray-500">({item.ratingCount})</span></span></li>)}</ul>
            {!data.reviews.products.length && <p className="py-8 text-sm text-gray-500">No product ratings recorded yet.</p>}
          </>}
          {view === "local" && <LocalContextPanel context={data.localContext} forecastDate={data.periods.forecastDate} comparisonDates={[data.sales.yesterday.date, data.sales.yesterday.comparisonDate]} onRefresh={onRefresh} onAsk={onAsk} />}
          <p className="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-400">Updated {new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Non-cancelled orders · Recommendations are planning guides</p>
        </div>
      )}
    </section>
  );
}