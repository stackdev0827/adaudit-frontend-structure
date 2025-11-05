import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Download, Grid3X3 } from "lucide-react";
import { cn } from "../../lib/utils";
import { CustomizeTableModal } from "./CustomizeTableModal";
import { ColumnHeader } from "./ColumnHeader";
import { renderCellContent } from "./utils/renderCellContent";
// import { metrics } from "../../constants/normalized_report";

// Meta logo component
const MetaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
	</svg>
);

// Google logo component
const GoogleLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			fill="#4285F4"
		/>
		<path
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			fill="#34A853"
		/>
		<path
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			fill="#FBBC05"
		/>
		<path
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			fill="#EA4335"
		/>
	</svg>
);

// const formatCurrency = (value: number) => {
// 	return new Intl.NumberFormat("en-US", {
// 		style: "currency",
// 		currency: "USD",
// 	}).format(value);
// };
// const formatNumber = (value: number) => {
// 	return new Intl.NumberFormat("en-US").format(value);
// };
// const formatPercentage = (value: number) => {
// 	return `${value.toFixed(2) || 0}%`;
// };
// const ChangeIndicator = ({ value }: { value: number }) => {
// 	const isPositive = value > 0;
// 	const isNeutral = value === 0;
// 	return (
// 		<div
// 			className={cn(
// 				"text-xs px-1.5 py-0.5 rounded text-center min-w-[50px]",
// 				isNeutral
// 					? "text-gray-400"
// 					: isPositive
// 					? "bg-green-100 text-green-700"
// 					: "bg-red-100 text-red-700"
// 			)}
// 		>
// 			{isNeutral ? "—" : `${isPositive ? "+" : ""}${value.toFixed(1)}%`}
// 		</div>
// 	);
// };
function normalizeTableRows<T extends { name: string; applications?: any }>(
	rows: T[]
): any[] {
	return rows.map((row) => ({
		...row,
		// Flatten applications fields to top-level
		...(row.applications
			? {
					applications_total: row.applications.total,
					applications_unqualified: row.applications.unqualified,
					cp_total: row.applications.cp_total,
					cp_unqualified: row.applications.cp_unqualified,
			  }
			: {}),
	}));
}
interface SelectedMetric {
	id: string;
	name: string;
	category: string;
	enabled: boolean;
}
interface DataTableProps {
	filters?: {
		timeComparison: string;
	};
	hasGeneratedReport?: boolean;
	reportName?: string;
	savedTableViews?: Array<{ id: string; name: string; metrics: any[] }>;
	onSaveTableView?: (name: string, metrics: any[]) => void;
	onLoadTableView?: (viewId: string) => any;
	initialSelectedMetrics: SelectedMetric[];
	tableData?: any;
	status: boolean;
}
export const DataTable = ({
	// filters,
	hasGeneratedReport = false,
	// reportName = "",
	savedTableViews = [],
	onSaveTableView,
	initialSelectedMetrics,
	tableData,
	status,
}: DataTableProps) => {
	console.log(initialSelectedMetrics);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("campaign");
	const [showCustomizeModal, setShowCustomizeModal] = useState(false);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	} | null>(null);
	const [nameColumnWidth, setNameColumnWidth] = useState(256);
	const resizeRef = useRef<HTMLTableHeaderCellElement>(null);
	const isResizing = useRef(false);
	const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>(
		initialSelectedMetrics
	);
	// Add state for metric column widths
	const [metricColumnWidths, setMetricColumnWidths] = useState<
		Record<string, number>
	>({});
	const metricResizingRef = useRef<{
		metricId: string | null;
		startX: number;
		startWidth: number;
	} | null>(null);

	// Initialize metric column widths
	useEffect(() => {
		const initialWidths: Record<string, number> = {};
		selectedMetrics.forEach((metric) => {
			if (!metricColumnWidths[metric.id]) {
				initialWidths[metric.id] = 100; // default width
			}
		});
		if (Object.keys(initialWidths).length > 0) {
			setMetricColumnWidths((prev) => ({ ...prev, ...initialWidths }));
		}
	}, [selectedMetrics]);

	// Metric column resize handlers
	const startMetricResize = useCallback(
		(e: React.MouseEvent, metricId: string) => {
			e.preventDefault();
			metricResizingRef.current = {
				metricId,
				startX: e.clientX,
				startWidth: metricColumnWidths[metricId] || 100,
			};
			document.addEventListener("mousemove", handleMetricResize);
			document.addEventListener("mouseup", stopMetricResize);
		},
		[metricColumnWidths]
	);

	const handleMetricResize = useCallback((e: MouseEvent) => {
		if (!metricResizingRef.current) return;
		const newWidth = Math.max(
			100,
			Math.min(
				300,
				metricResizingRef.current.startWidth +
					(e.clientX - metricResizingRef.current.startX)
			)
		);
		setMetricColumnWidths((prev) => ({
			...prev,
			[metricResizingRef.current!.metricId!]: newWidth,
		}));
	}, []);

	const stopMetricResize = useCallback(() => {
		metricResizingRef.current = null;
		document.removeEventListener("mousemove", handleMetricResize);
		document.removeEventListener("mouseup", stopMetricResize);
	}, [handleMetricResize]);
	const getCurrentData = () => {
		switch (activeTab) {
			case "platform":
				return normalizeTableRows(tableData?.platforms || []);
			case "campaign":
				return normalizeTableRows(tableData?.campaigns || []);
			case "adset":
				return normalizeTableRows(tableData?.ad_sets || []);
			case "ad":
				return normalizeTableRows(tableData?.ads || []);
			case "adaccount":
				return normalizeTableRows(tableData?.ad_accounts || []);
			default:
				return [];
		}
	};
	const handleSort = (key: string, direction: "asc" | "desc") => {
		setSortConfig({
			key,
			direction,
		});
	};
	const handleFilter = (key: string) => {
		console.log(`Filter ${key}`);
	};
	const handleUpdatedMetrics = (metrics: any) => {
		console.log(metrics);
	};
	const getSortedData = () => {
		let data = getCurrentData();

		if (sortConfig) {
			data = [...data].sort((a, b) => {
				const aValue = (a as any)[sortConfig.key];
				const bValue = (b as any)[sortConfig.key];
				if (typeof aValue === "number" && typeof bValue === "number") {
					return sortConfig.direction === "asc"
						? aValue - bValue
						: bValue - aValue;
				}
				if (typeof aValue === "string" && typeof bValue === "string") {
					return sortConfig.direction === "asc"
						? aValue.localeCompare(bValue)
						: bValue.localeCompare(aValue);
				}
				return 0;
			});
		}
		return data;
	};

	// Resize functionality
	const startResize = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isResizing.current = true;
		document.addEventListener("mousemove", handleResize);
		document.addEventListener("mouseup", stopResize);
	}, []);
	const handleResize = useCallback((e: MouseEvent) => {
		if (!isResizing.current) return;
		const newWidth = Math.max(
			200,
			Math.min(
				1000,
				e.clientX -
					(resizeRef.current?.getBoundingClientRect().left || 0)
			)
		);
		setNameColumnWidth(newWidth);
	}, []);
	const stopResize = useCallback(() => {
		isResizing.current = false;
		document.removeEventListener("mousemove", handleResize);
		document.removeEventListener("mouseup", stopResize);
	}, [handleResize]);

	// Check if comparison is enabled
	// const isComparisonEnabled =
	// 	filters?.timeComparison && filters.timeComparison !== "no-comparison";
	const filteredData = getSortedData().filter((item: any) =>
		item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	console.log(filteredData);

	useEffect(() => {
		setSelectedMetrics(initialSelectedMetrics);
	}, [initialSelectedMetrics]);

	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
			{/* Top Controls */}
			<div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 w-80 h-8 text-sm bg-white border-gray-300"
						/>
					</div>
				</div>

				{status == false ? (
					<div className="flex items-center gap-2">
						{/* <Button
							variant="outline"
							size="sm"
							className="h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
						>
							<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
							CUSTOM METRICS
						</Button> */}
						<Button
							variant="outline"
							size="sm"
							className="h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
							onClick={() => setShowCustomizeModal(true)}
						>
							<Grid3X3 className="w-3 h-3 mr-2" />
							CUSTOMIZE TABLE
						</Button>
						{/* <Button
							variant="outline"
							size="sm"
							className="h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
						>
							<Download className="w-3 h-3 mr-2" />
							EXPORT TABLE
						</Button> */}
					</div>
				) : null}
			</div>

			{/* Breakdown Tabs */}
			<div className="bg-white border-b border-gray-200">
				<div className="px-4 pt-[10px] pb-0">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-5 bg-transparent border-0 h-auto p-0 gap-1">
							<TabsTrigger
								value="platform"
								className="text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-b-0"
							>
								Platform
							</TabsTrigger>
							<TabsTrigger
								value="adaccount"
								className="text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-b-0"
							>
								Ad Accounts
							</TabsTrigger>
							<TabsTrigger
								value="campaign"
								className="text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-b-0"
							>
								Campaign
							</TabsTrigger>
							<TabsTrigger
								value="adset"
								className="text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-b-0"
							>
								Ad Set
							</TabsTrigger>
							<TabsTrigger
								value="ad"
								className="text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-b-0"
							>
								Ad
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-50 border-b border-gray-200">
							<th
								ref={resizeRef}
								style={{
									width: nameColumnWidth,
									minWidth: nameColumnWidth,
									maxWidth: nameColumnWidth,
									position: "sticky",
									left: 0,
									zIndex: 10,
								}}
								className="py-2 px-6 font-medium border-r border-gray-200/50 bg-gray-50 relative group h-[32px]"
							>
								<ColumnHeader
									title="Name"
									sortDirection={
										sortConfig?.key === "name"
											? sortConfig.direction
											: null
									}
									onSort={(direction) =>
										handleSort("name", direction)
									}
									onFilter={() => handleFilter("name")}
								/>
								<div
									className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
									onMouseDown={startResize}
								/>
							</th>
							{selectedMetrics
								.filter((metric) => metric.enabled)
								.map((metric, index) => (
									<th
										key={metric.id}
										style={{
											width:
												metricColumnWidths[metric.id] ||
												100,
											minWidth:
												metricColumnWidths[metric.id] ||
												100,
											maxWidth:
												metricColumnWidths[metric.id] ||
												150,
										}}
										className={cn(
											"text-center py-2 px-2 font-medium border-r border-gray-200/50 left-0 bg-gray-50 relative group h-[32px] overflow-hidden",
											index <
												selectedMetrics.filter(
													(m) => m.enabled
												).length -
													1 &&
												"border-r border-gray-200/50"
										)}
									>
										<div className="w-full h-full overflow-hidden">
											<ColumnHeader
												title={
													<div className="flex items-center justify-end gap-1 overflow-hidden min-w-4 w-full">
														{metric.category ===
															"metaReported" && (
															<MetaLogo className="w-3 h-3 text-blue-600 flex-shrink-0" />
														)}
														{metric.category ===
															"googleReported" && (
															<GoogleLogo className="w-3 h-3 flex-shrink-0" />
														)}
														<span
															className="overflow-hidden text-ellipsis whitespace-nowrap min-w-4 text-xs"
															title={metric.name}
														>
															{metric.name}
														</span>
													</div>
												}
												sortDirection={
													sortConfig?.key ===
													metric.id
														? sortConfig.direction
														: null
												}
												onSort={(direction) =>
													handleSort(
														metric.id,
														direction
													)
												}
												onFilter={() =>
													handleFilter(metric.id)
												}
												className="justify-end w-full"
											/>
										</div>
										<div
											className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
											onMouseDown={(e) =>
												startMetricResize(e, metric.id)
											}
										/>
									</th>
								))}
						</tr>
					</thead>
					<tbody className="bg-white">
						{hasGeneratedReport ? (
							<>
								{/* Data Rows */}
								{filteredData.map((item: any, index: any) => {
									const isEvenRow = index % 2 === 0;
									const rowBgClass = isEvenRow
										? "bg-white"
										: "bg-gray-50";
									return (
										<tr
											key={item.id}
											className={cn(
												"border-b border-gray-100 hover:bg-gray-100 transition-colors duration-150",
												rowBgClass
											)}
										>
											<td
												style={{
													width: nameColumnWidth,
													minWidth: nameColumnWidth,
													maxWidth: nameColumnWidth,
													position: "sticky",
													left: 0,
													zIndex: 5,
												}}
												className={cn(
													"py-2 px-6 border-r border-gray-200/50 bg-white",
													rowBgClass === "bg-gray-50"
														? "bg-gray-50"
														: "bg-white"
												)}
											>
												<div className="flex items-center gap-1 group relative">
													{item.type === "meta" ? (
														<img
															src="/logo/meta.svg"
															alt="Facebook"
															width={16}
															height={16}
														/>
													) : item.type ===
													  "google" ? (
														<img
															src="/logo/google.svg"
															alt="Google"
															width={16}
															height={16}
														/>
													) : item.type ===
													  "email" ? (
														<img
															src="/logo/email.svg"
															alt="Google"
															width={16}
															height={16}
														/>
													) : (
														<img
															src="/logo/default.svg"
															alt="Google"
															width={16}
															height={16}
														/>
													)}
													<div className="flex flex-col min-w-0 flex-1">
														<span
															className="text-xs block overflow-hidden text-ellipsis whitespace-nowrap"
															title={item.name}
														>
															{item.name}
														</span>

														{!item.ad_account_id ||
														item.ad_account_id ===
															"" ? null : (
															<span className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
																ID:{" "}
																{
																	item.ad_account_id
																}
															</span>
														)}
													</div>
												</div>
											</td>
											{selectedMetrics
												.filter(
													(metric) => metric.enabled
												)
												.map((metric, metricIndex) => {
													const renderCell = () =>
														renderCellContent(
															metric,
															item
														);
													return (
														<td
															key={metric.id}
															style={{
																width:
																	metricColumnWidths[
																		metric
																			.id
																	] || 100,
																minWidth:
																	metricColumnWidths[
																		metric
																			.id
																	] || 100,
																maxWidth:
																	metricColumnWidths[
																		metric
																			.id
																	] || 150,
															}}
															className={cn(
																"py-4 px-6 text-right",
																metricIndex <
																	selectedMetrics.filter(
																		(m) =>
																			m.enabled
																	).length -
																		1 &&
																	"border-r border-gray-200/50"
															)}
														>
															{renderCell()}
														</td>
													);
												})}
										</tr>
									);
								})}
							</>
						) : (
							<tr>
								<td
									colSpan={
										selectedMetrics.filter((m) => m.enabled)
											.length + 1
									}
									className="py-16 text-center"
								>
									<div className="flex flex-col items-center justify-center">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
											<Grid3X3 className="w-8 h-8 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">
											No Report Generated
										</h3>
										<p className="text-gray-500 max-w-md">
											Configure your filters above and
											click "Generate Report" to see your
											attribution data.
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<CustomizeTableModal
				open={showCustomizeModal}
				onOpenChange={setShowCustomizeModal}
				selectedMetrics={selectedMetrics}
				onMetricsChange={setSelectedMetrics}
				onUpdatedMetrics={handleUpdatedMetrics}
				savedViews={savedTableViews}
				onSaveView={onSaveTableView}
				onLoadView={(viewId) => {
					const view = savedTableViews.find((v) => v.id === viewId);
					if (view && view.metrics) {
						setSelectedMetrics(view.metrics);
					}
					return view; // Return the view so the modal can access it
				}}
			/>
		</div>
	);
};
