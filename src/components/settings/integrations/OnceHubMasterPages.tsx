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
import { integrationApi } from "../../../services/api";
// import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

interface MasterPage {
	id: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	label: string;
	name: string;
	page_id: string;
	page_url: string;
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

const OnceHubMasterPages: React.FC = () => {
	const [selectedAccount, setSelectedAccount] = useState("all");
	const [addingAccount, setAddingAccount] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newAccount, setNewAccount] = useState<{ name: string; key: string }>(
		{
			name: "",
			key: "",
		}
	);
	const [masterPages, setMasterPages] = useState<MasterPage[]>([]);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [selectedMasterPages, setSelectedMasterPages] = useState<string[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const [syncLoading, setSyncLoading] = useState(false);
	const [disconnectLoading, setDisconnectLoading] = useState(false);
	// const [saveLoading, setSaveLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	}>({ key: "", direction: "desc" });
	// const navigate = useNavigate();

	const setWebHookMasterPages = (pages: any) => {
		// console.log(pages);
		pages.map((page: any) => {
			if (page.webhook_enabled) {
				// console.log(page.page_id);
				setSelectedMasterPages((prev) => [...prev, page.id.toString()]);
			}
		});
	};

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
				"1",
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

	const fetchMasterPages = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		try {
			const response = await integrationApi.getMasterPages(
				page,
				page_size,
				selectedAccount === "all" || selectedAccount === ""
					? "all"
					: selectedAccount,
				searchQuery,
				sortConfig
			);
			setMasterPages(response.data.pages);
			setPagination({
				current_page: response.data.page,
				total_pages: response.data.total_pages,
				total_count: response.data.total_count,
				page_size: response.data.page_size,
			});
			setWebHookMasterPages(response.data.pages);
		} catch (error) {
			console.error("Error fetching master pages:", error);
		}
	};

	React.useEffect(() => {
		let ignore = false;

		const loadData = async () => {
			setIsLoading(true);
			try {
				const response = await integrationApi.getMasterPages(
					1,
					pagination.page_size,
					selectedAccount === "all" || selectedAccount === ""
						? "all"
						: selectedAccount,
					searchQuery,
					sortConfig
				);
				if (!ignore) {
					setMasterPages(response.data.pages);
					setPagination({
						current_page: response.data.page,
						total_pages: response.data.total_pages,
						total_count: response.data.total_count,
						page_size: response.data.page_size,
					});
					setWebHookMasterPages(response.data.pages);
				}
			} catch (error) {
				if (!ignore) {
					console.error("Error fetching master pages:", error);
				}
			} finally {
				setIsLoading(false);
			}
		};

		loadData();

		return () => {
			ignore = true;
		};
	}, [searchQuery, sortConfig, selectedAccount]);

	React.useEffect(() => {
		fetchAccounts();
	}, []);

	const handlePageChange = (newPage: number) => {
		fetchMasterPages(newPage);
	};

	const handlePerPageChange = (value: string) => {
		const newPerPage = parseInt(value);
		fetchMasterPages(1, newPerPage);
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

	const syncMasterPages = async () => {
		try {
			setSyncLoading(true);
			await integrationApi.syncOnceHubPages(selectedAccount);
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
			await integrationApi.disconnectOnceHub(selectedAccount);

			await fetchAccounts();
			setSelectedAccount("all");
			fetchMasterPages(1);
			// console.log(result.data);
		} catch (error) {
			console.log(error);
		} finally {
			setDisconnectLoading(false);
		}
	};

	const handleCheckboxChange = async (formId: string) => {
		console.log("Switch clicked for form:", formId);
		console.log("Current selectedForms:", selectedMasterPages);

		const isCurrentlyChecked = selectedMasterPages.includes(formId);
		const newCheckedStatus = !isCurrentlyChecked;

		console.log("New status will be:", newCheckedStatus);
		// Update local state
		if (newCheckedStatus) {
			setSelectedMasterPages((prev) => [...prev, formId]);
		} else {
			setSelectedMasterPages((prev) =>
				prev.filter((id) => id !== formId)
			);
		}

		// Send to API
		try {
			await integrationApi.updateOncehubSelection({
				form_id: Number(formId),
				checked: newCheckedStatus,
			});
		} catch (error) {
			console.error("Failed to update form selection:", error);
			// Revert local state on error
			if (newCheckedStatus) {
				setSelectedMasterPages((prev) =>
					prev.filter((id) => id !== formId)
				);
			} else {
				setSelectedMasterPages((prev) => [...prev, formId]);
			}
		}
	};

	// const updateMasterPages = async () => {
	// 	try {
	// 		setSaveLoading(true);
	// 		// console.log(selectedMasterPages);
	// 		await integrationApi.updateOncehubMasterPages(selectedMasterPages);
	// 		// console.log(result.data);
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		setSaveLoading(false);
	// 	}
	// };

	const handleAccountSelect = (value: string) => {
		setSelectedAccount(value);
		console.log(value);
	};

	const handleAddAccount = async () => {
		setAddingAccount(true);
		try {
			const response = await integrationApi.connectOnceHub(
				newAccount.name,
				newAccount.key
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
				<Title>About Master Page</Title>
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
							onClick={() => setShowAddModal(true)}
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
								onClick={() => syncMasterPages()}
								disabled={syncLoading}
							>
								{syncLoading ? (
									<div className="flex items-center">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Syncing...
									</div>
								) : (
									"Sync Master Pages"
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
								onClick={() => handleSort("label")}
							>
								<div className="flex items-center gap-2">
									Label
									{sortConfig?.key === "label"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-80 cursor-pointer"
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center gap-2">
									Name
									{sortConfig?.key === "name"
										? sortConfig.direction === "asc"
											? "↑"
											: "↓"
										: "↓"}
								</div>
							</TableHeaderCell>
							<TableHeaderCell
								className="w-32 cursor-pointer"
								onClick={() => handleSort("page_id")}
							>
								<div className="flex items-center gap-2">
									Page ID
									{sortConfig?.key === "page_id"
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
								onClick={() => handleSort("created_at")}
							>
								<div className="flex items-center gap-2">
									Created At
									{sortConfig?.key === "created_at"
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
						{masterPages.map((page) => (
							<TableRow key={page.id}>
								<TableCell className="w-16 text-black">
									<div className="flex items-center gap-3">
										<label
											className="inline-flex items-center cursor-pointer"
											title="Toggle webhook status"
										>
											<input
												type="checkbox"
												className="sr-only"
												checked={selectedMasterPages.includes(
													page.id.toString()
												)}
												onChange={() =>
													handleCheckboxChange(
														page.id.toString()
													)
												}
											/>
											<span
												className={`w-10 h-6 inline-block rounded-full transition-colors ${
													selectedMasterPages.includes(
														page.id.toString()
													)
														? "bg-green-500"
														: "bg-gray-300"
												}`}
											>
												<span
													className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
														selectedMasterPages.includes(
															page.id.toString()
														)
															? "translate-x-4"
															: "translate-x-0"
													} mt-1 ml-1`}
												/>
											</span>
										</label>
										<span className="text-xs text-gray-600">
											{selectedMasterPages.includes(
												page.id.toString()
											)
												? "On"
												: "Off"}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-80 text-black">
									<div className="flex flex-col">
										<span className="font-medium">
											{page.label}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-80 text-black">
									<div className="flex flex-col">
										<span className="font-medium">
											{page.name}
										</span>
										<span className="text-xs text-gray-500">
											ID: {page.page_id}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-32 text-black">
									{page.page_id}
								</TableCell>
								<TableCell className="w-32 text-black">
									<Badge
										color={page.is_active ? "green" : "red"}
									>
										{page.is_active ? "Active" : "Inactive"}
									</Badge>
								</TableCell>
								<TableCell className="w-40 text-black">
									{formatDateWithUserPreferences(
										page.created_at
									)}
								</TableCell>
								{/* <TableCell className="w-32">
									<Button
										size="xs"
										variant="secondary"
										onClick={() =>
											window.open(page.page_url, "_blank")
										}
									>
										View
									</Button>
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
			<Dialog
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
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								API Token
							</label>
							<TextInput
								placeholder="Enter API token"
								value={newAccount.key}
								onChange={(e) =>
									setNewAccount({
										...newAccount,
										key: e.target.value,
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
								disabled={
									!newAccount.name ||
									!newAccount.key ||
									addingAccount
								}
								loading={addingAccount}
							>
								Add
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		</div>
	);
};

export default OnceHubMasterPages;
