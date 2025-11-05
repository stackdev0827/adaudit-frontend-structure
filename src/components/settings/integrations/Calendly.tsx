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
	// Switch,
} from "@tremor/react";
import { Loader2 } from "lucide-react";
import { integrationApi } from "../../../services/api";
import { useSearchParams } from "react-router-dom";
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

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

interface StringField {
	String: string;
	Valid: boolean;
}

interface CustomQuestion {
	type: string;
	position: number;
	question: string;
	required: boolean;
}

interface CustomQuestionsField {
	RawMessage: CustomQuestion[];
	Valid: boolean;
}

interface EventType {
	id: number;
	client_id: number;
	calendly_uri: string;
	name: string;
	slug: string;
	is_active: boolean;
	duration: number;
	color: StringField;
	description: StringField;
	internal_note: StringField;
	location_type: StringField;
	location_details: StringField;
	custom_questions: CustomQuestionsField;
	created_at: string; // ISO date string
	updated_at: string; // ISO date string
}

const Calendly: React.FC = () => {
	const [selectedAccount, setSelectedAccount] = useState("all");
	const [addingAccount, setAddingAccount] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [newAccount, setNewAccount] = useState<{ name: string; key: string }>(
		{
			name: "",
			key: "",
		}
	);
	const [eventTypes, setEventTypes] = useState<EventType[]>([]);
	const [selectedEventTypes, setSelectedEventTypes] = useState<number[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [syncLoading, setSyncLoading] = useState(false);
	const [disconnectLoading, setDisconnectLoading] = useState(false);
	// const [saveLoading, setSaveLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [search, setSearch] = useState("");
	// const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	}>({ key: "", direction: "desc" });

	// Get account_id from URL parameters
	const accountId = searchParams.get("account_id");

	const setWebHookEventTypes = (event_types: any) => {
		// console.log(event_types);
		event_types?.map((event_type: any) => {
			if (event_type.webhook_enabled) {
				// console.log(event_type.id);
				setSelectedEventTypes((prev: any) => [...prev, event_type.id]);
			}
		});
	};

	const fetchAccounts = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		// setLoading(true);
		try {
			const response = await integrationApi.getAccounts(
				"3",
				page,
				page_size
			);
			console.log(response.data.data);
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
		try {
			const response = await integrationApi.getEventTypes(
				page,
				page_size,
				selectedAccount === "all" || selectedAccount === ""
					? "all"
					: selectedAccount,
				searchQuery,
				sortConfig
			);
			setEventTypes(
				response.data.event_types == null
					? []
					: response.data.event_types
			);
			setWebHookEventTypes(response.data.event_types);
			setPagination({
				current_page: page,
				total_pages: Math.max(
					1,
					Math.ceil(
						(response.data.totalCount || 0) / (page_size || 10)
					)
				),
				total_count: response.data.total_count,
				page_size: page_size,
			});
		} catch (error) {
			console.error("Error fetching Calendly event types:", error);
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		setIsLoading(true);
		fetchForms();
	}, [accountId, searchQuery, sortConfig, selectedAccount]);

	React.useEffect(() => {
		fetchAccounts();
	}, []);

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

	const syncEventTypes = async () => {
		console.log(selectedAccount);

		try {
			setSyncLoading(true);
			// console.log(accountId);
			await integrationApi.syncEventTypes(selectedAccount);
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
			// console.log(accountId);
			await integrationApi.disconnectCalendly(selectedAccount);
			// console.log(result.data);
			await fetchAccounts();
			setSelectedAccount("all");
			fetchForms(1);
		} catch (error) {
			console.log(error);
		} finally {
			setDisconnectLoading(false);
		}
	};

	const handleCheckboxChange = async (formId: number) => {
		console.log("Switch clicked for form:", formId);
		console.log("Current selectedForms:", selectedEventTypes);

		const isCurrentlyChecked = selectedEventTypes.includes(formId);
		const newCheckedStatus = !isCurrentlyChecked;

		console.log("New status will be:", newCheckedStatus);
		// Update local state
		if (newCheckedStatus) {
			setSelectedEventTypes((prev) => [...prev, formId]);
		} else {
			setSelectedEventTypes((prev) => prev.filter((id) => id !== formId));
		}

		// Send to API
		try {
			await integrationApi.updateCalendlySelection({
				form_id: formId,
				checked: newCheckedStatus,
			});
		} catch (error) {
			console.error("Failed to update form selection:", error);
			// Revert local state on error
			if (newCheckedStatus) {
				setSelectedEventTypes((prev) =>
					prev.filter((id) => id !== formId)
				);
			} else {
				setSelectedEventTypes((prev) => [...prev, formId]);
			}
		}
	};

	// const updateEventTypes = async () => {
	// 	try {
	// 		setSaveLoading(true);
	// 		// console.log(selectedEventTypes);
	// 		await integrationApi.updateCalendlyEventTypes(selectedEventTypes);
	// 		// console.log(result.data);
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		setSaveLoading(false);
	// 	}
	// };

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

	const handleAccountSelect = (value: string) => {
		setSelectedAccount(value);
		console.log(value);
	};

	const handleAddAccount = async () => {
		setAddingAccount(true);
		try {
			const response = await integrationApi.getCalendlyAuthUrl(
				newAccount.name
			);
			console.log(response.data.oauth_url);
			window.open(
				response.data.oauth_url,
				"_blank",
				"width=800,height=600"
			);
		} catch (error) {
			console.error("Error getting Calendly auth URL:", error);
		} finally {
			setAddingAccount(false);
		}
		return;
	};

	return (
		<div>
			<div className="  items-center">
				<div className="flex items-center gap-4"></div>
				<div className="flex justify-start items-center text-center ">
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
				<Title>Calendly Event Types</Title>
			</div>
			<Card>
				<div className="flex justify-between">
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
								onClick={() => syncEventTypes()}
								disabled={syncLoading}
							>
								{syncLoading ? (
									<div className="flex items-center">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Syncing...
									</div>
								) : (
									"Sync Event Types"
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
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center gap-2">
									Title
									{sortConfig?.key === "name"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-32 cursor-pointer"
								onClick={() => handleSort("slug")}
							>
								<div className="flex items-center gap-2">
									Slug
									{sortConfig?.key === "slug"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-32 cursor-pointer"
								onClick={() => handleSort("active")}
							>
								<div className="flex items-center gap-2">
									Status
									{sortConfig?.key === "active"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-40 cursor-pointer"
								onClick={() => handleSort("time")}
							>
								<div className="flex items-center gap-2">
									Last Updated
									{sortConfig?.key === "time"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							{/* <TableHeaderCell className="w-32">
								Actions
							</TableHeaderCell> */}
						</TableRow>
					</TableHead>
					<TableBody>
						{eventTypes.map((event_type) => (
							<TableRow key={event_type.id}>
								<TableCell className="w-16 text-black">
									<div className="flex items-center gap-3">
										<label
											className="inline-flex items-center cursor-pointer"
											title="Toggle webhook status"
										>
											<input
												type="checkbox"
												className="sr-only"
												checked={selectedEventTypes.includes(
													event_type.id
												)}
												onChange={() =>
													handleCheckboxChange(
														event_type.id
													)
												}
											/>
											{/* visual switch */}
											<span
												className={`w-10 h-6 inline-block rounded-full transition-colors ${
													selectedEventTypes.includes(
														event_type.id
													)
														? "bg-green-500"
														: "bg-gray-300"
												}`}
											>
												<span
													className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
														selectedEventTypes.includes(
															event_type.id
														)
															? "translate-x-4"
															: "translate-x-0"
													} mt-1 ml-1`}
												/>
											</span>
										</label>
										<span className="text-xs text-gray-600">
											{selectedEventTypes.includes(
												event_type.id
											)
												? "On"
												: "Off"}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-80 text-black">
									<div className="flex flex-col">
										<span className="font-medium">
											{event_type.name}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-32 text-black">
									<Badge color="blue">
										{event_type.slug}
									</Badge>
								</TableCell>
								<TableCell className="w-32 text-black">
									<div className="flex flex-col gap-1">
										<Badge
											color={
												event_type.is_active
													? "green"
													: "yellow"
											}
										>
											{event_type.is_active
												? "Active"
												: "Inactive"}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="w-40 text-black">
									<div className="flex flex-col">
										{/* <span>
											{new Date(
												event_type.updated_at
											).toLocaleDateString()}
										</span>
										<span className="text-xs text-gray-500">
											{new Date(
												event_type.updated_at
											).toLocaleTimeString()}
										</span> */}
										<span>
											{formatDateWithUserPreferences(
												event_type.updated_at
											)}
										</span>
									</div>
								</TableCell>
								{/* <TableCell className="w-32">
									<div className="flex flex-col gap-1">
										<a
											href={event_type.calendly_uri}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-500 hover:text-blue-700 text-sm cursor"
										>
											View Event Type
										</a>
									</div>
								</TableCell> */}
							</TableRow>
						))}
					</TableBody>
				</Table>
				{renderPagination()}
			</Card>
			{isLoading ? (
				<LoadingSpinner fullScreen text="Loading..." size="lg" />
			) : null}
			{/* <Dialog
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
				static={true}
			>
				<DialogPanel>
					<div className="space-y-4">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Add New Account
						</h3>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Account Name
							</label>
							<TextInput
								placeholder="Enter account name"
								value={newAccount.name}
								onChange={(e) =>
									setNewAccount({
										...newAccount,
										name: e.target.value,
									})
								}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									setShowAddModal(false);
									setNewAccount({ name: "", key: "" });
								}}
								disabled={addingAccount}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleAddAccount}
								disabled={!newAccount.name || addingAccount}
								loading={addingAccount}
							>
								Add
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog> */}
		</div>
	);
};

export default Calendly;
