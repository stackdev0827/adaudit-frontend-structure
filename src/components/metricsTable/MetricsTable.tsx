import React, { useState, useEffect } from "react";
import { CampaignMetrics } from "../../types/metrics";
import MetricsTableRow from "./MetricsTableRow";
import { metricsApi } from "../../services/api";
import { HelpCircle } from "lucide-react";
import { eventMetrics, metricDescriptions } from "../../constants/metricsTable";

interface MetricsTableProps {
	payload: any;
	data: CampaignMetrics[];
	onDataUpdate: (updatedData: CampaignMetrics[]) => void;
}

const MetricsTable: React.FC<MetricsTableProps> = ({
	payload,
	data,
	onDataUpdate,
}) => {
	const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
		new Set()
	);
	const [showTooltip, setShowTooltip] = useState<string | null>(null);
	const [expandedAdsets, setExpandedAdsets] = useState<Set<string>>(
		new Set()
	);
	const [loadingAdsets, setLoadingAdsets] = useState<Set<string>>(new Set());
	const [loadingAds, setLoadingAds] = useState<Set<string>>(new Set());

	// State for dynamic fields based on payload
	const [staticFields, setStaticFields] = useState(["Campaign"]);
	const [timeframes, setTimeframes] = useState<string[]>([]);
	const [activeEventMetrics, setActiveEventMetrics] = useState(eventMetrics);

	// Add new state variables for sales metrics
	const [salesTimeframes, setSalesTimeframes] = useState<string[]>([]);
	const [salesMetrics, setSalesMetrics] = useState<string[]>([]);

	// Process payload to determine which fields to show
	useEffect(() => {
		if (payload) {
			// Map payload rules to static fields
			const staticFieldMap: Record<string, string> = {
				previous_grade: "Previous Grade",
				grade: "Grade",
				campaign_name: "Campaign",
				budget: "Budget",
				audience: "Audience",
				days_live: "Days",
				total_spend: "Total Spend",
				creatives: "Creatives",
				launch_date: "Data Launched",
				// notes: "Notes",
			};

			const enabledStaticFields = Object.entries(payload.rules || {})
				.filter(([_, value]) => value)
				.map(([key]) => staticFieldMap[key] || key);

			// Define priority fields that should appear first
			const priorityFields = ["Campaign", "Previous Grade", "Grade"];

			// Separate priority fields from other fields
			const otherFields = enabledStaticFields.filter(
				(field) => !priorityFields.includes(field)
			);

			// Combine priority fields first, then other fields
			const finalStaticFields = [...priorityFields, ...otherFields];

			// Map payload time_frames to timeframes
			const timeFrameMap: Record<string, string> = {
				yesterday: "Yesterday",
				two_days_ago: "2 Days Ago",
				last_4_days: "Last 4 Days",
				last_7_days: "Last 7 Days",
				last_14_days: "Last 14 Days",
				last_30_days: "Last 30 Days",
				total: "Total",
			};

			// Get enabled timeframes
			const enabledTimeframes = Object.entries(payload.time_frames || {})
				.filter(([_, value]) => value)
				.map(([key]) => timeFrameMap[key] || key);

			// Build event metrics
			const enabledEventMetrics: string[] = [];

			// Handle sales timeframes separately
			const salesTimeframes: string[] = [];
			const salesMetrics: string[] = [];

			// Check if any sales timeframe is enabled
			const hasSalesTimeframe =
				payload.events?.sales?.time_frames &&
				Object.values(payload.events.sales.time_frames).some(
					(value) => value
				);

			if (payload.events?.sales) {
				// When no sales timeframe is selected but sales metrics are enabled
				if (!hasSalesTimeframe) {
					console.log("---------");
					if (
						payload.events.sales.product_groups?.[0]?.name === "all"
					) {
						// Add sales metrics to general event metrics
						if (payload.events.sales.metrics?.count_of_sales)
							enabledEventMetrics.push("# of Sales");
						if (payload.events.sales.metrics?.revenue)
							enabledEventMetrics.push("Rev");
						if (payload.events.sales.metrics?.cash_collected)
							enabledEventMetrics.push("Cash");
						if (payload.events.sales.metrics?.roas)
							enabledEventMetrics.push("ROAS Rev");
						if (payload.events.sales.metrics?.roas_cash)
							enabledEventMetrics.push("ROAS Cash");
						if (payload.events.sales.metrics?.cost_per_sale)
							enabledEventMetrics.push("CPS");
					} else {
						payload.events.sales.product_groups?.forEach(
							(group: any) => {
								if (
									payload.events.sales.metrics?.count_of_sales
								)
									enabledEventMetrics.push(
										`${group.name}-# of Sales`
									);
								if (payload.events.sales.metrics?.revenue)
									enabledEventMetrics.push(
										`${group.name}-Rev`
									);
								if (
									payload.events.sales.metrics?.cash_collected
								)
									enabledEventMetrics.push(
										`${group.name}-Cash`
									);
								if (payload.events.sales.metrics?.roas)
									enabledEventMetrics.push(
										`${group.name}-ROAS Rev`
									);
								if (payload.events.sales.metrics?.roas_cash)
									enabledEventMetrics.push(
										`${group.name}-ROAS Cash`
									);
								if (payload.events.sales.metrics?.cost_per_sale)
									enabledEventMetrics.push(
										`${group.name}-CPS`
									);
							}
						);
					}
				} else {
					// When specific sales timeframes are selected
					// Get enabled sales timeframes
					Object.entries(payload.events.sales.time_frames || {})
						.filter(([_, value]) => value)
						.forEach(([key]) => {
							salesTimeframes.push(timeFrameMap[key] || key);
						});
					console.log(salesTimeframes);
					// Get sales metrics based on product groups
					if (
						payload.events.sales.product_groups?.[0]?.name === "all"
					) {
						// Add general sales metrics
						if (payload.events.sales.metrics?.count_of_sales)
							salesMetrics.push("# of Sales");
						if (payload.events.sales.metrics?.revenue)
							salesMetrics.push("Rev");
						if (payload.events.sales.metrics?.cash_collected)
							salesMetrics.push("Cash");
						if (payload.events.sales.metrics?.roas)
							salesMetrics.push("ROAS Rev");
						if (payload.events.sales.metrics?.roas_cash)
							salesMetrics.push("ROAS Cash");
						if (payload.events.sales.metrics?.cost_per_sale)
							salesMetrics.push("CPS");
					} else {
						payload.events.sales.product_groups?.forEach(
							(group: any) => {
								if (
									payload.events.sales.metrics?.count_of_sales
								)
									salesMetrics.push(
										`${group.name}-# of Sales`
									);
								if (payload.events.sales.metrics?.revenue)
									salesMetrics.push(`${group.name}-Rev`);
								if (
									payload.events.sales.metrics?.cash_collected
								)
									salesMetrics.push(`${group.name}-Cash`);
								if (payload.events.sales.metrics?.roas)
									salesMetrics.push(`${group.name}-ROAS Rev`);
								if (payload.events.sales.metrics?.roas_cash)
									salesMetrics.push(
										`${group.name}-ROAS Cash`
									);
								if (payload.events.sales.metrics?.cost_per_sale)
									salesMetrics.push(`${group.name}-CPS`);
							}
						);
					}
				}
			}

			// Add other event metrics
			if (payload.events?.lead_form_submissions) {
				if (payload.events.lead_form_submissions.new)
					enabledEventMetrics.push("N Leads");
				if (payload.events.lead_form_submissions.total)
					enabledEventMetrics.push("Leads");
				if (payload.events.lead_form_submissions.cp_new)
					enabledEventMetrics.push("CP N Lead");
				if (payload.events.lead_form_submissions.cp_total)
					enabledEventMetrics.push("CP Lead");
			}

			if (payload.events?.applications) {
				if (payload.events.applications.total)
					enabledEventMetrics.push("Apps");
				if (payload.events.applications.qualified)
					enabledEventMetrics.push("Q Apps");
				if (payload.events.applications.unqualified)
					enabledEventMetrics.push("UQ Apps");
				if (payload.events.applications.cp_total)
					enabledEventMetrics.push("CP App");
				if (payload.events.applications.cp_qualified)
					enabledEventMetrics.push("CP Q App");
				if (payload.events.applications.cp_unqualified)
					enabledEventMetrics.push("CP UQ App");
			}

			if (payload.events?.booked_calls) {
				if (payload.events.booked_calls.total)
					enabledEventMetrics.push("BC");
				if (payload.events.booked_calls.qualified)
					enabledEventMetrics.push("Q BC");
				if (payload.events.booked_calls.unqualified)
					enabledEventMetrics.push("UQ BC");
				if (payload.events.booked_calls.confirmed)
					enabledEventMetrics.push("CFM BC");
				if (payload.events.booked_calls.showed)
					enabledEventMetrics.push("BC Sh");
				if (payload.events.booked_calls.cp_total)
					enabledEventMetrics.push("CP BC");
				if (payload.events.booked_calls.cp_qualified)
					enabledEventMetrics.push("CP Q BC");
				if (payload.events.booked_calls.cp_unqualified)
					enabledEventMetrics.push("CP UQ BC");
				if (payload.events.booked_calls.cp_confirmed)
					enabledEventMetrics.push("CP CFM BC");
				if (payload.events.booked_calls.cp_showed)
					enabledEventMetrics.push("CP BC Sh");
				// if (payload.events.booked_calls.live)
				// 	enabledEventMetrics.push("liveCalls");
			}

			if (payload.events?.sets) {
				if (payload.events.sets.total) enabledEventMetrics.push("Sets");
				if (payload.events.sets.outbound)
					enabledEventMetrics.push("OB Sets");
				if (payload.events.sets.inbound)
					enabledEventMetrics.push("IB Sets");
				if (payload.events.sets.new_opportunity)
					enabledEventMetrics.push("NO Sets");
				if (payload.events.sets.cp_total)
					enabledEventMetrics.push("CP Set");
				if (payload.events.sets.cp_outbound)
					enabledEventMetrics.push("CP OB Set");
				if (payload.events.sets.cp_inbound)
					enabledEventMetrics.push("CP IB Set");
				if (payload.events.sets.cp_new_opportunity)
					enabledEventMetrics.push("CP NO Set");
			}

			if (payload.events?.qualified_opportunities) {
				if (payload.events.qualified_opportunities.total)
					enabledEventMetrics.push("QO");
				if (payload.events.qualified_opportunities.new)
					enabledEventMetrics.push("NQO");
				if (payload.events.qualified_opportunities.live)
					enabledEventMetrics.push("NQO Sh");
				if (payload.events.qualified_opportunities.cp_total)
					enabledEventMetrics.push("CP QO");
				if (payload.events.qualified_opportunities.cp_new)
					enabledEventMetrics.push("CP NQO");
				if (payload.events.qualified_opportunities.cp_live)
					enabledEventMetrics.push("CP NQO Sh ");
			}

			if (payload.events?.offers?.total) enabledEventMetrics.push("OM");
			if (payload.events?.offers?.cp_total)
				enabledEventMetrics.push("CP OM");
			if (payload.events?.add_to_carts?.total)
				enabledEventMetrics.push("ATC");
			if (payload.events?.add_to_carts?.cp_total)
				enabledEventMetrics.push("CP ATC");

			if (payload.events?.ad_metrics?.meta) {
				if (payload.events.ad_metrics.meta.ctr)
					enabledEventMetrics.push("CTR(Meta)");
				if (payload.events.ad_metrics.meta.cpc)
					enabledEventMetrics.push("CPC(Meta)");
				if (payload.events.ad_metrics.meta.link_clicks)
					enabledEventMetrics.push("Link Clicks(Meta)");
				if (payload.events.ad_metrics.meta.cplc)
					enabledEventMetrics.push("CP Link Click(Meta)");
				if (payload.events.ad_metrics.meta.impressions)
					enabledEventMetrics.push("Imp(Meta)");
				if (payload.events.ad_metrics.meta.cpm)
					enabledEventMetrics.push("CPM(Meta)");
				if (payload.events.ad_metrics.meta.reach)
					enabledEventMetrics.push("Reach(Meta)");
				if (payload.events.ad_metrics.meta.video_watch)
					enabledEventMetrics.push("Vid Watch %(Meta)");
				if (payload.events.ad_metrics.meta.click_quality)
					enabledEventMetrics.push("Click Q(Meta)");
			}

			if (payload.events?.ad_metrics?.google) {
				if (payload.events.ad_metrics.google.clicks)
					enabledEventMetrics.push("Clicks(Google)");
				if (payload.events.ad_metrics.google.ctr)
					enabledEventMetrics.push("CTR(Google)");
				if (payload.events.ad_metrics.google.cpc)
					enabledEventMetrics.push("CPC(Google)");
				if (payload.events.ad_metrics.google.impressions)
					enabledEventMetrics.push("Imp(Google)");
				if (payload.events.ad_metrics.google.reach)
					enabledEventMetrics.push("Reach(Google)");
				if (payload.events.ad_metrics.google.video_watch)
					enabledEventMetrics.push("Vid Watch %(Google)");
			}

			// Update state with the enabled fields
			setStaticFields(finalStaticFields);
			setTimeframes(enabledTimeframes);
			setActiveEventMetrics(enabledEventMetrics);
			console.log(salesTimeframes);
			setSalesTimeframes(salesTimeframes);
			setSalesMetrics(salesMetrics);
		}
	}, [payload]);

	const handleToggleExpand = (campaignId: string) => {
		// console.log(campaignId);
		setExpandedCampaigns((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(campaignId)) {
				newSet.delete(campaignId);
			} else {
				newSet.add(campaignId);
			}
			return newSet;
		});
	};

	const handleToggleAdsetExpand = (adsetId: string) => {
		setExpandedAdsets((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(adsetId)) {
				newSet.delete(adsetId);
			} else {
				newSet.add(adsetId);
			}
			return newSet;
		});
	};

	const handleLoadAdsets = async (campaignId: string) => {
		if (loadingAdsets.has(campaignId)) return;

		setLoadingAdsets((prev) => new Set(prev).add(campaignId));

		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Find the campaign to get its data for generating sample adsets
			const campaign = data.find((c) => c.campaign_id === campaignId);
			if (!campaign) return;

			const testAdSets = await metricsApi.getAdsets(campaignId, payload);
			// console.log("+++++++++++++++++", testAdSets.data);

			// Update the campaign data with static adsets
			const updatedData = data.map((campaign) => {
				if (campaign.campaign_id === campaignId) {
					return {
						...campaign,
						adsets: testAdSets.data.data,
					};
				}
				return campaign;
			});

			onDataUpdate(updatedData);
		} catch (error) {
			console.error("Failed to load adsets:", error);
			// You might want to show an error message to the user here
		} finally {
			setLoadingAdsets((prev) => {
				const newSet = new Set(prev);
				newSet.delete(campaignId);
				return newSet;
			});
		}
	};

	const handleLoadAds = async (adsetId: string) => {
		if (loadingAds.has(adsetId)) return;

		setLoadingAds((prev) => new Set(prev).add(adsetId));

		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Find the adset to get its data for generating sample ads
			let targetAdset = null;
			let targetCampaign = null;

			for (const campaign of data) {
				if (campaign.adsets) {
					const adset = campaign.adsets.find(
						(a) => a.adset_id === adsetId
					);
					if (adset) {
						targetAdset = adset;
						targetCampaign = campaign;
						break;
					}
				}
			}

			if (!targetAdset || !targetCampaign) return;
		} catch (error) {
			console.error("Failed to load ads:", error);
		} finally {
			setLoadingAds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(adsetId);
				return newSet;
			});
		}
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border-separate border-spacing-0 text-xs mb-8 rounded-lg overflow-hidden">
				<thead>
					<tr>
						{/* Static Fields Headers */}
						{staticFields.map((field) => (
							<th
								key={field}
								rowSpan={
									salesTimeframes.length > 0 ||
									activeEventMetrics.length > 0
										? 2
										: 1
								}
								className={`border border-gray-200 px-3 py-2 bg-gray-100 font-semibold text-center align-middle ${
									field === "Campaign" ? "sticky left-0" : ""
								}`}
								style={{
									position:
										field === "Campaign"
											? "sticky"
											: undefined,
									left: field === "Campaign" ? 0 : undefined,
									zIndex:
										field === "Campaign" ? 2 : undefined,
									background: "#f3f4f6",
									minWidth:
										field === "Campaign" ? "700px" : "80px",
								}}
							>
								{field}
							</th>
						))}

						{/* Sales Timeframe Headers */}
						{salesTimeframes.map((timeframe) => (
							<th
								key={`sales-${timeframe}`}
								colSpan={salesMetrics.length}
								className="border border-gray-200 px-3 py-2 bg-green-100 font-semibold text-center"
							>
								{timeframe}
							</th>
						))}

						{/* Regular Timeframe Headers */}
						{timeframes.map((timeframe) => (
							<th
								key={timeframe}
								colSpan={activeEventMetrics.length}
								className="border border-gray-200 px-3 py-2 bg-blue-100 font-semibold text-center"
							>
								{timeframe}
							</th>
						))}
					</tr>

					<tr>
						{/* Sales Metrics Headers for each sales timeframe */}
						{/* Sales Metrics Headers for each sales timeframe */}
						{salesTimeframes.map((timeframe) =>
							salesMetrics.map((metric) => (
								<th
									key={`sales-${timeframe}-${metric}`}
									className="border border-gray-200 px-2 py-1 bg-green-50 font-medium text-center text-xs"
									style={{ minWidth: "70px" }}
								>
									<div className="flex items-center justify-center gap-1">
										<span title={metric}>{metric}</span>
										<div
											className="relative"
											onMouseEnter={() =>
												setShowTooltip(
													`sales-${timeframe}-${metric}`
												)
											}
											onMouseLeave={() =>
												setShowTooltip(null)
											}
										>
											<HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
											{showTooltip ===
												`sales-${timeframe}-${metric}` && (
												<div className="absolute z-50 bg-black text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
													{(
														metricDescriptions as Record<
															string,
															string
														>
													)[metric] ||
														"No description available"}
													<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
												</div>
											)}
										</div>
									</div>
								</th>
							))
						)}

						{/* Event & Metrics Headers for each regular timeframe */}
						{/* Event & Metrics Headers for each regular timeframe */}
						{timeframes.map((timeframe) =>
							activeEventMetrics.map((metric) => (
								<th
									key={`${timeframe}-${metric}`}
									className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium text-center text-xs"
									style={{ minWidth: "70px" }}
								>
									<div className="flex items-center justify-center gap-1">
										<span title={metric}>{metric}</span>
										<div
											className="relative"
											onMouseEnter={() =>
												setShowTooltip(
													`sales-${timeframe}-${metric}`
												)
											}
											onMouseLeave={() =>
												setShowTooltip(null)
											}
										>
											<HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
											{showTooltip ===
												`sales-${timeframe}-${metric}` && (
												<div className="absolute z-50 bg-black text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
													{(
														metricDescriptions as Record<
															string,
															string
														>
													)[metric] ||
														"No description available"}
													<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
												</div>
											)}
										</div>
									</div>
								</th>
							))
						)}
					</tr>
				</thead>

				<tbody>
					{data &&
						data.map((campaign) => (
							<MetricsTableRow
								key={campaign.campaign_id}
								campaign={campaign}
								staticFields={staticFields}
								timeframes={timeframes}
								eventMetrics={activeEventMetrics}
								salesTimeframes={salesTimeframes}
								salesMetrics={salesMetrics}
								isExpanded={expandedCampaigns.has(
									campaign.campaign_id
								)}
								onToggleExpand={handleToggleExpand}
								onLoadAdsets={handleLoadAdsets}
								loadingAdsets={loadingAdsets.has(
									campaign.campaign_id
								)}
								expandedAdsets={expandedAdsets}
								onToggleAdsetExpand={handleToggleAdsetExpand}
								onLoadAds={handleLoadAds}
								loadingAds={loadingAds}
							/>
						))}
				</tbody>
			</table>
		</div>
	);
};

export default MetricsTable;
