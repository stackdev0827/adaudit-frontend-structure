import React, { useState, useEffect } from "react";
import { Button } from "@tremor/react";
import { metricsTableApi, productsApi } from "../services/api";
import LoadingSpinner from "./ui/LoadingSpinner";
import { Checkbox } from "../pages/reports/ui/checkbox";
import { FilterNode } from "./CreateReportDialog";

interface Category {
	name: string;
	metrics: string[];
	subcategories?: {
		name: string;
		metrics: string[];
	}[];
}

interface Group {
	name: string;
	items: string[] | Category[];
	type: "fields" | "timeframes" | "events";
}

const groups: Group[] = [
	{
		name: "Campaign Static Fields",
		type: "fields",
		items: [
			"Campaign Name",
			"Total Spend",
			"Budget",
			"Creatives",
			"Audience",
			"Launch Date",
			"Days Live",
		],
	},
	{
		name: "Event Time Frames",
		type: "timeframes",
		items: [
			"Yesterday",
			"2 Days Ago",
			"Last 4 Days",
			"Last 7 Days",
			"Last 14 Days",
			"Last 30 Days",
			// "Yesterday",
			// "2 Days Ago",
			// "4 Days Ago",
			// "7 Days Ago",
			// "14 Days Ago",
			// "30 Days Ago",
			"Total",
		],
	},
	{
		name: "Events",
		type: "events",
		items: [
			{
				name: "Sales",
				metrics: [
					"# of Sales",
					"Cost per sale",
					"Revenue",
					"Cash Collected",
					"Roas Revenue",
					"ROAS Cash",
				],
			},
			{
				name: "Lead Form Submissions",
				metrics: [
					"# of new lead form submissions",
					"# of total lead form submissions",
					"Cost per # of new lead form submissions",
					"Cost per # of total lead form submissions",
				],
			},
			{
				name: "Applications",
				metrics: [
					// "Toggle",
					"# of applications",
					"# of qualified applications",
					"# of unqualified applications",
					"Cost per # of applications",
					"Cost per # of qualified applications",
					"Cost per # of unqualified applications",
				],
			},
			{
				name: "Booked Calls",
				metrics: [
					// "Toggle filter by new",
					"# of booked calls",
					"# of qualified booked calls",
					"# of unqualified booked calls",
					"# of confirmed booked calls",
					"# of booked calls showed",
					// "Total live calls",
					// "# of booked calls with sales rep",
					// "Total calls with sales rep",
					// "# of qualified calls booked with sales rep",
					// "# of unqualified calls booked with sales rep",
					// "# of confirmed calls with sales rep",
					// "# of calls showed with sales rep",
					// "Total live calls wirth sales rep",
					// "# of booked calls with appointment setters",
					// "Total calls with appointment setter",
					// "# of qualified calls booked with appointment setters",
					// "# of unqualified calls booked with appointment setters",
					// "# of confirmed calls with appointment setter",
					// "# of calls showed with appointment setter",
					// "# of live calls with appointment setter",
					"Cost per # of booked calls",
					"Cost per # of qualified booked calls",
					"Cost per # of unqualified booked calls",
					"Cost per # of confirmed booked calls",
					"Cost per # of booked calls showed",
				],
			},
			{
				name: "Sets",
				metrics: [
					"# of sets",
					"# of outbound sets",
					"# of inbound sets",
					"# of new opportunity sets",
					"# of live calls from sets",
					"Show % from sets",
					"Cost per # of sets",
					"Cost per # of outbound sets",
					"Cost per # of inbound sets",
					"Cost per # of new opportunity sets",
					"Cost per # of live calls from sets",
				],
			},
			{
				name: "Qualified Opportunity",
				metrics: [
					"# of qualified opportunity",
					"# of qualified opportunity calls showed",
					"Show % of qualified opportunity calls",
					"# of new qualified opportunity",
					"# of new qualified opportunity calls showed",
					"Show % of new qualified opportunity calls",
					"Cost per # of qualified opportunity",
					"Cost per # of qualified opportunity calls showed",
					"Cost per # of new qualified opportunity",
					"Cost per # of new qualified opportunity calls showed",
				],
			},
			{
				name: "Offers",
				metrics: ["# of Offers Made", "Cost per # of Offers Made"],
			},
			{
				name: "Add To Cart",
				metrics: [
					"# of add to carts",
					"Cost per # of add to carts",
					// "Custom Events"
				],
			},
			{
				name: "Ad Metrics",
				metrics: [
					"Meta - Clicks",
					"Meta - CTR",
					"Meta - Cost Per Click",
					"# of Link Clicks",
					"Meta - Link CTR",
					"Meta - Cost Per Link Click",
					"Meta - Impressions",
					"Meta - CPM",
					"Meta - Reach",
					"Meta - Video Watch %",
					"Meta - Cost Per Thruplay",
					"Google - Clicks",
					"Google - CTR",
					"Google - Cost Per Click",
					"Google - Impressions",
				],
				subcategories: [
					{
						name: "Meta",
						metrics: [
							"Meta - Clicks",
							"Meta - CTR",
							"Meta - Cost Per Click",
							"# of Link Clicks",
							"Meta - Link CTR",
							"Meta - Cost Per Link Click",
							"Meta - Impressions",
							"Meta - CPM",
							"Meta - Reach",
							"Meta - Video Watch %",
							"Meta - Cost Per Thruplay",
						],
					},
					{
						name: "Google",
						metrics: [
							"Google - Clicks",
							"Google - CTR",
							"Google - Cost Per Click",
							"Google - Impressions",
						],
					},
				],
			},
		],
	},
];

interface SuccessDialogProps {
	onClose: () => void;
	onApply?: (payload: any) => void;
	tableName: string;
	reportName: string;
	reportDate: string;
	// selectedType: string | null;
	filterTree: FilterNode;
	// groups: any[];
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
	onClose,
	onApply,
	tableName,
	reportName,
	reportDate,
	// selectedType,
	filterTree,
	// groups: parentGroups,
}) => {
	// const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const [checked, setChecked] = useState<string[]>([
		"Campaign Name",
		"Previous Grade",
		"Grade",
	]); // Default checked
	// const [showTable, setShowTable] = useState(false);
	// const [tableData, setTableData] = useState<any>(null);
	const [selectedGroup, setSelectedGroup] = useState("all");

	// --- Sales Product States ---
	const [selectSpecificProducts, setSelectSpecificProducts] = useState(true); // Show initially
	const [separateProducts, setSeparateProducts] = useState(false); // Show initially
	const [productInput, setProductInput] = useState("");
	const [showProductDropdown, setShowProductDropdown] = useState(false);
	const [products, setProducts] = useState<string[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
	const [groupInput, setGroupInput] = useState("");
	const [productGroups, setProductGroups] = useState<
		Array<{
			name: string;
			products: string[];
			metrics: string[];
		}>
	>([]);
	const [checkedForGroup, setCheckedForGroup] = useState<string[]>([]);
	const [separateSales, setSeparateSales] = useState(false);
	const [separateSalesChecked, setSeparateSalesChecked] = useState<string[]>(
		[]
	);
	const [loading, setLoading] = useState(false);
	// const [groupMetrics, setGroupMetrics] = useState<string[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await productsApi.getAll();
				// console.log(response.data.data);
				const fetchedProducts = response.data.data || [];
				// Extract just the names from the product objects
				const productNames = fetchedProducts.map(
					(product: any) => product.name
				);
				setProducts(productNames);
			} catch (error) {
				console.error("Failed to fetch products:", error);
			}
		};

		fetchProducts();
	}, []);

	const handleGroupMetricCheck = (metric: string, groupIndex: number) => {
		setProductGroups((prev) =>
			prev.map((group, idx) => {
				if (idx === groupIndex) {
					const updatedMetrics = group.metrics?.includes(metric)
						? group.metrics.filter((m) => m !== metric)
						: [...(group.metrics || []), metric];
					return { ...group, metrics: updatedMetrics };
				}
				return group;
			})
		);
	};

	const handleAddGroup = () => {
		if (groupInput.trim() && checkedForGroup.length > 0) {
			setProductGroups((prev) => [
				...prev,
				{
					name: groupInput.trim(),
					products: [...checkedForGroup],
					metrics: [], // Start with empty metrics
				},
			]);
			setGroupInput("");
			setCheckedForGroup([]);
		}
	};

	// Add a dedicated state variable for sales static fields
	// const [salesStaticFields, setSalesStaticFields] = useState<string[]>([]);

	// const toggleCollapse = (category: string) => {
	// 	setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
	// };

	// const isCategoryChecked = (cat: Category) => {
	// 	const allMetrics = cat.subcategories
	// 		? cat.subcategories.flatMap((sub) => sub.metrics)
	// 		: cat.metrics;
	// 	return (
	// 		allMetrics.length > 0 &&
	// 		allMetrics.every((metric) => checked.includes(metric))
	// 	);
	// };

	// const handleCheck = (metric: string) => {
	// 	setChecked((prev) =>
	// 		prev.includes(metric)
	// 			? prev.filter((item) => item !== metric)
	// 			: [...prev, metric]
	// 	);
	// };

	const handleCheck = (metric: string) => {
		setChecked((prev) => {
			const isChecked = prev.includes(metric);

			// Unchecking
			if (isChecked) {
				// If unchecking a "# of ..." also remove its "Cost per ..." counterpart
				if (metric.startsWith("# of")) {
					const cost = `Cost per ${metric}`;
					return prev.filter(
						(item) => item !== metric && item !== cost
					);
				}
				// Normal uncheck (including "Cost per ...")
				return prev.filter((item) => item !== metric);
			}

			// Checking
			if (metric.startsWith("Cost per ")) {
				const base = metric.replace(/^Cost per /, "");
				if (!prev.includes(base)) {
					// base not checked -> do not allow checking cost-per
					return prev;
				}
				return [...prev, metric];
			}

			// Checking a base metric ("# of ...") - do NOT auto-check cost-per (only enable it)
			return [...prev, metric];
		});
	};

	// const handleCategoryCheck = (cat: Category) => {
	// 	const allMetrics = cat.subcategories
	// 		? cat.subcategories.flatMap((sub) => sub.metrics)
	// 		: cat.metrics;

	// 	const allChecked = allMetrics.every((metric) => checked.includes(metric));
	// 	if (allChecked) {
	// 		setChecked((prev) =>
	// 			prev.filter((metric) => !allMetrics.includes(metric))
	// 		);
	// 	} else {
	// 		setChecked((prev) => [
	// 			...prev,
	// 			...allMetrics.filter((metric) => !prev.includes(metric)),
	// 		]);
	// 	}
	// };

	// --- Product/Group Handlers ---

	const handleProductCheckbox = (name: string) => {
		setSelectedProducts((prev) =>
			prev.includes(name)
				? prev.filter((p) => p !== name)
				: [...prev, name]
		);
	};
	const handleProductForGroupCheckbox = (name: string) => {
		setCheckedForGroup((prev) =>
			prev.includes(name)
				? prev.filter((p) => p !== name)
				: [...prev, name]
		);
	};

	const handleTemplate = async () => {
		const payload = generatePayload(checked);
		await metricsTableApi.saveTemplate(
			payload,
			reportName,
			reportDate,
			tableName,
			filterTree
		);
	};

	const handleApply = async () => {
		setLoading(true);
		const selectedByGroup: Record<string, string[]> = {};
		groups.forEach((group) => {
			if (group.type === "fields" || group.type === "timeframes") {
				selectedByGroup[group.name] = (group.items as string[]).filter(
					(item) => checked.includes(item)
				);
			} else if (group.type === "events") {
				selectedByGroup[group.name] = [];
				(group.items as Category[]).forEach((cat) => {
					selectedByGroup[group.name].push(
						...cat.metrics.filter((metric) =>
							checked.includes(metric)
						)
					);
				});
			}
		});

		// const staticFields = selectedByGroup["Campaign Static Fields"] || [];
		// const timeFrames = selectedByGroup["Event Time Frames"] || [];
		// const events = (
		// 	(groups.find((g) => g.name === "Events")?.items as Category[]) || []
		// )
		// 	.map((cat) => ({
		// 		name: cat.name,
		// 		metrics: cat.metrics.filter((m) => checked.includes(m)),
		// 	}))
		// 	.filter((cat) => cat.metrics.length > 0);

		handleGeneratePayload();

		// Print selected fields and conditions to the console
		// console.log("Selected Static Fields:", staticFields);
		// console.log("Selected Time Frames:", timeFrames);
		// console.log("Selected Events & Metrics:", events);
		// console.log("Table Name:", tableName);
		// console.log("Report Name:", reportName);
		// console.log("Selected Type:", selectedType);
		// console.log("Parent Groups:", parentGroups);

		// // Print added products and groups for Sales
		// console.log("Added Products:", products);
		// console.log("Added Product Groups:", productGroups);

		// Navigate to a new page and pass tablePayload via state
		// navigate("/generated-table", { state: { tablePayload, metricsResult } });
	};

	// Add this function to transform checked items into payload format
	const generatePayload = (checkedItems: string[]) => {
		// Extract timeframes
		const timeFramesChecked = checkedItems.filter((item) =>
			[
				"Yesterday",
				"2 Days Ago",
				"Last 4 Days",
				"Last 7 Days",
				"Last 14 Days",
				"Last 30 Days",
				"Total",
			].includes(item)
		);

		// Create the sales metrics object with the new structure
		const salesMetrics = {
			roas: checkedItems.includes("Roas Revenue"),
			roas_cash: checkedItems.includes("ROAS Cash"),
			count_of_sales: checkedItems.includes("# of Sales"),
			cost_per_sale: checkedItems.includes("Cost per sale"),
			revenue: checkedItems.includes("Revenue"),
			cash_collected: checkedItems.includes("Cash Collected"),
		};

		const salesTimeframes = {
			yesterday: separateSales
				? separateSalesChecked.includes("Yesterday")
				: false,
			two_days_ago: separateSales
				? separateSalesChecked.includes("2 Days Ago")
				: false,
			last_4_days: separateSales
				? separateSalesChecked.includes("Last 4 Days")
				: false,
			last_7_days: separateSales
				? separateSalesChecked.includes("Last 7 Days")
				: false,
			last_14_days: separateSales
				? separateSalesChecked.includes("Last 14 Days")
				: false,
			last_30_days: separateSales
				? separateSalesChecked.includes("Last 30 Days")
				: false,
			total: separateSales
				? separateSalesChecked.includes("Total")
				: false,
		};

		// Format product groups
		const formattedProductGroups =
			productGroups.length > 0
				? productGroups.map((group) => ({
						name: group.name,
						products: group.products.map((product) => ({
							name: product,
						})),
						metrics: {
							count_of_sales:
								group.metrics.includes("# of Sales"),
							revenue: group.metrics.includes("Rev"),
							cash_collected: group.metrics.includes("Cash"),
							roas: group.metrics.includes("ROAS Rev"),
							roas_cash: group.metrics.includes("ROAS Cash"),
							cost_per_sale: group.metrics.includes("CPS"),
						},
				  }))
				: [
						{
							name: "all",
							products:
								selectedProducts.length > 0
									? selectedProducts.map((product) => ({
											name: product,
									  }))
									: [{ name: "" }],
							metrics: salesMetrics,
						},
				  ];

		// Determine filter type
		const salesFilter =
			productGroups.length > 0
				? "product_group"
				: selectedProducts.length > 0
				? "product"
				: "all";

		return {
			filters: filterTree,
			statics: {
				previous_grade: true,
				grade: true,
				campaign_name: checkedItems.includes("Campaign Name"),
				budget: checkedItems.includes("Budget"),
				audience: checkedItems.includes("Audience"),
				days_live: checkedItems.includes("Days Live"),
				total_spend: checkedItems.includes("Total Spend"),
				creatives: checkedItems.includes("Creatives"),
				launch_date: checkedItems.includes("Launch Date"),
			},
			time_frames: {
				yesterday: timeFramesChecked.includes("Yesterday"),
				two_days_ago: timeFramesChecked.includes("2 Days Ago"),
				last_4_days: timeFramesChecked.includes("Last 4 Days"),
				last_7_days: timeFramesChecked.includes("Last 7 Days"),
				last_14_days: timeFramesChecked.includes("Last 14 Days"),
				last_30_days: timeFramesChecked.includes("Last 30 Days"),
				total: timeFramesChecked.includes("Total"),
			},
			events: {
				sales: {
					filter: salesFilter,
					time_frames: salesTimeframes,
					product_groups: formattedProductGroups,
					metrics: salesMetrics,
				},
				lead_form_submissions: {
					new: checkedItems.includes(
						"# of new lead form submissions"
					),
					total: checkedItems.includes(
						"# of total lead form submissions"
					),
					cp_new: checkedItems.includes(
						"Cost per # of new lead form submissions"
					),
					cp_total: checkedItems.includes(
						"Cost per # of total lead form submissions"
					),
				},
				applications: {
					total: checkedItems.includes("# of applications"),
					qualified: checkedItems.includes(
						"# of qualified applications"
					),
					unqualified: checkedItems.includes(
						"# of unqualified applications"
					),
					cp_total: checkedItems.includes(
						"Cost per # of applications"
					),
					cp_qualified: checkedItems.includes(
						"Cost per # of qualified applications"
					),
					cp_unqualified: checkedItems.includes(
						"Cost per # of unqualified applications"
					),
				},
				booked_calls: {
					total: checkedItems.includes("# of booked calls"),
					qualified: checkedItems.includes(
						"# of qualified booked calls"
					),
					unqualified: checkedItems.includes(
						"# of unqualified booked calls"
					),
					confirmed: checkedItems.includes(
						"# of confirmed booked calls"
					),
					showed: checkedItems.includes("# of booked calls showed"),
					cp_total: checkedItems.includes(
						"Cost per # of booked calls"
					),
					cp_qualified: checkedItems.includes(
						"Cost per # of qualified booked calls"
					),
					cp_unqualified: checkedItems.includes(
						"Cost per # of unqualified booked calls"
					),
					cp_confirmed: checkedItems.includes(
						"Cost per # of confirmed booked calls"
					),
					cp_showed: checkedItems.includes(
						"Cost per # of booked calls showed"
					),
					live: checkedItems.includes("Total live calls"),
				},
				sets: {
					total: checkedItems.includes("# of sets"),
					outbound: checkedItems.includes("# of outbound sets"),
					inbound: checkedItems.includes("# of inbound sets"),
					new_opportunity: checkedItems.includes(
						"# of new opportunity sets"
					),
					live: checkedItems.includes("# of live calls from sets"),
					cp_total: checkedItems.includes("Cost per # of sets"),
					cp_outbound: checkedItems.includes(
						"Cost per # of outbound sets"
					),
					cp_inbound: checkedItems.includes(
						"Cost per # of inbound sets"
					),
					cp_new_opportunity: checkedItems.includes(
						"Cost per # of new opportunity sets"
					),
					cp_live: checkedItems.includes(
						"Cost per # of live calls from sets"
					),
				},
				qualified_opportunities: {
					total: checkedItems.includes("# of qualified opportunity"),
					live: checkedItems.includes(
						"# of qualified opportunity calls showed"
					),
					new: checkedItems.includes(
						"# of new qualified opportunity"
					),
					live_new: checkedItems.includes(
						" # of new qualified opportunity calls showed"
					),
					cp_total: checkedItems.includes(
						"Cost per # of qualified opportunity"
					),
					cp_live: checkedItems.includes(
						"Cost per # of qualified opportunity calls showed"
					),
					cp_new: checkedItems.includes(
						"Cost per # of new qualified opportunity"
					),
					cp_live_new: checkedItems.includes(
						"Cost per # of new qualified opportunity calls showed"
					),
				},
				offers: {
					total: checkedItems.includes("# of Offers Made"),
					cp_total: checkedItems.includes(
						"Cost per # of Offers Made"
					),
				},
				add_to_carts: {
					total: checkedItems.includes("# of add to carts"),
					cp_total: checkedItems.includes(
						"Cost per # of add to carts"
					),
				},
				ad_metrics: {
					meta: {
						clicks: checkedItems.includes("Meta - Clicks"),
						ctr: checkedItems.includes("Meta - CTR"),
						cpc: checkedItems.includes("Meta - Cost Per Click"),
						link_clicks: checkedItems.includes("# of Link Clicks"),
						link_ctr: checkedItems.includes("Meta - Link CTR"),
						cplc: checkedItems.includes(
							"Meta - Cost Per Link Click"
						),
						impressions:
							checkedItems.includes("Meta - Impressions"),
						cpm: checkedItems.includes("Meta - CPM"),
						reach: checkedItems.includes("Meta - Reach"),
						video_watch: checkedItems.includes(
							"Meta - Video Watch %"
						),
						cost_per_thruplay: checkedItems.includes(
							"Meta - Cost Per Thruplay"
						),
					},
					google: {
						clicks: checkedItems.includes("Google - Clicks"),
						ctr: checkedItems.includes("Google - CTR"),
						cpc: checkedItems.includes("Google - Cost Per Click"),
						impressions: checkedItems.includes(
							"Google - Impressions"
						),
					},
				},
			},
			tableName: tableName,
			reportName: reportName,
		};
	};

	// Add this to your component to handle generating the payload
	const handleGeneratePayload = () => {
		const payload = generatePayload(checked);
		// console.log("newnewnewnewnewnewne", payload); // For debugging

		// Send the payload to MetricsTablePage
		if (onApply) {
			onApply(payload);
		}

		// You can also use navigation if needed
		// navigate("/metrics-table", { state: { payload } });

		return payload;
	};

	const handleProductInputFocus = () => {
		setShowProductDropdown(true);
	};

	const handleProductInputBlur = () => {
		// Delay hiding dropdown to allow clicks
		setTimeout(() => setShowProductDropdown(false), 200);
	};

	const handleProductSelect = (productName: string) => {
		if (!selectedProducts.includes(productName)) {
			setSelectedProducts((prev) => [...prev, productName]);
		}
		setProductInput("");
		setShowProductDropdown(false);
	};

	const filteredProducts = products.filter((product) =>
		product.toLowerCase().includes(productInput.toLowerCase())
	);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
			style={{}}
		>
			<div
				className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-[1200px] min-w-[1200px] flex flex-col gap-4 sm:gap-8 relative"
				style={{ maxHeight: "90vh", minHeight: "90vh" }}
			>
				{/* Top Title Section */}
				<div className="w-full mb-2 border-b">
					<h2 className="text-lg sm:text-xl font-bold text-center text-gray-800">
						Configure Table
					</h2>
					<p className="text-xs sm:text-sm text-center text-gray-500 mt-1">
						Select a template or continue without
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-1">
					{/* Left: Groups and Checkboxes */}
					<div className="sm:w-1/5 w-full border-r">
						<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
							FILTER TYPE
						</h3>
						<div
							onClick={() => setSelectedGroup("all")}
							className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
								selectedGroup === "all"
									? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
									: "text-gray-700"
							}`}
						>
							All
						</div>
						{groups.map((group: any) => (
							<div key={group.name}>
								{/* Display group name */}
								{group.name === "Events" ? (
									<div
										className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
											selectedGroup === group.name
												? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
												: "text-gray-700"
										}`}
									>
										{group.name}
									</div>
								) : (
									<div
										className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
											selectedGroup === group.name
												? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
												: "text-gray-700"
										}`}
										onClick={() =>
											setSelectedGroup(group.name)
										}
									>
										{group.name}
									</div>
								)}

								{/* Display subnames for Events */}
								{group.name === "Events" &&
									group.items.map((cat: Category) => (
										<div
											key={cat.name}
											className={`pl-6 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
												selectedGroup === cat.name
													? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
													: "text-gray-700"
											}`}
											onClick={() =>
												setSelectedGroup(cat.name)
											}
										>
											{cat.name}
										</div>
									))}
							</div>
						))}
					</div>

					<div className="sm:w-3/5 w-full max-h-[65vh] sm:max-h-[65vh] min-h-[65vh] overflow-y-auto pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r">
						{selectedGroup && (
							<>
								<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
									Main Metrics
								</h3>
								<div
									key={selectedGroup}
									className="mb-6 bg-white rounded-xl shadow border border-gray-200 p-3"
								>
									{/* <div className="flex items-center mb-2">
										<span className="flex-1 text-base font-bold text-center text-gray-800">
											{selectedGroup}
										</span>
									</div> */}
									{/* Rest of the existing group rendering logic for the selected group only */}
									{(() => {
										console.log(selectedGroup);

										// Handle "all" case - display everything
										if (selectedGroup === "all") {
											return (
												<div className="space-y-4">
													{groups.map((group) => (
														<div
															key={group.name}
															className="mb-4"
														>
															<div className="font-semibold text-sm mb-2 text-gray-700 border-b border-gray-200 pb-1">
																{group.name}
															</div>
															{group.type ===
																"fields" ||
															group.type ===
																"timeframes" ? (
																<div className="grid grid-cols-2 gap-2 pl-2">
																	{(
																		group.items as string[]
																	).map(
																		(
																			item
																		) => (
																			<label
																				key={
																					item
																				}
																				className="flex items-center cursor-pointer text-xm rounded px-2 py-1"
																			>
																				<Checkbox
																					className="accent-blue-600 mr-2"
																					checked={checked.includes(
																						item
																					)}
																					onCheckedChange={() =>
																						handleCheck(
																							item
																						)
																					}
																					disabled={
																						item ===
																						"Campaign Name"
																					}
																				/>
																				<span
																					className={
																						item ===
																						"Campaign Name"
																							? "text-gray-400 text-sm flex items-center gap-2"
																							: "text-sm text-gray-900 flex items-center gap-2"
																					}
																				>
																					{
																						item
																					}
																				</span>
																			</label>
																		)
																	)}
																</div>
															) : (
																// Events group - show all categories and their metrics
																<div className="flex flex-col gap-2 py-2 pl-2">
																	{(
																		group.items as Category[]
																	).map(
																		(
																			cat
																		) => (
																			<div
																				key={
																					cat.name
																				}
																				className="px-2 flex flex-col"
																			>
																				<div className="font-medium text-sm mb-2 text-gray-600">
																					{
																						cat.name
																					}
																				</div>
																				<div className="grid grid-cols-2 gap-2 pl-2">
																					{cat.metrics
																						.filter(
																							(
																								metric
																							) =>
																								!metric.startsWith(
																									"Cost per"
																								)
																						)
																						.map(
																							(
																								metric,
																								idx
																							) => (
																								<div
																									key={
																										idx
																									}
																									className="grid gap-2 text-xs mb-2"
																								>
																									<label className="flex items-center cursor-pointer">
																										<Checkbox
																											className="accent-blue-600 mr-2"
																											checked={checked.includes(
																												metric
																											)}
																											onCheckedChange={() =>
																												handleCheck(
																													metric
																												)
																											}
																										/>
																										<span className="text-sm text-gray-900 flex items-center gap-2">
																											{
																												metric
																											}
																										</span>
																									</label>
																									{metric.startsWith(
																										"#"
																									) &&
																										cat.name !==
																											"Ad Metrics" && (
																											<label className="flex items-center cursor-pointer">
																												<Checkbox
																													className="accent-blue-600 mr-2"
																													checked={checked.includes(
																														`Cost per ${metric}`
																													)}
																													onCheckedChange={() =>
																														handleCheck(
																															`Cost per ${metric}`
																														)
																													}
																													disabled={
																														!checked.includes(
																															metric
																														)
																													}
																												/>
																												<span className="text-sm text-gray-900 flex items-center gap-2">
																													Cost
																													per{" "}
																													{
																														metric
																													}
																												</span>
																											</label>
																										)}
																								</div>
																							)
																						)}
																				</div>
																			</div>
																		)
																	)}
																</div>
															)}
														</div>
													))}
												</div>
											);
										}

										// Original single group logic

										const rootGroup =
											groups.find(
												(g) => g.name === selectedGroup
											) ||
											groups.find(
												(g) =>
													g.type === "events" &&
													(
														g.items as Category[]
													).some(
														(c) =>
															c.name ===
															selectedGroup
													)
											) ||
											"";

										// console.log(selectedGroup, rootGroup);

										if (!rootGroup) return null;

										let categoriesToRender: Category[] = [];
										if (rootGroup.type === "events") {
											const maybeCat = (
												rootGroup.items as Category[]
											).find(
												(c) => c.name === selectedGroup
											);
											categoriesToRender = maybeCat
												? [maybeCat]
												: (rootGroup.items as Category[]) ||
												  [];
										}

										return rootGroup.type === "fields" ||
											rootGroup.type === "timeframes" ? (
											<div className="grid grid-cols-2 gap-2 pl-2">
												{(
													rootGroup.items as string[]
												).map((item) => (
													<label
														key={item}
														className="flex items-center cursor-pointer text-xm rounded px-2 py-1"
													>
														<Checkbox
															className="accent-blue-600 mr-2"
															checked={checked.includes(
																item
															)}
															onCheckedChange={() =>
																handleCheck(
																	item
																)
															}
															disabled={
																item ===
																"Campaign Name"
															}
														/>
														<span
															className={
																item ===
																"Campaign Name"
																	? "text-gray-400 text-sm flex items-center gap-2"
																	: "text-sm text-gray-900 flex items-center gap-2"
															}
														>
															{item}
														</span>
													</label>
												))}
											</div>
										) : (
											// Events group - existing logic
											<div className="flex flex-col gap-4 py-5">
												{categoriesToRender.map(
													(cat) => (
														<div
															key={cat.name}
															className=" px-2 flex flex-col pl-2"
														>
															{cat.name ===
																"Sales" && (
																<>
																	<div className="flex items-center mb-2 mt-2  pt-2">
																		<span className="mr-2 font-semibold text-sm font-medium">
																			Separate
																			sales
																			from
																			main
																			events
																		</span>
																		<label className="inline-flex items-center cursor-pointer ml-auto text-sm">
																			<Checkbox
																				className="sr-only peer"
																				checked={
																					separateSales
																				}
																				onCheckedChange={() =>
																					setSeparateSales(
																						!separateSales
																					)
																				}
																			/>
																			<div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-gray-500 transition-all duration-200 relative">
																				<div
																					className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
																						separateSales
																							? "translate-x-4"
																							: ""
																					}`}
																				></div>
																			</div>
																		</label>
																	</div>
																	{separateSales && (
																		<div className="flex flex-wrap gap-2 mb-2">
																			{[
																				"Yesterday",
																				"2 Days Ago",
																				"Last 4 Days",
																				"Last 7 Days",
																				"Last 14 Days",
																				"Last 30 Days",
																				"Total",
																			].map(
																				(
																					item
																				) => (
																					<label
																						key={
																							item
																						}
																						className="flex items-center cursor-pointer text-xs  rounded px-2 py-1 mb-1"
																					>
																						<Checkbox
																							className="accent-blue-600 mr-2"
																							checked={separateSalesChecked.includes(
																								item
																							)}
																							onCheckedChange={() =>
																								setSeparateSalesChecked(
																									(
																										prev
																									) =>
																										prev.includes(
																											item
																										)
																											? prev.filter(
																													(
																														v
																													) =>
																														v !==
																														item
																											  )
																											: [
																													...prev,
																													item,
																											  ]
																								)
																							}
																						/>
																						<span className="text-sm text-gray-900 flex items-center gap-2">
																							{
																								item
																							}
																						</span>
																					</label>
																				)
																			)}
																		</div>
																	)}
																</>
															)}
															{/* --- Custom UI for Sales --- */}
															{cat.name ===
																"Sales" && (
																<div className="mb-2 border-t border-gray-300 pt-2 pl-2">
																	<label className="flex items-center mb-1 cursor-pointer text-xs">
																		<Checkbox
																			className="mr-2 accent-blue-600"
																			checked={
																				selectSpecificProducts
																			}
																			onCheckedChange={() =>
																				setSelectSpecificProducts(
																					(
																						v
																					) =>
																						!v
																				)
																			}
																		/>
																		<span className="text-sm">
																			Select
																			specific
																			product
																			names
																		</span>
																	</label>
																	<label className="flex items-center mb-1 cursor-pointer text-xs">
																		<Checkbox
																			className="mr-2 accent-blue-600"
																			checked={
																				separateProducts
																			}
																			onCheckedChange={() =>
																				setSeparateProducts(
																					(
																						v
																					) =>
																						!v
																				)
																			}
																		/>
																		<span className="text-sm">
																			Separate
																			products
																			by
																			names
																		</span>
																	</label>
																	{selectSpecificProducts && (
																		<div className="mb-2 ml-4">
																			<div className="flex gap-2 mb-2 relative">
																				<input
																					type="text"
																					className="border rounded px-2 py-1 text-xs flex-1"
																					value={
																						productInput
																					}
																					onChange={(
																						e
																					) =>
																						setProductInput(
																							e
																								.target
																								.value
																						)
																					}
																					onFocus={
																						handleProductInputFocus
																					}
																					onBlur={
																						handleProductInputBlur
																					}
																					placeholder="Search products..."
																				/>
																				{showProductDropdown && (
																					<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto z-10">
																						{filteredProducts.length >
																						0 ? (
																							filteredProducts.map(
																								(
																									product
																								) => (
																									<div
																										key={
																											product
																										}
																										className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
																										onMouseDown={() =>
																											handleProductSelect(
																												product
																											)
																										}
																									>
																										{
																											product
																										}
																									</div>
																								)
																							)
																						) : (
																							<div className="px-2 py-1 text-gray-500 text-xs">
																								No
																								products
																								found
																							</div>
																						)}
																					</div>
																				)}
																			</div>
																			{/* Product list with checkbox */}
																			{selectedProducts.length >
																				0 && (
																				<div className="mb-2">
																					<div className="font-semibold mb-1 text-xs">
																						Products
																					</div>
																					{selectedProducts.map(
																						(
																							prod
																						) => (
																							<div
																								key={
																									prod
																								}
																								className="flex items-center justify-between mb-1 text-xs bg-gray-100 rounded px-2 py-1"
																							>
																								<span>
																									{
																										prod
																									}
																								</span>
																								<button
																									className="ml-2 text-red-500 hover:text-red-700 font-bold"
																									onClick={() =>
																										handleProductCheckbox(
																											prod
																										)
																									}
																									title="Remove product"
																								>
																									×
																								</button>
																							</div>
																						)
																					)}
																				</div>
																			)}
																		</div>
																	)}
																	{/* Separate products UI */}
																	{selectedProducts.length >
																		0 &&
																		separateProducts && (
																			<div className="mt-2 ml-4">
																				<div className="flex gap-2 mb-2">
																					<input
																						type="text"
																						className="border rounded px-2 py-1 text-xs"
																						value={
																							groupInput
																						}
																						onChange={(
																							e
																						) =>
																							setGroupInput(
																								e
																									.target
																									.value
																							)
																						}
																						placeholder="Group name"
																					/>
																					<button
																						className="bg-green-500 text-white px-2 py-1 rounded text-xs"
																						onClick={
																							handleAddGroup
																						}
																						disabled={
																							checkedForGroup.length ===
																							0
																						}
																					>
																						Add
																						group
																					</button>
																				</div>
																				<div className="mb-2">
																					<div className="font-semibold mb-1 text-xs">
																						Select
																						products
																						for
																						group
																					</div>
																					{selectedProducts.map(
																						(
																							prod
																						) => (
																							<label
																								key={
																									prod
																								}
																								className="flex items-center mb-1 text-xs cursor-pointer"
																							>
																								<Checkbox
																									className="mr-2 accent-blue-600"
																									checked={checkedForGroup.includes(
																										prod
																									)}
																									onCheckedChange={() =>
																										handleProductForGroupCheckbox(
																											prod
																										)
																									}
																								/>
																								<span>
																									{
																										prod
																									}
																								</span>
																							</label>
																						)
																					)}
																				</div>

																				{/* Show created groups with metrics selection */}
																				{productGroups.length >
																					0 && (
																					<div className="mt-2">
																						<div className="font-semibold text-xs mb-1">
																							Product
																							Groups
																						</div>
																						{productGroups.map(
																							(
																								g,
																								idx
																							) => (
																								<div
																									key={
																										g.name +
																										idx
																									}
																									className="bg-gray-100 rounded px-2 py-1 mb-2 text-xs"
																								>
																									<div className="mb-2">
																										<b>
																											{
																												g.name
																											}

																											:
																										</b>{" "}
																										{g.products.join(
																											", "
																										)}
																									</div>

																									{/* Metrics selection for this specific group */}
																									<div className="mb-2">
																										<div className="font-semibold mb-1 text-xs">
																											Select
																											metrics
																											for{" "}
																											{
																												g.name
																											}
																										</div>
																										<div className="grid grid-cols-2 gap-1">
																											{[
																												"# of Sales",
																												"Rev",
																												"Cash",
																												"ROAS Rev",
																												"ROAS Cash",
																												"CPS",
																											].map(
																												(
																													metric
																												) => (
																													<label
																														key={
																															metric
																														}
																														className="flex items-center text-xs cursor-pointer"
																													>
																														<Checkbox
																															className="mr-1 accent-blue-600"
																															checked={
																																g.metrics?.includes(
																																	metric
																																) ||
																																false
																															}
																															onCheckedChange={() =>
																																handleGroupMetricCheck(
																																	metric,
																																	idx
																																)
																															}
																														/>
																														<span className="text-sm text-gray-900 flex items-center gap-2">
																															{
																																metric
																															}
																														</span>
																													</label>
																												)
																											)}
																										</div>
																									</div>
																								</div>
																							)
																						)}
																					</div>
																				)}
																			</div>
																		)}
																</div>
															)}
															{/* Separate sales from main events */}

															{/* --- End custom UI for Sales --- */}
															{cat.metrics
																.length === 0 &&
																!cat.subcategories && (
																	<div className="text-gray-400 italic">
																		No
																		metrics
																	</div>
																)}

															{/* Render subcategories if they exist */}
															{cat.subcategories &&
																cat.subcategories.map(
																	(
																		subcat
																	) => (
																		<div
																			key={
																				subcat.name
																			}
																			className="mb-2"
																		>
																			<div className="font-semibold text-xs mb-1 text-gray-700 border-b border-gray-200 pb-1">
																				{
																					subcat.name
																				}
																			</div>
																			{subcat.metrics
																				.filter(
																					(
																						metric
																					) =>
																						!metric.startsWith(
																							"Cost per"
																						)
																				)
																				.map(
																					(
																						metric,
																						idx
																					) => (
																						<div
																							key={
																								idx
																							}
																							className="pl-2 grid grid-col gap-2  mb-1"
																						>
																							<label className="flex items-center cursor-pointer text-xs">
																								<Checkbox
																									className="accent-blue-600 mr-2"
																									checked={checked.includes(
																										metric
																									)}
																									onCheckedChange={() =>
																										handleCheck(
																											metric
																										)
																									}
																								/>
																								<span className="text-sm text-gray-900 flex items-center gap-2">
																									{
																										metric
																									}
																								</span>
																							</label>

																							{metric.startsWith(
																								"#"
																							) &&
																								cat.name !==
																									"Ad Metrics" && (
																									<label className="flex items-center cursor-pointer text-xs">
																										<Checkbox
																											className="accent-blue-600 mr-2"
																											checked={checked.includes(
																												`Cost per ${metric}`
																											)}
																											onCheckedChange={() =>
																												handleCheck(
																													`Cost per ${metric}`
																												)
																											}
																											disabled={
																												!checked.includes(
																													metric
																												)
																											}
																										/>
																										<span className="text-sm text-gray-900 flex items-center gap-2">
																											Cost
																											per{" "}
																											{
																												metric
																											}
																										</span>
																									</label>
																								)}
																						</div>
																					)
																				)}
																		</div>
																	)
																)}

															{/* Render regular metrics if no subcategories */}
															{!cat.subcategories &&
																cat.metrics
																	.filter(
																		(
																			metric
																		) =>
																			!metric.startsWith(
																				"Cost per"
																			)
																	)
																	.map(
																		(
																			metric,
																			idx
																		) => (
																			<div
																				key={
																					idx
																				}
																				className={`grid grid-cols-2 gap-2 text-xs items-center px-2 ${
																					metric ===
																					"# of Sales"
																						? "border-t border-gray-300 mt-2 pt-2"
																						: ""
																				} mb-2`}
																			>
																				<label className="flex items-center cursor-pointer">
																					<Checkbox
																						className="accent-blue-600 mr-2"
																						checked={checked.includes(
																							metric
																						)}
																						onCheckedChange={() =>
																							handleCheck(
																								metric
																							)
																						}
																					/>
																					<span className="text-sm text-gray-900 flex items-center gap-2">
																						{
																							metric
																						}
																					</span>
																				</label>
																				<div>
																					{metric.startsWith(
																						"#"
																					) &&
																						cat.name !==
																							"Ad Metrics" && (
																							<label className="flex items-center cursor-pointer ml-3">
																								<Checkbox
																									className="accent-blue-600 mr-2"
																									checked={checked.includes(
																										`Cost per ${metric}`
																									)}
																									onCheckedChange={() =>
																										handleCheck(
																											`Cost per ${metric}`
																										)
																									}
																									disabled={
																										!checked.includes(
																											metric
																										)
																									}
																								/>
																								<span className="text-sm text-gray-900 flex items-center gap-2">
																									Cost
																									per{" "}
																									{
																										metric
																									}
																								</span>
																							</label>
																						)}
																				</div>
																			</div>
																		)
																	)}
														</div>
													)
												)}
											</div>
										);
									})()}
								</div>
							</>
						)}
					</div>
					{/* Right: Selected Metrics */}
					<div className="sm:w-1/5 w-full pl-0  flex flex-col text-xs max-h-[65vh] sm:max-h-[65vh] min-h-[65vh]">
						{/* <h3 className="text-lg font-semibold mb-3 text-green-700">
							Selected Metrics
						</h3> */}
						<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
							Selected Metrics
						</h3>
						<div className="flex-1 overflow-y-auto max-h-[65vh]">
							{groups.map((group) => {
								// Get selected items for this group
								let selected: string[] = [];
								if (
									group.type === "fields" ||
									group.type === "timeframes"
								) {
									selected = (group.items as string[]).filter(
										(item) => checked.includes(item)
									);
								} else if (group.type === "events") {
									selected = [];
									(group.items as Category[]).forEach(
										(cat) => {
											selected.push(
												...cat.metrics.filter(
													(metric) =>
														checked.includes(metric)
												)
											);
										}
									);
								}
								if (selected.length === 0) return null;
								return (
									<div
										key={group.name}
										className="mb-3 bg-white rounded-xl shadow border border-gray-200 p-3"
									>
										<div className="font-bold text-gray-700 mb-1 border-b border-gray-200">
											{group.name}
										</div>
										<ul className="list-disc list-inside space-y-1 p-3">
											{selected.map((metric) => (
												<li
													key={metric}
													className="flex items-center justify-between border border-gray-100 p-1 rounded-md"
												>
													<span className="text-sm text-gray-900 flex items-center gap-2">
														{metric}
													</span>
													<button
														className="ml-2 text-red-500 hover:text-red-700"
														onClick={() =>
															handleCheck(metric)
														}
														title="Remove"
													>
														×
													</button>
												</li>
											))}
										</ul>
									</div>
								);
							})}
							{/* If nothing selected at all */}
							{!groups.some((group) => {
								if (
									group.type === "fields" ||
									group.type === "timeframes"
								) {
									return (group.items as string[]).some(
										(item) => checked.includes(item)
									);
								} else if (group.type === "events") {
									return (group.items as Category[]).some(
										(cat) =>
											cat.metrics.some((metric) =>
												checked.includes(metric)
											)
									);
								}
								return false;
							}) && (
								<div className="text-gray-400 italic text-sm">
									No metrics selected.
								</div>
							)}
						</div>
					</div>
				</div>
				{/* Table Section - Show generated table if applicable */}
				{/* (showTable && tableData && ...) removed because showTable is unused */}
				{/* Fixed Apply Button */}
				<div className="w-full flex justify-end bg-white sticky left-0 z-10">
					<Button
						className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition text-xs"
						onClick={handleApply}
						disabled={loading}
					>
						{loading ? <LoadingSpinner size="sm" /> : "Apply"}
					</Button>
					<Button
						className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition text-xs ml-2"
						onClick={handleTemplate}
						disabled={loading}
					>
						{loading ? (
							<LoadingSpinner size="sm" />
						) : (
							"Save Template"
						)}
					</Button>
				</div>
				{/* Close Button */}
				<button
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
					onClick={onClose}
					aria-label="Close"
				>
					×
				</button>
			</div>
		</div>
	);
};

export default SuccessDialog;
