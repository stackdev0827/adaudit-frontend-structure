import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Title, Text } from "@tremor/react";
import { getAllCampaigns, getAllGoogleCampaigns } from "../utils/campaignUtils";
import GeneratedTable from "../components/generateTable/GeneratedTable";
import CreateReportDialog from "../components/CreateReportDialog";

const GeneratedTablePage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const tableData = location.state.tablePayload;
	const metricsResult = location.state.metricsResult;

	const [dialogOpen, setDialogOpen] = useState(false);
	const [openCampaigns, setOpenCampaigns] = useState<
		Record<string, Record<string, boolean>>
	>({});
	const [openAdSets, setOpenAdSets] = useState<
		Record<string, Record<string, boolean>>
	>({});
	const [tables, setTables] = useState<any[]>(() => {
		const stored = localStorage.getItem("generatedTables");
		let parsed: any[] = [];
		if (stored) {
			try {
				parsed = JSON.parse(stored);
			} catch {}
		}
		// If no tables in localStorage but tableData exists, initialize with it
		if ((!parsed || parsed.length === 0) && location.state?.tablePayload) {
			parsed = [location.state.tablePayload];
			localStorage.setItem("generatedTables", JSON.stringify(parsed));
		}
		return parsed;
	});

	useEffect(() => {
		if (
			tableData &&
			!tables.some((t) => t && t.tableName === tableData.tableName)
		) {
			setTables((prev) => {
				// Prevent duplicate if table already exists
				if (prev.some((t) => t && t.tableName === tableData.tableName))
					return prev;
				const updated = [...prev, tableData];
				localStorage.setItem("generatedTables", JSON.stringify(updated));
				return updated;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableData]);

	if (!tableData) {
		return (
			<div className="p-8">
				<h2 className="text-lg font-bold mb-4">No table data found.</h2>
				<button
					className="bg-blue-600 text-white px-4 py-2 rounded"
					onClick={() => navigate(-1)}
				>
					Back
				</button>
			</div>
		);
	}

	const handleToggleCampaign = (tableName: string, campaignId: string) => {
		setOpenCampaigns((prev) => ({
			...prev,
			[tableName]: {
				...prev[tableName],
				[campaignId]: !prev[tableName]?.[campaignId],
			},
		}));
	};

	const handleToggleAdSet = (tableName: string, adSetId: string) => {
		setOpenAdSets((prev) => ({
			...prev,
			[tableName]: {
				...prev[tableName],
				[adSetId]: !prev[tableName]?.[adSetId],
			},
		}));
	};

	const allCampaigns = getAllCampaigns(metricsResult);
	const googleCampaigns = getAllGoogleCampaigns(metricsResult);

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* <span className="text-xl">Report</span> */}
			<div className="mb-6">
				<Title>Reports</Title>
				<Text>View and manage your reports</Text>
			</div>

			<div className="bg-white rounded-xl shadow-lg p-6 max-w-full">
				<div className="flex justify-between">
					<Button
						variant="secondary"
						size="xs"
						onClick={() => navigate("/reports")}
						icon={() => (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-5 h-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
								/>
							</svg>
						)}
					>
						Back to Integrations
					</Button>
					<div>
						<Button size="xs" onClick={() => setDialogOpen(true)}>
							Create New Table
						</Button>
					</div>
				</div>
				{tables
					.filter((t) => t && t.staticFields && t.events)
					.map((t, idx) => (
						<div
							key={t.tableName + idx}
							className="bg-white rounded-xl shadow-lg p-6 max-w-full mt-6"
						>
							<h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
								{t.tableName}
							</h2>
							<GeneratedTable
								tableData={t}
								metricsResult={metricsResult}
								allCampaigns={allCampaigns}
								googleCampaigns={googleCampaigns}
								openCampaigns={openCampaigns[t.tableName] || {}}
								openAdSets={openAdSets[t.tableName] || {}}
								onToggleCampaign={(campaignId) =>
									handleToggleCampaign(t.tableName, campaignId)
								}
								onToggleAdSet={(adSetId) =>
									handleToggleAdSet(t.tableName, adSetId)
								}
							/>
						</div>
					))}
			</div>
			<div className="space-y-6">
				<CreateReportDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					selectedType="1111"
				/>
			</div>
		</div>
	);
};

export default GeneratedTablePage;
