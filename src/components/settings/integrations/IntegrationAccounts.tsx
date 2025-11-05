import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Card,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Button,
	Select,
	SelectItem,
	Title,
	Dialog,
	DialogPanel,
	TextInput,
} from "@tremor/react";
import { integrationApi } from "../../../services/api";
import LoadingSpinner from "../../ui/LoadingSpinner";
import HyrosApiModal from "./HyrosApiModal";
import HyrosTagClassification from "./HyrosTagClassification";
import HyrosDatePickerModal from "./HyrosDatePickerModal";
import HyrosSyncStatusModal from "./HyrosSyncStatusModal";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { triggerSSE } from "../../../slices/toastSlice";
import { formatDateWithUserPreferences } from "../../../utils/dateFormatter";

interface Account {
	id: number;
	account_name: string;
	email?: string;
	status: string;
	created_at: string;
	account_id: string;
	is_active: boolean;
	access_token: string;
	integration_date: string;
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

const integrationsItems = {
	calendly: "3",
	"google-ads": "5",
	hyros: "4",
	"meta-ads": "6",
	oncehub: "1",
	typeform: "2",
};

const IntegrationAccounts: React.FC = () => {
	const { integrationName } = useParams<{ integrationName: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [showAddModal, setShowAddModal] = useState(false);
	const [newAccount, setNewAccount] = useState<{
		email: string;
		password: string;
		name: string;
		key: string;
	}>({
		email: "",
		password: "",
		name: "",
		key: "",
	});
	const [addingAccount, setAddingAccount] = useState(false);
	const needsApiKey =
		integrationName !== "typeform" &&
		integrationName !== "google-ads" &&
		integrationName !== "meta-ads" &&
		integrationName !== "calendly";

	const [moreActionOpenId, setMoreActionOpenId] = useState<number | null>(
		null
	);
	// const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">(
	// 	"up"
	// );
	// const dropdownDirection = "up";
	const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
	const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
	const [isHyrosApiDialogOpen, setIsHyrosApiDialogOpen] = useState(false);
	const [isHyrosTagClassification, setIsHyrosTagClassification] =
		useState(false);
	const [isDateModalOpen, setIsDateModalOpen] = useState(false);
	const [isSyncStatusOpen, setIsSyncStatusOpen] = useState(false);
	const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);

	// Outside click handler for dropdown
	useEffect(() => {
		if (moreActionOpenId === null) return;
		const handleClick = (e: MouseEvent) => {
			const dropdown = dropdownRefs.current[moreActionOpenId];
			const button = buttonRefs.current[moreActionOpenId];
			if (
				dropdown &&
				!dropdown.contains(e.target as Node) &&
				button &&
				!button.contains(e.target as Node)
			) {
				setMoreActionOpenId(null);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [moreActionOpenId]);

	const formatIntegrationName = (name: string) => {
		return name.charAt(0).toUpperCase() + name.slice(1);
	};

	// Helper function to get the appropriate text for View Details button
	const getViewDetailsText = (integrationKey: string) => {
		switch (integrationKey) {
			case "typeform":
				return "Show Forms";
			case "oncehub":
				return "Show Master Pages";
			case "calendly":
				return "Show Event Types";
			case "meta-ads":
				return "Show Meta Ads Accounts";
			case "google-ads":
				return "Show Google Ads Accounts";
			default:
				return "Sync Data";
		}
	};

	const fetchAccounts = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		if (!integrationName) return;

		setLoading(true);
		try {
			// console.log(
			// 	integrationName,
			// 	typeof integrationsItems[
			// 		integrationName as keyof typeof integrationsItems
			// 	]
			// );
			const response = await integrationApi.getAccounts(
				integrationsItems[
					integrationName as keyof typeof integrationsItems
				],
				page,
				page_size
			);
			// console.log(response.data.data);
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
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAccounts();
	}, [integrationName]);

	const handlePageChange = (newPage: number) => {
		fetchAccounts(newPage);
	};

	const handlePerPageChange = (value: string) => {
		const newPerPage = parseInt(value);
		fetchAccounts(1, newPerPage);
	};

	const renderPagination = () => {
		if (pagination.total_pages <= 1) return null;

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
					</Select>
				</div>
				<div className="flex items-center gap-2">
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
					<span className="text-sm text-gray-600">
						Page {pagination.current_page} of{" "}
						{pagination.total_pages}
					</span>
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
				</div>
				<div className="text-sm text-gray-600">
					Showing{" "}
					{(pagination.current_page - 1) * pagination.page_size + 1}{" "}
					to{" "}
					{Math.min(
						pagination.current_page * pagination.page_size,
						pagination.total_count
					)}{" "}
					of {pagination.total_count} accounts
				</div>
			</div>
		);
	};

	const handleAddAccount = async () => {
		if (!integrationName) return;

		// For integrations that don't need API key
		if (integrationName === "calendly") {
			if (!newAccount.name) return;

			setAddingAccount(true);
			try {
				const response = await integrationApi.getCalendlyAuthUrl(
					newAccount.name
				);
				// console.log(response.data);
				window.open(
					response.data.oauth_url,
					"_blank",
					"width=800,height=600"
				);
				setShowAddModal(false);
			} catch (error) {
				console.error("Error getting Calendly auth URL:", error);
			} finally {
				setAddingAccount(false);
			}
			return;
		}

		if (integrationName === "typeform") {
			if (!newAccount.name) return;

			setAddingAccount(true);
			try {
				const response = await integrationApi.getTypeformAuthUrl();

				// Send account name along with auth URL request
				window.open(
					response.data.auth_url,
					"_blank",
					"width=800,height=600"
				);
				setShowAddModal(false);
			} catch (error) {
				console.error("Error getting Typeform auth URL:", error);
			} finally {
				setAddingAccount(false);
			}
			return;
		}

		if (integrationName === "google-ads") {
			if (!newAccount.name) return;

			setAddingAccount(true);
			try {
				const response = await integrationApi.getGoogleAdsAuthUrl(
					newAccount.name
				);
				// console.log(response.data.auth_url);
				window.open(
					response.data.auth_url,
					"_blank",
					"width=800,height=600"
				);
				setShowAddModal(false);
			} catch (error) {
				console.error("Error getting Google Ads auth URL:", error);
			} finally {
				setAddingAccount(false);
			}
			return;
		}

		if (integrationName === "meta-ads") {
			if (!newAccount.name) return;

			setAddingAccount(true);
			try {
				const response = await integrationApi.getMetaAdsAuthUrl(
					newAccount.name
				);
				window.open(
					response.data.auth_url,
					"_blank",
					"width=800,height=600"
				);
				setShowAddModal(false);
			} catch (error) {
				console.error("Error getting Meta Ads auth URL:", error);
			} finally {
				setAddingAccount(false);
			}
			return;
		}

		// For integrations that need API key
		if (
			!newAccount.name ||
			(integrationName === "oncehub" && !newAccount.key)
		)
			return;

		setAddingAccount(true);
		try {
			if (integrationName === "hyros") {
				await integrationApi.updateApiHyros(
					newAccount.email,
					newAccount.password,
					newAccount.key,
					newAccount.name
				);
			} else if (integrationName === "oncehub") {
				await integrationApi.getOncehubAuthUrl(
					integrationsItems[
						integrationName as keyof typeof integrationsItems
					],
					newAccount.key,
					newAccount.name
				);
			} else {
				const integrationId =
					integrationsItems[
						integrationName as keyof typeof integrationsItems
					];
				await integrationApi.addAccount(integrationId, newAccount.key);
			}

			setNewAccount({ email: "", password: "", name: "", key: "" });
			setShowAddModal(false);

			// Refresh accounts list
			await fetchAccounts();
		} catch (error) {
			console.error("Error adding account:", error);
		} finally {
			setAddingAccount(false);
		}
	};

	const handleDeleteAccount = async (id: number) => {
		// require integrationName to be present
		if (!integrationName) return;

		try {
			setLoading(true);

			// Prefer passing the integration id from the map (backend expects integration id + account id)
			const integrationId =
				integrationsItems[
					integrationName as keyof typeof integrationsItems
				];

			// If your integrationApi has a delete method, use it. Fallback to a DELETE fetch.

			await integrationApi.deleteAccount(integrationId, id);

			// refresh list after deletion
			await fetchAccounts(pagination.current_page);
		} catch (error) {
			console.error("Error deleting account:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleShowAdditionalInfo = (name: string, accountId?: string) => {
		// console.log("-----------", accountId, name);
		const baseUrl = `/settings/integrations/${name}`;
		const urlWithAccountId = accountId
			? `${baseUrl}?account_id=${accountId}`
			: baseUrl;

		if (name === "oncehub") {
			navigate(urlWithAccountId);
		} else if (name === "typeform") {
			navigate(urlWithAccountId);
		} else if (name === "hyros") {
			setIsHyrosTagClassification(true);
			// navigate(urlWithAccountId);
		} else if (name === "calendly") {
			navigate(urlWithAccountId);
		} else if (name === "meta-ads") {
			navigate(urlWithAccountId);
		} else if (name === "google-ads") {
			navigate(urlWithAccountId);
		}
	};

	const handleApiSuccess = () => {
		setIsHyrosTagClassification(true);
	};

	const handleHyrosSyncData = async () => {
		setIsDateModalOpen(true);

		const eventSource = new EventSource(
			`${process.env.VITE_SERVER_ADDRESS}/admin/integrations/hyros/events`
		);
		eventSource.onopen = () => {};
		eventSource.onerror = () => {
			setTimeout(() => {
				eventSource.close();
			}, 5000);
		};
		eventSource.addEventListener("hyros_sync_complete", (event) => {
			let result = null;
			try {
				result = JSON.parse(event.data);
			} catch (e) {
				result = { status: "error", message: "Invalid event data" };
			}
			// console.log(result);
			eventSource.close();
		});
	};

	const handleCopyToken = async (token: string, accountId: number) => {
		await navigator.clipboard.writeText(token);
		setCopiedTokenId(accountId);
		setTimeout(() => setCopiedTokenId(null), 2000);
	};

	return (
		<div className="space-y-6">
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
						onClick={() => navigate("/settings/integrations")}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					<span
						className="text-center text-blue-500 text-sm cursor-pointer"
						onClick={() => navigate("/settings/integrations")}
					>
						Back to Integrations
					</span>
				</div>
				<Title>
					{formatIntegrationName(integrationName || "")} Accounts
				</Title>
				{/* <h2 className="text-xl font-semibold">
					{formatIntegrationName(integrationName || "")} Accounts
				</h2> */}
			</div>
			<Card>
				<div className="flex justify-end mb-4">
					<Button
						size="xs"
						variant="primary"
						onClick={() => setShowAddModal(true)}
					>
						Add Account
					</Button>
				</div>

				{loading ? (
					<LoadingSpinner
						fullScreen
						text="Loading accounts..."
						size="lg"
					/>
				) : (
					<>
						<Table>
							<TableHead>
								<TableRow>
									<TableHeaderCell>Name</TableHeaderCell>
									<TableHeaderCell>Email</TableHeaderCell>
									{/* <TableHeaderCell>Email</TableHeaderCell> */}
									<TableHeaderCell>API Key</TableHeaderCell>
									{/* <TableHeaderCell>Status</TableHeaderCell> */}
									<TableHeaderCell>
										Created At
									</TableHeaderCell>
									<TableHeaderCell>Actions</TableHeaderCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{accounts.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center py-8 text-gray-500"
										>
											No accounts found
										</TableCell>
									</TableRow>
								) : (
									accounts.map((account) => (
										<TableRow key={account.id}>
											<TableCell>
												<div className="font-medium text-black">
													{account.account_name}
												</div>
											</TableCell>
											<TableCell className=" text-black">
												{account.email || "-"}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-black">
													<span className="font-mono text-sm">
														{account.access_token
															.length > 20
															? `${account.access_token.substring(
																	0,
																	10
															  )}...${account.access_token.substring(
																	account
																		.access_token
																		.length -
																		10
															  )}`
															: account.access_token}
													</span>
													<button
														onClick={() =>
															handleCopyToken(
																account.access_token,
																account.id
															)
														}
														className="p-1 hover:bg-gray-100 rounded"
														title="Copy API Key"
													>
														{copiedTokenId ===
														account.id ? (
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
																	d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
																/>
															</svg>
														)}
													</button>
												</div>
											</TableCell>

											<TableCell className=" text-black">
												{/* {new Date(
													account.integration_date
												).toLocaleDateString()} */}
												{formatDateWithUserPreferences(
													account.integration_date
												)}
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													{/* <Button size="xs" variant="secondary">
														Edit
													</Button> */}
													<Button
														variant="secondary"
														className=" text-left py-2 hover:bg-gray-100 text-sm"
														onClick={() => {
															// Find the key that matches the current integrationName
															const integrationKey =
																Object.keys(
																	integrationsItems
																).find(
																	(key) =>
																		integrationsItems[
																			key as keyof typeof integrationsItems
																		] ===
																		integrationsItems[
																			integrationName as keyof typeof integrationsItems
																		]
																);
															console.log(
																"Integration key:",
																integrationKey
															);
															console.log(
																"Integration value:",
																integrationsItems[
																	integrationName as keyof typeof integrationsItems
																]
															);
															handleShowAdditionalInfo(
																integrationKey ||
																	"",
																integrationKey ==
																	"meta-ads" ||
																	"google-ads"
																	? Array.isArray(
																			account.account_name
																	  )
																		? account.account_name.join(
																				","
																		  )
																		: account.account_name
																	: Array.isArray(
																			account.account_id
																	  )
																	? account.account_id.join(
																			","
																	  )
																	: account.account_id
															);
														}}
													>
														{(() => {
															const integrationKey =
																Object.keys(
																	integrationsItems
																).find(
																	(key) =>
																		integrationsItems[
																			key as keyof typeof integrationsItems
																		] ===
																		integrationsItems[
																			integrationName as keyof typeof integrationsItems
																		]
																);
															return getViewDetailsText(
																integrationKey ||
																	""
															);
														})()}
													</Button>
													<Button
														size="xs"
														variant="secondary"
														onClick={() =>
															handleDeleteAccount(
																account.id
															)
														}
													>
														Delete
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
						{renderPagination()}
					</>
				)}
			</Card>

			<HyrosApiModal
				open={isHyrosApiDialogOpen}
				onClose={() => setIsHyrosApiDialogOpen(false)}
				onSuccess={handleApiSuccess}
			/>
			<HyrosTagClassification
				open={isHyrosTagClassification}
				onClose={() => setIsHyrosTagClassification(false)}
				onSuccess={() => handleHyrosSyncData()}
			/>
			<HyrosDatePickerModal
				open={isDateModalOpen}
				onClose={() => setIsDateModalOpen(false)}
				onSuccess={() => {
					dispatch(triggerSSE(true));
					// console.log("-------Pick-----------");
				}}
			/>
			<HyrosSyncStatusModal
				open={isSyncStatusOpen}
				onClose={() => setIsSyncStatusOpen(false)}
			/>

			{/* Add Account Modal */}
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
						{!needsApiKey && (
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
						)}
						{needsApiKey && (
							<>
								{integrationName === "hyros" && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Email
										</label>
										<TextInput
											className="mb-4"
											placeholder="Enter email"
											value={newAccount.email}
											onChange={(e) =>
												setNewAccount({
													...newAccount,
													email: e.target.value,
												})
											}
										/>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Password
										</label>
										<TextInput
											placeholder="Enter password"
											value={newAccount.password}
											onChange={(e) =>
												setNewAccount({
													...newAccount,
													password: e.target.value,
												})
											}
										/>
									</div>
								)}
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
								{(integrationName === "oncehub" ||
									integrationName === "hyros") && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											API Key
										</label>
										<TextInput
											placeholder="Enter API key"
											value={newAccount.key}
											onChange={(e) =>
												setNewAccount({
													...newAccount,
													key: e.target.value,
												})
											}
										/>
									</div>
								)}
							</>
						)}
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									setShowAddModal(false);
									setNewAccount({
										email: "",
										password: "",
										name: "",
										key: "",
									});
								}}
								disabled={addingAccount}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleAddAccount}
								disabled={
									(needsApiKey && !newAccount.name) ||
									(integrationName === "oncehub" &&
										!newAccount.key) ||
									addingAccount
								}
								loading={addingAccount}
							>
								{needsApiKey ? "Add" : "Connect"}
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		</div>
	);
};

export default IntegrationAccounts;
