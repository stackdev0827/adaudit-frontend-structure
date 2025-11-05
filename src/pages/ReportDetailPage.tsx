import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, TextInput, Textarea } from "@tremor/react";
import { BookOpen, Plus, X } from "lucide-react";
import MetricsTablePage from "./MetricsTablePage";
import { metricsApi } from "../services/api";

const ReportDetailPage: React.FC = () => {
	const { date, report_name: encodedReportName } = useParams<{
		date: string;
		report_name: string;
	}>();
	
	// Decode the report name to handle special characters like forward slashes
	const report_name = encodedReportName ? decodeURIComponent(encodedReportName) : '';

	const [notebook, setNotebook] = useState<{
		id?: string;
		name: string;
		description: string;
		content: string;
		createdAt?: string;
	} | null>(null);
	const [showNotebookDashboard, setShowNotebookDashboard] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newNotebook, setNewNotebook] = useState({
		name: "",
		description: "",
		content: "",
	});

	useEffect(() => {
		loadNotebook();
	}, [date, report_name]);

	const loadNotebook = async () => {
		try {
			// TODO: Replace with actual API call
			const response = await metricsApi.getNotebook({ report_name, date });
			setNotebook(response.data.data?.RawMessage);
		} catch (error) {
			console.error("Error loading notebook:", error);
			setNotebook(null);
		}
	};

	const handleCreateNotebook = async () => {
		if (!newNotebook.name.trim()) return;

		const requestPayload = {
			report_name: report_name,
			report_date: date,
			notebook: {
				name: newNotebook.name,
				description: newNotebook.description,
				content: newNotebook.content,
			},
		};

		// console.log("Creating notebook with request payload:", requestPayload);

		try {
			// TODO: Replace with actual API call
			await metricsApi.saveNote(requestPayload);

			const createdNotebook = {
				id: Date.now().toString(),
				name: newNotebook.name,
				description: newNotebook.description,
				content: newNotebook.content,
				createdAt: new Date().toISOString().split("T")[0],
			};

			setNotebook(createdNotebook);
			console.log("Notebook saved successfully!");
			// alert(
			// 	`Notebook "${createdNotebook.name}" created for report "${report_name}" on ${date}!`
			// );
		} catch (error) {
			console.error("Error saving notebook:", error);
			alert("Failed to save notebook. Please try again.");
		}

		setNewNotebook({ name: "", description: "", content: "" });
		setShowCreateForm(false);
	};

	const handleEditNotebook = () => {
		if (notebook) {
			// Auto-fill existing data in the create form
			setNewNotebook({
				name: notebook.name,
				description: notebook.description,
				content: notebook.content,
			});
			setShowCreateForm(true);
		}
	};

	const handleSaveNotebook = async () => {
		if (!newNotebook.name.trim()) return;

		const requestPayload = {
			report_name: report_name,
			report_date: date,
			notebook: {
				name: newNotebook.name,
				description: newNotebook.description,
				content: newNotebook.content,
			},
		};

		try {
			// TODO: Replace with actual API call
			await metricsApi.saveNote(requestPayload);

			const updatedNotebook = {
				...notebook,
				name: newNotebook.name,
				description: newNotebook.description,
				content: newNotebook.content,
			};

			setNotebook(updatedNotebook);
			console.log("Notebook updated successfully!");
			alert("Notebook updated successfully!");
		} catch (error) {
			console.error("Error updating notebook:", error);
			alert("Failed to update notebook. Please try again.");
		}

		setNewNotebook({ name: "", description: "", content: "" });
		setShowCreateForm(false);
	};

	return (
		<div className="relative">
			{/* Main Content */}
			<div className="space-y-6">
				<MetricsTablePage />
			</div>

			{/* Notebooks Button - Fixed position on right */}
			<button
				onClick={() => setShowNotebookDashboard(true)}
				className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
			>
				<BookOpen className="w-5 h-5" />
			</button>

			{/* Notebook Dashboard Overlay */}
			{showNotebookDashboard && (
				<>
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-50"
						onClick={() => setShowNotebookDashboard(false)}
					/>

					<div
						className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
							showNotebookDashboard ? "translate-x-0" : "translate-x-full"
						}`}
					>
						<div className="p-4 h-full overflow-auto">
							<div className="flex items-center justify-between mb-4 pb-4 border-b">
								<div className="flex items-center gap-2">
									<BookOpen className="w-5 h-5" />
									<h3 className="text-lg font-semibold">Notebook</h3>
								</div>
								<div className="flex gap-2">
									{!notebook && (
										<Button
											size="xs"
											onClick={() => setShowCreateForm(!showCreateForm)}
											icon={Plus}
										>
											New
										</Button>
									)}
									<Button
										size="xs"
										variant="secondary"
										onClick={() => setShowNotebookDashboard(false)}
										icon={X}
									></Button>
								</div>
							</div>

							{/* Create/Edit Form */}
							{showCreateForm && (
								<div className="mb-4 p-3 bg-gray-50 rounded-lg border space-y-3">
									<TextInput
										value={newNotebook.name}
										onChange={(e) =>
											setNewNotebook((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder="Notebook name"
										className="text-sm"
									/>
									<Textarea
										value={newNotebook.description}
										onChange={(e) =>
											setNewNotebook((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="Description"
										rows={2}
										className="text-sm"
									/>
									<Textarea
										value={newNotebook.content}
										onChange={(e) =>
											setNewNotebook((prev) => ({
												...prev,
												content: e.target.value,
											}))
										}
										placeholder="Write your notes here..."
										rows={6}
										className="text-sm"
									/>
									<div className="flex gap-2">
										<Button
											size="xs"
											onClick={
												notebook ? handleSaveNotebook : handleCreateNotebook
											}
										>
											{notebook ? "Save" : "Create"}
										</Button>
										<Button
											size="xs"
											variant="secondary"
											onClick={() => setShowCreateForm(false)}
										>
											Cancel
										</Button>
									</div>
								</div>
							)}

							{/* Notebook Display */}
							{notebook && !showCreateForm ? (
								<div className="space-y-2">
									<div className="p-3 bg-gray-50 rounded-lg border">
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium text-gray-900 text-sm">
												{notebook.name}
											</h4>
											<Button size="xs" onClick={handleEditNotebook}>
												Edit
											</Button>
										</div>
										<p className="text-xs text-gray-600 mt-1">
											{notebook.description}
										</p>
										{notebook.content && (
											<p className="text-xs text-gray-700 mt-2 bg-white p-2 rounded border">
												{notebook.content}
											</p>
										)}
										{/* <p className="text-xs text-gray-400 mt-2">
											{notebook.createdAt}
										</p> */}
									</div>
								</div>
							) : (
								!notebook &&
								!showCreateForm && (
									<p className="text-gray-500 text-center py-4 text-sm">
										No notebook yet
									</p>
								)
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default ReportDetailPage;
