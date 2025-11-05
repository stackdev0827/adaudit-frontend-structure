import React, { useState } from "react";
import { Button } from "@tremor/react";

interface NewAdAuditDialogProps {
	open: boolean;
	onClose: () => void;
	onCreateReport: (data: { type: string; template?: string }) => void;
}

const NewAdAuditDialog: React.FC<NewAdAuditDialogProps> = ({
	open,
	onClose,
	onCreateReport,
}) => {
	const [selectedOption, setSelectedOption] = useState<string>("scratch");
	const [selectedTemplate, setSelectedTemplate] = useState("");

	// Sample templates - replace with actual data
	const templates = [
		{ value: "facebook-ads", label: "Facebook Ads Template" },
		{ value: "google-ads", label: "Google Ads Template" },
		{ value: "instagram-ads", label: "Instagram Ads Template" },
		{ value: "linkedin-ads", label: "LinkedIn Ads Template" },
	];

	const handleCreate = () => {
		if (selectedOption === "template" && !selectedTemplate) {
			alert("Please select a template.");
			return;
		}

		onCreateReport({
			type: selectedOption,
			template: selectedOption === "template" ? selectedTemplate : undefined,
		});

		// Reset form
		setSelectedOption("scratch");
		setSelectedTemplate("");
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
			<div className="bg-white p-6 rounded-lg max-w-md w-full relative overflow-visible">
				<h3 className="text-lg font-medium mb-4">New Ad Audit</h3>

				<div className="space-y-4 mb-6">
					<div className="flex items-center">
						<input
							type="radio"
							id="scratch"
							name="auditType"
							value="scratch"
							checked={selectedOption === "scratch"}
							onChange={(e) => setSelectedOption(e.target.value)}
							className="mr-2"
						/>
						<label htmlFor="scratch" className="text-sm">
							Start from scratch
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="radio"
							id="template"
							name="auditType"
							value="template"
							checked={selectedOption === "template"}
							onChange={(e) => setSelectedOption(e.target.value)}
							className="mr-2"
						/>
						<label htmlFor="template" className="text-sm">
							Select from template
						</label>
					</div>
				</div>

				{selectedOption === "template" && (
					<div className="space-y-4 mb-6 relative">
						<div className="relative">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Template *
							</label>
							<select
								value={selectedTemplate}
								onChange={(e) => setSelectedTemplate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Select a template</option>
								{templates.map((template) => (
									<option key={template.value} value={template.value}>
										{template.label}
									</option>
								))}
							</select>
						</div>
					</div>
				)}

				<div className="flex justify-end space-x-3">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleCreate}>Next</Button>
				</div>
			</div>
		</div>
	);
};

export default NewAdAuditDialog;
