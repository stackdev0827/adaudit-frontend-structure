import React, { useState } from "react";
import {
	Card,
	Title,
	Text,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Badge,
	Button,
} from "@tremor/react";

const Reports: React.FC = () => {
	const [selectedType, setSelectedType] = useState<string | null>(null);

	const reportTypes = [
		{
			id: "last_click",
			name: "Last Click",
			description:
				"Attributes 100% of the conversion value to the last marketing touchpoint before purchase",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
					/>
				</svg>
			),
		},
		{
			id: "first_click",
			name: "First Click",
			description:
				"Attributes 100% of the conversion value to the first marketing touchpoint in the customer journey",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
					/>
				</svg>
			),
		},
		{
			id: "scientific",
			name: "Scientific",
			description:
				"Uses time-decay modeling to attribute more value to touchpoints closer to the conversion",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
					/>
				</svg>
			),
		},
		{
			id: "biggest_impact",
			name: "Biggest Impact",
			description:
				"Identifies and attributes value to the marketing touchpoints that had the most significant impact",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
					/>
				</svg>
			),
		},
	];

	const handleCreateReport = () => {
		if (!selectedType) return;
		// TODO: Implement report creation logic
		console.log(`Creating report of type: ${selectedType}`);
	};

	const reports = [
		{
			id: 1,
			name: "Q1 Performance Report",
			type: "Financial",
			status: "Completed",
			date: "2024-03-15",
		},
		{
			id: 2,
			name: "Customer Satisfaction Survey",
			type: "Customer",
			status: "In Progress",
			date: "2024-03-14",
		},
		{
			id: 3,
			name: "Marketing Campaign Analysis",
			type: "Marketing",
			status: "Pending",
			date: "2024-03-13",
		},
		{
			id: 4,
			name: "Sales Pipeline Overview",
			type: "Sales",
			status: "Completed",
			date: "2024-03-12",
		},
		{
			id: 5,
			name: "Product Usage Metrics",
			type: "Product",
			status: "In Progress",
			date: "2024-03-11",
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "green";
			case "In Progress":
				return "blue";
			case "Pending":
				return "yellow";
			default:
				return "gray";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<Title>Reports</Title>
				<Text>View and manage your reports</Text>
			</div>

			<Card>
				<div className="border-2 border-gray-100 rounded-lg p-6 mb-6">
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{reportTypes.map((type) => (
								<button
									key={type.id}
									onClick={() => setSelectedType(type.id)}
									className={`p-4 rounded-lg border-2 text-left transition-all ${
										selectedType === type.id
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="flex items-start space-x-3">
										<div
											className={`mt-1 ${
												selectedType === type.id
													? "text-blue-500"
													: "text-gray-500"
											}`}
										>
											{type.icon}
										</div>
										<div>
											<div className="font-medium mb-1">
												{type.name}
											</div>
											<div className="text-sm text-gray-500">
												{type.description}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>

						<div className="flex justify-end">
							<Button
								size="lg"
								disabled={!selectedType}
								onClick={handleCreateReport}
							>
								Create report
							</Button>
						</div>
						<div className="space-y-6"></div>
					</div>
				</div>

				<div className="mt-6">
					<Table>
						<TableHead>
							<TableRow>
								<TableHeaderCell>Report Name</TableHeaderCell>
								<TableHeaderCell>Type</TableHeaderCell>
								<TableHeaderCell>Status</TableHeaderCell>
								<TableHeaderCell>Date</TableHeaderCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{reports.map((report) => (
								<TableRow key={report.id}>
									<TableCell>{report.name}</TableCell>
									<TableCell>{report.type}</TableCell>
									<TableCell>
										<Badge
											color={getStatusColor(
												report.status
											)}
										>
											{report.status}
										</Badge>
									</TableCell>
									<TableCell>{report.date}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
};

export default Reports;
