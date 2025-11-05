import { useLocation } from "react-router-dom";
import { Button } from "./reports/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "./reports/DataTable";
import { Title, Text, Card } from "@tremor/react";

const ReportDisplay = () => {
	const location = useLocation();
	const { reportData, reportName, selectedMetrics } = location.state || {};

	console.log(selectedMetrics);

	if (!reportData) {
		return (
			<div className="p-6">
				<Text>No report data available</Text>
				<Button onClick={() => window.history.back()} className="mt-4">
					Back to Reports
				</Button>
			</div>
		);
	}

	return (
		<div>
			<div>
				<button
					// variant="ghost"
					onClick={() => window.history.back()}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Reports
				</button>
				<Title>Normalized Report</Title>
				<Text>View and manage your reports</Text>
			</div>

			<Card className="mt-2">
				<div></div>
				<div className="flex items-center gap-4 mb-6">
					<div>
						<Title>{reportName || "Report Details"}</Title>
						<Text>Generated report data</Text>
					</div>
				</div>
				<div className="min-h-screen ">
					<DataTable
						hasGeneratedReport={true}
						initialSelectedMetrics={selectedMetrics || []}
						tableData={reportData}
						status={true}
					/>
				</div>
			</Card>
		</div>
	);
};

export default ReportDisplay;
