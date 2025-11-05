import React from "react";
import { Card } from "@tremor/react";
import { useNavigate } from "react-router-dom";

const IntegrationsCopy: React.FC = React.memo(() => {
	const navigate = useNavigate();

	const integrationCategories = [
		{
			title: "Scheduling Platforms",
			items: [
				{ name: "Calendly", logo: "/logo/calendly.svg" },
				{ name: "OnceHub", logo: "/logo/oncehub.svg" },
			],
		},
		{
			title: "Ad Tracking Platforms",
			items: [
				{ name: "Google Ads", logo: "/logo/google.svg" },
				{ name: "Meta Ads", logo: "/logo/meta.svg" },
				{ name: "Hyros", logo: "/logo/hyros.svg" },
			],
		},
		{
			title: "Other",
			items: [{ name: "Typeform", logo: "/logo/typeform.svg" }],
		},
	];

	const handleConnect = async (item: string) => {
		try {
			if (item.toLowerCase().replace(/\s+/g, "-") === "google-ads") {
				navigate("/settings/integrations/google-ads");
			} else if (item.toLowerCase().replace(/\s+/g, "-") === "meta-ads") {
				navigate("/settings/integrations/meta-ads");
			} else if (item.toLowerCase().replace(/\s+/g, "-") === "calendly") {
				navigate("/settings/integrations/calendly");
			} else if (item.toLowerCase().replace(/\s+/g, "-") === "oncehub") {
				navigate("/settings/integrations/oncehub");
			} else if (item.toLowerCase().replace(/\s+/g, "-") === "typeform") {
				navigate("/settings/integrations/typeform");
			} else {
				navigate(
					`/settings/integrations/${item
						.toLowerCase()
						.replace(/\s+/g, "-")}/accounts`
				);
			}
		} catch (error) {
			console.error("Navigation failed:", error);
		}
	};

	return (
		<div className="space-y-8">
			{integrationCategories.map((category) => (
				<div key={category.title}>
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						{category.title}
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
						{category.items.map((item) => (
							<Card
								key={item.name}
								className="h-32 flex flex-col items-center justify-center text-center p-4 hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
								onClick={() => handleConnect(item.name)}
							>
								<img
									src={item.logo}
									alt={`${item.name} logo`}
									className="w-8 h-8 mb-2 object-contain"
								/>
								<span className="font-medium text-gray-700 group-hover:opacity-0 transition-opacity duration-300">
									{item.name}
								</span>
								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<span className="font-medium text-blue-600 bg-white px-3 py-1 rounded-md shadow-md">
										Configure
									</span>
								</div>
							</Card>
						))}
					</div>
				</div>
			))}
		</div>
	);
});

export default IntegrationsCopy;
