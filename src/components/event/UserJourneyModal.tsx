import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogPanel,
	TabGroup,
	TabList,
	Tab,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Button,
	TextInput,
} from "@tremor/react";
import { Check, X, Copy } from "lucide-react";
import { eventApi } from "../../services/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import { formatDateWithUserPreferences } from "../../utils/dateFormatter";

interface UserJourneyModalProps {
	open: boolean;
	onClose: () => void;
	userId: string;
	userName: string;
	userEmail: string;
	option: string;
}

interface JourneyEvent {
	event_id: string;
	event_type: string;
	property_1_name: string;
	property_1_value: string;
	property_2_name: string;
	property_2_value: string;
	property_3_name: string;
	property_3_value: string;
	record_id: string;
	record_type: string;
	event_time: string;
	extra_data: any;
	event_name: string;
}

interface UserInfo {
	name?: string;
	lead_email?: string;
	phones?: string;
	first_name?: string;
	last_name?: string;
	last_click_ad_name?: string;
	first_click_ad_name?: string;
}

const UserJourneyModal: React.FC<UserJourneyModalProps> = ({
	open,
	onClose,
	userId,
	userName,
	userEmail,
	option,
}) => {
	const [activeTab, setActiveTab] = useState(0);
	const [loading, setLoading] = useState(false);
	const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
	const [userInfo, setUserInfo] = useState<UserInfo>({});
	// Add this state to track which row is expanded
	const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
	const [isEditingPhone, setIsEditingPhone] = useState(false);
	const [isEditingEmail, setIsEditingEmail] = useState(false);
	const [newPhone, setNewPhone] = useState(userInfo.phones || "");
	const [newEmail, setNewEmail] = useState(userInfo.lead_email || "");
	const [copiedProperty, setCopiedProperty] = useState<string | null>(null);

	const handleCopyProperty = async (value: string, propertyKey: string) => {
		await navigator.clipboard.writeText(value);
		setCopiedProperty(propertyKey);
		setTimeout(() => setCopiedProperty(null), 2000);
	};

	// Fetch user journey data when modal opens
	useEffect(() => {
		if (open && userId) {
			fetchUserJourneyData(userId);
		}
	}, [open, userId]);

	useEffect(() => {
		if (activeTab === 1) {
			fetchUserInfo(userId);
		}
	}, [activeTab, open]);

	// Reset states when modal closes
	useEffect(() => {
		if (!open) {
			setJourneyEvents([]);
			setUserInfo({});
			setActiveTab(0);
		}
	}, [open]);

	const savePhone = async () => {
		try {
			// Replace with your actual API call
			await eventApi.updateUserInfo(userId, "phone", newPhone, option);
			setUserInfo((prev) => ({ ...prev, phone: newPhone }));
			setIsEditingPhone(false);
			setNewPhone("");
			onClose();
		} catch (error) {
			console.error("Error saving phone:", error);
		}
	};

	const saveEmail = async () => {
		try {
			// Replace with your actual API call
			await eventApi.updateUserInfo(userId, "email", newEmail, option);
			setUserInfo((prev) => ({ ...prev, email: newEmail }));
			setIsEditingEmail(false);
			setNewEmail("");
			onClose();
		} catch (error) {
			console.error("Error saving email:", error);
		}
	};

	const cancelEditPhone = () => {
		setNewPhone(userInfo.phones || "");
		setIsEditingPhone(false);
	};

	const cancelEditEmail = () => {
		setNewEmail(userInfo.lead_email || "");
		setIsEditingEmail(false);
	};

	const fetchUserJourneyData = async (userId: string) => {
		setLoading(true);
		try {
			// Replace with your actual API call
			const response = await eventApi.getUserJourney({ userId, option });
			// console.log(response.data);
			if (response.data === null) {
				setLoading(false);
				return;
			}
			setJourneyEvents(response.data.journey);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching user journey data:", error);
			setLoading(false);
		}
	};

	const fetchUserInfo = async (userId: string) => {
		setLoading(true);
		try {
			// Replace with your actual API call
			const response = await eventApi.getUserInfo({ userId });
			if (response.data === null) {
				setLoading(false);
				return;
			}

			// Extract first name and last name from the full name
			const fullName = response.data.name || "";
			const nameParts = fullName.split(" ");
			const firstName = nameParts[0] || "";
			const lastName = nameParts.slice(1).join(" ") || "";

			// Create a new userInfo object with first_name and last_name properties
			setUserInfo({
				...response.data,
				first_name: firstName,
				last_name: lastName,
			});

			setLoading(false);
		} catch (error) {
			console.error("Error fetching user info data:", error);
			setLoading(false);
		}
	};

	// Handle modal close
	const handleClose = () => {
		setJourneyEvents([]);
		setUserInfo({});
		setActiveTab(0);
		onClose();
	};

	// Format ISO date string to "YYYY-MM-DD HH:MM:SS" format
	// const formatDateTime = (isoString: string) => {
	// 	try {
	// 		const date = new Date(isoString);
	// 		const year = date.getFullYear();
	// 		const month = String(date.getMonth() + 1).padStart(2, "0");
	// 		const day = String(date.getDate()).padStart(2, "0");
	// 		const hours = String(date.getHours()).padStart(2, "0");
	// 		const minutes = String(date.getMinutes()).padStart(2, "0");
	// 		const seconds = String(date.getSeconds()).padStart(2, "0");

	// 		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	// 	} catch (error) {
	// 		console.error("Error formatting date:", error);
	// 		return isoString; // Return original string if parsing fails
	// 	}
	// };

	// Format key: capitalize first letter and handle special cases
	const formatKey = (key: string) => {
		if (key === "ip") return "IP";
		if (key.includes("url"))
			return (
				key.replace(/url/gi, "URL").charAt(0).toUpperCase() +
				key.replace(/url/gi, "URL").slice(1).replace(/_/g, " ")
			);
		if (key.endsWith("_id") || key.startsWith("id_"))
			return (
				key
					.replace(/_id$/gi, " ID")
					.replace(/^id_/gi, "ID ")
					.charAt(0)
					.toUpperCase() +
				key.replace(/_id$/gi, " ID").replace(/^id_/gi, "ID ").slice(1)
			);

		// Split by underscore, capitalize first letter of each word, then join with space
		return key
			.split("_")
			.map(
				(word) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			)
			.join(" ");
	};

	// Sort events by date (newest first)
	const sortedEvents = [...journeyEvents].sort(
		(a, b) =>
			new Date(b.event_time).getTime() - new Date(a.event_time).getTime()
	);

	return (
		<Dialog open={open} onClose={handleClose} static={true}>
			<DialogPanel className="max-w-4xl ">
				<div className="flex flex-col">
					<h3 className="text-xl font-medium leading-6 text-gray-900 mb-4">
						User Journey
					</h3>
					<h4 className="text-md font-medium leading-6 text-gray-900">
						{userName}
					</h4>
					<h2 className="text-xl font-medium leading-6 text-gray-900">
						{userEmail}
					</h2>

					<TabGroup
						index={activeTab}
						onIndexChange={setActiveTab}
						className="flex-1 flex flex-col"
					>
						<TabList className="mt-2 mb-6">
							<Tab>User Journey</Tab>
							<Tab>Info</Tab>
							{/* <Tab>Events</Tab> */}
						</TabList>

						<div className="flex-1 overflow-hidden">
							{activeTab === 0 && (
								<div className="h-full flex flex-col">
									{loading ? (
										<LoadingSpinner
											text="Loading User Journey..."
											size="lg"
											variant="circle"
										/>
									) : (
										<div className="overflow-hidden flex-1 flex flex-col">
											<Table className="table-fixed h-[600px]">
												<TableHead className="sticky top-0 z-10 bg-white">
													<TableRow>
														<TableHeaderCell>
															Event
														</TableHeaderCell>
														<TableHeaderCell>
															Timestamp
														</TableHeaderCell>
														<TableHeaderCell>
															Event Details
														</TableHeaderCell>
													</TableRow>
												</TableHead>
												<TableBody className="overflow-auto">
													{sortedEvents.length > 0 ? (
														sortedEvents.map(
															(event) => (
																<React.Fragment
																	key={
																		event.event_id
																	}
																>
																	<TableRow
																		onClick={() => {
																			// console.log(event);
																			// Toggle expanded state for this row
																			setExpandedRowId(
																				expandedRowId ===
																					event.event_id
																					? null
																					: event.event_id
																			);
																		}}
																		className="cursor-pointer hover:bg-gray-50"
																	>
																		<TableCell className="text-black font-semibold">
																			{
																				event.event_name
																			}
																		</TableCell>
																		<TableCell className="text-black">
																			{formatDateWithUserPreferences(
																				event.event_time
																			)}
																		</TableCell>
																		<TableCell>
																			<span
																				className="inline-block overflow-hidden text-ellipsis whitespace-nowrap text-black"
																				style={{
																					width: "120px",
																					marginRight:
																						"20px",
																				}}
																				title={
																					event.property_1_value ||
																					""
																				}
																			>
																				{event.property_1_value ||
																					""}
																			</span>
																			{event.property_1_name ===
																				"Page URL" &&
																				event.property_1_value && (
																					<button
																						onClick={(
																							e
																						) => {
																							e.stopPropagation();
																							handleCopyProperty(
																								event.property_1_value,
																								`${event.event_id}-prop1`
																							);
																						}}
																						className="inline-block p-1 hover:bg-gray-200 rounded"
																						title="Copy URL"
																					>
																						{copiedProperty ===
																						`${event.event_id}-prop1` ? (
																							<Check className="w-3 h-3 text-green-500" />
																						) : (
																							<Copy className="w-3 h-3 text-gray-500" />
																						)}
																					</button>
																				)}
																			<span
																				className="inline-block overflow-hidden text-ellipsis whitespace-nowrap text-black"
																				style={{
																					width: "120px",
																				}}
																				title={
																					event.property_2_value?.replace(
																						/\|(.)$/,
																						"$1"
																					) ||
																					""
																				}
																			>
																				{event.property_2_value?.replace(
																					/\|(.)$/,
																					"$1"
																				) ||
																					""}
																			</span>
																			{event.property_2_name ===
																				"Page URL" &&
																				event.property_2_value && (
																					<button
																						onClick={(
																							e
																						) => {
																							e.stopPropagation();
																							handleCopyProperty(
																								event.property_2_value.replace(
																									/\|(.)$/,
																									"$1"
																								),
																								`${event.event_id}-prop2`
																							);
																						}}
																						className="inline-block p-1 hover:bg-gray-200 rounded mr-[20px]"
																						title="Copy URL"
																					>
																						{copiedProperty ===
																						`${event.event_id}-prop2` ? (
																							<Check className="w-3 h-3 text-green-500" />
																						) : (
																							<Copy className="w-3 h-3 text-gray-500" />
																						)}
																					</button>
																				)}
																			<span
																				className="inline-block overflow-hidden text-ellipsis whitespace-nowrap text-black"
																				style={{
																					width: "120px",
																				}}
																				title={
																					event.property_3_value
																						? event.property_3_value
																								.charAt(
																									0
																								)
																								.toUpperCase() +
																						  event.property_3_value.slice(
																								1
																						  )
																						: ""
																				}
																			>
																				{event.property_3_value
																					? event.property_3_value
																							.charAt(
																								0
																							)
																							.toUpperCase() +
																					  event.property_3_value.slice(
																							1
																					  )
																					: ""}
																			</span>
																			{event.property_3_name ===
																				"page_url" &&
																				event.property_3_value && (
																					<button
																						onClick={(
																							e
																						) => {
																							e.stopPropagation();
																							handleCopyProperty(
																								event.property_3_value,
																								`${event.event_id}-prop3`
																							);
																						}}
																						className="inline-block p-1 hover:bg-gray-200 rounded"
																						title="Copy URL"
																					>
																						{copiedProperty ===
																						`${event.event_id}-prop3` ? (
																							<Check className="w-3 h-3 text-green-500" />
																						) : (
																							<Copy className="w-3 h-3 text-gray-500" />
																						)}
																					</button>
																				)}
																		</TableCell>
																	</TableRow>
																	{/* Show expanded details for different record types when clicked */}
																	{expandedRowId ===
																		event.event_id && (
																		<TableRow className="bg-gray-50">
																			<TableCell
																				colSpan={
																					3
																				}
																				className="px-6 py-3"
																			>
																				<div className="text-sm  text-black">
																					<div className="grid grid-cols-2 gap-4">
																						{event.extra_data &&
																							Object.entries(
																								event.extra_data
																							).map(
																								(
																									[
																										key,
																										value,
																									],
																									index
																								) => (
																									<div
																										key={
																											index
																										}
																										className="flex items-center gap-2 overflow-hidden"
																									>
																										<span
																											className="overflow-hidden text-ellipsis whitespace-nowrap flex-1"
																											title={`${formatKey(
																												key
																											)}: ${String(
																												value ||
																													""
																											)}`}
																										>
																											{formatKey(
																												key
																											)}

																											:{" "}
																											{String(
																												value ||
																													""
																											)}
																											{key ===
																												"previous_url" && (
																												<button
																													onClick={() =>
																														handleCopyProperty(
																															String(
																																value
																															),
																															`${event.event_id}-${key}`
																														)
																													}
																													className="p-1 hover:bg-gray-200 rounded"
																													title="Copy URL"
																												>
																													{copiedProperty ===
																													`${event.event_id}-${key}` ? (
																														<Check className="w-3 h-3 text-green-500" />
																													) : (
																														<Copy className="w-3 h-3 text-gray-500" />
																													)}
																												</button>
																											)}
																										</span>
																									</div>
																								)
																							)}
																					</div>
																				</div>
																			</TableCell>
																		</TableRow>
																	)}
																</React.Fragment>
															)
														)
													) : (
														<TableRow>
															<TableCell
																colSpan={3}
																className="text-center"
															>
																No journey
																events found
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									)}
								</div>
							)}

							{activeTab === 1 && (
								<div className="p-1 h-full overflow-auto">
									{loading ? (
										<LoadingSpinner
											text="Loading User Information..."
											size="lg"
											variant="circle"
										/>
									) : (
										<>
											<h4 className="text-base font-medium mb-4">
												User Information
											</h4>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														First Name:
													</label>
													<TextInput
														value={
															userInfo.first_name ||
															""
														}
														readOnly
														className="w-full"
														placeholder=""
													/>
												</div>
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Last Name:
													</label>
													<TextInput
														value={
															userInfo.last_name ||
															""
														}
														readOnly
														className="w-full"
														placeholder=""
													/>
												</div>
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Phone:
													</label>
													{isEditingPhone ? (
														<div className="flex items-center gap-2">
															<TextInput
																value={newPhone}
																placeholder="Input the new phone number"
																onChange={(e) =>
																	setNewPhone(
																		e.target
																			.value
																	)
																}
																className="w-full"
															/>
															<Button
																variant="primary"
																size="xs"
																onClick={
																	savePhone
																}
															>
																<Check className="w-4 h-4" />
															</Button>
															<Button
																variant="secondary"
																size="xs"
																onClick={
																	cancelEditPhone
																}
															>
																<X className="w-4 h-4" />
															</Button>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<TextInput
																value={
																	userInfo.phones ||
																	""
																}
																readOnly
																className="w-full"
																placeholder="No phone available"
															/>
															<Button
																variant="secondary"
																size="xs"
																onClick={() =>
																	setIsEditingPhone(
																		true
																	)
																}
															>
																Add Phone
															</Button>
														</div>
													)}
												</div>

												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Email:
													</label>
													{isEditingEmail ? (
														<div className="flex items-center gap-2">
															<TextInput
																placeholder="Input the new email"
																value={newEmail}
																onChange={(e) =>
																	setNewEmail(
																		e.target
																			.value
																	)
																}
																className="w-full"
															/>
															<Button
																variant="primary"
																size="xs"
																onClick={
																	saveEmail
																}
															>
																<Check className="w-4 h-4" />
															</Button>
															<Button
																variant="secondary"
																size="xs"
																onClick={
																	cancelEditEmail
																}
															>
																<X className="w-4 h-4" />
															</Button>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<TextInput
																value={
																	userInfo.lead_email ||
																	""
																}
																readOnly
																className="w-full"
																placeholder="No email available"
															/>
															<Button
																variant="secondary"
																size="xs"
																onClick={() =>
																	setIsEditingEmail(
																		true
																	)
																}
															>
																Add Email
															</Button>
														</div>
													)}
												</div>
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														First Source:
													</label>
													<TextInput
														value={
															userInfo.first_click_ad_name ||
															""
														}
														readOnly
														className="w-full"
														placeholder=""
													/>
												</div>
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Last Source:
													</label>
													<TextInput
														value={
															userInfo.last_click_ad_name ||
															""
														}
														readOnly
														className="w-full"
														placeholder=""
													/>
												</div>
											</div>
										</>
									)}
								</div>
							)}

							{activeTab === 2 && (
								<div className="p-4 h-full overflow-auto">
									<p>{userId}</p>
									{/* You can implement attribution data visualization here */}
								</div>
							)}
						</div>
					</TabGroup>

					<div className="flex justify-end mt-4">
						<Button variant="secondary" onClick={handleClose}>
							Close
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default UserJourneyModal;
