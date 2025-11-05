import React, { useState } from "react";
// import { CampaignMetrics } from "../../types/metrics";
import { ChevronDown, ChevronRight, Loader2, X } from "lucide-react";
import { metricsTableApi } from "../../services/api";

interface MetricsTableRowProps {
	campaign: any; // Using 'any' to match your data structure
	staticFields: string[];
	timeframes: string[];
	eventMetrics: string[];
	salesTimeframes: string[];
	salesMetrics: string[];
	isExpanded: boolean;
	onToggleExpand: (campaignId: string) => void;
	onLoadAdsets: (campaignId: string) => void;
	loadingAdsets: boolean;
	expandedAdsets: Set<string>;
	onToggleAdsetExpand: (adsetId: string) => void;
	onLoadAds: (adsetId: string, campaignId: string) => void;
	loadingAds: Set<string>;
}

const MetricsTableRow: React.FC<MetricsTableRowProps> = ({
	campaign,
	staticFields,
	timeframes,
	eventMetrics,
	salesTimeframes,
	salesMetrics,
	isExpanded,
	onToggleExpand,
	onLoadAdsets,
	loadingAdsets,
	expandedAdsets,
	onToggleAdsetExpand,
	onLoadAds,
	// loadingAds,
}) => {
	const [showGradeDialog, setShowGradeDialog] = useState(false);
	const [showPreviousGradeDialog, setShowPreviousGradeDialog] =
		useState(false);
	const [gradeInput, setGradeInput] = useState("1");
	const [commentInput, setCommentInput] = useState("");
	const [todayGrade, setTodayGrade] = useState<any[]>([]);
	const [loadingGrade, setLoadingGrade] = useState(false);
	const [loadingPreviousGrades, setLoadingPreviousGrades] = useState(false);
	const [previousGrades, setPreviousGrades] = useState<any[]>([]);
	const [saveCampaignId, setSaveCampaignId] = useState("");
	const [platform, setPlatform] = useState("");

	const gradeOptions = ["Not Qualified", "Triage", "Qualified", "Best Fit"];

	const timeframeMap = {
		yesterday: "yesterday",
		"2 days ago": "two_days_ago",
		"last 4 days": "last_4_days",
		total: "total",
	};

	const fetchTodayGrade = async (campaignId: string) => {
		setLoadingGrade(true);
		try {
			// TODO: Replace with actual API endpoint
			const response = await metricsTableApi.getTodayGrade(campaignId);
			// const response = await fetch(`/api/campaigns/${campaignId}/grade/today`);
			const data = await response.data;
			// console.log(data);
			setTodayGrade(data || "");
		} catch (error) {
			console.error("Failed to fetch today's grade:", error);
		} finally {
			setLoadingGrade(false);
		}
	};

	const fetchAllGrades = async (campaignId: string) => {
		setLoadingPreviousGrades(true);
		try {
			// TODO: Replace with actual API endpoint
			const response = await metricsTableApi.getGrade(campaignId);
			const data = await response.data;
			// console.log(data);
			setPreviousGrades(data || gradeOptions);
		} catch (error) {
			console.error("Failed to fetch all grades:", error);
			setPreviousGrades(gradeOptions);
		} finally {
			setLoadingPreviousGrades(false);
		}
	};

	const handleGradeSave = async (campaignId: string) => {
		const now = new Date();
		const formattedDate = now.toISOString().slice(0, 10);
		try {
			await metricsTableApi.saveGrade(
				campaignId,
				formattedDate,
				gradeInput,
				commentInput,
				platform
			);

			// Update the campaign's grade immediately after successful save
			campaign.campaign_grade = {
				grade: gradeInput,
				comment: commentInput,
				date: formattedDate,
			};

			setShowGradeDialog(false);
			setGradeInput("");
			setCommentInput("");
		} catch (error) {
			console.error("Failed to save grade:", error);
		}
	};

	// Helper function to get static field value
	const getStaticFieldValue = (field: string) => {
		switch (field) {
			case "Campaign": {
				const src = (campaign.ad_source || "").toString().toLowerCase();
				const isFacebook =
					src.includes("facebook") || src.includes("meta");
				const isGoogle = src.includes("google");
				return (
					<div className="flex items-center gap-1 group relative">
						{isFacebook && (
							<img
								src="/logo/meta.svg"
								alt="Facebook"
								width={16}
								height={16}
							/>
						)}
						{isGoogle && (
							<img
								src="/logo/google.svg"
								alt="Google"
								width={16}
								height={16}
							/>
						)}
						<div className="flex flex-col min-w-0 flex-1">
							<span
								className="text-xs block overflow-hidden text-ellipsis whitespace-nowrap"
								title={campaign.campaign_name}
								style={{ width: "600px" }}
							>
								{campaign.campaign_name}
							</span>
							<span className="text-xs text-gray-500 ">
								ID: {campaign.campaign_id}
							</span>
						</div>
						{/* Tooltip */}
						{/* <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-full break-words whitespace-normal">
							{campaign.campaign_name} | ID: {campaign.campaign_id}
						</div> */}
					</div>
				);
			}
			case "Budget":
				return campaign.static_metrics?.budget?.toLocaleString() || "-";
			case "Audience":
				return (
					<div
						className="truncate max-w-20"
						title={
							campaign.static_metrics?.audience?.toLocaleString() ||
							"-"
						}
					>
						{campaign.static_metrics?.audience?.toLocaleString() ||
							"-"}
					</div>
				);
			case "Days":
				return campaign.static_metrics?.days_live?.toString() || "-";
			case "Total Spend":
				return (
					campaign.static_metrics?.total_spend?.toLocaleString() ||
					"-"
				);
			case "Creatives":
				return campaign.static_metrics?.creatives?.toString() || "-";
			case "Data Launched":
				return campaign.static_metrics?.launch_date
					? new Date(
							campaign.static_metrics.launch_date
					  ).toLocaleDateString()
					: "-";
			case "Notes":
				return campaign.static_metrics?.notes || "-";
			case "Grade":
				return campaign.static_metrics?.grade || "Set Grade";
			case "Previous Grade":
				if (
					campaign.campaign_grade == null ||
					(typeof campaign.campaign_grade === "object" &&
						Object.keys(campaign.campaign_grade).length === 0)
				) {
					return "No Grade";
				}
				return getGradeText(campaign.campaign_grade.grade);
			default:
				return "-";
		}
	};

	// Helper function to get sales metric value for a specific timeframe and metric
	const getSalesMetricValue = (timeframe: string, metric: string) => {
		// Convert display timeframe to the API timeframe key
		// const timeframeKey = timeframe
		// 	.toLowerCase()
		// 	.replace(/\s+/g, "_")
		// 	.replace("days_ago", "days")
		// 	.replace("2 days ago", "last_2_days");
		const timeframeKey =
			timeframeMap[
				timeframe.toLowerCase() as keyof typeof timeframeMap
			] || timeframe.toLowerCase().replace(/\s+/g, "_");

		// Get the sales data for this timeframe from sales_timeframes
		const salesData =
			campaign.sales_timeframes?.[timeframeKey]?.sales || [];

		if (!salesData || salesData.length === 0) return "-";

		// For product-specific metrics (format: "group-product-metric")
		if (metric.includes("-")) {
			const [groupName, metricName] = metric.split("-");

			// Find the specific product group
			const productGroup = salesData.find(
				(group: any) => group.product_group_name === groupName
			);

			if (!productGroup) return "-";

			switch (metricName) {
				case "# of Sales":
					return productGroup.count_of_sales?.toString() || "-";
				case "Rev":
					return productGroup.revenue?.toLocaleString() || "-";
				case "Cash":
					return productGroup.cash_collected?.toLocaleString() || "-";
				case "ROAS Rev":
					return productGroup.roas?.toFixed(2) || "-";
				case "ROAS Cash":
					return productGroup.roas_cash?.toFixed(2) || "-";
				case "CPS":
					return productGroup.cost_per_sale?.toLocaleString() || "-";
				default:
					return "-";
			}
		}
		// For general metrics (not product-specific)
		else {
			// Find the appropriate product group (could be "all" or first one)
			const productGroup =
				salesData.find(
					(group: any) => group.product_group_name === "all"
				) || salesData[0];

			if (!productGroup) return "-";

			switch (metric) {
				case "# of Sales":
					return productGroup.count_of_sales?.toString() || "-";
				case "Rev":
					return productGroup.revenue?.toLocaleString() || "-";
				case "Cash":
					return productGroup.cash_collected?.toLocaleString() || "-";
				case "ROAS Rev":
					return productGroup.roas?.toFixed(2) || "-";
				case "ROAS Cash":
					return productGroup.roas_cash?.toFixed(2) || "-";
				case "CPS":
					return productGroup.cost_per_sale?.toLocaleString() || "-";
				default:
					return "-";
			}
		}
	};

	// Helper function to get event metric value for a specific timeframe and metric
	const getEventMetricValue = (timeframe: string, metric: string) => {
		// Convert display timeframe to the API timeframe key
		const timeframeKey =
			timeframeMap[
				timeframe.toLowerCase() as keyof typeof timeframeMap
			] || timeframe.toLowerCase().replace(/\s+/g, "_");

		// Get the data for this timeframe from the timeframes object
		const timeframeData = campaign.timeframes?.[timeframeKey];
		if (!timeframeData) return "-";

		// Check if this is a product-specific metric (format: "group-product-metric")
		if (metric.includes("-")) {
			const [groupName, metricName] = metric.split("-");
			const salesData = timeframeData.sales || [];

			// Find the specific product group
			const productGroup = salesData.find(
				(group: any) => group.product_group_name === groupName
			);

			if (!productGroup) return "-";

			// Return the appropriate metric value based on the metric type
			switch (metricName) {
				case "# of Sales":
					return productGroup.count_of_sales?.toString() || "-";
				case "Rev":
					return productGroup.revenue?.toLocaleString() || "-";
				case "Cash":
					return productGroup.cash_collected?.toLocaleString() || "-";
				case "ROAS Rev":
					return productGroup.roas?.toFixed(2) || "-";
				case "ROAS Cash":
					return productGroup.roas_cash?.toFixed(2) || "-";
				case "CPS":
					return productGroup.cost_per_sale?.toLocaleString() || "-";
				default:
					return "-";
			}
		}

		// Return the appropriate metric value based on the metric name
		switch (metric) {
			case "# of Sales":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.count_of_sales?.toString() || "-"
					: timeframeData.sales?.count_of_sales?.toString() || "-";
			case "Rev":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.revenue?.toLocaleString() || "-"
					: timeframeData.sales?.revenue?.toLocaleString() || "-";
			case "Cash":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.cash_collected?.toLocaleString() ||
							"-"
					: timeframeData.sales?.cash_collected?.toLocaleString() ||
							"-";
			case "ROAS Rev":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.roas?.toFixed(2) || "-"
					: timeframeData.sales?.roas?.toFixed(2) || "-";
			case "ROAS Cash":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.roas_cash?.toFixed(2) || "-"
					: timeframeData.sales?.roas_cash?.toFixed(2) || "-";
			case "CPS":
				return Array.isArray(timeframeData.sales)
					? timeframeData.sales[0]?.cost_per_sale?.toFixed(2) || "-"
					: timeframeData.sales?.cost_per_sale?.toFixed(2) || "-";
			// Lead form submissions
			case "N Leads":
				return (
					timeframeData.lead_form_submissions?.new?.toString() || "-"
				);
			case "Leads":
				return (
					timeframeData.lead_form_submissions?.total?.toString() ||
					"-"
				);
			case "CP N Lead":
				return (
					timeframeData.lead_form_submissions?.cp_new?.toFixed(2) ||
					"-"
				);
			case "CP Lead":
				return (
					timeframeData.lead_form_submissions?.cp_total?.toFixed(2) ||
					"-"
				);

			// Applications
			case "Apps":
				return timeframeData.applications?.total?.toString() || "-";
			case "Q Apps":
				return timeframeData.applications?.qualified?.toString() || "-";
			case "UQ Apps":
				return (
					timeframeData.applications?.unqualified?.toString() || "-"
				);
			case "CP App":
				return timeframeData.applications?.cp_total?.toString() || "-";
			case "CP Q App":
				return (
					timeframeData.applications?.cp_qualified?.toString() || "-"
				);
			case "CP UQ App":
				return (
					timeframeData.applications?.cp_unqualified?.toString() ||
					"-"
				);

			// Booked calls
			case "BC":
				return timeframeData.booked_calls?.total?.toString() || "-";
			case "Q BC":
				return timeframeData.booked_calls?.qualified?.toString() || "-";
			case "UQ BC":
				return (
					timeframeData.booked_calls?.unqualified?.toString() || "-"
				);
			case "CFM BC":
				return timeframeData.booked_calls?.confirmed?.toString() || "-";
			case "BC Sh":
				return timeframeData.booked_calls?.showed?.toString() || "-";
			case "liveCalls":
				return timeframeData.booked_calls?.live?.toString() || "-";
			case "CP BC":
				return timeframeData.booked_calls?.cp_total?.toFixed(2) || "-";
			case "CP Q BC":
				return (
					timeframeData.booked_calls?.cp_qualified?.toString() || "-"
				);
			case "CP UQ BC":
				return (
					timeframeData.booked_calls?.cp_unqualified?.toFixed(2) ||
					"-"
				);
			case "CP CFM BC":
				return (
					timeframeData.booked_calls?.cp_confirmed?.toString() || "-"
				);
			case "CP BC Sh":
				return timeframeData.booked_calls?.cp_showed?.toString() || "-";

			// Sales rep calls (using same data as booked_calls since not differentiated in API)
			case "totalCallsWithSalesRep":
				return timeframeData.booked_calls?.total?.toString() || "-";
			case "qualifiedCallsWithSalesRep":
				return timeframeData.booked_calls?.qualified?.toString() || "-";
			case "unqualifiedCallsWithSalesRep":
				return (
					timeframeData.booked_calls?.unqualified?.toString() || "-"
				);
			case "confirmedCallsWithSalesRep":
				return timeframeData.booked_calls?.confirmed?.toString() || "-";
			case "callsShowedWithSalesRep":
				return timeframeData.booked_calls?.showed?.toString() || "-";
			case "liveCallsWithSalesRep":
				return timeframeData.booked_calls?.live?.toString() || "-";

			// Setter calls (using same data as booked_calls since not differentiated in API)
			case "totalCallsWithSetter":
				return timeframeData.booked_calls?.total?.toString() || "-";
			case "qualifiedCallsWithSetter":
				return timeframeData.booked_calls?.qualified?.toString() || "-";
			case "unqualifiedCallsWithSetter":
				return (
					timeframeData.booked_calls?.unqualified?.toString() || "-"
				);
			case "confirmedCallsWithSetter":
				return timeframeData.booked_calls?.confirmed?.toString() || "-";
			case "callsShowedWithSetter":
				return timeframeData.booked_calls?.showed?.toString() || "-";
			case "liveCallsWithSetter":
				return timeframeData.booked_calls?.live?.toString() || "-";

			// Sets
			case "Sets":
				return timeframeData.sets?.total?.toString() || "-";
			case "OB Sets":
				return timeframeData.sets?.outbound?.toString() || "-";
			case "IB Sets":
				return timeframeData.sets?.inbound?.toString() || "-";
			case "NO Sets":
				return timeframeData.sets?.new_opportunity?.toString() || "-";
			case "NQO Sh":
				return timeframeData.sets?.live?.toString() || "-";
			case "CP Set":
				return timeframeData.sets?.cp_total?.toString() || "-";
			case "CP OB Set":
				return timeframeData.sets?.cp_outbound?.toString() || "-";
			case "CP IB Set":
				return timeframeData.sets?.cp_inbound?.toString() || "-";
			case "CP NO Set":
				return (
					timeframeData.sets?.cp_new_opportunity?.toString() || "-"
				);

			// Qualified opportunities
			case "QO":
				return (
					timeframeData.qualified_opportunities?.total?.toString() ||
					"-"
				);
			case "NQO":
				return (
					timeframeData.qualified_opportunities?.new?.toString() ||
					"-"
				);
			// case "NQO Sh":
			// 	return timeframeData.qualified_opportunities?.showed?.toString() || "-";
			case "CP QO":
				return (
					timeframeData.qualified_opportunities?.cp_total?.toString() ||
					"-"
				);
			case "CP NQO":
				return (
					timeframeData.qualified_opportunities?.cp_new?.toString() ||
					"-"
				);
			case "CP NQO Sh":
				return (
					timeframeData.qualified_opportunities?.cp_showed?.toString() ||
					"-"
				);

			// Offers
			case "OM":
				return timeframeData.offers?.total?.toString() || "-";

			// Add to cart
			case "ATC":
				return timeframeData.add_to_carts?.total?.toString() || "-";

			// Custom events (not in API)
			case "totalCustomEvents":
				return "-";

			// Meta ad metrics
			case "clicks":
			case "Link Clicks(Meta)":
				return (
					timeframeData.ad_metrics?.meta?.link_clicks?.toString() ||
					"-"
				);
			case "CTR(Meta)":
			case "linkCtr":
				return timeframeData.ad_metrics?.meta?.ctr?.toFixed(2) || "-";
			case "CPC(Meta)":
				return timeframeData.ad_metrics?.meta?.cpc?.toFixed(2) || "-";
			case "CP Link Click(Meta)":
				return timeframeData.ad_metrics?.meta?.cplc?.toFixed(2) || "-";
			case "Imp(Meta)":
				return (
					timeframeData.ad_metrics?.meta?.impressions?.toString() ||
					"-"
				);
			case "CPM(Meta)":
				return timeframeData.ad_metrics?.meta?.cpm?.toFixed(2) || "-";
			case "Reach(Meta)":
				return timeframeData.ad_metrics?.meta?.reach?.toString() || "-";
			case "Vid Watch %(Meta)":
				return (
					timeframeData.ad_metrics?.meta?.video_watch?.toString() ||
					"-"
				);
			case "Click Q(Meta)":
				return (
					timeframeData.ad_metrics?.meta?.click_quality?.toFixed(1) ||
					"-"
				);
			case "thumbScrollStopRate":
				return "-"; // Not in API

			// Google ad metrics
			case "Clicks(Google)":
				return (
					timeframeData.ad_metrics?.google?.clicks?.toString() || "-"
				);
			case "CTR(Google)":
				return timeframeData.ad_metrics?.google?.ctr?.toFixed(2) || "-";
			case "CPC(Google)":
				return timeframeData.ad_metrics?.google?.cpc?.toFixed(2) || "-";
			case "Imp(Google)":
				return (
					timeframeData.ad_metrics?.google?.impressions?.toString() ||
					"-"
				);
			case "Reach(Google)":
				return (
					timeframeData.ad_metrics?.google?.reach?.toString() || "-"
				);
			case "Vid Watch %(Google)":
				return (
					timeframeData.ad_metrics?.google?.video_watch?.toString() ||
					"-"
				);

			default:
				return "-";
		}
	};

	const getGradeText = (gradeValue: string) => {
		switch (gradeValue) {
			case "1":
				return "Cut";
			case "2":
				return "Below Average";
			case "3":
				return "Good";
			case "4":
				return "Great";
			default:
				return "";
		}
	};

	return (
		<>
			{/* Grade Dialog */}
			{showGradeDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg p-6 w-96">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Set Grade</h3>
							<button
								onClick={() => setShowGradeDialog(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						{loadingGrade ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin" />
							</div>
						) : (
							<>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Today Grade: {todayGrade[0]?.date}{" "}
										{getGradeText(todayGrade[0]?.grade)}
									</label>
									<select
										value={gradeInput}
										onChange={(e) =>
											setGradeInput(e.target.value)
										}
										className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option
											value="1"
											className="text-red-600"
										>
											Cut
										</option>
										<option
											value="2"
											className="text-orange-500"
										>
											Below Average
										</option>
										<option
											value="3"
											className="text-blue-600"
										>
											Good
										</option>
										<option
											value="4"
											className="text-green-600"
										>
											Great
										</option>
									</select>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Comments
									</label>
									<textarea
										value={commentInput}
										onChange={(e) =>
											setCommentInput(e.target.value)
										}
										className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										rows={3}
										placeholder="Add your comments here..."
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<button
										onClick={() =>
											setShowGradeDialog(false)
										}
										className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										onClick={() =>
											handleGradeSave(saveCampaignId)
										}
										className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
									>
										Save
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Previous Grade Dialog */}
			{showPreviousGradeDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg p-6 w-96">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">
								Previous Grades
							</h3>
							<button
								onClick={() =>
									setShowPreviousGradeDialog(false)
								}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						{loadingPreviousGrades ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin" />
							</div>
						) : (
							<div className="space-y-2">
								{previousGrades.map((grade) => (
									<div
										key={grade.id}
										className="relative w-full text-left px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
										title={
											grade.comment
												? `Comment: ${grade.comment}`
												: "No comment"
										}
									>
										<div className="flex justify-between items-center">
											<span className="text-sm font-medium">
												Date: {grade.date}
											</span>
											<span className="text-sm">
												Grade:{" "}
												{getGradeText(grade.grade)}
											</span>
										</div>
										{grade.comment && (
											<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
												{grade.comment}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			<tr className="hover:bg-gray-50">
				{/* Static Fields */}
				{staticFields.map((field, index) => (
					<td
						key={`${campaign.campaign_id}-${field}`}
						className={`border border-gray-200 px-3 py-2 ${
							index === 0
								? "bg-white sticky left-0 z-10"
								: "bg-white"
						}`}
						style={{
							position: index === 0 ? "sticky" : undefined,
							left: index === 0 ? 0 : undefined,
						}}
					>
						{index === 0 ? (
							<div className="flex items-center group relative">
								<button
									onClick={() => {
										onToggleExpand(campaign.campaign_id);
										if (!isExpanded && !campaign.adsets) {
											onLoadAdsets(campaign.campaign_id);
										}
									}}
									className="mr-2 focus:outline-none"
								>
									{loadingAdsets ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : isExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</button>

								{getStaticFieldValue(field)}
							</div>
						) : field === "Grade" || field === "Previous Grade" ? (
							field === "Previous Grade" ? (
								<div className="relative group">
									<button
										className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 w-full"
										onClick={async () => {
											await fetchAllGrades(
												campaign.campaign_id
											);
											setShowPreviousGradeDialog(true);
										}}
									>
										{getStaticFieldValue(field)}
									</button>
									{campaign.campaign_grade &&
										Object.keys(campaign.campaign_grade)
											.length > 0 &&
										campaign.campaign_grade.comment && (
											<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
												{
													campaign.campaign_grade
														.comment
												}
											</div>
										)}
								</div>
							) : (
								<button
									className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
									onClick={async () => {
										if (field === "Grade") {
											await fetchTodayGrade(
												campaign.campaign_id
											);
											setSaveCampaignId(
												campaign.campaign_id
											);
											setPlatform(campaign.ad_source);
											setShowGradeDialog(true);
										}
									}}
								>
									{getStaticFieldValue(field)}
								</button>
							)
						) : (
							getStaticFieldValue(field)
						)}
					</td>
				))}

				{/* Sales Metrics by Timeframe */}
				{salesTimeframes.map((timeframe) =>
					salesMetrics.map((metric) => (
						<td
							key={`${campaign.campaign_id}-${timeframe}-${metric}`}
							className="border border-gray-200 px-3 py-2 bg-white text-center"
						>
							{getSalesMetricValue(timeframe, metric)}
						</td>
					))
				)}

				{/* Regular Event Metrics by Timeframe */}
				{timeframes.map((timeframe) =>
					eventMetrics.map((metric) => (
						<td
							key={`${campaign.campaign_id}-${timeframe}-${metric}`}
							className="border border-gray-200 px-3 py-2 bg-white text-center"
						>
							{getEventMetricValue(timeframe, metric)}
						</td>
					))
				)}
			</tr>

			{/* Adsets rows (when expanded) */}
			{isExpanded &&
				campaign.adsets?.map((adset: any) => (
					<React.Fragment key={adset.adset_id}>
						<tr className="bg-gray-50">
							{/* Static Fields for Adset */}
							{staticFields.map((field, index) => (
								<td
									key={`${adset.adset_id}-${field}`}
									className={`border border-gray-200 px-3 py-2 ${
										index === 0
											? "bg-gray-50 sticky left-0 z-10"
											: "bg-gray-50"
									}`}
									style={{
										position:
											index === 0 ? "sticky" : undefined,
										left: index === 0 ? 0 : undefined,
									}}
								>
									{index === 0 ? (
										<div className="flex items-center pl-6">
											<button
												onClick={() => {
													onToggleAdsetExpand(
														adset.adset_id
													);
													if (
														!expandedAdsets.has(
															adset.adset_id
														) &&
														!adset.ads
													) {
														onLoadAds(
															adset.adset_id,
															campaign.campaign_id
														);
													}
												}}
												className="mr-2 focus:outline-none"
											>
												{/* {loadingAds.has(adset.adset_id) ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : expandedAdsets.has(adset.adset_id) ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)} */}
												{expandedAdsets.has(
													adset.adset_id
												) ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</button>
											{(() => {
												const src = (
													adset.ad_source ||
													campaign.ad_source ||
													""
												)
													.toString()
													.toLowerCase();
												const isFacebook =
													src.includes("facebook") ||
													src.includes("meta");
												const isGoogle =
													src.includes("google");
												return (
													<div className="flex items-center gap-2">
														{isFacebook && (
															<img
																src="/logo/meta.svg"
																alt="Facebook"
																width={16}
																height={16}
															/>
														)}
														{isGoogle && (
															<img
																src="/logo/google.svg"
																alt="Google"
																width={16}
																height={16}
															/>
														)}
														<div className="flex flex-col min-w-0 flex-1">
															<span
																className="text-xs block overflow-hidden text-ellipsis whitespace-nowrap"
																title={
																	adset.adset_name
																}
																style={{
																	width: "500px",
																}}
															>
																{
																	adset.adset_name
																}
															</span>
															<span className="text-xs text-gray-500 ">
																ID:{" "}
																{adset.adset_id}
															</span>
														</div>
													</div>
												);
											})()}
										</div>
									) : field === "Budget" ? (
										adset.static_metrics?.budget?.toLocaleString() ||
										"-"
									) : field === "Audience" ? (
										<div
											className="truncate max-w-20"
											title={
												adset.static_metrics?.audience?.toLocaleString() ||
												"-"
											}
										>
											{adset.static_metrics?.audience?.toLocaleString() ||
												"-"}
										</div>
									) : field === "Total Spend" ? (
										adset.static_metrics?.total_spend?.toLocaleString() ||
										"-"
									) : field === "Creatives" ? (
										adset.static_metrics?.creatives?.toString() ||
										"-"
									) : field === "Notes" ? (
										adset.static_metrics?.notes || "-"
									) : field === "Days" ? (
										adset.static_metrics?.days_live || "-"
									) : field === "Data Launched" ? (
										adset.static_metrics?.launch_date || "-"
									) : (
										"-"
									)}
								</td>
							))}

							{/* Sales Metrics for Adset */}
							{salesTimeframes.map((timeframe) =>
								salesMetrics.map((metric) => {
									// Convert display timeframe to the API timeframe key
									const timeframeKey = timeframe
										.toLowerCase()
										.replace(/\s+/g, "_")
										.replace("days_ago", "days")
										.replace("2 days ago", "last_2_days");

									// Get the sales data for this timeframe
									const salesData =
										adset.sales_timeframes?.[timeframeKey]
											?.sales || [];

									if (!salesData || salesData.length === 0)
										return (
											<td
												key={`${adset.adset_id}-${timeframe}-${metric}`}
												className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
											>
												-
											</td>
										);

									// For product-specific metrics (format: "group-product-metric")
									if (metric.includes("-")) {
										const [groupName, metricName] =
											metric.split("-");

										// Find the specific product group
										const productGroup = salesData.find(
											(group: any) =>
												group.product_group_name ===
												groupName
										);

										if (!productGroup)
											return (
												<td
													key={`${adset.adset_id}-${timeframe}-${metric}`}
													className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
												>
													-
												</td>
											);

										return (
											<td
												key={`${adset.adset_id}-${timeframe}-${metric}`}
												className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
											>
												{(() => {
													switch (metricName) {
														case "# of Sales":
															return (
																productGroup.count_of_sales?.toString() ||
																"-"
															);
														case "Rev":
															return (
																productGroup.revenue?.toLocaleString() ||
																"-"
															);
														case "Cash":
															return (
																productGroup.cash_collected?.toLocaleString() ||
																"-"
															);
														case "ROAS Rev":
															return (
																productGroup.roas?.toFixed(
																	2
																) || "-"
															);
														case "ROAS Cash":
															return (
																productGroup.roas_cash?.toFixed(
																	2
																) || "-"
															);
														case "CPS":
															return (
																productGroup.cost_per_sale?.toLocaleString() ||
																"-"
															);
														default:
															return "-";
													}
												})()}
											</td>
										);
									}
									// For general metrics (not product-specific)
									else {
										// Find the appropriate product group (could be "all" or first one)
										const productGroup =
											salesData.find(
												(group: any) =>
													group.product_group_name ===
													"all"
											) || salesData[0];

										if (!productGroup)
											return (
												<td
													key={`${adset.adset_id}-${timeframe}-${metric}`}
													className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
												>
													-
												</td>
											);

										return (
											<td
												key={`${adset.adset_id}-${timeframe}-${metric}`}
												className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
											>
												{(() => {
													switch (metric) {
														case "# of Sales":
															return (
																productGroup.count_of_sales?.toString() ||
																"-"
															);
														case "Rev":
															return (
																productGroup.revenue?.toLocaleString() ||
																"-"
															);
														case "Cash":
															return (
																productGroup.cash_collected?.toLocaleString() ||
																"-"
															);
														case "ROAS Rev":
															return (
																productGroup.roas?.toFixed(
																	2
																) || "-"
															);
														case "ROAS Cash":
															return (
																productGroup.roas_cash?.toFixed(
																	2
																) || "-"
															);
														case "CPS":
															return (
																productGroup.cost_per_sale?.toLocaleString() ||
																"-"
															);
														default:
															return "-";
													}
												})()}
											</td>
										);
									}
								})
							)}

							{/* Regular Event Metrics for Adset */}
							{timeframes.map((timeframe) =>
								eventMetrics.map((metric) => {
									// Convert display timeframe to the API timeframe key
									const timeframeKey = timeframe
										.toLowerCase()
										.replace(/\s+/g, "_")
										.replace("days_ago", "days")
										.replace("2 days ago", "last_2_days");

									// Get the data for this timeframe from the adset's timeframes object
									const timeframeData =
										adset.timeframes?.[timeframeKey];

									return (
										<td
											key={`${adset.adset_id}-${timeframe}-${metric}`}
											className="border border-gray-200 px-3 py-2 bg-gray-50 text-center"
										>
											{timeframeData
												? (() => {
														// Check if this is a product-specific metric
														if (
															metric.includes("-")
														) {
															const [
																groupName,
																metricName,
															] =
																metric.split(
																	"-"
																);
															const salesData =
																timeframeData.sales ||
																[];

															// Find the specific product group
															const productGroup =
																salesData.find(
																	(
																		group: any
																	) =>
																		group.product_group_name ===
																		groupName
																);

															if (!productGroup)
																return "-";

															// Return the appropriate metric value based on the metric type
															switch (
																metricName
															) {
																case "# of Sales":
																	return (
																		productGroup.count_of_sales?.toString() ||
																		"-"
																	);
																case "Rev":
																	return (
																		productGroup.revenue?.toLocaleString() ||
																		"-"
																	);
																case "Cash":
																	return (
																		productGroup.cash_collected?.toLocaleString() ||
																		"-"
																	);
																case "ROAS Rev":
																	return (
																		productGroup.roas?.toFixed(
																			2
																		) || "-"
																	);
																case "ROAS Cash":
																	return (
																		productGroup.roas_cash?.toFixed(
																			2
																		) || "-"
																	);
																case "CPS":
																	return (
																		productGroup.cost_per_sale?.toLocaleString() ||
																		"-"
																	);
																default:
																	return "-";
															}
														}

														// Handle regular metrics
														switch (metric) {
															// Sales metrics
															case "# of Sales":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.count_of_sales?.toString() ||
																			"-"
																	: timeframeData.sales?.count_of_sales?.toString() ||
																			"-";
															case "Rev":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.revenue?.toFixed(
																			2
																	  ) || "-"
																	: timeframeData.sales?.revenue?.toFixed(
																			2
																	  ) || "-";
															case "Cash":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.cash_collected?.toFixed(
																			2
																	  ) || "-"
																	: timeframeData.sales?.cash_collected?.toFixed(
																			2
																	  ) || "-";
															case "ROAS Rev":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.roas?.toFixed(
																			2
																	  ) || "-"
																	: timeframeData.sales?.roas?.toFixed(
																			2
																	  ) || "-";
															case "ROAS Cash":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.roas_cash?.toFixed(
																			2
																	  ) || "-"
																	: timeframeData.sales?.roas_cash?.toFixed(
																			2
																	  ) || "-";
															case "CPS":
																return Array.isArray(
																	timeframeData.sales
																)
																	? timeframeData.sales[0]?.cost_per_sale?.toFixed(
																			2
																	  ) || "-"
																	: timeframeData.sales?.cost_per_sale?.toFixed(
																			2
																	  ) || "-";

															// Lead form submissions
															case "N Leads":
																return (
																	timeframeData.lead_form_submissions?.new?.toString() ||
																	"-"
																);
															case "Leads":
																return (
																	timeframeData.lead_form_submissions?.total?.toString() ||
																	"-"
																);

															// Applications
															case "Apps":
																return (
																	timeframeData.applications?.total?.toString() ||
																	"-"
																);
															case "Q Apps":
																return (
																	timeframeData.applications?.qualified?.toString() ||
																	"-"
																);
															case "UQ Apps":
																return (
																	timeframeData.applications?.unqualified?.toString() ||
																	"-"
																);

															// Booked calls
															case "BC":
																return (
																	timeframeData.booked_calls?.total?.toString() ||
																	"-"
																);
															case "Q BC":
																return (
																	timeframeData.booked_calls?.qualified?.toString() ||
																	"-"
																);
															case "UQ BC":
																return (
																	timeframeData.booked_calls?.unqualified?.toString() ||
																	"-"
																);
															case "CFM BC":
																return (
																	timeframeData.booked_calls?.confirmed?.toString() ||
																	"-"
																);
															case "CP BC":
																return (
																	timeframeData.booked_calls?.cp_total?.toFixed(
																		2
																	) || "-"
																);
															case "CP CFM BC":
																return (
																	timeframeData.booked_calls?.cp_confirmed?.toString() ||
																	"-"
																);
															case "CP BC Sh":
																return (
																	timeframeData.booked_calls?.cp_showed?.toString() ||
																	"-"
																);
															case "CP UQ BC":
																return (
																	timeframeData.booked_calls?.cp_unqualified?.toFixed(
																		2
																	) || "-"
																);
															case "CP Q BC":
																return (
																	timeframeData.booked_calls?.cp_qualified?.toString() ||
																	"-"
																);
															case "BC Sh":
																return (
																	timeframeData.booked_calls?.showed?.toString() ||
																	"-"
																);
															case "liveCalls":
																return (
																	timeframeData.booked_calls?.live?.toString() ||
																	"-"
																);

															// Sales rep calls (using same data as booked_calls)
															case "totalCallsWithSalesRep":
																return (
																	timeframeData.booked_calls?.total?.toString() ||
																	"-"
																);
															case "qualifiedCallsWithSalesRep":
																return (
																	timeframeData.booked_calls?.qualified?.toString() ||
																	"-"
																);
															case "unqualifiedCallsWithSalesRep":
																return (
																	timeframeData.booked_calls?.unqualified?.toString() ||
																	"-"
																);
															case "confirmedCallsWithSalesRep":
																return (
																	timeframeData.booked_calls?.confirmed?.toString() ||
																	"-"
																);
															case "callsShowedWithSalesRep":
																return (
																	timeframeData.booked_calls?.showed?.toString() ||
																	"-"
																);
															case "liveCallsWithSalesRep":
																return (
																	timeframeData.booked_calls?.live?.toString() ||
																	"-"
																);

															// Setter calls (using same data as booked_calls)
															case "totalCallsWithSetter":
																return (
																	timeframeData.booked_calls?.total?.toString() ||
																	"-"
																);
															case "qualifiedCallsWithSetter":
																return (
																	timeframeData.booked_calls?.qualified?.toString() ||
																	"-"
																);
															case "unqualifiedCallsWithSetter":
																return (
																	timeframeData.booked_calls?.unqualified?.toString() ||
																	"-"
																);
															case "confirmedCallsWithSetter":
																return (
																	timeframeData.booked_calls?.confirmed?.toString() ||
																	"-"
																);
															case "callsShowedWithSetter":
																return (
																	timeframeData.booked_calls?.showed?.toString() ||
																	"-"
																);
															case "liveCallsWithSetter":
																return (
																	timeframeData.booked_calls?.live?.toString() ||
																	"-"
																);

															// Sets
															case "Sets":
																return (
																	timeframeData.sets?.total?.toString() ||
																	"-"
																);
															case "OB Sets":
																return (
																	timeframeData.sets?.outbound?.toString() ||
																	"-"
																);
															case "IB Sets":
																return (
																	timeframeData.sets?.inbound?.toString() ||
																	"-"
																);
															case "NO Sets":
																return (
																	timeframeData.sets?.new_opportunity?.toString() ||
																	"-"
																);
															case "NQO Sh":
																return (
																	timeframeData.sets?.live?.toString() ||
																	"-"
																);

															// Qualified opportunities
															case "QO":
																return (
																	timeframeData.qualified_opportunities?.total?.toString() ||
																	"-"
																);
															case "NQO":
																return (
																	timeframeData.qualified_opportunities?.new?.toString() ||
																	"-"
																);

															// Offers
															case "OM":
																return (
																	timeframeData.offers?.total?.toString() ||
																	"-"
																);

															// Add to cart
															case "ATC":
																return (
																	timeframeData.add_to_carts?.total?.toString() ||
																	"-"
																);

															// Custom events (not in API)
															case "totalCustomEvents":
																return "-";

															// Meta ad metrics
															case "clicks":
															case "Link Clicks(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.link_clicks?.toString() ||
																	"-"
																);
															case "CTR(Meta)":
															case "linkCtr":
																return (
																	timeframeData.ad_metrics?.meta?.ctr?.toFixed(
																		2
																	) || "-"
																);
															case "CPC(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.cpc?.toFixed(
																		2
																	) || "-"
																);
															case "CP Link Click(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.cplc?.toFixed(
																		2
																	) || "-"
																);
															case "Imp(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.impressions?.toString() ||
																	"-"
																);
															case "CPM(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.cpm?.toFixed(
																		2
																	) || "-"
																);
															case "Reach(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.reach?.toString() ||
																	"-"
																);
															case "Vid Watch %(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.video_watch?.toString() ||
																	"-"
																);
															case "thumbScrollStopRate":
																return "-"; // Not in API
															case "Click Q(Meta)":
																return (
																	timeframeData.ad_metrics?.meta?.click_quality?.toFixed(
																		1
																	) || "-"
																);

															// Google ad metrics
															case "Clicks(Google)":
																return (
																	timeframeData.ad_metrics?.google?.clicks?.toString() ||
																	"-"
																);
															case "CTR(Google)":
																return (
																	timeframeData.ad_metrics?.google?.ctr?.toFixed(
																		2
																	) || "-"
																);
															case "CPC(Google)":
																return (
																	timeframeData.ad_metrics?.google?.cpc?.toFixed(
																		2
																	) || "-"
																);
															case "Imp(Google)":
																return (
																	timeframeData.ad_metrics?.google?.impressions?.toString() ||
																	"-"
																);
															case "Reach(Google)":
																return (
																	timeframeData.ad_metrics?.google?.reach?.toString() ||
																	"-"
																);
															case "Vid Watch %(Google)":
																return (
																	timeframeData.ad_metrics?.google?.video_watch?.toString() ||
																	"-"
																);

															default:
																return "-";
														}
												  })()
												: "-"}
										</td>
									);
								})
							)}
						</tr>

						{/* Ads rows (when adset is expanded) */}
						{expandedAdsets.has(adset.adset_id) &&
							adset.ads?.map((ad: any) => (
								<tr key={ad.ad_id} className="bg-gray-100">
									{/* Static Fields for Ad */}
									{staticFields.map((field, index) => (
										<td
											key={`${ad.ad_id}-${field}`}
											className={`border border-gray-200 px-3 py-2 ${
												index === 0
													? "bg-gray-100 sticky left-0 z-10"
													: "bg-gray-100"
											}`}
											style={{
												position:
													index === 0
														? "sticky"
														: undefined,
												left:
													index === 0 ? 0 : undefined,
											}}
										>
											{index === 0 ? (
												<div className="flex items-center pl-12">
													{(() => {
														const src = (
															adset.ad_source ||
															campaign.ad_source ||
															ad.ad_source ||
															""
														)
															.toString()
															.toLowerCase();
														const isFacebook =
															src.includes(
																"facebook"
															) ||
															src.includes(
																"meta"
															);
														const isGoogle =
															src.includes(
																"google"
															);
														return (
															<div className="flex items-center gap-2">
																{isFacebook && (
																	<img
																		src="/logo/meta.svg"
																		alt="Facebook"
																		width={
																			16
																		}
																		height={
																			16
																		}
																	/>
																)}
																{isGoogle && (
																	<img
																		src="/logo/google.svg"
																		alt="Google"
																		width={
																			16
																		}
																		height={
																			16
																		}
																	/>
																)}

																<div className="flex flex-col min-w-0 flex-1">
																	<span
																		className="text-xs block overflow-hidden text-ellipsis whitespace-nowrap"
																		title={
																			ad.ad_name
																		}
																		style={{
																			width: "500px",
																		}}
																	>
																		{
																			ad.ad_name
																		}
																	</span>
																	<span className="text-xs text-gray-500 ">
																		ID:{" "}
																		{
																			ad.ad_id
																		}
																	</span>
																</div>
															</div>
														);
													})()}
												</div>
											) : field === "Budget" ? (
												ad.static_metrics?.budget?.toLocaleString() ||
												"-"
											) : field === "Audience" ? (
												<div
													className="truncate max-w-20"
													title={
														ad.static_metrics?.audience?.toLocaleString() ||
														"-"
													}
												>
													{ad.static_metrics?.audience?.toLocaleString() ||
														"-"}
												</div>
											) : field === "Total Spend" ? (
												ad.static_metrics?.total_spend?.toLocaleString() ||
												"-"
											) : field === "Creatives" ? (
												ad.static_metrics?.creatives?.toString() ||
												"-"
											) : field === "Notes" ? (
												ad.static_metrics?.notes || "-"
											) : field === "Data Launched" ? (
												ad.static_metrics
													?.launch_date ? (
													new Date(
														ad.static_metrics.launch_date
													).toLocaleDateString()
												) : (
													"-"
												)
											) : field === "Days" ? (
												ad.static_metrics?.days_live?.toString() ||
												"-"
											) : (
												"-"
											)}
										</td>
									))}

									{/* Sales Metrics for Ad */}
									{salesTimeframes.map((timeframe) =>
										salesMetrics.map((metric) => {
											// Convert display timeframe to the API timeframe key
											const timeframeKey = timeframe
												.toLowerCase()
												.replace(/\s+/g, "_")
												.replace("days_ago", "days")
												.replace(
													"2 days ago",
													"last_2_days"
												);

											// Get the sales data for this timeframe
											const salesData =
												ad.sales_timeframes?.[
													timeframeKey
												]?.sales || [];

											if (
												!salesData ||
												salesData.length === 0
											)
												return (
													<td
														key={`${ad.ad_id}-${timeframe}-${metric}`}
														className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
													>
														-
													</td>
												);

											// For product-specific metrics (format: "group-product-metric")
											if (metric.includes("-")) {
												const [groupName, metricName] =
													metric.split("-");

												// Find the specific product group
												const productGroup =
													salesData.find(
														(group: any) =>
															group.product_group_name ===
															groupName
													);

												if (!productGroup)
													return (
														<td
															key={`${ad.ad_id}-${timeframe}-${metric}`}
															className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
														>
															-
														</td>
													);

												return (
													<td
														key={`${ad.ad_id}-${timeframe}-${metric}`}
														className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
													>
														{(() => {
															switch (
																metricName
															) {
																case "# of Sales":
																	return (
																		productGroup.count_of_sales?.toString() ||
																		"-"
																	);
																case "Rev":
																	return (
																		productGroup.revenue?.toLocaleString() ||
																		"-"
																	);
																case "Cash":
																	return (
																		productGroup.cash_collected?.toLocaleString() ||
																		"-"
																	);
																case "ROAS Rev":
																	return (
																		productGroup.roas?.toFixed(
																			2
																		) || "-"
																	);
																case "ROAS Cash":
																	return (
																		productGroup.roas_cash?.toFixed(
																			2
																		) || "-"
																	);
																case "CPS":
																	return (
																		productGroup.cost_per_sale?.toLocaleString() ||
																		"-"
																	);
																default:
																	return "-";
															}
														})()}
													</td>
												);
											}
											// For general metrics (not product-specific)
											else {
												// Find the appropriate product group (could be "all" or first one)
												const productGroup =
													salesData.find(
														(group: any) =>
															group.product_group_name ===
															"all"
													) || salesData[0];

												if (!productGroup)
													return (
														<td
															key={`${ad.ad_id}-${timeframe}-${metric}`}
															className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
														>
															-
														</td>
													);

												return (
													<td
														key={`${ad.ad_id}-${timeframe}-${metric}`}
														className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
													>
														{(() => {
															switch (metric) {
																case "# of Sales":
																	return (
																		productGroup.count_of_sales?.toString() ||
																		"-"
																	);
																case "Rev":
																	return (
																		productGroup.revenue?.toLocaleString() ||
																		"-"
																	);
																case "Cash":
																	return (
																		productGroup.cash_collected?.toLocaleString() ||
																		"-"
																	);
																case "ROAS Rev":
																	return (
																		productGroup.roas?.toFixed(
																			2
																		) || "-"
																	);
																case "ROAS Cash":
																	return (
																		productGroup.roas_cash?.toFixed(
																			2
																		) || "-"
																	);
																case "CPS":
																	return (
																		productGroup.cost_per_sale?.toLocaleString() ||
																		"-"
																	);
																default:
																	return "-";
															}
														})()}
													</td>
												);
											}
										})
									)}

									{/* Regular Event Metrics for Ad */}
									{timeframes.map((timeframe) =>
										eventMetrics.map((metric) => {
											// Convert display timeframe to the API timeframe key
											const timeframeKey = timeframe
												.toLowerCase()
												.replace(/\s+/g, "_")
												.replace("days_ago", "days")
												.replace(
													"2 days ago",
													"last_2_days"
												);

											// Get the data for this timeframe
											const timeframeData =
												ad.timeframes?.[timeframeKey];

											return (
												<td
													key={`${ad.ad_id}-${timeframe}-${metric}`}
													className="border border-gray-200 px-3 py-2 bg-gray-100 text-center"
												>
													{timeframeData
														? (() => {
																// Check if this is a product-specific metric
																if (
																	metric.includes(
																		"-"
																	)
																) {
																	const [
																		groupName,
																		metricName,
																	] =
																		metric.split(
																			"-"
																		);
																	const salesData =
																		timeframeData.sales ||
																		[];

																	// Find the specific product group
																	const productGroup =
																		salesData.find(
																			(
																				group: any
																			) =>
																				group.product_group_name ===
																				groupName
																		);

																	if (
																		!productGroup
																	)
																		return "-";

																	// Return the appropriate metric value based on the metric type
																	switch (
																		metricName
																	) {
																		case "# of Sales":
																			return (
																				productGroup.count_of_sales?.toString() ||
																				"-"
																			);
																		case "Rev":
																			return (
																				productGroup.revenue?.toLocaleString() ||
																				"-"
																			);
																		case "Cash":
																			return (
																				productGroup.cash_collected?.toLocaleString() ||
																				"-"
																			);
																		case "ROAS Rev":
																			return (
																				productGroup.roas?.toFixed(
																					2
																				) ||
																				"-"
																			);
																		case "ROAS Cash":
																			return (
																				productGroup.roas_cash?.toFixed(
																					2
																				) ||
																				"-"
																			);
																		case "CPS":
																			return (
																				productGroup.cost_per_sale?.toLocaleString() ||
																				"-"
																			);
																		default:
																			return "-";
																	}
																}

																// Handle regular metrics
																switch (
																	metric
																) {
																	case "# of Sales":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.count_of_sales?.toString() ||
																					"-"
																			: timeframeData.sales?.count_of_sales?.toString() ||
																					"-";
																	case "Rev":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.revenue?.toFixed(
																					2
																			  ) ||
																					"-"
																			: timeframeData.sales?.revenue?.toFixed(
																					2
																			  ) ||
																					"-";
																	case "Cash":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.cash_collected?.toFixed(
																					2
																			  ) ||
																					"-"
																			: timeframeData.sales?.cash_collected?.toFixed(
																					2
																			  ) ||
																					"-";
																	case "ROAS Rev":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.roas?.toFixed(
																					2
																			  ) ||
																					"-"
																			: timeframeData.sales?.roas?.toFixed(
																					2
																			  ) ||
																					"-";
																	case "ROAS Cash":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.roas_cash?.toFixed(
																					2
																			  ) ||
																					"-"
																			: timeframeData.sales?.roas_cash?.toFixed(
																					2
																			  ) ||
																					"-";
																	case "CPS":
																		return Array.isArray(
																			timeframeData.sales
																		)
																			? timeframeData.sales[0]?.cost_per_sale?.toFixed(
																					2
																			  ) ||
																					"-"
																			: timeframeData.sales?.cost_per_sale?.toFixed(
																					2
																			  ) ||
																					"-";
																	// Lead form submissions
																	case "N Leads":
																		return (
																			timeframeData.lead_form_submissions?.new?.toString() ||
																			"-"
																		);
																	case "Leads":
																		return (
																			timeframeData.lead_form_submissions?.total?.toString() ||
																			"-"
																		);

																	// Applications
																	case "Apps":
																		return (
																			timeframeData.applications?.total?.toString() ||
																			"-"
																		);
																	case "Q Apps":
																		return (
																			timeframeData.applications?.qualified?.toString() ||
																			"-"
																		);
																	case "UQ Apps":
																		return (
																			timeframeData.applications?.unqualified?.toString() ||
																			"-"
																		);

																	// Booked calls
																	case "BC":
																		return (
																			timeframeData.booked_calls?.total?.toString() ||
																			"-"
																		);
																	case "Q BC":
																		return (
																			timeframeData.booked_calls?.qualified?.toString() ||
																			"-"
																		);
																	case "UQ BC":
																		return (
																			timeframeData.booked_calls?.unqualified?.toString() ||
																			"-"
																		);
																	case "CFM BC":
																		return (
																			timeframeData.booked_calls?.confirmed?.toString() ||
																			"-"
																		);
																	case "BC Sh":
																		return (
																			timeframeData.booked_calls?.showed?.toString() ||
																			"-"
																		);
																	case "CP BC":
																		return (
																			timeframeData.booked_calls?.cp_total?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "CP CFM BC":
																		return (
																			timeframeData.booked_calls?.cp_confirmed?.toString() ||
																			"-"
																		);
																	case "CP BC Sh":
																		return (
																			timeframeData.booked_calls?.cp_showed?.toString() ||
																			"-"
																		);
																	case "CP UQ BC":
																		return (
																			timeframeData.booked_calls?.cp_unqualified?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "CP Q BC":
																		return (
																			timeframeData.booked_calls?.cp_qualified?.toString() ||
																			"-"
																		);
																	case "liveCalls":
																		return (
																			timeframeData.booked_calls?.live?.toString() ||
																			"-"
																		);

																	// Sales rep calls
																	case "totalCallsWithSalesRep":
																		return (
																			timeframeData.booked_calls?.total?.toString() ||
																			"-"
																		);
																	case "qualifiedCallsWithSalesRep":
																		return (
																			timeframeData.booked_calls?.qualified?.toString() ||
																			"-"
																		);
																	case "unqualifiedCallsWithSalesRep":
																		return (
																			timeframeData.booked_calls?.unqualified?.toString() ||
																			"-"
																		);
																	case "confirmedCallsWithSalesRep":
																		return (
																			timeframeData.booked_calls?.confirmed?.toString() ||
																			"-"
																		);
																	case "callsShowedWithSalesRep":
																		return (
																			timeframeData.booked_calls?.showed?.toString() ||
																			"-"
																		);
																	case "liveCallsWithSalesRep":
																		return (
																			timeframeData.booked_calls?.live?.toString() ||
																			"-"
																		);

																	// Setter calls
																	case "totalCallsWithSetter":
																		return (
																			timeframeData.booked_calls?.total?.toString() ||
																			"-"
																		);
																	case "qualifiedCallsWithSetter":
																		return (
																			timeframeData.booked_calls?.qualified?.toString() ||
																			"-"
																		);
																	case "unqualifiedCallsWithSetter":
																		return (
																			timeframeData.booked_calls?.unqualified?.toString() ||
																			"-"
																		);
																	case "confirmedCallsWithSetter":
																		return (
																			timeframeData.booked_calls?.confirmed?.toString() ||
																			"-"
																		);
																	case "callsShowedWithSetter":
																		return (
																			timeframeData.booked_calls?.showed?.toString() ||
																			"-"
																		);
																	case "liveCallsWithSetter":
																		return (
																			timeframeData.booked_calls?.live?.toString() ||
																			"-"
																		);

																	// Sets
																	case "Sets":
																		return (
																			timeframeData.sets?.total?.toString() ||
																			"-"
																		);
																	case "OB Sets":
																		return (
																			timeframeData.sets?.outbound?.toString() ||
																			"-"
																		);
																	case "IB Sets":
																		return (
																			timeframeData.sets?.inbound?.toString() ||
																			"-"
																		);
																	case "NO Sets":
																		return (
																			timeframeData.sets?.new_opportunity?.toString() ||
																			"-"
																		);
																	case "NQO Sh":
																		return (
																			timeframeData.sets?.live?.toString() ||
																			"-"
																		);

																	// Qualified opportunities
																	case "QO":
																		return (
																			timeframeData.qualified_opportunities?.total?.toString() ||
																			"-"
																		);
																	case "NQO":
																		return (
																			timeframeData.qualified_opportunities?.new?.toString() ||
																			"-"
																		);

																	// Offers
																	case "OM":
																		return (
																			timeframeData.offers?.total?.toString() ||
																			"-"
																		);

																	// Add to cart
																	case "ATC":
																		return (
																			timeframeData.add_to_carts?.total?.toString() ||
																			"-"
																		);

																	// Custom events
																	case "totalCustomEvents":
																		return "-";

																	// Meta ad metrics
																	case "clicks":
																	case "Link Clicks(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.link_clicks?.toString() ||
																			"-"
																		);
																	case "CTR(Meta)":
																	case "linkCtr":
																		return (
																			timeframeData.ad_metrics?.meta?.ctr?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "CPC(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.cpc?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "CP Link Click(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.cplc?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "Imp(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.impressions?.toString() ||
																			"-"
																		);
																	case "CPM(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.cpm?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "Reach(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.reach?.toString() ||
																			"-"
																		);
																	case "Vid Watch %(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.video_watch?.toString() ||
																			"-"
																		);
																	case "thumbScrollStopRate":
																		return "-"; // Not in API
																	case "Click Q(Meta)":
																		return (
																			timeframeData.ad_metrics?.meta?.click_quality?.toFixed(
																				1
																			) ||
																			"-"
																		);

																	// Google ad metrics
																	case "Clicks(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.clicks?.toString() ||
																			"-"
																		);
																	case "CTR(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.ctr?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "CPC(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.cpc?.toFixed(
																				2
																			) ||
																			"-"
																		);
																	case "Imp(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.impressions?.toString() ||
																			"-"
																		);
																	case "Reach(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.reach?.toString() ||
																			"-"
																		);
																	case "Vid Watch %(Google)":
																		return (
																			timeframeData.ad_metrics?.google?.video_watch?.toString() ||
																			"-"
																		);

																	default:
																		return "-";
																}
														  })()
														: "-"}
												</td>
											);
										})
									)}
								</tr>
							))}
					</React.Fragment>
				))}
		</>
	);
};

export default MetricsTableRow;
