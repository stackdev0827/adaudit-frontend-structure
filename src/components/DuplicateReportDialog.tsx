import React, { useState } from "react";
import { Button, TextInput } from "@tremor/react";

interface DuplicateReportDialogProps {
	open: boolean;
	onClose: () => void;
	onDuplicateReport: (data: { reportName: string; date: string }) => void;
	originalReport?: { report_name: string; date: string };
}

const DuplicateReportDialog: React.FC<DuplicateReportDialogProps> = ({
	open,
	onClose,
	onDuplicateReport,
}) => {
	const [reportName, setReportName] = useState("");
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

	const handleDuplicate = () => {
		if (!reportName.trim() || !date.trim()) {
			alert("Please fill in all required fields.");
			return;
		}

		onDuplicateReport({
			reportName,
			date,
		});

		// Reset form
		setReportName("");
		setDate("");
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110]">
			<div className="bg-white p-6 rounded-lg max-w-md w-full">
				<h3 className="text-lg font-medium mb-4">Duplicate Report</h3>
				<div className="space-y-4 mb-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Report Name *
						</label>
						<TextInput
							value={reportName}
							onChange={(e) => setReportName(e.target.value)}
							placeholder="Enter report name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Date *
						</label>
						<TextInput
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex justify-end space-x-3">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleDuplicate}>Duplicate Report</Button>
				</div>
			</div>
		</div>
	);
};

export default DuplicateReportDialog;
