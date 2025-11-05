import React, { useEffect, useState } from "react";
import {
	Card,
	Title,
	Text,
	Button,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	TextInput,
	Select,
	SelectItem,
} from "@tremor/react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { metricsApi, metricsTableApi } from "../services/api";
import NewAdAuditDialog from "../components/NewAdAuditDialog";
import CreateScratchReportDialog from "../components/CreateScratchReportDialog";
import DuplicateReportDialog from "../components/DuplicateReportDialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface Report {
	id: number;
	date: string;
	count: number;
	created_at: string;
	last_update_at: string;
	metrics_data: any;
	report_name: string;
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

const AdAudit: React.FC = () => {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const [reportList, setReportList] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [newAuditDialogOpen, setNewAuditDialogOpen] = useState(false);
	const [scratchReportDialogOpen, setScratchReportDialogOpen] =
		useState(false);
	const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
	const [reportToDuplicate, setReportToDuplicate] = useState<any>(null);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [duplicateLoading, setDuplicateLoading] = useState(false);
	const navigate = useNavigate();

	// Function to fetch reports with pagination and search
	const fetchReports = async (
		page = pagination.current_page,
		pageSize = pagination.page_size,
		search = searchTerm
	) => {
		setLoading(true);
		try {
			const response = await metricsTableApi.getAllTables(
				page,
				pageSize,
				search
			);
			const result = response.data;
			setReportList(result.data);
			setPagination({
				current_page: page || 1,
				total_pages: Math.ceil(
					(result.totalCount || 0) / (pageSize || 10)
				),
				total_count: result.totalCount || 0,
				page_size: pageSize || 10,
			});
		} catch (error) {
			console.error("Failed to fetch reports:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewReport = (report: Report) => {
		// Encode the report name to handle special characters like forward slashes
		const encodedReportName = encodeURIComponent(report.report_name);
		navigate(`/adaudit/metrics/${report.date}/${encodedReportName}`);
	};

	const handleDeleteClick = (report: Report) => {
		try {
			setSelectedReport(report);
			setDeleteDialogOpen(true);
		} catch (error) {
			console.log(error);
		}
	};

	const handleConfirmDelete = async () => {
		if (!selectedReport?.date) {
			console.error("No date available for deletion");
			return;
		}

		try {
			await metricsApi.deleteReport(selectedReport);

			// Refresh the report list after deletion
			fetchReports();

			setDeleteDialogOpen(false);
			setSelectedReport(null);
		} catch (error) {
			console.error("Failed to delete report:", error);
		}
	};

	// Handle page change
	const handlePageChange = (newPage: number) => {
		fetchReports(newPage, pagination.page_size, searchTerm);
	};

	// Handle page size change
	const handlePageSizeChange = (value: string) => {
		const newPageSize = parseInt(value);
		fetchReports(1, newPageSize, searchTerm);
	};

	// Handle search
	const handleSearch = () => {
		fetchReports(1, pagination.page_size, searchTerm);
	};

	useEffect(() => {
		fetchReports();
	}, []);

	const renderPagination = () => {
		return (
			<div className="flex items-center justify-between mt-4">
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">
						Rows per page:
					</span>
					<Select
						value={pagination.page_size.toString()}
						onValueChange={handlePageSizeChange}
						className="w-20"
					>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="25">25</SelectItem>
						<SelectItem value="50">50</SelectItem>
						<SelectItem value="100">100</SelectItem>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="xs"
						variant="secondary"
						onClick={() => handlePageChange(1)}
						disabled={pagination.current_page === 1}
					>
						First
					</Button>
					<Button
						size="xs"
						variant="secondary"
						onClick={() =>
							handlePageChange(pagination.current_page - 1)
						}
						disabled={pagination.current_page === 1}
					>
						Previous
					</Button>
					{Array.from(
						{ length: Math.min(5, pagination.total_pages) },
						(_, i) => {
							const pageNum =
								pagination.current_page > 3
									? pagination.current_page - 3 + i + 1
									: i + 1;
							if (pageNum <= pagination.total_pages) {
								return (
									<Button
										key={`page-${pageNum}`}
										size="xs"
										variant={
											pageNum === pagination.current_page
												? "primary"
												: "secondary"
										}
										onClick={() =>
											handlePageChange(pageNum)
										}
									>
										{pageNum}
									</Button>
								);
							}
							return null;
						}
					)}
					<Button
						size="xs"
						variant="secondary"
						onClick={() =>
							handlePageChange(pagination.current_page + 1)
						}
						disabled={
							pagination.current_page === pagination.total_pages
						}
					>
						Next
					</Button>
					<Button
						size="xs"
						variant="secondary"
						onClick={() => handlePageChange(pagination.total_pages)}
						disabled={
							pagination.current_page === pagination.total_pages
						}
					>
						Last
					</Button>
				</div>
			</div>
		);
	};

	const handleCreateNewAudit = (data: {
		type: string;
		template?: string;
	}) => {
		if (data.type === "scratch") {
			setScratchReportDialogOpen(true);
		} else {
			// Handle template selection
			navigate("/adaudit/metrics", {
				state: {
					templateData: {
						template: data.template,
					},
				},
			});
		}
	};

	const handleCreateScratchReport = async (data: {
		reportName: string;
		date: string;
	}) => {
		const result = await metricsApi.createReport(data);
		if (result.data.status === "success") {

			const encodedReportName = encodeURIComponent(data.reportName);
			navigate(`/adaudit/metrics/${data.date}/${encodedReportName}`, {
				state: {
					scratchData: {
						reportName: data.reportName,
						date: data.date,
					},
				},
			});
		} else {
		}
	};

	const handleDuplicateClick = (report: any) => {
		setReportToDuplicate(report);
		setDuplicateDialogOpen(true);
	};

	const handleDuplicateReport = async (data: {
		reportName: string;
		date: string;
	}) => {
		console.log("Duplicating report:", data);
		setDuplicateLoading(true); // Start full screen loading

		try {
			const reportTemplate = await metricsApi.duplicate(
				reportToDuplicate
			);
			if (reportTemplate.data.status === "success") {
				// Transform the data to extract from RawMessage wrapper
				const transformedPayloads = reportTemplate.data.data.map(
					(item: any) => item.RawMessage
				);

				const result = await metricsApi.duplicateSave({
					payloads: transformedPayloads,
					date: data.date,
					reportName: data.reportName,
				});
				if (result.data.status === "success") {
					await metricsApi.createReport(data);
					await metricsTableApi.saveTable({
						report_date: result.data.data.report_date,
						tables: result.data.data.tables,
					});
					navigate(
						`/adaudit/metrics/${data.date}/${data.reportName}`,
						{
							state: {
								scratchData: {
									reportName: data.reportName,
									date: data.date,
									data: reportTemplate.data,
								},
							},
						}
					);
				}
			} else {
				console.log("error");
			}
		} catch (error) {
			console.error("Error duplicating report:", error);
		} finally {
			setDuplicateLoading(false); // End loading
		}
	};

	return (
		<div>
			<div>
				<Title>Ad Audits</Title>
				<Text>View and manage your reports</Text>
			</div>

			<Card className="mt-2">
				<div className="flex justify-between mb-6 items-center">
					<div className="flex items-center gap-2">
						<TextInput
							placeholder="Search reports..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-80 max-w-2xl"
							icon={Search}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch();
								}
							}}
						/>
						<Button size="sm" onClick={handleSearch}>
							Search
						</Button>
					</div>
					<Button
						size="lg"
						onClick={() => setScratchReportDialogOpen(true)}
					>
						New Ad Audit
					</Button>
				</div>

				<Table className="mt-6">
					<TableHead>
						<TableRow>
							<TableHeaderCell className="text-left w-16">
								No
							</TableHeaderCell>
							<TableHeaderCell className="text-center w-1/5">
								Report Date
							</TableHeaderCell>
							<TableHeaderCell className="text-center w-1/3">
								Report Name
							</TableHeaderCell>
							<TableHeaderCell className="text-center w-1/5">
								Created At
							</TableHeaderCell>
							<TableHeaderCell className="text-center w-1/5">
								Actions
							</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{reportList === null || reportList.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									No matching reports found
								</TableCell>
							</TableRow>
						) : (
							reportList.map((report: any, index: number) => (
								<TableRow key={report.id || index}>
									<TableCell className="text-left text-black">
										{(pagination.current_page - 1) *
											pagination.page_size +
											index +
											1}
										{/* {(pagination.current_page - 1) * pagination.page_size +
											reportList.indexOf(report) +
											1} */}
									</TableCell>
									<TableCell className="text-center text-black">
										{report.date}
									</TableCell>
									<TableCell className="text-center text-black">
										{report.report_name}
									</TableCell>
									<TableCell className="text-center text-black">
										{new Date(report.created_at)
											.toLocaleString("sv-SE", {
												year: "numeric",
												month: "2-digit",
												day: "2-digit",
												hour: "2-digit",
												minute: "2-digit",
												second: "2-digit",
											})
											.replace("T", " ")}
									</TableCell>

									{/* <TableCell className="text-center">
										{report.created_at}
									</TableCell> */}
									<TableCell className="text-center">
										<div className="flex justify-center space-x-2">
											<Button
												variant="secondary"
												size="xs"
												onClick={() =>
													handleViewReport(report)
												}
											>
												View
											</Button>
											<Button
												variant="secondary"
												size="xs"
												onClick={() =>
													handleDuplicateClick(report)
												}
											>
												Duplicate
											</Button>
											<Button
												variant="secondary"
												size="xs"
												color="red"
												onClick={() =>
													handleDeleteClick(report)
												}
											>
												Delete
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				{renderPagination()}
				{/* Add pagination component */}
				{/* {!loading && pagination.total_pages > 1 && renderPagination()} */}
			</Card>

			{/* New Ad Audit Dialog */}
			<NewAdAuditDialog
				open={newAuditDialogOpen}
				onClose={() => setNewAuditDialogOpen(false)}
				onCreateReport={handleCreateNewAudit}
			/>

			{/* Create Scratch Report Dialog */}
			<CreateScratchReportDialog
				open={scratchReportDialogOpen}
				onClose={() => setScratchReportDialogOpen(false)}
				onCreateReport={handleCreateScratchReport}
			/>

			{/* Duplicate Report Dialog */}
			<DuplicateReportDialog
				open={duplicateDialogOpen}
				onClose={() => setDuplicateDialogOpen(false)}
				onDuplicateReport={handleDuplicateReport}
				originalReport={reportToDuplicate}
			/>

			{/* Delete Confirmation Dialog */}
			{deleteDialogOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg max-w-md w-full">
						<h3 className="text-lg font-medium mb-4">
							Confirm Delete
						</h3>
						<p className="mb-6">
							Are you sure you want to delete this report from{" "}
							{selectedReport?.date}?
						</p>
						<div className="flex justify-end space-x-3">
							<Button
								variant="secondary"
								onClick={() => setDeleteDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button color="red" onClick={handleConfirmDelete}>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Full Screen Loading Overlay */}
			{duplicateLoading && (
				<LoadingSpinner
					fullScreen
					text="Duplicating report..."
					size="lg"
				/>
			)}
			{loading && (
				<LoadingSpinner
					fullScreen
					text="loading reports..."
					size="lg"
				/>
			)}
		</div>
	);
};

export default AdAudit;
