import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LoaderCircle, MapPin, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { adminApi, getStoredUser } from "../../services/api";

const inputClass = "w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#e86a33]";

export default function LocalContextPanel({ context, forecastDate, comparisonDates, onRefresh, onAsk }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const canManage = ["OWNER", "MANAGER"].includes(getStoredUser()?.role);
  if (!context) return <p className="py-5 text-sm text-gray-500">Local context is unavailable. Refresh to try again.</p>;
  const today = new Date(new Date(`${forecastDate}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10);
  const dates = [...new Set([...comparisonDates, today, forecastDate])].sort();
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const sourceLink = (url, label) => url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-[#bd4e21] hover:underline">{label}<ExternalLink size={12} className="shrink-0" /></a> : <span>{label}</span>;

  function openForm(activity) {
    setError("");
    setEditing(activity?.id || null);
    setForm(activity ? { ...activity, latitude: activity.latitude == null ? "" : String(activity.latitude), longitude: activity.longitude == null ? "" : String(activity.longitude), sourceUrl: activity.sourceUrl || "" } : {
      kind: "EVENT", scope: "nearby", title: "", placeName: "", startsOn: today, endsOn: today,
      latitude: "", longitude: "", sourceUrl: "",
    });
  }

  async function saveActivity(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      kind: form.kind, scope: form.scope, title: form.title, placeName: form.placeName,
      startsOn: form.startsOn, endsOn: form.endsOn,
      latitude: form.scope === "nearby" ? Number(form.latitude) : null,
      longitude: form.scope === "nearby" ? Number(form.longitude) : null,
      sourceUrl: form.sourceUrl.trim() || null,
    };
    try {
      if (editing) await adminApi.updateLocalActivity(editing, body);
      else await adminApi.createLocalActivity(body);
      setForm(null);
      setEditing(null);
      onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteActivity(id) {
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteLocalActivity(id);
      setDeleting(null);
      if (editing === id) setForm(null);
      onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="font-semibold text-gray-900">Weather, nearby events & promotions</h3><p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-500"><MapPin size={13} />{context.location.latitude == null ? "Restaurant location not set" : `${context.location.city || "Restaurant"} · ${context.location.latitude}, ${context.location.longitude} · ${context.location.radiusKm} km radius`}</p></div>
        <Link to="/settings" className="text-xs font-medium text-[#bd4e21] hover:underline">Location settings</Link>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="sr-only">Weather context for the sales comparison and tomorrow</caption>
          <thead className="border-b border-gray-200 text-xs text-gray-500"><tr><th scope="col" className="py-2 font-medium">Date</th><th scope="col" className="py-2 font-medium">Conditions</th><th scope="col" className="py-2 text-right font-medium">High</th><th scope="col" className="py-2 text-right font-medium">Precipitation</th><th scope="col" className="py-2 pl-3 font-medium">Evidence</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{dates.map((date) => {
            const day = context.weather.data.find((entry) => entry.date === date);
            return <tr key={date}><td className="py-3 pr-3 text-gray-700">{date}</td><td className="py-3 text-gray-700">{day?.conditions || "Not available"}</td><td className="py-3 text-right text-gray-600">{day?.maxTemperatureC == null ? "-" : `${day.maxTemperatureC} C`}</td><td className="py-3 text-right text-gray-600">{day?.precipitationMm == null ? "-" : `${day.precipitationMm} mm`}</td><td className="py-3 pl-3 text-xs text-gray-500">{day ? day.evidence === "forecast" ? "Forecast" : "Past model estimate" : "Missing data"}</td></tr>;
          })}</tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-5 text-gray-500">{sourceLink(context.weather.sourceUrl, "Open-Meteo")}{context.weather.fetchedAt ? ` · Retrieved ${new Date(context.weather.fetchedAt).toLocaleString()}` : ""} · {context.weather.message}</p>
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Events & promotions · {context.period.from} to {context.period.to}</h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">{sourceLink(context.events.sourceUrl, "Ticketmaster")} · {context.events.message}{context.events.fetchedAt ? ` Retrieved ${new Date(context.events.fetchedAt).toLocaleString()}.` : ""}</p>
        <ul className="mt-3 divide-y divide-gray-100">{context.activities.map((activity) => <li key={activity.id} className="py-3">
          <p className="break-words text-sm font-medium text-gray-800">{activity.title}</p>
          <p className="mt-1 break-words text-xs text-gray-500">{activity.kind === "PROMOTION" ? "Promotion" : "Event"} · {activity.placeName} · {activity.scope === "restaurant" ? "At restaurant" : `${activity.distanceKm} km away`} · {activity.startsOn} - {activity.endsOn}</p>
          <p className="mt-1 text-xs text-gray-500">{sourceLink(activity.sourceUrl, activity.source)} · Recorded {new Date(activity.recordedAt).toLocaleString()}</p>
        </li>)}</ul>
        {!context.activities.length && <p className="py-5 text-sm text-gray-500">No overlapping activities in the available sources. Coverage is incomplete.</p>}
        <button type="button" onClick={() => onAsk("How might weather, nearby events and promotions relate to yesterday's sales?")} className="text-xs font-medium text-[#bd4e21] hover:underline">Discuss these factors with the assistant</button>
        <p className="mt-2 text-xs leading-5 text-gray-500">Contextual factors, not proven causes. Prep quantities are not automatically increased or reduced by weather or events.</p>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold text-gray-900">Owner-recorded activity log</h3>{canManage && <button type="button" onClick={() => openForm()} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white"><Plus size={14} /> Log activity</button>}</div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        {canManage && form && <form onSubmit={saveActivity} className="mt-4 grid min-w-0 gap-3 border-y border-gray-200 py-4 sm:grid-cols-2">
          <label className="min-w-0 text-xs text-gray-600">Activity type<select value={form.kind} onChange={(event) => update("kind", event.target.value)} className={`${inputClass} mt-1`}><option value="EVENT">Event</option><option value="PROMOTION">Promotion</option></select></label>
          <label className="min-w-0 text-xs text-gray-600">Location<select value={form.scope} onChange={(event) => update("scope", event.target.value)} className={`${inputClass} mt-1`}><option value="nearby">Nearby place</option><option value="restaurant">At this restaurant</option></select></label>
          <label className="min-w-0 text-xs text-gray-600">Title<input required maxLength={160} value={form.title} onChange={(event) => update("title", event.target.value)} className={`${inputClass} mt-1`} /></label>
          <label className="min-w-0 text-xs text-gray-600">Place name<input required maxLength={160} value={form.placeName} onChange={(event) => update("placeName", event.target.value)} className={`${inputClass} mt-1`} /></label>
          <label className="min-w-0 text-xs text-gray-600">Starts on<input required type="date" value={form.startsOn} onChange={(event) => update("startsOn", event.target.value)} className={`${inputClass} mt-1`} /></label>
          <label className="min-w-0 text-xs text-gray-600">Ends on<input required type="date" min={form.startsOn} value={form.endsOn} onChange={(event) => update("endsOn", event.target.value)} className={`${inputClass} mt-1`} /></label>
          {form.scope === "nearby" && <>
            <label className="min-w-0 text-xs text-gray-600">Place latitude<input required type="number" step="any" min={-90} max={90} value={form.latitude} onChange={(event) => update("latitude", event.target.value)} className={`${inputClass} mt-1`} /></label>
            <label className="min-w-0 text-xs text-gray-600">Place longitude<input required type="number" step="any" min={-180} max={180} value={form.longitude} onChange={(event) => update("longitude", event.target.value)} className={`${inputClass} mt-1`} /></label>
          </>}
          <label className="min-w-0 text-xs text-gray-600 sm:col-span-2">HTTPS source URL (optional)<input type="url" maxLength={2000} value={form.sourceUrl} onChange={(event) => update("sourceUrl", event.target.value)} placeholder="https://..." className={`${inputClass} mt-1`} /></label>
          <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#e86a33] px-3 py-2 text-xs font-medium text-white disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />} Save activity</button><button type="button" disabled={busy} onClick={() => setForm(null)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"><X size={14} /> Cancel</button></div>
        </form>}
        <ul className="mt-3 divide-y divide-gray-100">{context.recordedActivities.map((activity) => <li key={activity.id} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0"><p className="break-words text-sm text-gray-800">{activity.title}</p><p className="mt-1 break-words text-xs text-gray-500">{activity.kind === "PROMOTION" ? "Promotion" : "Event"} · {activity.placeName} · {activity.startsOn} - {activity.endsOn}</p><p className="mt-1 text-xs text-gray-400">{context.activities.some((entry) => entry.id === activity.id) ? "Included in current context" : "Outside current date/radius coverage"}</p></div>
          {canManage && <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {deleting === activity.id ? <><button type="button" disabled={busy} onClick={() => deleteActivity(activity.id)} className="rounded-lg px-2 py-1 text-xs font-medium text-red-600">Confirm delete</button><button type="button" title="Cancel deletion" aria-label="Cancel deletion" onClick={() => setDeleting(null)} className="p-1.5 text-gray-500"><X size={14} /></button></> : <><button type="button" disabled={busy} title={`Edit ${activity.title}`} aria-label={`Edit ${activity.title}`} onClick={() => openForm(activity)} className="p-1.5 text-gray-500 hover:text-[#bd4e21]"><Pencil size={15} /></button><button type="button" disabled={busy} title={`Delete ${activity.title}`} aria-label={`Delete ${activity.title}`} onClick={() => setDeleting(activity.id)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 size={15} /></button></>}
          </div>}
        </li>)}</ul>
        {!context.recordedActivities.length && <p className="py-5 text-sm text-gray-500">No owner-recorded activities yet.</p>}
        <p className="mt-2 text-xs text-gray-500">Latest 100 entries. Nearby promotions are owner-recorded, not automatically verified.</p>
      </div>
    </div>
  );
}