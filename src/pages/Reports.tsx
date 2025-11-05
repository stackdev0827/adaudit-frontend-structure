import { useState, useEffect } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { DashboardFilters } from "./reports/DashboardFilters";
import { DataTable } from "./reports/DataTable";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./reports/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./reports/ui/table";
import { Trash2 } from "lucide-react";
// import { metrics } from "../constants/normalized_report";
import { normalizedApi } from "../services/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./reports/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";

interface SelectedMetric {
	id: string;
	name: string;
	category: string;
	enabled: boolean;
}

interface PreviousReport {
	id: string;
	report_name: string;
	attribution: string;
	start_date: string;
	end_date: string;
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

const Index = () => {
	const [filters, setFilters] = useState({
		attributionModel: "biggest_impact",
		attributionWindow: "30-day",
		timePeriod: "today",
		timeComparison: "no-comparison",
		trafficFilter: "all",
	});

	const [savedViews, setSavedViews] = useState<
		Array<{
			id: string;
			templatename: string;
			filters: typeof filters;
			filterby: any;
			metrics: any;
		}>
	>([]);
	const [savedTableViews, setSavedTableViews] = useState<
		Array<{ id: string; name: string; metrics: any[] }>
	>([]);
	const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
	const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
	const [reportName, setReportName] = useState("");
	const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>(
		[]
	);
	const [reportData, setReportData] = useState<any>(null);
	const [previousReports, setPreviousReports] = useState<PreviousReport[]>(
		[]
	);
	const [reportsPagination, setReportsPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});

	// Modal filter selections
	const [selectedModalFilters, setSelectedModalFilters] = useState({
		platforms: [] as string[],
		adAccounts: {
			facebook: [] as string[],
			google: [] as string[],
		},
		campaigns: [] as string[],
		events: [] as string[],
	});

	const [showReportDialog, setShowReportDialog] = useState(false);
	const [selectedReportData, setSelectedReportData] = useState(null);

	const [deleteLoading, setDeleteLoading] = useState(false);
	const [getReportLoading, setGetReportLoading] = useState(false);
	const [generateReportLoading, setGenerateReportLoading] = useState(false);

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "new-report";

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleSaveView = async (name: string) => {
		const newView = {
			id: Date.now().toString(),
			templatename: name,
			filters: { ...filters },
			filterby: { ...selectedModalFilters },
			metrics: { ...selectedMetrics },
		};

		try {
			// Call the save endpoint API
			await normalizedApi.saveTemplate(newView);

			// Update the saved views state only if the API call succeeds
			setSavedViews((prev) => [...prev, newView]);
		} catch (error) {
			console.error("Error saving view:", error);
		}
	};

	const handleLoadView = (viewId: string) => {
		const view = savedViews.find((v) => v.id === viewId);
		if (view) {
			setFilters(view.filters);
		}
		setSelectedModalFilters(view?.filterby);
	};

	const handleSaveTableView = (name: string, metrics: any[]) => {
		const newView = {
			id: Date.now().toString(),
			name,
			metrics,
		};
		setSavedTableViews((prev) => [...prev, newView]);
	};

	const handleLoadTableView = (viewId: string) => {
		return savedTableViews.find((v) => v.id === viewId);
	};

	const handleGenerateReport = async (
		selectedMetrics: SelectedMetric[],
		start: any,
		end: any,
		changedMetrics: SelectedMetric[]
	) => {
		// Generate report name based on current filters
		setGenerateReportLoading(true);
		try {
			type AttributionModelKey =
				| "biggest_impact"
				| "last_click"
				| "first_click"
				| "linear"
				| "time_decay"
				| "position_based";

			const attributionModelNames: Record<AttributionModelKey, string> = {
				biggest_impact: "Biggest Impact",
				last_click: "Last Click",
				first_click: "First Click",
				linear: "Linear",
				time_decay: "Time Decay",
				position_based: "Position Based",
			};

			const timePeriodKeys = [
				"today",
				"yesterday",
				"last-7-days",
				"last-30-days",
				"last-90-days",
				"this-month",
				"last-month",
				"this-year",
				"last-year",
			] as const;
			type TimePeriodKey = (typeof timePeriodKeys)[number];

			const timePeriodNames: Record<TimePeriodKey, string> = {
				today: "Today",
				yesterday: "Yesterday",
				"last-7-days": "Last 7 days",
				"last-30-days": "Last 30 days",
				"last-90-days": "Last 90 days",
				"this-month": "This month",
				"last-month": "Last month",
				"this-year": "This year",
				"last-year": "Last year",
			};

			const now = new Date();
			const timestamp = now.toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});

			const attributionName =
				attributionModelNames[
					filters.attributionModel as AttributionModelKey
				] || filters.attributionModel;
			const attribution = filters.attributionModel;
			const period =
				timePeriodNames[
					(filters.timePeriod as TimePeriodKey) in timePeriodNames
						? (filters.timePeriod as TimePeriodKey)
						: "today"
				] || filters.timePeriod;

			const generatedName = `${attributionName} - ${period} - ${timestamp}`;

			console.log(changedMetrics);

			const requestBody = {
				name: generatedName,
				attribution: attribution,
				attribution_window: parseInt(
					filters?.attributionWindow?.match(/\d+/)?.[0] ?? "0"
				),

				filters: {
					platforms: selectedModalFilters.platforms,
					ad_accounts: selectedModalFilters.adAccounts,
					campaigns: selectedModalFilters.campaigns[0],
					events: selectedModalFilters.events,
				},
				period: period,
				traffic_filter: filters.trafficFilter,
				time_comparison: filters.timeComparison,
				start_date: start,
				end_date: end,
				// metrics: metrics,
				metrics: selectedMetrics,
				changed_metrics: changedMetrics,
			};
			const result = await normalizedApi.getAll(requestBody);
			console.log(result.data.data);
			setReportData(result.data.data);
			setReportName(generatedName);
			setHasGeneratedReport(true);
			setIsFiltersCollapsed(true);
			setGenerateReportLoading(false);
		} catch (error) {
			console.log(error);
			setGenerateReportLoading(false);
		} finally {
			setGenerateReportLoading(false);
		}
	};

	const handleDeleteReport = async (reportId: number) => {
		setDeleteLoading(true);
		try {
			await normalizedApi.deleteReport(reportId);
			console.log("Delete report:", reportId);
			setPreviousReports((prev) =>
				prev.filter((report) => parseInt(report.id) !== reportId)
			);
		} catch (error) {
			console.log(error);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleGetReport = async (reportId: number) => {
		try {
			setGetReportLoading(true);
			const response = await normalizedApi.getReport(reportId);
			const reportData = response.data;

			// Find the report details from previousReports
			const reportDetails = previousReports.find(
				(report) => parseInt(report.id) === reportId
			);

			// Navigate to new page with report data
			navigate("/report-display", {
				state: {
					reportData: reportData.data,
					reportName: reportDetails?.report_name || "Report",
					selectedMetrics: reportData.metrics,
					// selectedModalFilters: reportData.metrics,
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			setGetReportLoading(false);
		}
	};

	// const handleGetReport = async (reportId: number) => {
	// 	setGetReportLoading(true);
	// 	try {
	// 		const report = await normalizedApi.getReport(reportId);
	// 		console.log(report.data.data);
	// 		setSelectedReportData(report.data.data);
	// 		setShowReportDialog(true);
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		setGetReportLoading(false);
	// 	}
	// };

	const onUpdateSelectedMetrics = (metrics: SelectedMetric[]) => {
		console.log(metrics);
		setSelectedMetrics(metrics); // Update local state
	};

	const handleDeleteView = (viewId: string) => {
		setSavedViews((prevViews) =>
			prevViews.filter((view) => view.id !== viewId)
		);
	};

	const fetchPreviousReports = async (
		page: number = 1,
		page_size: number = reportsPagination.page_size
	) => {
		try {
			const response = await normalizedApi.getReports(page, page_size);
			setPreviousReports(response.data.reports || []);
			setReportsPagination({
				current_page: response.data.page || page,
				total_pages:
					response.data.total_pages ||
					Math.ceil((response.data.count || 0) / page_size),
				total_count: response.data.count || 0,
				page_size: response.data.page_size || page_size,
			});
		} catch (error) {
			console.error("Error fetching previous reports:", error);
			setPreviousReports([]);
		}
	};

	const handleReportsPageChange = (newPage: number) => {
		setReportsPagination((prev) => ({
			...prev,
			current_page: newPage,
		}));
		fetchPreviousReports(newPage);
	};

	const handleReportsPerPageChange = (value: string) => {
		const newPerPage = parseInt(value);
		setReportsPagination((prev) => ({
			...prev,
			current_page: 1,
			page_size: newPerPage,
		}));
		fetchPreviousReports(1, newPerPage);
	};

	const renderReportsPagination = () => {
		const renderPageNumbers = () => {
			const pages = [];
			const totalPages = reportsPagination.total_pages;
			const currentPage = reportsPagination.current_page;

			// Always show first page
			pages.push(
				<Button
					key={1}
					size="xs"
					variant={currentPage === 1 ? "primary" : "secondary"}
					onClick={() => handleReportsPageChange(1)}
					className="mx-1"
				>
					1
				</Button>
			);

			// Calculate range to show
			let startPage = Math.max(2, currentPage - 2);
			let endPage = Math.min(totalPages - 1, currentPage + 2);

			// Add ellipsis after first page if needed
			if (startPage > 2) {
				pages.push(
					<span key="ellipsis1" className="mx-1">
						...
					</span>
				);
			}

			// Add pages in range
			for (let i = startPage; i <= endPage; i++) {
				pages.push(
					<Button
						key={i}
						size="xs"
						variant={currentPage === i ? "primary" : "secondary"}
						onClick={() => handleReportsPageChange(i)}
						className="mx-1"
					>
						{i}
					</Button>
				);
			}

			// Add ellipsis before last page if needed
			if (endPage < totalPages - 1) {
				pages.push(
					<span key="ellipsis2" className="mx-1">
						...
					</span>
				);
			}

			// Always show last page if there is more than one page
			if (totalPages > 1) {
				pages.push(
					<Button
						key={totalPages}
						size="xs"
						variant={
							currentPage === totalPages ? "primary" : "secondary"
						}
						onClick={() => handleReportsPageChange(totalPages)}
						className="mx-1"
					>
						{totalPages}
					</Button>
				);
			}

			return pages;
		};

		return (
			<div className="flex items-center justify-between mt-4">
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">
						Rows per page:
					</span>
					<select
						value={reportsPagination.page_size.toString()}
						onChange={(e) =>
							handleReportsPerPageChange(e.target.value)
						}
						className="border rounded px-2 py-1 text-sm"
					>
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="xs"
						variant="secondary"
						onClick={() => handleReportsPageChange(1)}
						disabled={reportsPagination.current_page === 1}
					>
						First
					</Button>
					<Button
						size="xs"
						variant="secondary"
						onClick={() =>
							handleReportsPageChange(
								reportsPagination.current_page - 1
							)
						}
						disabled={reportsPagination.current_page === 1}
					>
						Previous
					</Button>
					<div className="flex items-center gap-1">
						{renderPageNumbers()}
					</div>
					<Button
						size="xs"
						variant="secondary"
						onClick={() =>
							handleReportsPageChange(
								reportsPagination.current_page + 1
							)
						}
						disabled={
							reportsPagination.current_page ===
							reportsPagination.total_pages
						}
					>
						Next
					</Button>
					<Button
						size="xs"
						variant="secondary"
						onClick={() =>
							handleReportsPageChange(
								reportsPagination.total_pages
							)
						}
						disabled={
							reportsPagination.current_page ===
							reportsPagination.total_pages
						}
					>
						Last
					</Button>
				</div>
				<div className="text-sm text-gray-600">
					Showing{" "}
					{(reportsPagination.current_page - 1) *
						reportsPagination.page_size +
						1}{" "}
					to{" "}
					{Math.min(
						reportsPagination.current_page *
							reportsPagination.page_size,
						reportsPagination.total_count
					)}{" "}
					of {reportsPagination.total_count} items
				</div>
			</div>
		);
	};

	useEffect(() => {
		if (activeTab === "previous-reports") {
			fetchPreviousReports();
		}
	}, [activeTab]);

	useEffect(() => {
		const getTemplates = async () => {
			const templates = await normalizedApi.template();
			setSavedViews(templates.data);
		};
		getTemplates();
	}, [hasGeneratedReport]);

	return (
		<div>
			<div>
				<Title>Normalized Report</Title>
				<Text>View and manage your reports</Text>
			</div>

			<Card className="mt-2">
				<div className="min-h-screen ">
					<div>
						<Tabs
							value={activeTab}
							onValueChange={(value) => {
								const newSearchParams = new URLSearchParams(
									searchParams
								);
								newSearchParams.set("tab", value);
								setSearchParams(newSearchParams);
							}}
							className="w-full"
						>
							<TabsList className="mt-2 text-black">
								<TabsTrigger
									value="new-report"
									className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b data-[state=active]:border-blue-600"
								>
									New Report
								</TabsTrigger>
								<TabsTrigger
									value="previous-reports"
									className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b data-[state=active]:border-blue-600"
								>
									Previous Reports
								</TabsTrigger>
							</TabsList>

							<TabsContent value="new-report" className="mt-2">
								<DashboardFilters
									filters={filters}
									onFilterChange={handleFilterChange}
									savedViews={savedViews}
									onSaveView={handleSaveView}
									onLoadView={handleLoadView}
									onDeleteView={handleDeleteView}
									onGenerateReport={handleGenerateReport}
									isCollapsed={isFiltersCollapsed}
									onToggleCollapse={() =>
										setIsFiltersCollapsed(
											!isFiltersCollapsed
										)
									}
									hasGeneratedReport={hasGeneratedReport}
									reportName={reportName}
									selectedModalFilters={selectedModalFilters}
									onModalFiltersChange={(filters) =>
										setSelectedModalFilters({
											...filters,
											adAccounts: {
												facebook:
													filters.adAccounts
														.facebook || [],
												google:
													filters.adAccounts.google ||
													[],
											},
										})
									}
									onMetricsChange={onUpdateSelectedMetrics}
								/>
								<div className="mt-6">
									<DataTable
										filters={filters}
										hasGeneratedReport={hasGeneratedReport}
										savedTableViews={savedTableViews}
										onSaveTableView={handleSaveTableView}
										onLoadTableView={handleLoadTableView}
										initialSelectedMetrics={selectedMetrics}
										tableData={reportData}
										status={false}
									/>
								</div>
							</TabsContent>

							<TabsContent
								value="previous-reports"
								className="mt-6"
							>
								<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
									<div className="mb-5">
										<h2 className="text-lg font-semibold text-gray-900">
											Previous Reports
										</h2>
										<p className="text-sm text-gray-500 mt-1">
											View and manage your previously
											generated reports
										</p>
									</div>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>
													Attribution
												</TableHead>
												<TableHead>
													Start Date
												</TableHead>
												<TableHead>End Date</TableHead>
												<TableHead className="w-20">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{previousReports.map((report) => (
												<TableRow
													key={report.id}
													className="cursor-pointer"
												>
													<TableCell
														className="font-medium"
														onClick={() => {
															handleGetReport(
																parseInt(
																	report.id
																)
															);
														}}
													>
														{report.report_name}
													</TableCell>
													{/* <TableCell className="text-sm text-gray-600">
														{report.filters}
													</TableCell> */}
													<TableCell
														onClick={() => {
															handleGetReport(
																parseInt(
																	report.id
																)
															);
														}}
													>
														{report.attribution}
													</TableCell>
													<TableCell
														onClick={() => {
															handleGetReport(
																parseInt(
																	report.id
																)
															);
														}}
													>
														{report.start_date.slice(
															0,
															10
														)}
													</TableCell>
													<TableCell
														onClick={() => {
															handleGetReport(
																parseInt(
																	report.id
																)
															);
														}}
													>
														{report.end_date.slice(
															0,
															10
														)}
													</TableCell>
													<TableCell>
														<Button
															variant="secondary"
															size="sm"
															onClick={() =>
																handleDeleteReport(
																	parseInt(
																		report.id
																	)
																)
															}
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									{renderReportsPagination()}
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</Card>

			{/* Report Display Dialog */}
			<Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
				<DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Report Details</DialogTitle>
					</DialogHeader>
					{selectedReportData && (
						<div className="mt-4">
							<DataTable
								hasGeneratedReport={true}
								initialSelectedMetrics={selectedMetrics}
								tableData={selectedReportData}
								status={true}
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Loading Overlays */}
			{deleteLoading && (
				<LoadingSpinner
					fullScreen
					text="Deleting report..."
					size="lg"
				/>
			)}
			{getReportLoading && (
				<LoadingSpinner fullScreen text="Loading report..." size="lg" />
			)}
			{generateReportLoading && (
				<LoadingSpinner fullScreen text="Loading report..." size="lg" />
			)}
		</div>
	);
};

export default Index;
