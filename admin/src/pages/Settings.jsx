import { motion } from "framer-motion";
import { ImagePlus, Save, Upload } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

import SettingSection from "../components/settings/SettingSection";
import { adminApi } from "../services/api";
import { useRestaurantBranding } from "../context/BrandingStore";

const ACCEPTING_ORDERS_KEY =
	"accepting-orders";

const readAcceptingOrders = () => {
	const storedValue = localStorage.getItem(
		ACCEPTING_ORDERS_KEY
	);

	if (storedValue === null) {
		return true;
	}

	return storedValue === "true";
};

export default function Settings() {
	const { refreshRestaurant } = useRestaurantBranding();
	const [restaurantName, setRestaurantName] = useState("");
	const [restaurantEmail, setRestaurantEmail] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [contextRadiusKm, setContextRadiusKm] = useState("3");
	const [timezone, setTimezone] = useState("Asia/Kolkata");
	const [brandName, setBrandName] = useState("");
	const [logoUrl, setLogoUrl] = useState("");
	const [logoFile, setLogoFile] = useState(null);
	const [gradientStart, setGradientStart] = useState("#e86a33");
	const [gradientEnd, setGradientEnd] = useState("#f7c59f");
	const [logoUploading, setLogoUploading] = useState(false);
	const [brandingMessage, setBrandingMessage] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const [serviceCharge, setServiceCharge] =
		useState(5);

	const [taxRate, setTaxRate] =
		useState(18);

	const [acceptingOrders, setAcceptingOrders] =
		useState(readAcceptingOrders);

	const [autoAcceptOrders, setAutoAcceptOrders] =
		useState(false);

	useEffect(() => {
		adminApi.restaurant()
			.then((restaurant) => {
				setRestaurantName(restaurant.name || "");
				setRestaurantEmail(restaurant.email || "");
				setAddress(restaurant.address || "");
				setCity(restaurant.city || "");
				setLatitude(restaurant.latitude == null ? "" : String(restaurant.latitude));
				setLongitude(restaurant.longitude == null ? "" : String(restaurant.longitude));
				setContextRadiusKm(String(restaurant.contextRadiusKm ?? 3));
				setTimezone(restaurant.timezone || "Asia/Kolkata");
				setBrandName(restaurant.branding?.brandName || "");
				setLogoUrl(restaurant.branding?.logoUrl || restaurant.logoUrl || "");
				setGradientStart(restaurant.branding?.gradientStart || "#e86a33");
				setGradientEnd(restaurant.branding?.gradientEnd || "#f7c59f");
			})
			.catch((requestError) => setError(requestError.message));
	}, []);

	const [saved, setSaved] =
		useState(false);

	const handleSave = async () => {
		setError("");
		if ((latitude.trim() === "") !== (longitude.trim() === "")) {
			setError("Enter both latitude and longitude, or leave both empty.");
			return;
		}
		setSaving(true);
		setBrandingMessage("");
		try {
			await Promise.all([
				adminApi.updateRestaurant({
					name: restaurantName,
					email: restaurantEmail,
					address, city, timezone,
					latitude: latitude.trim() === "" ? null : Number(latitude),
					longitude: longitude.trim() === "" ? null : Number(longitude),
					contextRadiusKm: Number(contextRadiusKm),
				}),
				adminApi.updateBranding({
					brandName: brandName.trim() || null,
					gradientStart,
					gradientEnd,
				}),
			]);
			await refreshRestaurant();
			setBrandingMessage("Brand identity saved.");
		} catch (requestError) {
			setError(requestError.message);
			return;
		} finally {
			setSaving(false);
		}
		localStorage.setItem(
			ACCEPTING_ORDERS_KEY,
			String(acceptingOrders)
		);

		window.dispatchEvent(
			new CustomEvent(
				"accepting-orders-changed",
				{
					detail: acceptingOrders,
				}
			)
		);

		setSaved(true);

		setTimeout(() => {
			setSaved(false);
		}, 1500);
	};

	const handleLogoUpload = async () => {
		if (!logoFile) return;
		setBrandingMessage("");
		setError("");
		if (!logoFile.type.startsWith("image/")) {
			setError("Choose an image file for your logo.");
			return;
		}
		if (logoFile.size > 5 * 1024 * 1024) {
			setError("Logo images must be 5 MB or smaller.");
			return;
		}
		setLogoUploading(true);
		try {
			const updated = await adminApi.uploadRestaurantLogo(logoFile);
			setLogoUrl(updated.branding?.logoUrl || updated.logoUrl || "");
			setLogoFile(null);
			await refreshRestaurant();
			setBrandingMessage("Restaurant logo updated.");
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setLogoUploading(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl">
			{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
			<motion.div
				initial={{
					opacity: 0,
					y: -10,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
			>
				<div>
					<p className="text-sm text-gray-400">
						Restaurant management
					</p>

					<h1 className="mt-1 text-3xl font-bold text-gray-900">
						Settings
					</h1>

					<p className="mt-1 text-gray-500">
						Manage restaurant profile and order preferences.
					</p>
				</div>

				<motion.button
					whileHover={{ y: -2 }}
					whileTap={{ scale: 0.97 }}
					onClick={handleSave}
					disabled={saving}
					className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
				>
					<Save size={18} />
					{saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
				</motion.button>
			</motion.div>

			<div className="mt-8 space-y-5">
				<SettingSection
					title="Brand identity"
					description="Your logo and two-color gradient appear in the admin and customer menu."
				>
					<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
						<div className="space-y-5">
							<label className="block text-sm">
								<span className="mb-1 block font-medium text-gray-700">Custom brand name</span>
								<input value={brandName} maxLength={60} onChange={(event) => setBrandName(event.target.value)} placeholder={restaurantName || "Use restaurant name"} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]" />
								<span className="mt-1 block text-xs text-gray-500">Leave empty to use {restaurantName || "your restaurant name"}.</span>
							</label>
							<div className="flex items-center gap-4">
								<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-500">
									{logoUrl ? <img src={logoUrl} alt="Restaurant logo preview" className="h-full w-full object-cover" /> : <ImagePlus size={24} />}
								</div>
								<div className="min-w-0 flex-1">
									<label className="block text-sm font-medium text-gray-700" htmlFor="restaurant-logo">Restaurant logo</label>
									<input id="restaurant-logo" type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} className="mt-2 block w-full min-w-0 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#e86a33]" />
									<p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP · 5 MB maximum</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-3">
								<button type="button" onClick={handleLogoUpload} disabled={!logoFile || logoUploading} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#e86a33] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
									<Upload size={16} /> {logoUploading ? "Uploading..." : "Upload logo"}
								</button>
								{logoFile && <span className="self-center max-w-56 truncate text-xs text-gray-500">{logoFile.name}</span>}
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<ColorField label="Gradient start" value={gradientStart} onChange={setGradientStart} />
								<ColorField label="Gradient end" value={gradientEnd} onChange={setGradientEnd} />
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<button type="button" onClick={() => { setGradientStart("#e86a33"); setGradientEnd("#f7c59f"); }} className="min-h-10 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Reset colors</button>
								{brandingMessage && <span role="status" className="text-sm text-green-700">{brandingMessage}</span>}
							</div>
						</div>
						<div className="flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl border border-gray-100 bg-white p-4">
							<p className="mb-3 text-xs font-medium text-gray-500">Customer menu preview</p>
							<div className="rounded-xl p-4 text-white" style={{ backgroundImage: `linear-gradient(125deg, ${gradientStart}, ${gradientEnd})` }}>
								<div className="flex items-center gap-3">
									{logoUrl ? <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg bg-white object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20"><ImagePlus size={18} /></div>}
									<div><p className="text-[10px] font-semibold uppercase">Table 12</p><p className="break-words font-semibold">{brandName.trim() || restaurantName || "Your restaurant"}</p></div>
								</div>
								<p className="mt-5 text-lg font-semibold">Chef&apos;s picks</p>
								<p className="mt-1 text-xs opacity-90">Your menu, with your brand.</p>
							</div>
						</div>
					</div>
				</SettingSection>

				<SettingSection
					title="Restaurant Profile"
					description="Information shown to your team and customers."
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								Restaurant Name
							</span>

							<input
								value={restaurantName}
								onChange={(e) =>
									setRestaurantName(e.target.value)
								}
								className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]"
							/>
						</label>

						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								Contact Email
							</span>

							<input
								type="email"
								value={restaurantEmail}
								onChange={(e) => setRestaurantEmail(e.target.value)}
								className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]"
							/>
						</label>
					</div>
				</SettingSection>

				<SettingSection
					title="Location & Local Context"
					description="Restaurant coordinates, local timezone and nearby search radius."
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Address</span><input value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">City</span><input value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Latitude</span><input type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="e.g. 19.0760" className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Longitude</span><input type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="e.g. 72.8777" className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Nearby radius (km)</span><input type="number" min="1" max="50" step="1" value={contextRadiusKm} onChange={(event) => setContextRadiusKm(event.target.value)} className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
						<label className="text-sm"><span className="mb-1 block font-medium text-gray-700">IANA timezone</span><input value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Asia/Kolkata" className="w-full rounded-lg border border-orange-100 px-3 py-2.5 outline-none focus:border-[#e86a33]" /></label>
					</div>
				</SettingSection>

				<SettingSection
					title="Billing"
					description="Taxes and charges applied to customer orders."
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								Service Charge (%)
							</span>

							<input
								type="number"
								min={0}
								max={30}
								value={serviceCharge}
								onChange={(e) =>
									setServiceCharge(Number(e.target.value))
								}
								className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]"
							/>
						</label>

						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								GST / Tax Rate (%)
							</span>

							<input
								type="number"
								min={0}
								max={40}
								value={taxRate}
								onChange={(e) =>
									setTaxRate(Number(e.target.value))
								}
								className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]"
							/>
						</label>
					</div>
				</SettingSection>

				<SettingSection
					title="Order Preferences"
					description="Control how incoming orders are handled."
				>
					<div className="space-y-3">
						<ToggleRow
							label="Accept New Orders"
							description="Turn this off when your restaurant is closed."
							checked={acceptingOrders}
							onChange={(value) => {
								setAcceptingOrders(value);

								localStorage.setItem(
									ACCEPTING_ORDERS_KEY,
									String(value)
								);

								window.dispatchEvent(
									new CustomEvent(
										"accepting-orders-changed",
										{
											detail: value,
										}
									)
								);
							}}
						/>

						<ToggleRow
							label="Auto Accept Orders"
							description="Automatically confirm orders without manual review."
							checked={autoAcceptOrders}
							onChange={setAutoAcceptOrders}
						/>
					</div>
				</SettingSection>
			</div>
		</div>
	);
}

function ColorField({ label, value, onChange }) {
	return (
		<label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
			<span className="min-w-0 truncate font-medium text-gray-700">{label}</span>
			<span className="flex shrink-0 items-center gap-2">
				<span className="font-mono text-xs text-gray-500">{value.toUpperCase()}</span>
				<input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
			</span>
		</label>
	);
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-2xl border border-orange-100 p-4">
			<div>
				<p className="text-sm font-semibold text-gray-900">
					{label}
				</p>

				<p className="mt-1 text-sm text-gray-500">
					{description}
				</p>
			</div>

			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative h-7 w-12 rounded-full transition ${
					checked
						? "bg-[#e86a33]"
						: "bg-gray-200"
				}`}
			>
				<span
					className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
						checked ? "left-6" : "left-1"
					}`}
				/>
			</button>
		</div>
	);
}
