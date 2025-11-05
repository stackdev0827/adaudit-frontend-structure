import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Title, Text, Card } from "@tremor/react";
import { metricsApi, metricsTableApi } from "../services/api";
import { isAuthenticated } from "../utils/token";
import MetricsTable from "../components/metricsTable/MetricsTable";
import CreateReportDialog from "../components/CreateReportDialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const MetricsTablePage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { date, report_name: encodedReportName } = useParams<{
		date: string;
		report_name: string;
	}>();

	// Decode the report name to handle special characters like forward slashes
	const report_name = encodedReportName
		? decodeURIComponent(encodedReportName)
		: "";
	const today = new Date();
	const formattedDate = today.toISOString().slice(0, 10);

	// Get data from navigation state
	const scratchData = location.state?.scratchData;

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [tableName, setTableName] = useState(scratchData?.reportName || "");

	const [tables, setTables] = useState<
		Array<{
			id?: string; // Database ID
			tableName: string;
			reportName: string;
			payload: any;
			data: any;
		}>
	>([]);

	const handleCreateReport = () => {
		// TODO: Implement report creation logic
		setDialogOpen(true);
	};

	// Handler for table name changes from the dialog
	const handleTableNameChange = (newTableName: string) => {
		setTableName(newTableName);
	};

	// Update to store the new table
	const handleApplyPayload = (payload: any) => {
		setDialogOpen(false);

		// Make sure the payload has the table name
		const payloadWithName = {
			...payload,
			tableName: payload.tableName || tableName,
			reportName: payload.reportName || scratchData?.reportName || "",
		};

		// Use the payload to fetch metrics data and store as a new table
		fetchMetricsWithPayload(payloadWithName);
	};

	// Update to store the fetched data as a new table
	const fetchMetricsWithPayload = async (payload: any) => {
		setLoading(true);
		setError(null);
		try {
			const response = await metricsApi.test(payload);

			// Create the new table object
			const newTable = {
				tableName: payload.tableName || tableName,
				reportName: payload.reportName || scratchData?.reportName || "",
				payload: payload,
				data: response.data.data,
			};

			setTables((prevTables) => {
				const updatedTables = [...prevTables, newTable];
				return updatedTables;
			});
		} catch (err) {
			setError("Failed to fetch metrics data. Please try again.");
			console.error("Error fetching metrics:", err);
		} finally {
			setLoading(false);
		}
	};

	// Function to update a specific table's data
	const handleUpdateTableData = async (
		tableIndex: number,
		updatedData: any
	) => {
		setTables((prevTables) => {
			const updatedTables = [...prevTables];
			const currentTable = updatedTables[tableIndex];

			// Update the table data
			updatedTables[tableIndex] = {
				...currentTable,
				data: {
					...currentTable.data,
					data: updatedData,
				},
			};

			// Save to localStorage
			localStorage.setItem(
				"metricsTables",
				JSON.stringify(updatedTables)
			);

			// Save to database if authenticated and has ID
			if (isAuthenticated() && currentTable.id) {
				metricsTableApi
					.updateTable(currentTable.id, updatedTables[tableIndex])
					.then((response) =>
						console.log("Table updated in database:", response.data)
					)
					.catch((error) =>
						console.error(
							"Error updating table in database:",
							error
						)
					);
			}

			return updatedTables;
		});
	};

	// Function to delete a table
	const handleDeleteTable = async (tableIndex: number) => {
		const tableToDelete = tables[tableIndex];

		setTables((prevTables) => {
			const updatedTables = prevTables.filter(
				(_, index) => index !== tableIndex
			);
			localStorage.setItem(
				"metricsTables",
				JSON.stringify(updatedTables)
			);
			return updatedTables;
		});

		// Delete from database if authenticated and has ID
		if (isAuthenticated() && tableToDelete.id) {
			try {
				await metricsTableApi.deleteTable(tableToDelete.id);
			} catch (error) {
				console.error("Error deleting table from database:", error);
			}
		}
	};

	useEffect(() => {
		const getAdAuditReports = async (date: string, reportName?: string) => {
			const safeReportName = reportName ?? "";
			const response = await metricsTableApi.getTableByDate(
				date,
				safeReportName
			);
			const result = response.data;
			return result;
		};

		const fetchData = async () => {
			setLoading(true);
			try {
				const data = await getAdAuditReports(
					date || formattedDate,
					report_name
				);

				// Check if data.data exists and is not null
				if (data.data && data.data !== null) {
					const transformed = data.data.map((item: any) => ({
						id: item.id,
						tableName: item.metrics_data.tableName,
						reportName: item.metrics_data.reportName,
						payload: item.metrics_data.payload,
						data: item.metrics_data.data,
					}));
					setTables(transformed);
				} else {
					setTables([]);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setError("Failed to load tables. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<LoadingSpinner
				fullScreen
				text="loading metrics data..."
				size="lg"
			/>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<Card className="max-w-md mx-auto">
					<div className="text-center">
						<Title className="text-red-600 mb-4">Error</Title>
						<Text className="mb-4">{error}</Text>
						<Button onClick={() => setError(null)}>Dismiss</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<div className="space-y-6">
					{dialogOpen ? (
						<CreateReportDialog
							onClose={() => setDialogOpen(false)}
							onApply={handleApplyPayload}
							initialTableName={tableName}
							initialReportName={scratchData?.reportName}
							initialDate={scratchData?.date}
							onTableNameChange={handleTableNameChange} // Pass the handler to receive table name changes
						/>
					) : null}
				</div>
				<div
					className="flex justify-start items-center text-center cursor-pointer"
					onClick={() => navigate("/adaudit")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-4 h-4 text-center text-blue-500"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					<span className="text-center text-blue-500 text-sm">
						Back to Reports
					</span>
				</div>
				<div className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-4">
					<span>Report:</span>
					<span>{report_name}</span>
					<span>({date})</span>
				</div>
			</div>
			<Card>
				{date && date !== formattedDate ? null : (
					<div className="mb-2 flex justify-end">
						<Button onClick={handleCreateReport} className="mr-2">
							Create New Table
						</Button>
					</div>
				)}
				{tables.length === 0 ||
				!tables.some((table) => table.data?.campaigns?.length > 0) ? (
					<Card className="p-6">
						<div className="text-center">
							<Text>
								No metrics tables available. Create a table to
								get started.
							</Text>
						</div>
					</Card>
				) : (
					<div className="space-y-8">
						{tables.map((table, index) => (
							<Card key={index} className="p-4">
								<div className="flex justify-between items-center mb-4">
									<Title className="text-xl">
										{table.tableName}
									</Title>
									{date &&
									date !== formattedDate ? null : table.data
											?.campaigns?.length > 0 ? (
										<Button
											size="xs"
											variant="secondary"
											color="red"
											onClick={() =>
												handleDeleteTable(index)
											}
										>
											Delete
										</Button>
									) : null}
								</div>
								<div className="overflow-hidden">
									{table.data?.campaigns?.length > 0 ? (
										<MetricsTable
											payload={table.payload}
											data={table.data.campaigns}
											onDataUpdate={(updatedData) =>
												handleUpdateTableData(
													index,
													updatedData
												)
											}
										/>
									) : (
										<div className="text-center p-4 text-gray-500">
											No campaign data available for this
											table
										</div>
									)}
								</div>
							</Card>
						))}
					</div>
				)}
			</Card>
		</div>
	);
};

export default MetricsTablePage;
