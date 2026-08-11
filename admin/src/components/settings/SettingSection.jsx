export default function SettingSection({
	title,
	description,
	children,
}) {
	return (
		<section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
			<div>
				<h3 className="text-lg font-semibold text-gray-900">
					{title}
				</h3>

				{description && (
					<p className="mt-1 text-sm text-gray-500">
						{description}
					</p>
				)}
			</div>

			<div className="mt-5">
				{children}
			</div>
		</section>
	);
}
