import React, { useState } from "react";
import {
	Card,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Badge,
	Button,
	Select,
	SelectItem,
	Title,
	TextInput,
	Dialog,
	DialogPanel,
	// Switch,
} from "@tremor/react";
import { Loader2 } from "lucide-react";
import { integrationApi } from "../../../services/api";
// import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { formatDateWithUserPreferences } from "../../../utils/dateFormatter";

interface Account {
	id: number;
	account_name: string;
	email?: string;
	status: string;
	created_at: string;
	account_id: string;
	is_active: boolean;
	integration_date: string;
}

interface TypeformForm {
	id: string;
	form_id: string;
	form_name: string;
	form_type: string;
	is_public: boolean;
	is_trial: boolean;
	last_updated_at: string;
	self_href: string;
	theme_href: string;
	webhook_id: string;
	webhook_enabled: boolean;
	form_owner_account_name: string;
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

interface Outcome {
	id: number;
	type: string;
	title: string;
	url: string;
	qualification_rule?: number;
}

const TypeformForms: React.FC = () => {
	const [ruleStatus, setRuleStatus] = useState(false);
	const [outcomes, setOutcomes] = useState<Outcome[]>([]);
	const [selectedAccount, setSelectedAccount] = useState("all");
	const [addingAccount, setAddingAccount] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [forms, setForms] = React.useState<TypeformForm[]>([]);
	const [selectedForms, setSelectedForms] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [syncLoading, setSyncLoading] = useState(false);
	const [disconnectLoading, setDisconnectLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	}>({ key: "", direction: "desc" });
	// const navigate = useNavigate();
	const [copiedOutcomeId, setCopiedOutcomeId] = useState<number | null>(null);
	const [fetchingOutcomes, setFetchingOutcomes] = useState<string | null>(
		null
	);

	const handleSort = (key: string) => {
		console.log(key, sortConfig);
		let direction: "asc" | "desc" = "desc";
		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		} else {
			direction = "asc";
		}
		setSortConfig({ key, direction });
	};

	const fetchAccounts = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		// setLoading(true);
		try {
			const response = await integrationApi.getAccounts(
				"2",
				page,
				page_size
			);
			setAccounts(response.data.data || []);
			setPagination({
				current_page: response.data.page || 1,
				total_pages: response.data.total_pages || 1,
				total_count: response.data.total_count || 0,
				page_size: response.data.page_size || 10,
			});
		} catch (error) {
			console.error("Error fetching accounts:", error);
			setAccounts([]);
		} finally {
			// setLoading(false);
		}
	};

	const fetchForms = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		setLoading(true);
		try {
			const response = await integrationApi.getTypeformForms(
				page,
				page_size,
				selectedAccount,
				searchQuery,
				sortConfig
			);
			setForms(response.data.forms || []);
			setPagination({
				current_page: response.data.page,
				total_pages: response.data.total_pages,
				total_count: response.data.total_count,
				page_size: response.data.page_size,
			});
			// Update selected forms based on webhook_id
			const selectedIds = response.data.forms
				.filter((form: TypeformForm) => form.webhook_enabled)
				.map((form: TypeformForm) => form.id);
			console.log(selectedIds);
			setSelectedForms((_) => {
				const newSelected: string[] = [];
				selectedIds.forEach((id: string) => {
					if (!newSelected.includes(id)) {
						newSelected.push(id);
					}
				});
				return newSelected;
			});
		} catch (error) {
			console.error("Error fetching Typeform forms:", error);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchForms();
	}, [searchQuery, sortConfig, selectedAccount]);

	React.useEffect(() => {
		fetchAccounts();
	}, []);

	const handleCheckboxChange = async (formId: string) => {
		console.log("Switch clicked for form:", formId);
		console.log("Current selectedForms:", selectedForms);

		const isCurrentlyChecked = selectedForms.includes(formId);
		const newCheckedStatus = !isCurrentlyChecked;

		console.log("New status will be:", newCheckedStatus);
		// Update local state
		if (newCheckedStatus) {
			setSelectedForms((prev) => [...prev, formId]);
		} else {
			setSelectedForms((prev) => prev.filter((id) => id !== formId));
		}

		// Send to API
		try {
			await integrationApi.updateTypeformSelection({
				form_id: formId,
				checked: newCheckedStatus,
			});
		} catch (error) {
			console.error("Failed to update form selection:", error);
			// Revert local state on error
			if (newCheckedStatus) {
				setSelectedForms((prev) => prev.filter((id) => id !== formId));
			} else {
				setSelectedForms((prev) => [...prev, formId]);
			}
		}
	};

	// const handleCreateAllWebhooks = async () => {
	// 	try {
	// 		// Get form IDs from current page that are not selected
	// 		const notSelectedFormIds = forms
	// 			.filter((form) => !selectedForms.includes(form.form_id))
	// 			.map((form) => form.form_id);

	// 		if (notSelectedFormIds.length === 0) {
	// 			return; // No forms to create webhooks for
	// 		}

	// 		const response = await integrationApi.createAllTypeformWebhooks(
	// 			notSelectedFormIds
	// 		);
	// 		const createdFormIds = response.data.created_webhooks;
	// 		// Add newly created webhook form IDs to selected forms
	// 		setSelectedForms((prev) => [...new Set([...prev, ...createdFormIds])]);
	// 	} catch (error) {
	// 		console.error("Error creating webhooks:", error);
	// 	}
	// };

	// const handleDeleteAllWebhooks = async () => {
	// 	try {
	// 		// Get form IDs from current page that are selected
	// 		const selectedFormIdsOnPage = forms
	// 			.filter((form) => selectedForms.includes(form.form_id))
	// 			.map((form) => form.form_id);

	// 		if (selectedFormIdsOnPage.length === 0) {
	// 			return; // No forms to delete webhooks for
	// 		}

	// 		const response = await integrationApi.deleteAllTypeformWebhooks(
	// 			selectedFormIdsOnPage
	// 		);
	// 		const deletedFormIds = response.data.deleted_webhooks;
	// 		// Remove deleted webhook form IDs from selected forms
	// 		setSelectedForms((prev) =>
	// 			prev.filter((id) => !deletedFormIds.includes(id))
	// 		);
	// 	} catch (error) {
	// 		console.error("Error deleting webhooks:", error);
	// 	}
	// };

	const handlePageChange = (newPage: number) => {
		fetchForms(newPage);
	};

	const handlePerPageChange = (value: string) => {
		const newPerPage = parseInt(value);
		fetchForms(1, newPerPage);
	};

	const renderPagination = () => {
		const renderPageNumbers = () => {
			const pages = [];
			const totalPages = pagination.total_pages;
			const currentPage = pagination.current_page;

			// Always show first page
			pages.push(
				<Button
					key={1}
					size="xs"
					variant={currentPage === 1 ? "primary" : "secondary"}
					onClick={() => handlePageChange(1)}
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
						onClick={() => handlePageChange(i)}
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
						onClick={() => handlePageChange(totalPages)}
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
					<Select
						value={pagination.page_size.toString()}
						onValueChange={handlePerPageChange}
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
					<div className="flex items-center gap-1">
						{renderPageNumbers()}
					</div>
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
				<div className="text-sm text-gray-600">
					Showing{" "}
					{(pagination.current_page - 1) * pagination.page_size + 1}{" "}
					to{" "}
					{Math.min(
						pagination.current_page * pagination.page_size,
						pagination.total_count
					)}{" "}
					of {pagination.total_count} items
				</div>
			</div>
		);
	};

	const syncForms = async () => {
		try {
			setSyncLoading(true);

			await integrationApi.syncTypeformForms(selectedAccount);
			// console.log(result.data);
		} catch (error) {
			console.log(error);
		} finally {
			setSyncLoading(false);
		}
	};

	const disconnectAccount = async () => {
		try {
			setDisconnectLoading(true);

			await integrationApi.disconnectTypeformForms(selectedAccount);

			// Refresh data after disconnecting
			await fetchAccounts();
			setSelectedAccount("all");
			fetchForms(1);
		} catch (error) {
			console.log(error);
		} finally {
			setDisconnectLoading(false);
		}
	};

	const handleAccountSelect = (value: string) => {
		setSelectedAccount(value);
		console.log(value);
	};

	const handleAddAccount = async () => {
		setAddingAccount(true);
		try {
			const response = await integrationApi.getTypeformAuthUrl();
			console.log(response.data.auth_url);
			window.open(
				response.data.auth_url,
				"_blank",
				"width=800,height=600"
			);
		} catch (error) {
			console.error("Error getting Typeform auth URL:", error);
		} finally {
			setAddingAccount(false);
		}
		return;
	};

	const fetchOutcomes = async (form_id: string, account_name: string) => {
		setFetchingOutcomes(form_id);
		try {
			const response = await integrationApi.fetchTypeformEndings(
				form_id,
				account_name
			);
			setRuleStatus(true);
			setOutcomes(response.data);
			console.log(response.data);
		} catch (error) {
			console.log(error);
		} finally {
			setFetchingOutcomes(null);
		}
	};

	const resetRule = async () => {
		console.log("--------");
		setRuleStatus(false);
	};

	const handleCopyOutcome = async (title: string, outcomeId: number) => {
		await navigator.clipboard.writeText(title);
		setCopiedOutcomeId(outcomeId);
		setTimeout(() => setCopiedOutcomeId(null), 2000);
	};

	const handleQualifiedChange = async (outcomeId: number, value: string) => {
		console.log(outcomeId, value);

		try {
			// const requestValue = value === "1" ? 1 : value === "0" ? 0 : -1;
			// await integrationApi.setQualificationRuleOnEnding(
			// 	outcomeId,
			// 	requestValue
			// );
			setOutcomes((prev) =>
				prev.map((outcome) =>
					outcome.id === outcomeId
						? { ...outcome, qualification_rule: parseInt(value) }
						: outcome
				)
			);
		} catch (error) {
			console.log(error);
		}
	};

	const handleSetRule = async () => {
		try {
			const data = outcomes.map((outcome) => ({
				ending_id: outcome.id,
				qualified: outcome.qualification_rule || parseInt("100"),
			}));
			await integrationApi.setQualificationRuleOnEnding(data);
			setRuleStatus(false);
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<div>
			<div className="  items-center">
				<div className="flex items-center gap-4"></div>
				<div className="flex justify-start items-center text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-4 h-4 text-center text-blue-500 cursor-pointer"
						onClick={() => window.history.back()}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					<span
						className="text-center text-blue-500 text-sm cursor-pointer"
						onClick={() => window.history.back()}
					>
						Back to Page
					</span>
				</div>
				<Title>About TypeForm</Title>
			</div>
			<Card>
				<div className="mb-6 flex justify-between items-center">
					<div className="flex justify-start">
						<Select
							defaultValue="all"
							value={selectedAccount}
							onValueChange={handleAccountSelect}
							className="w-56 mr-2"
						>
							<SelectItem value="all" className="cursor-pointer">
								All Profile
							</SelectItem>
							{accounts.map((a) => (
								<SelectItem
									key={a.id}
									value={String(a.account_name)}
									className="cursor-pointer"
								>
									{a.account_name ??
										a.account_id ??
										`Account ${a.id}`}
								</SelectItem>
							))}
						</Select>
						<Button
							size="xs"
							variant="primary"
							onClick={() => handleAddAccount()}
							loading={addingAccount}
						>
							Add Account
						</Button>
						<TextInput
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setSearchQuery(search);
								}
							}}
							placeholder="Search Events..."
							className="w-[400px] ml-4"
						/>
						<Button
							size="sm"
							variant="secondary"
							icon={() => (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-4 h-4"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
									/>
								</svg>
							)}
							onClick={() => setSearchQuery(search)}
							className="ml-2 mr-2"
						/>
					</div>
					{selectedAccount === "all" ? null : (
						<div className=" flex justify-end items-center gap-2">
							<Button
								size="xs"
								variant="secondary"
								onClick={() => syncForms()}
								disabled={syncLoading}
							>
								{syncLoading ? (
									<div className="flex items-center">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Syncing...
									</div>
								) : (
									"Sync Forms"
								)}
							</Button>
							<Button
								size="xs"
								variant="secondary"
								onClick={() => disconnectAccount()}
								disabled={disconnectLoading}
							>
								{disconnectLoading ? (
									<div className="flex items-center">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										disconnecting...
									</div>
								) : (
									"Disconnect"
								)}
							</Button>
						</div>
					)}
				</div>

				<Table>
					<TableHead>
						<TableRow>
							<TableHeaderCell className="w-16"></TableHeaderCell>
							<TableHeaderCell
								className="w-80 cursor-pointer"
								onClick={() => handleSort("form_name")}
							>
								<div className="flex items-center gap-2">
									Title
									{sortConfig?.key === "form_name"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-56 cursor-pointer"
								onClick={() => handleSort("form_type")}
							>
								<div className="flex items-center gap-2">
									Type
									{sortConfig?.key === "form_type"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-56 cursor-pointer"
								onClick={() => handleSort("is_public")}
							>
								<div className="flex items-center gap-2">
									Status
									{sortConfig?.key === "is_public"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-16 cursor-pointer"
								onClick={() => handleSort("last_updated_at")}
							>
								<div className="flex items-center gap-2">
									Last Updated
									{sortConfig?.key === "last_updated_at"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell className="w-8 items-right">
								Actions
							</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{forms.map((form) => (
							<TableRow key={form.form_id}>
								<TableCell className="w-16 text-black">
									<div className="flex items-center gap-3">
										<label
											className="inline-flex items-center cursor-pointer"
											title="Toggle webhook status"
										>
											<input
												type="checkbox"
												className="sr-only"
												checked={selectedForms.includes(
													form.id
												)}
												onChange={() =>
													handleCheckboxChange(
														form.id
													)
												}
											/>
											{/* visual switch */}
											<span
												className={`w-10 h-6 inline-block rounded-full transition-colors ${
													selectedForms.includes(
														form.id
													)
														? "bg-green-500"
														: "bg-gray-300"
												}`}
											>
												<span
													className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
														selectedForms.includes(
															form.id
														)
															? "translate-x-4"
															: "translate-x-0"
													} mt-1 ml-1`}
												/>
											</span>
										</label>
										<span className="text-xs text-gray-600">
											{selectedForms.includes(form.id)
												? "On"
												: "Off"}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-80 text-black">
									<div className="flex flex-col">
										<span className="font-medium">
											{form.form_name}
										</span>
										<span className="text-xs text-gray-500">
											ID: {form.form_id}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-56 text-black">
									<Badge color="blue">
										{form.form_type || "Standard"}
									</Badge>
								</TableCell>
								<TableCell className="w-56 text-black">
									<div className="flex flex-col gap-1">
										<Badge
											color={
												form.is_public
													? "green"
													: "yellow"
											}
										>
											{form.is_public
												? "Public"
												: "Private"}
										</Badge>
										{form.is_trial && (
											<Badge color="orange">Trial</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="w-16 text-black">
									{/* <div className="flex flex-col">
										<span>
											{new Date(
												form.last_updated_at
											).toLocaleDateString()}
										</span>
										<span className="text-xs text-gray-500">
											{new Date(
												form.last_updated_at
											).toLocaleTimeString()}
										</span>
									</div> */}
									{formatDateWithUserPreferences(
										form.last_updated_at
									)}
								</TableCell>
								<TableCell className="w-[100px] text-black">
									{form.webhook_enabled ? (
										<Button
											variant="secondary"
											onClick={() => {
												fetchOutcomes(
													form.form_id,
													form.form_owner_account_name
												);
											}}
											loading={
												fetchingOutcomes ===
												form.form_id
											}
											disabled={
												fetchingOutcomes ===
												form.form_id
											}
											className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
										>
											Set Qualification
										</Button>
									) : null}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{renderPagination()}
			</Card>
			{loading ? (
				<LoadingSpinner fullScreen text="Loading..." size="lg" />
			) : null}
			<div>
				<Dialog open={ruleStatus} onClose={resetRule} static={true}>
					<DialogPanel className="max-w-4xl bg-white">
						<div>
							<h3 className="text-lg font-semibold text-gray-900  pl-4">
								Qualification Based on Ending
							</h3>

							<Table className="mt-8">
								<TableHead>
									<TableRow>
										<TableHeaderCell>Type</TableHeaderCell>
										<TableHeaderCell>Title</TableHeaderCell>
										<TableHeaderCell>
											Action
										</TableHeaderCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{outcomes.map((item: Outcome) => (
										<TableRow key={item.id}>
											<TableCell className="text-black">
												{item.type}
											</TableCell>
											<TableCell
												className="text-black"
												title={
													item.title.length > 50
														? item.title
														: ""
												}
											>
												{item.title === "" ? (
													""
												) : (
													<div>
														<div className="flex justify-between items-center">
															<span>
																Title :{" "}
															</span>
															<span>
																{item.title
																	.length > 50
																	? `${item.title.substring(
																			0,
																			50
																	  )}...`
																	: item.title ===
																	  ""
																	? "xxx"
																	: item.title}
															</span>
															<button
																onClick={() =>
																	handleCopyOutcome(
																		item.title,
																		item.id
																	)
																}
																className="p-1 hover:bg-gray-100 rounded"
																title="Copy Title"
															>
																{copiedOutcomeId ===
																item.id ? (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={
																			1.5
																		}
																		stroke="currentColor"
																		className="w-4 h-4 text-green-500"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M4.5 12.75l6 6 9-13.5"
																		/>
																	</svg>
																) : (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={
																			1.5
																		}
																		stroke="currentColor"
																		className="w-4 h-4"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
																		/>
																	</svg>
																)}
															</button>
														</div>
														<div className="flex justify-between items-center">
															<span>URL : </span>
															<span>
																{item.url
																	.length > 50
																	? `${item.url.substring(
																			0,
																			50
																	  )}...`
																	: item.url ===
																	  ""
																	? "xxx"
																	: item.url}
															</span>
															<button
																onClick={() =>
																	handleCopyOutcome(
																		item.url,
																		item.id
																	)
																}
																className="p-1 hover:bg-gray-100 rounded"
																title="Copy URL"
															>
																{copiedOutcomeId ===
																item.id ? (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={
																			1.5
																		}
																		stroke="currentColor"
																		className="w-4 h-4 text-green-500"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M4.5 12.75l6 6 9-13.5"
																		/>
																	</svg>
																) : (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={
																			1.5
																		}
																		stroke="currentColor"
																		className="w-4 h-4"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
																		/>
																	</svg>
																)}
															</button>
														</div>
													</div>
												)}
											</TableCell>
											<TableCell className="text-black">
												<Select
													value={
														item.qualification_rule?.toString() ||
														""
													}
													onValueChange={(value) =>
														handleQualifiedChange(
															item.id,
															value
														)
													}
													placeholder="Pending"
												>
													<SelectItem value="1">
														Qualified
													</SelectItem>
													<SelectItem value="0">
														Unqualified
													</SelectItem>
													{/* <SelectItem value="-1">
														Pending
													</SelectItem> */}
												</Select>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="flex justify-end gap-2 mt-4">
								<Button
									variant="secondary"
									onClick={handleSetRule}
								>
									Set Rule
								</Button>
								<Button variant="secondary" onClick={resetRule}>
									Cancel
								</Button>
							</div>
						</div>
					</DialogPanel>
				</Dialog>
			</div>
		</div>
	);
};

export default TypeformForms;
