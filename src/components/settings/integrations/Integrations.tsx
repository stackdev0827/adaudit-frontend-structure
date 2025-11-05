import React, { useEffect, useRef, useState } from "react";
import {
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Badge,
	Button,
	TextInput,
	Dialog,
	DialogPanel,
	Card,
} from "@tremor/react";
import { integrationApi } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import HyrosConnectModal from "./HyrosConnectModal";
import HyrosApiModal from "./HyrosApiModal";
import HyrosTagClassification from "./HyrosTagClassification";
import HyrosDatePickerModal from "./HyrosDatePickerModal";
import HyrosSyncStatusModal from "./HyrosSyncStatusModal";
import OnceHubSyncDataModal from "./OnceHubSyncDataModal";
import OnceHubSyncStatusModal from "./OnceHubSyncStatusModal";
import TypeformSyncDataModal from "./TypeformSyncDataModal";
import TypeformSyncStatusModal from "./TypeformsyncStatusModal";
import { triggerSSE } from "../../../slices/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { setIntegrations } from "../../../slices/integrationsSlice";

interface Integration {
	id: number;
	name: string;
	display_name: string;
	is_connected: boolean;
	icon_url: string;
	sync_status: string;
	is_visible: boolean;
}

const Integrations: React.FC = React.memo(() => {
	const [integrations, setIntegrationsState] = useState<Integration[]>([]);
	const [isOnceHubDialogOpen, setIsOnceHubDialogOpen] = useState(false);
	const [isHyrosDialogOpen, setIsHyrosDialogOpen] = useState(false);
	const [onceHubApiToken, setOnceHubApiToken] = useState("");
	const [isTypeformSyncing, setIsTypeformSyncing] = useState(false);
	const [isTypeformSyncDataModal, setIsTypeformSyncDataModal] =
		useState(false);
	const [isTypeformSyncStatusModal, setIsTypeformSyncStatusModal] =
		useState(false);
	const [isOnceHubDataModal, setIsOnceHubDataModal] = useState(false);
	const [isOnceHubStatusModal, setIsOnceHubStatusModal] = useState(false);
	const [isHyrosApiDialogOpen, setIsHyrosApiDialogOpen] = useState(false);
	const [isHyrosTagClassification, setIsHyrosTagClassification] =
		useState(false);
	const [isDateModalOpen, setIsDateModalOpen] = useState(false);
	const [isSyncStatusOpen, setIsSyncStatusOpen] = useState(false);
	const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
	const [moreActionOpenId, setMoreActionOpenId] = useState<number | null>(
		null
	);

	const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">(
		"down"
	); // <<<< ADDED
	const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({}); // <<<< ADDED
	const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({}); // <<<< ADDED
	const hyrosEventSourceRef = useRef<EventSource | null>(null); // <<<< ADDED
	const dispatch = useAppDispatch();
	// Access toast state for triggerSSE and showtoast type

	// Access toast state for triggerSSE and showtoast type
	const toastState = useAppSelector((state) => state.toast);

	const navigate = useNavigate();

	const handleConnectSuccess = () => {
		fetchIntegrations();
	};

	const handleApiSuccess = () => {
		setIsHyrosTagClassification(true);
	};

	// Function to update Hyros sync status in the integrations array
	const updateHyrosSyncStatus = (newStatus: string) => {
		setIntegrationsState((prevIntegrations) => {
			const updatedIntegrations = prevIntegrations.map((integration) => {
				if (integration.name.toLowerCase() === "hyros") {
					return { ...integration, sync_status: newStatus };
				}
				return integration;
			});
			// Also update Redux store
			dispatch(setIntegrations(updatedIntegrations));
			localStorage.setItem(
				"integrations",
				JSON.stringify(updatedIntegrations)
			);
			return updatedIntegrations;
		});
	};

	// Watch for changes in toast state to update Hyros sync status
	useEffect(() => {
		// When triggerSSE is true, set Hyros sync status to "in_progress" (Syncing)
		if (toastState.triggerSSE) {
			updateHyrosSyncStatus("in_progress");
		}

		// When showtoast type is success, set Hyros sync status to "success"
		if (toastState.open && toastState.type === "success") {
			updateHyrosSyncStatus("success");
		}

		// When showtoast type is error, set Hyros sync status to "error"
		if (toastState.open && toastState.type === "error") {
			updateHyrosSyncStatus("error");
		}
	}, [toastState.triggerSSE, toastState.open, toastState.type]);

	useEffect(() => {
		fetchIntegrations();
	}, []);

	const fetchIntegrations = async () => {
		try {
			const response = await integrationApi.getAll();
			// console.log(response.data);
			setIntegrationsState(response.data);
			dispatch(setIntegrations(response.data));
			localStorage.setItem("integrations", JSON.stringify(response.data));
		} catch (err) {
			console.error("Error fetching integrations:", err);
		}
	};

	const handleIntegrationAction = async (integration: Integration) => {
		if (integration.is_connected) {
			setDisconnectingId(integration.id);
			await handleDisconnect(integration);
			setDisconnectingId(null);
		} else {
			if (integration.name.toLowerCase() === "oncehub") {
				setIsOnceHubDialogOpen(true);
			} else if (integration.name.toLowerCase() === "typeform") {
				handleTypeformConnect();
			} else if (integration.name.toLowerCase() === "hyros") {
				setIsHyrosDialogOpen(true);
			}
		}
	};

	const handleDisconnect = async (integration: Integration) => {
		try {
			const name = integration.name.toLowerCase();
			if (name === "oncehub") {
				await integrationApi.disconnectOnceHub();
			} else if (name === "typeform") {
				await integrationApi.disconnectTypeform();
			} else if (name === "hyros") {
				await integrationApi.disconnectHyros();
			}
			await fetchIntegrations();
		} catch (err) {
			console.error("Error disconnecting integration:", err);
		}
	};

	const handleOnceHubConnect = async () => {
		if (!onceHubApiToken) return;

		try {
			await integrationApi.connectOnceHub(onceHubApiToken);
			setIsOnceHubDialogOpen(false);
			setOnceHubApiToken("");
			await fetchIntegrations();
		} catch (err) {
			console.error("Error connecting OnceHub:", err);
		}
	};

	const handleTypeformConnect = async () => {
		try {
			const response = await integrationApi.getTypeformAuthUrl();
			window.open(
				response.data.auth_url,
				"_blank",
				"width=800,height=600"
			);
		} catch (err) {
			console.error("Error getting Typeform auth URL:", err);
		}
	};

	const handleTypeformSync = async () => {
		setIsTypeformSyncing(true);
		try {
			await integrationApi.syncTypeformForms("---");
		} catch (error) {
			console.error("Error syncing Typeform forms:", error);
		} finally {
			setIsTypeformSyncing(false);
		}
	};

	const handleHyrosSync = async () => {
		setIsSyncStatusOpen(true);
	};

	// Add state to store Hyros sync event status
	const [hyrosSyncStatus, setHyrosSyncStatus] = useState<null | {
		status: string;
		message?: string;
	}>(null);

	const handleHyrosSyncData = async () => {
		setIsDateModalOpen(true);

		if (hyrosEventSourceRef.current) {
			hyrosEventSourceRef.current.close();
		}
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
			setHyrosSyncStatus(result);
			eventSource.close();
			hyrosEventSourceRef.current = null;
		});
		hyrosEventSourceRef.current = eventSource;
	};

	// Clean up SSE on modal close or unmount
	useEffect(() => {
		if (!isDateModalOpen && hyrosEventSourceRef.current) {
			hyrosEventSourceRef.current.close();
			hyrosEventSourceRef.current = null;
		}
		return () => {
			if (hyrosEventSourceRef.current) {
				hyrosEventSourceRef.current.close();
				hyrosEventSourceRef.current = null;
			}
		};
	}, [isDateModalOpen]);

	const handleShowAdditionalInfo = (name: string) => {
		if (name === "oncehub") {
			navigate("/settings/integrations/oncehub");
		} else if (name === "typeform") {
			navigate("/settings/integrations/typeform");
		} else if (name === "hyros") {
			setIsHyrosApiDialogOpen(true);
		}
	};

	const BUTTON_WIDTH_CLASS = "min-w-[100px]";

	// <<<< OUTSIDE CLICK HANDLER FOR DROPDOWN
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

	// <<<< CHECK IF DROPDOWN SHOULD GO UP OR DOWN
	useEffect(() => {
		if (moreActionOpenId === null) return;
		const button = buttonRefs.current[moreActionOpenId];
		const dropdown = dropdownRefs.current[moreActionOpenId];
		if (!button || !dropdown) {
			setDropdownDirection("down");
			return;
		}
		// Find the index of the integration in the list
		const idx = integrations.findIndex((i) => i.id === moreActionOpenId);
		if (
			integrations.length > 1 &&
			(idx === integrations.length - 1 || idx === integrations.length - 2)
		) {
			setDropdownDirection("up");
			return;
		}
		const buttonRect = button.getBoundingClientRect();
		const dropdownHeight = dropdown.offsetHeight;
		const spaceBelow = window.innerHeight - buttonRect.bottom;
		const spaceAbove = buttonRect.top;
		if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
			setDropdownDirection("up");
		} else {
			setDropdownDirection("down");
		}
	}, [moreActionOpenId, integrations]);

	const renderActionButtons = (integration: Integration) => {
		const buttons = [];
		buttons.push(
			<Button
				key="connection"
				size="xs"
				variant={integration.is_connected ? "secondary" : "primary"}
				onClick={() => handleIntegrationAction(integration)}
				className={`mr-2 min-w-[100px]`}
				loading={
					integration.is_connected &&
					disconnectingId === integration.id
				}
				disabled={
					integration.is_connected &&
					disconnectingId === integration.id
				}
			>
				{integration.is_connected ? "Disconnect" : "Connect"}
			</Button>
		);

		const moreButtons = [];
		if (integration.is_connected) {
			if (integration.name.toLowerCase() === "typeform") {
				moreButtons.push({
					title: "Show Forms",
					onClick: () => handleShowAdditionalInfo("typeform"),
					disabled: false,
				});
				moreButtons.push({
					title: "Sync Forms",
					onClick: handleTypeformSync,
					disabled: isTypeformSyncing,
				});
				moreButtons.push({
					title: "Sync Data",
					onClick: () => setIsTypeformSyncDataModal(true),
					disabled: false,
				});
				moreButtons.push({
					title: "Sync Status",
					onClick: () => setIsTypeformSyncStatusModal(true),
					disabled: false,
				});
			} else if (integration.name.toLowerCase() === "oncehub") {
				moreButtons.push({
					title: "Show Master Pages",
					onClick: () => handleShowAdditionalInfo("oncehub"),
					disabled: false,
				});
				moreButtons.push({
					title: "Sync Data",
					onClick: () => setIsOnceHubDataModal(true),
					disabled: false,
				});
				moreButtons.push({
					title: "Sync Status",
					onClick: () => setIsOnceHubStatusModal(true),
					disabled: false,
				});
			} else if (integration.name.toLowerCase() === "hyros") {
				moreButtons.push({
					title: "Sync Historical Data",
					onClick: () => handleShowAdditionalInfo("hyros"),
					disabled: false,
				});
				moreButtons.push({
					title: "Sync Status",
					onClick: handleHyrosSync,
					// disabled: isHyrosSyncing,
				});
			}
		}

		if (moreButtons.length > 0) {
			buttons.push(
				<div key="more-action" className="relative inline-block">
					<Button
						size="xs"
						variant="secondary"
						className={BUTTON_WIDTH_CLASS}
						ref={(el) => (buttonRefs.current[integration.id] = el)}
						onClick={() =>
							setMoreActionOpenId(
								moreActionOpenId === integration.id
									? null
									: integration.id
							)
						}
					>
						More Actions
					</Button>
					{moreActionOpenId === integration.id && (
						<div
							ref={(el) =>
								(dropdownRefs.current[integration.id] = el)
							}
							className={`
								absolute z-50 min-w-[200px] right-0 bg-white border border-gray-200 rounded shadow-lg
								${dropdownDirection === "up" ? "bottom-full mb-2" : "mt-2"}
							`}
						>
							<ul className="flex flex-col p-2">
								{moreButtons.map((item, idx) => (
									<li
										key={item.title + idx}
										className="mb-1 last:mb-0"
									>
										<button
											type="button"
											className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
												item.disabled
													? "opacity-50 cursor-not-allowed"
													: ""
											}`}
											onClick={
												item.disabled
													? undefined
													: item.onClick
											}
											disabled={item.disabled}
										>
											{item.title}
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			);
		}
		return <div className="flex gap-2">{buttons}</div>;
	};

	return (
		<div className="space-y-6">
			<Card>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeaderCell className="w-[35%]">
								Integration
							</TableHeaderCell>
							<TableHeaderCell className="w-[30%]">
								Status
							</TableHeaderCell>
							<TableHeaderCell className="w-[20%]">
								Sync Status
							</TableHeaderCell>
							<TableHeaderCell className="w-[35%]">
								Actions
							</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{integrations.map((integration) => {
							if (integration.is_visible) {
								return (
									<TableRow key={integration.id}>
										<TableCell className="w-[35%]">
											{integration.display_name}
										</TableCell>
										<TableCell className="w-[30%]">
											<Badge
												color={
													integration.is_connected
														? "green"
														: "red"
												}
											>
												{integration.is_connected
													? "Connected"
													: "Not Connected"}
											</Badge>
										</TableCell>
										<TableCell className="w-[20%]">
											<Badge
												color={
													integration.sync_status ===
													"in_progress"
														? "blue"
														: integration.sync_status ===
														  "error"
														? "red"
														: integration.sync_status ===
														  "success"
														? "green"
														: "gray"
												}
											>
												{integration.sync_status === ""
													? "Never Synced"
													: integration.sync_status ===
													  "in_progress"
													? "Syncing"
													: integration.sync_status ===
													  "error"
													? "Failed"
													: "Success"}
											</Badge>
										</TableCell>
										<TableCell className="w-[35%]">
											<div className="flex gap-2 items-center">
												{renderActionButtons(
													integration
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							}
						})}
					</TableBody>
				</Table>
			</Card>

			{/* OnceHub API Token Dialog */}
			<Dialog
				open={isOnceHubDialogOpen}
				onClose={() => setIsOnceHubDialogOpen(false)}
				static={true}
			>
				<DialogPanel>
					<div className="space-y-4">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Connect OnceHub
						</h3>
						<div>
							<label
								htmlFor="apiToken"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								API Token
							</label>
							<TextInput
								id="apiToken"
								placeholder="Enter your OnceHub API token"
								value={onceHubApiToken}
								onChange={(e) =>
									setOnceHubApiToken(e.target.value)
								}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => setIsOnceHubDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleOnceHubConnect}
								disabled={!onceHubApiToken}
							>
								Connect
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>

			<HyrosConnectModal
				open={isHyrosDialogOpen}
				onClose={() => setIsHyrosDialogOpen(false)}
				onSuccess={handleConnectSuccess}
			/>
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

			<OnceHubSyncDataModal
				open={isOnceHubDataModal}
				onClose={() => setIsOnceHubDataModal(false)}
				onSuccess={() => console.log("-----------")}
			/>
			<OnceHubSyncStatusModal
				open={isOnceHubStatusModal}
				onClose={() => setIsOnceHubStatusModal(false)}
			/>

			<TypeformSyncDataModal
				open={isTypeformSyncDataModal}
				onClose={() => setIsTypeformSyncDataModal(false)}
				onSuccess={() => console.log("-----------")}
			/>
			<TypeformSyncStatusModal
				open={isTypeformSyncStatusModal}
				onClose={() => setIsTypeformSyncStatusModal(false)}
			/>

			{/* Optionally, show the status somewhere in the UI for demonstration */}
			{hyrosSyncStatus && (
				<div
					className={`mt-4 p-2 rounded ${
						hyrosSyncStatus.status === "success"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					<strong>Hyros Sync Status:</strong> {hyrosSyncStatus.status}{" "}
					{hyrosSyncStatus.message && `- ${hyrosSyncStatus.message}`}
				</div>
			)}
		</div>
	);
});

export default Integrations;
