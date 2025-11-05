import React, { useState } from "react";
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
} from "@tremor/react";
import { Loader2 } from "lucide-react";
import { integrationApi } from "../../../services/api";
import { useNavigate } from "react-router-dom";

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

// Normalized shape used in the UI (we map the API's nullable/typed fields into this)
interface Ad {
	id: number;
	adsAccountId: string;
	actId?: string;
	name?: string;
	amount_spent?: number;
	currency?: string;
	timezone?: string;
	accountName?: string;
	dateAdded?: string;
	status?: string;
	cron_status?: boolean;
	raw?: any; // keep original payload if needed
}

interface PaginationData {
	current_page: number;
	total_pages: number;
	total_count: number;
	page_size: number;
}

const GoogleAds: React.FC = () => {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [ads, setAds] = React.useState<Ad[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<string>("all");
	const [addingAccount, setAddingAccount] = useState(false);
	const [pagination, setPagination] = useState<PaginationData>({
		current_page: 1,
		total_pages: 1,
		total_count: 0,
		page_size: 10,
	});
	const [syncLoading, setSyncLoading] = useState(false);
	const [disconnectLoading, setDisconnectLoading] = useState(false);
	// id of ad currently updating cron status (shows loader / disables interaction)
	const [updatingCronId, setUpdatingCronId] = useState<number | null>(null);
	// const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const fetchAccounts = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		// setLoading(true);
		try {
			const response = await integrationApi.getAccounts(
				"5",
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

	const fetchAds = async (
		page: number = 1,
		page_size: number = pagination.page_size
	) => {
		try {
			const response = await integrationApi.getGoogleAdsAccounts(
				page,
				page_size,
				selectedAccount === "all" || selectedAccount === ""
					? "all"
					: selectedAccount
			);
			const payload = response.data || {};

			console.log(payload);

			// Normalize incoming items into UI-friendly shape
			const normalized: Ad[] = (payload.adaccounts || []).map(
				(a: any) => {
					const cronFlag = (() => {
						if (a == null || a.cron_status == null) return false;
						if (typeof a.cron_status === "object") {
							if ("Bool" in a.cron_status)
								return Boolean(a.cron_status.Bool);
							if ("Int32" in a.cron_status)
								return Number(a.cron_status.Int32) === 1;
						}
						return Boolean(a.cron_status);
					})();

					return {
						id:
							a.id?.Int64 ??
							a.id ??
							Math.floor(Math.random() * 1e9),
						adsAccountId: a.ads_account_id?.Int64 ?? "-",
						actId: a.act_id?.String ?? "-",
						name: a.name?.String ?? "-",
						amount_spent: (
							((a.amount_spent?.Int64 ??
								a.amount_spent ??
								0) as number) / 1000000
						).toFixed(2),
						currency: a.currency_code?.String ?? "-",
						timezone: a.time_zone?.String ?? "-",
						accountName:
							a.account_name?.String ?? a.account_name ?? "-",
						dateAdded: a.date_added?.Time ?? a.date_added ?? "-",
						status: mapMetaStatus(
							a.account_status?.String ?? a.status
						),

						raw: a,
						cron_status: cronFlag,
					};
				}
			);

			setAds(normalized);
			setPagination({
				current_page: page,
				total_pages: Math.max(
					1,
					Math.ceil(
						(payload.totalCount || payload.count || 0) /
							(page_size || 10)
					)
				),
				total_count: payload.count || payload.totalCount || 0,
				page_size: page_size,
			});
		} catch (error) {
			console.error("Error fetching Google Ads accounts:", error);
		}
	};

	React.useEffect(() => {
		fetchAds();
	}, [selectedAccount]);

	React.useEffect(() => {
		fetchAccounts();
	}, []);

	const handleAddAccount = async () => {
		setAddingAccount(true);
		try {
			const response = await integrationApi.getGoogleAdsAuthUrl(
				"google-ads"
			);
			console.log(response.data.auth_url);
			window.open(
				response.data.auth_url,
				"_blank",
				"width=800,height=600"
			);
		} catch (error) {
			console.error("Error getting Google Ads auth URL:", error);
		} finally {
			setAddingAccount(false);
		}
		return;
	};

	const handlePageChange = (newPage: number) => {
		fetchAds(newPage);
	};

	const handlePerPageChange = (value: string) => {
		const newPerPage = parseInt(value);
		fetchAds(1, newPerPage);
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

	const syncAccounts = async () => {
		try {
			setSyncLoading(true);
			const result = await integrationApi.syncGoogleAdAccount(
				selectedAccount || ""
			);
			console.log(result);
		} catch (error) {
			console.log(error);
		} finally {
			setSyncLoading(false);
		}
	};

	const disconnectAccount = async () => {
		try {
			setDisconnectLoading(true);
			await integrationApi.disconnectGoogleAds(selectedAccount);
			await fetchAccounts();
			setSelectedAccount("all");
			fetchAds(1);
		} catch (error) {
			console.log(error);
		} finally {
			setDisconnectLoading(false);
		}
	};

	// toggle cron status (UI + optional backend call)
	const handleToggleCron = async (ad: Ad) => {
		// determine current normalized flag (0/1)
		const current = ad.cron_status ? 1 : 0;
		const newStatus = current === 1 ? 0 : 1;

		// Optimistically update UI immediately
		setAds((prev) =>
			prev.map((a) =>
				a.id === ad.id
					? {
							...a,
							cron_status: newStatus === 1,
							raw: { ...(a.raw ?? {}), cron_status: newStatus },
					  }
					: a
			)
		);

		// mark as updating
		setUpdatingCronId(ad.id);

		try {
			// Ensure we send integer 0 when turning off
			if (
				typeof (integrationApi as any).updateGoogleAdsCronStatus ===
				"function"
			) {
				await (integrationApi as any).updateGoogleAdsCronStatus(
					ad.id,
					newStatus
				);
			} else if (
				typeof (integrationApi as any).updateCronStatus === "function"
			) {
				await (integrationApi as any).updateCronStatus(
					"meta-ads",
					ad.id,
					newStatus
				);
			} else {
				// no-op backend available
				console.log(
					"No API method found for updating cron status — optimistic UI applied",
					ad.id,
					newStatus
				);
			}
		} catch (error) {
			// revert optimistic change on error
			console.error("Error toggling cron status:", error);
			setAds((prev) =>
				prev.map((a) =>
					a.id === ad.id
						? {
								...a,
								cron_status: current === 1,
								raw: { ...(a.raw ?? {}), cron_status: current },
						  }
						: a
				)
			);
		} finally {
			setUpdatingCronId(null);
		}
	};

	const handleAccountSelect = (value: string) => {
		setSelectedAccount(value);
		console.log(value);
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
				<Title>About Google Ads Account</Title>
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
							onClick={handleAddAccount}
							loading={addingAccount}
						>
							Add Account
						</Button>
					</div>

					{selectedAccount === "all" ? null : (
						<div>
							<Button
								size="xs"
								variant="secondary"
								onClick={() => syncAccounts()}
								disabled={syncLoading}
								className="mr-2"
							>
								{syncLoading ? (
									<div className="flex items-center">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Syncing...
									</div>
								) : (
									"Sync Accounts"
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
							{/* <TableHeaderCell className="w-16"></TableHeaderCell> */}
							<TableHeaderCell className="w-40">
								Sync Account
							</TableHeaderCell>
							<TableHeaderCell className="w-80">
								Account ID
							</TableHeaderCell>
							<TableHeaderCell className="w-80">
								Amount Spent
							</TableHeaderCell>
							<TableHeaderCell className="w-80">
								Currency
							</TableHeaderCell>
							<TableHeaderCell className="w-80">
								Timezone
							</TableHeaderCell>
							<TableHeaderCell className="w-32">
								Status
							</TableHeaderCell>
							{/* <TableHeaderCell className="w-32">Status</TableHeaderCell> */}

							{/* <TableHeaderCell className="w-32">Actions</TableHeaderCell> */}
						</TableRow>
					</TableHead>
					<TableBody>
						{ads.map((ad) => (
							<TableRow key={ad.id}>
								<TableCell className="w-40 text-black">
									<div className="flex items-center gap-3">
										<label
											className={`inline-flex items-center cursor-pointer ${
												updatingCronId === ad.id
													? "opacity-50 pointer-events-none"
													: ""
											}`}
											title="Toggle cron status"
										>
											<input
												type="checkbox"
												className="sr-only"
												checked={Boolean(
													ad.cron_status
												)}
												onChange={() =>
													handleToggleCron(ad)
												}
												disabled={
													updatingCronId === ad.id
												}
											/>
											{/* visual switch */}
											<span
												className={`w-10 h-6 inline-block rounded-full transition-colors ${
													ad.cron_status
														? "bg-green-500"
														: "bg-gray-300"
												}`}
											>
												<span
													className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
														ad.cron_status
															? "translate-x-4"
															: "translate-x-0"
													} mt-1 ml-1`}
												/>
											</span>
										</label>
										<span className="text-xs text-gray-600">
											{ad.cron_status ? "On" : "Off"}
										</span>
										{updatingCronId === ad.id && (
											<Loader2 className="w-4 h-4 animate-spin text-gray-500" />
										)}
									</div>
								</TableCell>
								<TableCell className="w-80 text-black">
									<div className="flex flex-col">
										<span className="font-medium">
											{ad.name || "-"}
										</span>
										<span className="text-xs  text-black">
											ID: {ad.adsAccountId}
										</span>
									</div>
								</TableCell>
								<TableCell className="w-32">
									<span className="text-xs text-black">
										{ad.amount_spent}
									</span>
								</TableCell>
								<TableCell className="w-32">
									<span className="text-xs text-black">
										{ad.currency}
									</span>
								</TableCell>
								<TableCell className="w-32">
									<span className="text-xs text-black">
										{ad.timezone}
									</span>
								</TableCell>
								{/* <TableCell className="w-32">
                                    <div className="flex flex-col gap-1">
                                        <Badge color={ad.balance ? "green" : "yellow"}>
                                            {ad.balance ? `Balance: ${ad.balance}` : "No balance"}
                                        </Badge>
                                    </div>
                                </TableCell> */}
								<TableCell className="w-32">
									<span className="text-xs text-black">
										{ad.status}
									</span>
								</TableCell>

								{/* <TableCell className="w-32">
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href="#"
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            View Account
                                        </a>
                                    </div>
                                </TableCell> */}
							</TableRow>
						))}
					</TableBody>
				</Table>
				{renderPagination()}
			</Card>
		</div>
	);
};

// add mapping helper
const mapMetaStatus = (s: any): string => {
	const code = Number(s);
	switch (code) {
		case 1:
			return "Active";
		case 2:
			return "Disabled";
		case 3:
			return "Unsettled";
		case 7:
			return "Pending Risk Review";
		case 8:
			return "Pending Settlement";
		case 9:
			return "In Grace Period";
		case 100:
			return "Pending Closure";
		case 101:
			return "Closed";
		case 201:
			return "Any Active";
		case 202:
			return "Any Closed";
		default:
			return s !== undefined && s !== null ? String(s) : "-";
	}
};

export default GoogleAds;
