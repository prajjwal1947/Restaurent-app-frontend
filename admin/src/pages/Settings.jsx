import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";

import SettingSection from "../components/settings/SettingSection";

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
	const [restaurantName, setRestaurantName] =
		useState("DineFlow Restaurant");

	const [serviceCharge, setServiceCharge] =
		useState(5);

	const [taxRate, setTaxRate] =
		useState(18);

	const [acceptingOrders, setAcceptingOrders] =
		useState(readAcceptingOrders);

	const [autoAcceptOrders, setAutoAcceptOrders] =
		useState(false);

	const [saved, setSaved] =
		useState(false);

	const handleSave = () => {
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

	return (
		<div className="mx-auto max-w-5xl">
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
					className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
				>
					<Save size={18} />
					{saved ? "Saved" : "Save Changes"}
				</motion.button>
			</motion.div>

			<div className="mt-8 space-y-5">
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
								defaultValue="admin@dineflow.com"
								className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none focus:border-[#e86a33]"
							/>
						</label>
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
