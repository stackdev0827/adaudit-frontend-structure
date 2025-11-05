import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
} from "./ui/dialog";
import { metricsTableApi, normalizedApi } from "../../services/api";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
	ChevronDown,
	// Download,
	// Save,
	// CalendarIcon,
	Plus,
	Facebook,
	Twitter,
	Instagram,
	Youtube,
	X,
	ChevronUp,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CustomizeTableModal } from "./CustomizeTableModal";

// Static data arrays - moved outside component for reusability
const platforms = [
	{
		id: "google",
		name: "Google",
		icon: (
			<span
				style={{
					display: "flex",
					alignItems: "center",
				}}
			>
				<img
					src="/logo/google.svg"
					alt="Google"
					width={16}
					height={16}
					style={{
						marginRight: 8,
					}}
				/>
			</span>
		),
	},
	{
		id: "facebook",
		name: "Facebook",
		icon: (
			<span
				style={{
					display: "flex",
					alignItems: "center",
				}}
			>
				<img
					src="/logo/meta.svg"
					alt="Facebook"
					width={16}
					height={16}
					style={{
						marginRight: 8,
					}}
				/>
			</span>
		),
	},
	{
		id: "instagram",
		name: "Instagram",
		icon: Instagram,
	},
	{
		id: "youtube",
		name: "YouTube",
		icon: Youtube,
	},
	{
		id: "twitter",
		name: "Twitter",
		icon: Twitter,
	},
];

const adAccounts = [
	{
		id: "1",
		name: "Main Ad Account",
		number: "123456789",
		platform: "facebook",
		icon: Facebook,
	},
	{
		id: "2",
		name: "Secondary Account",
		number: "987654321",
		platform: "facebook",
		icon: Facebook,
	},
	{
		id: "3",
		name: "Instagram Business",
		number: "456789123",
		platform: "instagram",
		icon: Instagram,
	},
	{
		id: "4",
		name: "YouTube Channel",
		number: "789123456",
		platform: "youtube",
		icon: Youtube,
	},
];

const eventsByType = {
	"Lead form submission": [
		{
			id: "lead1",
			name: "Contact Form Submission",
		},
		{
			id: "lead2",
			name: "Newsletter Signup",
		},
		{
			id: "lead3",
			name: "Demo Request",
		},
		{
			id: "lead4",
			name: "Quote Request",
		},
		{
			id: "lead5",
			name: "Consultation Booking",
		},
	],
	Application: [
		{
			id: "app1",
			name: "Job Application",
		},
		{
			id: "app2",
			name: "Course Application",
		},
		{
			id: "app3",
			name: "Membership Application",
		},
		{
			id: "app4",
			name: "Partnership Application",
		},
	],
	"Booked call": [
		{
			id: "call1",
			name: "Sales Call",
		},
		{
			id: "call2",
			name: "Support Call",
		},
		{
			id: "call3",
			name: "Consultation Call",
		},
		{
			id: "call4",
			name: "Demo Call",
		},
	],
	Sale: [
		{
			id: "sale1",
			name: "Premium Subscription",
		},
		{
			id: "sale2",
			name: "Basic Plan",
		},
		{
			id: "sale3",
			name: "Enterprise Package",
		},
		{
			id: "sale4",
			name: "Add-on Services",
		},
		{
			id: "sale5",
			name: "Custom Solution",
		},
	],
	"Offer Made": [
		{
			id: "offer1",
			name: "Special Discount Offer",
		},
		{
			id: "offer2",
			name: "Limited Time Promotion",
		},
		{
			id: "offer3",
			name: "Bundle Deal",
		},
		{
			id: "offer4",
			name: "Upgrade Offer",
		},
	],
};
interface Filters {
	attributionModel: string;
	attributionWindow: string;
	timePeriod: string;
	timeComparison: string;
	trafficFilter: string;
}

interface ModalFilters {
	platforms: string[];
	adAccounts: {
		facebook?: string[];
		google?: string[];
	};
	campaigns: string[];
	events: string[];
}

interface SelectedMetric {
	id: string;
	name: string;
	category: string;
	enabled: boolean;
}

interface DashboardFiltersProps {
	filters: Filters;
	onFilterChange: (key: string, value: string) => void;
	savedViews: Array<{
		id: string;
		templatename: string;
		filters: Filters;
		filterby: any;
		metrics: any;
	}>;
	onSaveView: (name: string) => void;
	onLoadView: (viewId: string) => void;
	onDeleteView?: (viewId: string) => void;
	onGenerateReport: (
		metrics: SelectedMetric[],
		start: any,
		end: any,
		changedMetrics: SelectedMetric[]
	) => void;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	hasGeneratedReport?: boolean;
	reportName?: string;
	selectedModalFilters?: ModalFilters;
	onModalFiltersChange?: (filters: ModalFilters) => void;
	onMetricsChange: (metrics: SelectedMetric[]) => void;
}
// const DateRangePicker = ({
// 	startDate,
// 	endDate,
// 	onDateChange,
// }: {
// 	startDate?: Date;
// 	endDate?: Date;
// 	onDateChange: (start: Date | undefined, end: Date | undefined) => void;
// }) => {
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
// 		startDate
// 	);
// 	const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);

// 	const handleApply = () => {
// 		if (tempStartDate && tempEndDate) {
// 			onDateChange(tempStartDate, tempEndDate);
// 			setIsOpen(false);
// 		}
// 	};
// 	const formatDateRange = () => {
// 		if (startDate && endDate) {
// 			return `${format(startDate, "MMM dd")} - ${format(
// 				endDate,
// 				"MMM dd, yyyy"
// 			)}`;
// 		}
// 		if (startDate) {
// 			return `${format(startDate, "MMM dd, yyyy")} - Select end date`;
// 		}
// 		return "Select date range";
// 	};
// 	return (
// 		<Popover open={isOpen} onOpenChange={setIsOpen}>
// 			<PopoverTrigger asChild>
// 				<Button
// 					variant="outline"
// 					className="h-9 px-4 text-sm border-gray-200 bg-white shadow-sm rounded-lg justify-between min-w-[220px] hover:border-gray-300 transition-colors"
// 				>
// 					<span className="font-medium">{formatDateRange()}</span>
// 					<CalendarIcon className="h-4 w-4 opacity-50" />
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent
// 				className="w-auto p-0 bg-white border border-gray-200 shadow-xl rounded-xl"
// 				align="start"
// 			>
// 				<div className="flex gap-4 p-6">
// 					<div>
// 						<div className="text-sm font-semibold text-gray-700 mb-3">
// 							Start Date
// 						</div>
// 						<Calendar
// 							mode="single"
// 							selected={tempStartDate}
// 							onSelect={setTempStartDate}
// 							className={cn("p-0 pointer-events-auto rounded-lg")}
// 							disabled={(date) => date > new Date()}
// 							initialFocus
// 							month={tempStartDate || new Date()}
// 						/>
// 					</div>
// 					<div>
// 						<div className="text-sm font-semibold text-gray-700 mb-3">
// 							End Date
// 						</div>
// 						<Calendar
// 							mode="single"
// 							selected={tempEndDate}
// 							onSelect={setTempEndDate}
// 							disabled={(date) => {
// 								if (tempStartDate && date < tempStartDate) return true;
// 								if (date > new Date()) return true;
// 								return false;
// 							}}
// 							className={cn("p-0 pointer-events-auto rounded-lg")}
// 							month={
// 								tempEndDate ||
// 								(tempStartDate
// 									? new Date(
// 											tempStartDate.getFullYear(),
// 											tempStartDate.getMonth() + 1,
// 											1
// 									  )
// 									: new Date(
// 											new Date().getFullYear(),
// 											new Date().getMonth() + 1,
// 											1
// 									  ))
// 						/>
// 					</div>
// 				</div>
// 				<div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
// 					<Button
// 						variant="outline"
// 						size="sm"
// 						onClick={() => {
// 							setTempStartDate(startDate);
// 							setTempEndDate(endDate);
// 							setIsOpen(false);
// 						}}
// 						className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50"
// 					>
// 						Cancel
// 					</Button>
// 					<Button
// 						size="sm"
// 						onClick={handleApply}
// 						disabled={!tempStartDate || !tempEndDate}
// 						className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
// 					>
// 						Apply
// 					</Button>
// 				</div>
// 			</PopoverContent>
// 		</Popover>
// 	);
// };
// const FilterSelect = ({
// 	label,
// 	value,
// 	onChange,
// 	options,
// 	width = "w-auto",
// 	}: {
// 	label: string;
// 	value: string;
// 	onChange: (value: string) => void;
// 	options: {
// 		value: string;
// 		label: string;
// 	}[];
// 	width?: string;
// 	}) => (
// 	<div className="flex items-center gap-3">
// 		<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
// 			{label}
// 		</span>
// 		<Select value={value} onValueChange={onChange}>
// 			<SelectTrigger
// 				className={cn(
// 					"h-9 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors",
// 					width
// 				)}
// 			>
// 				<SelectValue />
// 			</SelectTrigger>
// 			<SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
// 				{options.map((option) => (
// 					<SelectItem
// 						key={option.value}
// 						value={option.value}
// 						className="text-xs rounded-md hover:bg-gray-50"
// 					>
// 						{option.label}
// 					</SelectItem>
// 				))}
// 			</SelectContent>
// 		</Select>
// 	</div>
// );
const FilterDialog = ({
	selectedModalFilters,
	onModalFiltersChange,
}: // onMetricsChange,
{
	selectedModalFilters?: ModalFilters;
	onModalFiltersChange?: (filters: ModalFilters) => void;
	// onMetricsChange: (metrics: SelectedMetric[]) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState("platform");
	const [searchTerm, setSearchTerm] = useState("");
	// const [showCustomizeModal, setShowCustomizeModal] = useState(false);
	// const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([]);
	// const [savedTableViews, setSavedTableViews] = useState<any[]>([]);
	const [adPlatform, setAdPlatform] = useState([]);
	const [campaignNames, setCampaignNames] = useState<string[]>(["..."]);
	const [adAccountIDs, setADAccountIDs] = useState<
		{
			id: string;
			name: string;
			number: string | number;
			platform: string;
			icon: any;
		}[]
	>([]);
	const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(
		selectedModalFilters?.campaigns || []
	);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
		selectedModalFilters?.platforms || []
	);
	const [selectedAdAccounts, setSelectedAdAccounts] = useState<{
		facebook?: string[];
		google?: string[];
	}>(selectedModalFilters?.adAccounts || {});
	const [selectedEvents, setSelectedEvents] = useState<string[]>(
		selectedModalFilters?.events || []
	);
	const [campaignSubFilter, setCampaignSubFilter] = useState("contains");
	const [campaignNameFilter, setCampaignNameFilter] = useState("");
	const [selectedEventType, setSelectedEventType] = useState(
		"Lead form submission"
	);

	// const [visibleAdAccountCount, setVisibleAdAccountCount] = useState(20);
	const [visibleCampaignCount, setVisibleCampaignCount] = useState(20);
	const filterCategories = [
		{
			id: "platform",
			name: "Platform",
		},
		{
			id: "ad-accounts",
			name: "Ad Accounts",
		},
		{
			id: "campaigns",
			name: "Campaigns",
		},
		// {
		// 	id: "events",
		// 	name: "Events",
		// },
	];
	const eventTypes = [
		"Lead form submission",
		"Application",
		"Booked call",
		"Sale",
		"Offer Made",
	];

	useEffect(() => {
		// setVisibleAdAccountCount(20);
		setVisibleCampaignCount(20);
	}, [selectedFilter, searchTerm]);
	const getFilteredData = () => {
		switch (selectedFilter) {
			case "platform":
				return platforms.filter((platform) => {
					const matchesSearch = platform.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase());

					const matchesPlatform = adPlatform.some(
						(adPlat: string) => {
							const adPlatLower = adPlat.toLowerCase();
							const platformName = platform.name.toLowerCase();

							if (adPlatLower === "meta") {
								return platformName === "facebook";
							}
							if (adPlatLower === "google") {
								return platformName === "google";
							}

							return adPlatLower === platformName;
						}
					);
					console.log(matchesPlatform, matchesSearch);
					return matchesSearch && matchesPlatform;
				});
			case "ad-accounts":
				return adAccountIDs.filter(
					(account) =>
						account.name
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						String(account.number).includes(searchTerm)
				);
			case "campaigns":
				if (campaignSubFilter === "contains") {
					return [];
				}
				return campaignNames.filter((campaign) =>
					campaign.toLowerCase().includes(searchTerm.toLowerCase())
				);
			case "events":
				const currentEvents =
					eventsByType[
						selectedEventType as keyof typeof eventsByType
					] || [];
				return currentEvents.filter((event: any) =>
					event.name.toLowerCase().includes(searchTerm.toLowerCase())
				);
			default:
				return [];
		}
	};
	const getSelectedData = () => {
		switch (selectedFilter) {
			case "platform":
				return selectedPlatforms
					.map((id) => platforms.find((p) => p.id === id))
					.filter(Boolean);
			case "ad-accounts":
				const allSelectedAccounts = [
					...(selectedAdAccounts.facebook || []),
					...(selectedAdAccounts.google || []),
				];
				return allSelectedAccounts
					.map((number) =>
						adAccountIDs.find((a) => a.number === number)
					)
					.filter(Boolean);
			case "campaigns":
				return selectedCampaigns;
			case "events":
				const allEvents = Object.values(eventsByType).flat();
				return selectedEvents
					.map((id) => allEvents.find((e) => e.id === id))
					.filter(Boolean);
			default:
				return [];
		}
	};
	const handleItemToggle = (item: any) => {
		switch (selectedFilter) {
			case "platform":
				setSelectedPlatforms((prev) =>
					prev.includes(item.id)
						? prev.filter((id) => id !== item.id)
						: [...prev, item.id]
				);
				break;
			case "ad-accounts":
				setSelectedAdAccounts((prev) => {
					const number = item.number;
					const platform = item.platform as "facebook" | "google";
					if (!number || !platform) return prev;

					const currentPlatformAccounts = prev[platform] || [];
					const isSelected = currentPlatformAccounts.includes(number);

					return {
						...prev,
						[platform]: isSelected
							? currentPlatformAccounts.filter(
									(n) => n !== number
							  )
							: [...currentPlatformAccounts, number],
					};
				});
				break;
			case "campaigns":
				setSelectedCampaigns((prev) =>
					prev.includes(item)
						? prev.filter((c) => c !== item)
						: [...prev, item]
				);
				break;
			case "events":
				setSelectedEvents((prev) =>
					prev.includes(item.id)
						? prev.filter((id) => id !== item.id)
						: [...prev, item.id]
				);
				break;
		}
	};
	const isItemSelected = (item: any) => {
		switch (selectedFilter) {
			case "platform":
				return selectedPlatforms.includes(item.id);
			case "ad-accounts":
				const platform = item.platform as "facebook" | "google";
				return (
					selectedAdAccounts[platform]?.includes(item.number) || false
				);
			case "campaigns":
				return selectedCampaigns.includes(item);
			case "events":
				return selectedEvents.includes(item.id);
			default:
				return false;
		}
	};
	const handleRemoveItem = (item: any) => {
		switch (selectedFilter) {
			case "platform":
				setSelectedPlatforms((prev) =>
					prev.filter((id) => id !== item.id)
				);
				break;
			case "ad-accounts":
				setSelectedAdAccounts((prev) => {
					const platform = item.platform as "facebook" | "google";
					const currentPlatformAccounts = prev[platform] || [];
					return {
						...prev,
						[platform]: currentPlatformAccounts.filter(
							(number) => number !== item.number
						),
					};
				});
				break;
			case "campaigns":
				setSelectedCampaigns((prev) => prev.filter((c) => c !== item));
				break;
			case "events":
				setSelectedEvents((prev) =>
					prev.filter((id) => id !== item.id)
				);
				break;
		}
	};
	const renderFilterContent = () => {
		if (selectedFilter === "campaigns") {
			return (
				<div className="space-y-4">
					<div className="flex border-b border-gray-200">
						{/* <button
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								campaignSubFilter === "list"
									? "border-blue-500 text-blue-600 bg-blue-50"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
							}`}
							onClick={() => setCampaignSubFilter("list")}
						>
							Campaign List
						</button> */}
						<button
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								campaignSubFilter === "contains"
									? "border-blue-500 text-blue-600 bg-blue-50"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
							}`}
							onClick={() => setCampaignSubFilter("contains")}
						>
							Campaign Name Contains
						</button>
					</div>

					{campaignSubFilter === "list" && (
						<div className="space-y-2">
							{/* Scroll container with load more */}
							<div
								className="max-h-[320px] overflow-y-auto"
								onScroll={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (
										el.scrollTop + el.clientHeight >=
										el.scrollHeight - 20
									) {
										setVisibleCampaignCount((prev) =>
											Math.min(
												prev + 10,
												campaignNames.filter(
													(campaign) =>
														campaign
															.toLowerCase()
															.includes(
																searchTerm.toLowerCase()
															)
												).length
											)
										);
									}
								}}
							>
								{campaignNames
									.filter((campaign) =>
										campaign
											.toLowerCase()
											.includes(searchTerm.toLowerCase())
									)
									.slice(0, visibleCampaignCount)
									.map((campaign, idx) => (
										<div
											key={`${campaign}-${idx}`}
											className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
											onClick={() =>
												handleItemToggle(campaign)
											}
										>
											<Checkbox
												checked={isItemSelected(
													campaign
												)}
												onChange={() => {}}
											/>
											<span className="text-sm font-medium">
												{campaign}
											</span>
										</div>
									))}
							</div>
						</div>
					)}

					{campaignSubFilter === "contains" && (
						<div className="space-y-3">
							<Input
								placeholder="Enter campaign name to filter..."
								value={campaignNameFilter}
								onChange={(e) =>
									setCampaignNameFilter(e.target.value)
								}
								className="w-full"
							/>
							<div className="text-sm text-gray-600">
								This will filter campaigns containing: "
								{campaignNameFilter}"
							</div>
							{campaignNameFilter === "" ? null : (
								<div className="max-h-[300px] overflow-y-auto space-y-2">
									{campaignNames
										.filter((c) =>
											c
												.toLowerCase()
												.includes(
													campaignNameFilter.toLowerCase()
												)
										)
										.slice(0, visibleCampaignCount)
										.map((campaign, idx) => (
											<div
												key={`${campaign}-${idx}`}
												className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
												onClick={() =>
													handleItemToggle(campaign)
												}
											>
												{/* <Checkbox
													checked={isItemSelected(
														campaign
													)}
													onChange={() =>
														handleItemToggle(
															campaign
														)
													}
												/> */}
												<span className="text-sm">
													{campaign}
												</span>
											</div>
										))}
									{campaignNames.filter((c) =>
										c
											.toLowerCase()
											.includes(
												campaignNameFilter.toLowerCase()
											)
									).length === 0 && (
										<div className="text-sm text-gray-500 p-3">
											No campaigns match.
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			);
		}
		if (selectedFilter === "events") {
			return (
				<div className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							Event Type
						</label>
						<Select
							value={selectedEventType}
							onValueChange={setSelectedEventType}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="bg-white">
								{eventTypes.map((type) => (
									<SelectItem
										key={type}
										value={type}
										className="cursor-pointer"
									>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							{selectedEventType === "Sale"
								? "Product Names"
								: "Event Names"}
						</label>
						{(
							eventsByType[
								selectedEventType as keyof typeof eventsByType
							] || []
						)
							.filter((event: any) =>
								event.name
									.toLowerCase()
									.includes(searchTerm.toLowerCase())
							)
							.map((event: any) => (
								<div
									key={event.id}
									className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
									onClick={() => handleItemToggle(event)}
								>
									<Checkbox
										checked={isItemSelected(event)}
										onChange={() => {}}
									/>
									<span className="text-sm font-medium">
										{event.name}
									</span>
								</div>
							))}
					</div>
				</div>
			);
		}
		const filteredData = getFilteredData();
		return (
			<div className="space-y-4">
				{/* Wrap list in an internal scroll area so we can detect bottom scroll */}
				<div
					className="max-h-[360px] overflow-y-auto"
					// onScroll={(e) => {
					// 	if (selectedFilter !== "ad-accounts") return;
					// 	const el = e.currentTarget as HTMLElement;
					// 	if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
					// 		setVisibleAdAccountCount((prev) =>
					// 			Math.min(prev + 10, filteredData.length)
					// 		);
					// 	}
					// }}
				>
					{selectedFilter === "ad-accounts"
						? (() => {
								const list = filteredData as any[];
								// const sliced = list.slice(0, visibleAdAccountCount);
								const grouped = list.reduce(
									(acc: any, a: any) => {
										const key = (
											a.platform || "other"
										).toLowerCase();
										if (!acc[key]) acc[key] = [];
										acc[key].push(a);
										return acc;
									},
									{} as Record<string, any[]>
								);
								const order = ["google", "facebook"];
								return (
									<div className="grid grid-cols-1 gap-4">
										{order.map((plat) => (
											<div key={plat}>
												<div className="text-sm font-semibold mb-2 capitalize">
													{plat === "google"
														? "Google"
														: "Facebook"}
												</div>

												<div className="grid grid-cols-2 gap-2">
													{(grouped[plat] || []).map(
														(item: any) => (
															<div
																key={item.id}
																className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
																onClick={() =>
																	handleItemToggle(
																		item
																	)
																}
															>
																<Checkbox
																	checked={isItemSelected(
																		item
																	)}
																	onChange={() => {}}
																/>
																{item.icon}
																<div className="flex flex-col">
																	<span className="text-sm font-medium">
																		{
																			item.name
																		}
																	</span>
																	<span className="text-xs text-gray-500">
																		{
																			item.number
																		}
																	</span>
																</div>
															</div>
														)
													)}
												</div>
											</div>
										))}
									</div>
								);
						  })()
						: filteredData.map((item: any) => {
								if (selectedFilter === "platform") {
									console.log(item);
									const IconComponent = item.icon;
									return (
										<div
											key={item.id}
											className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
											onClick={() =>
												handleItemToggle(item)
											}
										>
											<Checkbox
												checked={isItemSelected(item)}
												onChange={() => {}}
											/>
											{item.name === "Facebook" ||
											"Google" ? (
												item.icon
											) : (
												<IconComponent className="w-4 h-4 text-gray-600" />
											)}
											<span className="text-sm font-medium">
												{item.name}
											</span>
										</div>
									);
								}
								if (selectedFilter === "campaigns") {
									return (
										<div
											key={item}
											className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
											onClick={() =>
												handleItemToggle(item)
											}
										>
											<Checkbox
												checked={isItemSelected(item)}
												onChange={() => {}}
											/>
											<span className="text-sm font-medium">
												{item}
											</span>
										</div>
									);
								}
								return null;
						  })}
				</div>
			</div>
		);
	};
	const renderSelectedItems = () => {
		const selectedData = getSelectedData();
		if (selectedData.length === 0) {
			return (
				<div className="text-center text-gray-500 text-sm py-8">
					No items selected
				</div>
			);
		}
		return (
			<div className="space-y-2">
				{selectedData.map((item: any) => {
					if (selectedFilter === "platform") {
						const IconComponent = item.icon;
						return (
							<div
								key={item.id}
								className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
							>
								<div className="flex items-center gap-2">
									<IconComponent className="w-4 h-4 text-blue-600" />
									<span className="text-sm font-medium text-blue-700">
										{item.name}
									</span>
								</div>
								<X
									className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800"
									onClick={() => handleRemoveItem(item)}
								/>
							</div>
						);
					}
					if (selectedFilter === "ad-accounts") {
						return (
							<div
								key={item.id}
								className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
							>
								<div className="flex items-center gap-2">
									{item.icon}
									<div className="flex flex-col">
										<span className="text-sm font-medium text-blue-700">
											{item.name}
										</span>
										<span className="text-xs text-blue-600">
											{item.number}
										</span>
									</div>
								</div>
								<X
									className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800"
									onClick={() => handleRemoveItem(item)}
								/>
							</div>
						);
					}
					if (selectedFilter === "campaigns") {
						return (
							<div
								key={item}
								className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
							>
								<span className="text-sm font-medium text-blue-700">
									{item}
								</span>
								<X
									className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800"
									onClick={() => handleRemoveItem(item)}
								/>
							</div>
						);
					}
					if (selectedFilter === "events") {
						return (
							<div
								key={item.id}
								className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
							>
								<span className="text-sm font-medium text-blue-700">
									{item.name}
								</span>
								<X
									className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800"
									onClick={() => handleRemoveItem(item)}
								/>
							</div>
						);
					}
					return null;
				})}
			</div>
		);
	};
	const getTotalSelected = () => {
		const adAccountsCount =
			(selectedAdAccounts.facebook?.length || 0) +
			(selectedAdAccounts.google?.length || 0);
		return (
			selectedPlatforms.length +
			adAccountsCount +
			selectedCampaigns.length +
			selectedEvents.length
		);
	};

	useEffect(() => {
		if (selectedModalFilters) {
			setSelectedPlatforms(selectedModalFilters.platforms || []);
			setSelectedAdAccounts(selectedModalFilters.adAccounts || {});
			setSelectedCampaigns(selectedModalFilters.campaigns || []);
			setSelectedEvents(selectedModalFilters.events || []);
		}
	}, [selectedModalFilters]);

	useEffect(() => {
		try {
			const getCampaignNames = async () => {
				const nameResponse = await metricsTableApi.getCampaignNames();
				setCampaignNames(nameResponse.data);
			};
			const getAdAccountID = async () => {
				try {
					const idResponse = await metricsTableApi.getAdAccountID();
					const rawAdAccounts = idResponse.data;

					// Transform the raw adAccounts data into the desired format
					const transformedAdAccounts = Object.entries(
						rawAdAccounts
					).flatMap(([platform, accounts]) =>
						(Array.isArray(accounts) ? accounts : []).map(
							(account: any, idx: number) => {
								const idValue =
									account?.ads_account_id?.Int64 ??
									account?.ads_account_id?.String ??
									`unknown-${idx}`;
								const nameValue =
									account?.name?.String ?? `account-${idx}`;
								return {
									// include platform + idValue + local index to guarantee uniqueness
									id: `${platform}-${idValue}-${idx}`,
									name: nameValue,
									number: String(idValue), // Convert to string for consistency
									platform,
									icon: getPlatformIcon(platform),
								};
							}
						)
					);

					// Update the state with the transformed adAccounts
					setADAccountIDs(transformedAdAccounts);
				} catch (error) {
					console.error("Failed to fetch ad accounts:", error);
				}
			};

			const getAdPlatforms = async () => {
				try {
					const response = await metricsTableApi.getAdPlatforms();
					setAdPlatform(response.data.platforms);
				} catch (error) {
					console.log(error);
				}
			};

			// Helper function to map platform to its icon
			const getPlatformIcon = (platform: string) => {
				switch (platform) {
					case "facebook":
						return (
							<img
								src="/logo/meta.svg"
								alt="Facebook"
								width={16}
								height={16}
							/>
						);
					case "google":
						return (
							<img
								src="/logo/google.svg"
								alt="Google"
								width={16}
								height={16}
							/>
						);
					default:
						return null;
				}
			};
			getAdPlatforms();
			getCampaignNames();
			getAdAccountID();
		} catch (error) {
			console.log(error);
		}
	}, []);

	// const handleMetricsChange = (metrics: SelectedMetric[]) => {
	// 	setSelectedMetrics(metrics); // Update local state
	// 	onMetricsChange(metrics); // Pass metrics to parent
	// };

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-3 text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
					>
						<Plus className="w-3 h-3 mr-1" />
						ADD FILTER
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white">
					<DialogHeader className="px-6 py-4 border-b border-gray-200">
						<DialogTitle className="text-lg font-medium text-gray-900">
							Add Filter
						</DialogTitle>
					</DialogHeader>

					<div className="flex h-[600px]">
						{/* Filter Categories */}
						<div className="w-64 border-r border-gray-200 bg-white">
							<div className="p-4 border-b border-gray-100">
								<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
									FILTER TYPE
								</h3>
								<div className="space-y-1">
									{filterCategories.map((category) => (
										<div
											key={category.id}
											className={cn(
												"px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors",
												selectedFilter === category.id
													? "bg-blue-50 text-blue-600 font-medium"
													: "text-gray-700"
											)}
											onClick={() => {
												setSelectedFilter(category.id);
												setSearchTerm("");
											}}
										>
											{category.name}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Filter Options */}
						<div className="flex-1 border-r border-gray-200 bg-white">
							<div className="px-4 pt-4">
								<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
									{filterCategories
										.find((c) => c.id === selectedFilter)
										?.name.toUpperCase()}{" "}
									OPTIONS
								</h3>
								{/* <div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
									<Input
										placeholder={`Search ${filterCategories
											.find(
												(c) => c.id === selectedFilter
											)
											?.name.toLowerCase()}...`}
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="pl-10 h-9 text-sm bg-white border-gray-300"
									/>
								</div> */}
							</div>

							<div className="p-4 max-h-[480px] overflow-y-auto">
								{renderFilterContent()}
							</div>
						</div>

						{/* Selected Items */}
						<div className="w-80 bg-white">
							<div className="p-4 border-b border-gray-100">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
										SELECTED FILTERS
									</h3>
									{getTotalSelected() > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setSelectedPlatforms([]);
												setSelectedAdAccounts({});
												setSelectedCampaigns([]);
												setSelectedEvents([]);
											}}
											className="text-xs text-red-600 hover:text-red-700 p-0 h-auto"
										>
											Clear all
										</Button>
									)}
								</div>
								<div className="text-xs text-gray-600">
									({getTotalSelected()}) Selected items
								</div>
							</div>

							<div className="p-4 max-h-[480px] overflow-y-auto">
								{renderSelectedItems()}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							className="px-6 py-2 text-sm border-gray-300 hover:bg-gray-50"
						>
							CANCEL
						</Button>
						<Button
							onClick={() => {
								onModalFiltersChange?.({
									platforms: selectedPlatforms,
									adAccounts: selectedAdAccounts,
									campaigns: selectedCampaigns,
									events: selectedEvents,
								});
								setIsOpen(false);
							}}
							className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
						>
							APPLY
						</Button>
						{/* <Button
							onClick={() => {
								onModalFiltersChange?.({
									platforms: selectedPlatforms,
									adAccounts: selectedAdAccounts,
									campaigns: selectedCampaigns,
									events: selectedEvents,
								});
								setShowCustomizeModal(true);
								setIsOpen(false);
							}}
							className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
						>
							Next
						</Button> */}
					</div>
				</DialogContent>
			</Dialog>
			{/* <CustomizeTableModal
				open={showCustomizeModal}
				onOpenChange={setShowCustomizeModal}
				selectedMetrics={selectedMetrics}
				onMetricsChange={handleMetricsChange}
				savedViews={savedTableViews}
				onSaveView={(view: any) => {
					// Logic to save a view
					setSavedTableViews((prev) => [...prev, view]);
				}}
				onLoadView={(viewId: any) => {
					const view = savedTableViews.find((v) => v.id === viewId);
					if (view && view.metrics) {
						setSelectedMetrics(view.metrics);
					}
					return view; // Return the view so the modal can access it
				}}
			/> */}
		</>
	);
};
const SaveViewDialog = ({ onSave }: { onSave: (name: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [viewName, setViewName] = useState("");
	const handleSave = () => {
		if (viewName.trim()) {
			onSave(viewName.trim());
			setViewName("");
			setIsOpen(false);
		}
	};
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-9 px-6 text-xs font-medium text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
				>
					Save View
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Save View</DialogTitle>
					<DialogDescription>
						Give your view a name to save the current filter
						settings.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<Label htmlFor="viewName">View Name</Label>
						<Input
							id="viewName"
							value={viewName}
							onChange={(e) => setViewName(e.target.value)}
							placeholder="Enter view name..."
							className="w-full"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!viewName.trim()}>
						Save View
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export const DashboardFilters = ({
	filters,
	onFilterChange,
	savedViews,
	onSaveView,
	onLoadView,
	onGenerateReport,
	isCollapsed,
	onToggleCollapse,
	hasGeneratedReport = false,
	reportName = "",
	selectedModalFilters,
	onModalFiltersChange,
	onMetricsChange,
	onDeleteView,
}: DashboardFiltersProps) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [customStartDate, setCustomStartDate] = useState<Date>();
	const [customEndDate, setCustomEndDate] = useState<Date>();
	const [timePeriodOpen, setTimePeriodOpen] = useState(false);
	const [tempTimePeriod, setTempTimePeriod] = useState(filters.timePeriod);
	const [showCustomizeModal, setShowCustomizeModal] = useState(false);
	const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>(
		[]
	);
	const [savedTableViews, setSavedTableViews] = useState<any[]>([]);
	const [selectedViewName, setSelectedViewName] = useState<string>("");

	const handleMetricsChange = (metrics: SelectedMetric[]) => {
		setSelectedMetrics(metrics); // Update local state
		onMetricsChange(metrics); // Pass metrics to parent
	};

	const handleUpdatedMetrics = (
		metrics: any,
		changedMetrics: SelectedMetric[]
	) => {
		const { start, end } = getSelectedDateRange();
		onGenerateReport(metrics, start, end, changedMetrics);
	};
	// const handleCustomDateChange = (
	// 	start: Date | undefined,
	// 	end: Date | undefined
	// ) => {
	// 	setCustomStartDate(start);
	// 	setCustomEndDate(end);
	// };
	const getSelectedDateRange = () => {
		if (filters.timePeriod === "custom") {
			return {
				start: customStartDate,
				end: customEndDate,
			};
		}
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		switch (filters.timePeriod) {
			case "today":
				return {
					start: today,
					end: today,
				};
			case "yesterday":
				return {
					start: yesterday,
					end: yesterday,
				};
			case "2d":
				const twoDaysStart = new Date(today);
				twoDaysStart.setDate(twoDaysStart.getDate() - 2);
				return {
					start: twoDaysStart,
					end: yesterday,
				};
			case "4d":
				const fourDaysStart = new Date(today);
				fourDaysStart.setDate(fourDaysStart.getDate() - 4);
				return {
					start: fourDaysStart,
					end: yesterday,
				};
			case "7d":
				const weekStart = new Date(today);
				weekStart.setDate(weekStart.getDate() - 7);
				return {
					start: weekStart,
					end: yesterday,
				};
			case "14d":
				const twoWeeksStart = new Date(today);
				twoWeeksStart.setDate(twoWeeksStart.getDate() - 14);
				return {
					start: twoWeeksStart,
					end: yesterday,
				};
			case "30d":
				const monthStart = new Date(today);
				monthStart.setDate(monthStart.getDate() - 30);
				return {
					start: monthStart,
					end: yesterday,
				};
			case "60d":
				const twoMonthsStart = new Date(today);
				twoMonthsStart.setDate(twoMonthsStart.getDate() - 60);
				return {
					start: twoMonthsStart,
					end: yesterday,
				};
			case "6m":
				const sixMonthsStart = new Date(today);
				sixMonthsStart.setMonth(sixMonthsStart.getMonth() - 6);
				return {
					start: sixMonthsStart,
					end: yesterday,
				};
			case "1y":
				const oneYearStart = new Date(today);
				oneYearStart.setFullYear(oneYearStart.getFullYear() - 1);
				return {
					start: oneYearStart,
					end: yesterday,
				};
			default:
				return {
					start: today,
					end: today,
				};
		}
	};
	const getCurrentDateDisplay = () => {
		const { start, end } = getSelectedDateRange();
		if (filters.timePeriod === "custom" && start && end) {
			return `${format(start, "MMM dd")} - ${format(
				end,
				"MMM dd, yyyy"
			)}`;
		}
		if (start && end) {
			if (start.getTime() === end.getTime()) {
				return format(start, "MMM dd, yyyy");
			}
			return `${format(start, "MMM dd")} - ${format(
				end,
				"MMM dd, yyyy"
			)}`;
		}
		return "Select date range";
	};
	// const getComparisonDateDisplay = () => {
	// 	const today = new Date();
	// 	switch (filters.timeComparison) {
	// 		case "previous-period":
	// 			const prevDay = new Date(today);
	// 			prevDay.setDate(prevDay.getDate() - 1);
	// 			return format(prevDay, "MMM dd, yyyy");
	// 		case "previous-year":
	// 			const prevYear = new Date(today);
	// 			prevYear.setFullYear(prevYear.getFullYear() - 1);
	// 			return format(prevYear, "MMM dd, yyyy");
	// 		default:
	// 			return format(today, "MMM dd, yyyy");
	// 	}
	// };
	const handleDeleteSavedView = async (viewId: string) => {
		try {
			// Call the delete API
			await normalizedApi.deleteTemplate(viewId);

			// Since savedViews is a prop, we need to call a callback to update the parent
			// You'll need to add this prop to DashboardFiltersProps
			onDeleteView?.(viewId);
		} catch (error) {
			console.error("Failed to delete saved view:", error);
		}
	};
	return (
		<div className="bg-white border border-gray-200 shadow-sm border-solid">
			{/* Header - Only show after report is generated */}
			{hasGeneratedReport && (
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<h1 className="text-lg font-semibold text-gray-900">
							{reportName || "Report Overview"}
						</h1>
						<button onClick={onToggleCollapse}>
							{isCollapsed ? (
								<ChevronDown className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
							) : (
								<ChevronUp className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
							)}
						</button>
					</div>
					<div className="flex items-center gap-2"></div>
				</div>
			)}

			{/* Filter By Section - Only show when not collapsed or when no report generated */}
			{(!hasGeneratedReport || !isCollapsed) && (
				<div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
								Filter By
							</span>
							<FilterDialog
								selectedModalFilters={selectedModalFilters}
								onModalFiltersChange={onModalFiltersChange}
								// onMetricsChange={onMetricsChange}
							/>
						</div>
						{/* Saved Views - Small and on the right */}
						{/* {savedViews.length > 0 && ( */}
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-gray-500">
								Saved Views:
							</span>
							<div className="relative">
								<button
									onClick={() =>
										setIsDropdownOpen(!isDropdownOpen)
									}
									className="h-8 text-xs border-gray-200 bg-white shadow-sm rounded-md hover:border-gray-300 transition-colors min-w-[150px] px-3 py-1 border flex items-center justify-between"
								>
									<span className="text-gray-500">
										{selectedViewName ||
											(savedViews.length > 0
												? "Select the template"
												: "No Items")}
									</span>
								</button>

								{isDropdownOpen && (
									<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50">
										{savedViews.map((view) => (
											<div
												key={view.id}
												className="text-xs rounded-md hover:bg-gray-50 px-3 py-2 flex items-center justify-between"
											>
												<button
													onClick={() => {
														onLoadView(view.id);
														setSelectedViewName(
															view.templatename
														);
														setIsDropdownOpen(
															false
														);
													}}
													className="flex-1 text-left"
												>
													{view.templatename}
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteSavedView(
															view.id
														);
													}}
													className="text-red-600 hover:text-red-800 ml-2"
												>
													<X className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
						{/* )} */}
					</div>
				</div>
			)}

			{/* Selected Filters Display - Only showing filters from the add filter modal */}
			{selectedModalFilters && (
				<div className="px-6 py-3 border-b border-gray-100 bg-blue-50/30">
					<div className="flex flex-wrap gap-2">
						{/* Platform Filter */}
						{selectedModalFilters.platforms.length > 0 && (
							<div className="bg-white border border-blue-200 rounded-md px-3 py-1.5 flex items-center justify-between">
								<span className="text-xs font-medium text-blue-700">
									Platform:{" "}
									{selectedModalFilters.platforms
										.map((id) => {
											console.log(selectedModalFilters);
											const platform = platforms.find(
												(p) => p.id === id
											);
											return platform?.name;
										})
										.filter(Boolean)
										.join(", ")}
								</span>
								<button
									onClick={() =>
										onModalFiltersChange?.({
											...selectedModalFilters,
											platforms: [],
										})
									}
									className="ml-2 text-blue-600 hover:text-blue-800"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						)}

						{/* Ad Accounts Filter */}
						{(selectedModalFilters.adAccounts.facebook?.length ||
							0) > 0 ||
							((selectedModalFilters.adAccounts.google?.length ||
								0) > 0 && (
								<div className="bg-white border border-blue-200 rounded-md px-3 py-1.5 flex items-center justify-between">
									<span className="text-xs font-medium text-blue-700">
										Ad Accounts:{" "}
										{[
											...(selectedModalFilters.adAccounts
												.facebook || []),
											...(selectedModalFilters.adAccounts
												.google || []),
										]
											.map((number) => {
												console.log("number", number);
												const account = adAccounts.find(
													(a) => a.number === number
												);
												return account?.name || number;
											})
											.filter(Boolean)
											.join(", ")}
									</span>
									<button
										onClick={() =>
											onModalFiltersChange?.({
												...selectedModalFilters,
												adAccounts: {
													facebook: [],
													google: [],
												},
											})
										}
										className="ml-2 text-blue-600 hover:text-blue-800"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
						{(selectedModalFilters.adAccounts.facebook?.length ||
							0) > 0 &&
							(selectedModalFilters.adAccounts.google?.length ||
								0) > 0 && (
								<div className="bg-white border border-blue-200 rounded-md px-3 py-1.5 flex items-center justify-between">
									<span className="text-xs font-medium text-blue-700">
										Ad Accounts:{" "}
										{[
											...(selectedModalFilters.adAccounts
												.facebook || []),
											...(selectedModalFilters.adAccounts
												.google || []),
										]
											.map((number) => {
												console.log("number", number);
												const account = adAccounts.find(
													(a) => a.number === number
												);
												return account?.name || number;
											})
											.filter(Boolean)
											.join(", ")}
									</span>
									<button
										onClick={() =>
											onModalFiltersChange?.({
												...selectedModalFilters,
												adAccounts: {
													facebook: [],
													google: [],
												},
											})
										}
										className="ml-2 text-blue-600 hover:text-blue-800"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}

						{/* Campaigns Filter */}
						{selectedModalFilters.campaigns.length > 0 && (
							<div className="bg-white border border-blue-200 rounded-md px-3 py-1.5 flex items-center justify-between">
								<span className="text-xs font-medium text-blue-700">
									Campaigns:{" "}
									{selectedModalFilters.campaigns.join(", ")}
								</span>
								<button
									onClick={() =>
										onModalFiltersChange?.({
											...selectedModalFilters,
											campaigns: [],
										})
									}
									className="ml-2 text-blue-600 hover:text-blue-800"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						)}

						{/* Events Filter */}
						{selectedModalFilters.events.length > 0 && (
							<div className="bg-white border border-blue-200 rounded-md px-3 py-1.5 flex items-center justify-between">
								<span className="text-xs font-medium text-blue-700">
									Events:{" "}
									{selectedModalFilters.events
										.map((id) => {
											const allEvents =
												Object.values(
													eventsByType
												).flat();
											const event = allEvents.find(
												(e) => e.id === id
											);
											return event?.name;
										})
										.filter(Boolean)
										.join(", ")}
								</span>
								<button
									onClick={() =>
										onModalFiltersChange?.({
											...selectedModalFilters,
											events: [],
										})
									}
									className="ml-2 text-blue-600 hover:text-blue-800"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Filter Controls - Show/Hide based on isCollapsed */}
			{(!hasGeneratedReport || !isCollapsed) && (
				<div className="px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-8">
							<div className="flex items-center gap-3">
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
									Attribution Model
								</span>
								<Select
									value={filters.attributionModel}
									onValueChange={(value) => {
										onFilterChange(
											"attributionModel",
											value
										);
										// Set default window for biggest-impact
										if (
											value === "biggest_impact" &&
											filters.attributionWindow !==
												"30-day"
										) {
											onFilterChange(
												"attributionWindow",
												"30-day"
											);
										}
									}}
								>
									<SelectTrigger className="h-9 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors min-w-[130px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
										<SelectItem
											value="biggest_impact"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											Biggest Impact
										</SelectItem>
										<SelectItem
											value="last_click"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											Last Click
										</SelectItem>
										<SelectItem
											value="first_click"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											First Click
										</SelectItem>
										<SelectItem
											value="linear"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											Linear
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{filters.attributionModel === "biggest_impact" && (
								<div className="flex items-center gap-3">
									<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
										Attribution Window
									</span>
									<Select
										value={filters.attributionWindow}
										onValueChange={(value) =>
											onFilterChange(
												"attributionWindow",
												value
											)
										}
									>
										<SelectTrigger className="h-9 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors min-w-[70px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
											<SelectItem
												value="7-day"
												className="text-xs rounded-md hover:bg-gray-50"
											>
												7 day
											</SelectItem>
											<SelectItem
												value="14-day"
												className="text-xs rounded-md hover:bg-gray-50"
											>
												14 day
											</SelectItem>
											<SelectItem
												value="30-day"
												className="text-xs rounded-md hover:bg-gray-50"
											>
												30 day
											</SelectItem>
											<SelectItem
												value="60-day"
												className="text-xs rounded-md hover:bg-gray-50"
											>
												60 day
											</SelectItem>
											<SelectItem
												value="90-day"
												className="text-xs rounded-md hover:bg-gray-50"
											>
												90 day
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							<div className="flex items-center gap-3">
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
									Traffic Filter
								</span>
								<Select
									value={filters.trafficFilter}
									onValueChange={(value) =>
										onFilterChange("trafficFilter", value)
									}
								>
									<SelectTrigger className="h-9 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors min-w-[120px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
										<SelectItem
											value="all"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											All traffic
										</SelectItem>
										<SelectItem
											value="paid"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											Paid only
										</SelectItem>
										<SelectItem
											value="organic"
											className="text-xs rounded-md hover:bg-gray-50"
										>
											Organic only
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Time Controls */}
					<div className="mt-4 flex items-center gap-6">
						<div className="flex items-center gap-3">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Time Period
							</span>
							<Popover
								open={timePeriodOpen}
								onOpenChange={setTimePeriodOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="h-9 px-4 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors min-w-[180px] justify-between"
									>
										<span>{getCurrentDateDisplay()}</span>
										<ChevronDown className="h-3 w-3 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0 bg-white border border-gray-200 shadow-xl rounded-xl"
									align="start"
								>
									<div className="flex">
										<div className="p-4 border-r border-gray-100 w-48">
											<div className="text-sm font-semibold text-gray-700 mb-3">
												Recently used
											</div>
											<div className="space-y-2">
												{[
													{
														value: "today",
														label: "Today",
													},
													{
														value: "yesterday",
														label: "Yesterday",
													},
													{
														value: "2d",
														label: "Last 2 days",
													},
													{
														value: "4d",
														label: "Last 4 days",
													},
													{
														value: "7d",
														label: "Last 7 days",
													},
													{
														value: "14d",
														label: "Last 14 days",
													},
													{
														value: "30d",
														label: "Last 30 days",
													},
													{
														value: "60d",
														label: "Last 60 days",
													},
													{
														value: "6m",
														label: "Last 6 months",
													},
													{
														value: "1y",
														label: "Last year",
													},
													{
														value: "custom",
														label: "Custom Range",
													},
												].map((option) => (
													<div
														key={option.value}
														className={cn(
															"px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-gray-50 transition-colors",
															tempTimePeriod ===
																option.value &&
																"bg-blue-50 text-blue-600"
														)}
														onClick={() =>
															setTempTimePeriod(
																option.value
															)
														}
													>
														{option.label}
													</div>
												))}
											</div>
										</div>
										<div className="p-4">
											{tempTimePeriod === "custom" ? (
												<div className="flex gap-4">
													<div>
														{/*  */}{" "}
														<div className="text-sm font-semibold text-gray-700 mb-3">
															Start Date
														</div>
														<Calendar
															mode="single"
															selected={
																customStartDate
															}
															onSelect={
																setCustomStartDate
															}
															className={cn(
																"p-0 pointer-events-auto rounded-lg"
															)}
															disabled={(date) =>
																date >
																new Date()
															}
															initialFocus
															modifiers={{
																range_start:
																	customStartDate
																		? [
																				customStartDate,
																		  ]
																		: [],
																range_end:
																	customEndDate
																		? [
																				customEndDate,
																		  ]
																		: [],
																range_middle:
																	customStartDate &&
																	customEndDate
																		? (() => {
																				const dates =
																					[];
																				const current =
																					new Date(
																						customStartDate
																					);
																				current.setDate(
																					current.getDate() +
																						1
																				);
																				while (
																					current <
																					customEndDate
																				) {
																					dates.push(
																						new Date(
																							current
																						)
																					);
																					current.setDate(
																						current.getDate() +
																							1
																					);
																				}
																				return dates;
																		  })()
																		: [],
															}}
															modifiersStyles={{
																range_start: {
																	backgroundColor:
																		"#3b82f6",
																	color: "white",
																},
																range_end: {
																	backgroundColor:
																		"#3b82f6",
																	color: "white",
																},
																range_middle: {
																	backgroundColor:
																		"#dbeafe",
																	color: "#1e40af",
																},
															}}
														/>
													</div>
													<div>
														<div className="text-sm font-semibold text-gray-700 mb-3">
															End Date
														</div>
														<Calendar
															mode="single"
															selected={
																customEndDate
															}
															onSelect={
																setCustomEndDate
															}
															disabled={(
																date
															) => {
																if (
																	customStartDate &&
																	date <
																		customStartDate
																)
																	return true;
																if (
																	date >
																	new Date()
																)
																	return true;
																return false;
															}}
															className={cn(
																"p-0 pointer-events-auto rounded-lg"
															)}
															modifiers={{
																range_start:
																	customStartDate
																		? [
																				customStartDate,
																		  ]
																		: [],
																range_end:
																	customEndDate
																		? [
																				customEndDate,
																		  ]
																		: [],
																range_middle:
																	customStartDate &&
																	customEndDate
																		? (() => {
																				const dates =
																					[];
																				const current =
																					new Date(
																						customStartDate
																					);
																				current.setDate(
																					current.getDate() +
																						1
																				);
																				while (
																					current <
																					customEndDate
																				) {
																					dates.push(
																						new Date(
																							current
																						)
																					);
																					current.setDate(
																						current.getDate() +
																							1
																					);
																				}
																				return dates;
																		  })()
																		: [],
															}}
															modifiersStyles={{
																range_start: {
																	backgroundColor:
																		"#3b82f6",
																	color: "white",
																},
																range_end: {
																	backgroundColor:
																		"#3b82f6",
																	color: "white",
																},
																range_middle: {
																	backgroundColor:
																		"#dbeafe",
																	color: "#1e40af",
																},
															}}
															// month={
															// 	customStartDate
															// 		? new Date(
															// 				customStartDate.getFullYear(),
															// 				customStartDate.getMonth() +
															// 					1,
															// 				1
															// 		  )
															// 		: new Date(
															// 				new Date().getFullYear(),
															// 				new Date().getMonth() +
															// 					1,
															// 				1
															// 		  )
															// }
														/>
													</div>
												</div>
											) : (
												(() => {
													const getPreviewDateRange =
														() => {
															if (
																tempTimePeriod ===
																"custom"
															) {
																return {
																	start: customStartDate,
																	end: customEndDate,
																};
															}
															const today =
																new Date();
															const yesterday =
																new Date(today);
															yesterday.setDate(
																yesterday.getDate() -
																	1
															);
															switch (
																tempTimePeriod
															) {
																case "today":
																	return {
																		start: today,
																		end: today,
																	};
																case "yesterday":
																	return {
																		start: yesterday,
																		end: yesterday,
																	};
																case "2d":
																	const twoDaysStart =
																		new Date(
																			today
																		);
																	twoDaysStart.setDate(
																		twoDaysStart.getDate() -
																			2
																	);
																	return {
																		start: twoDaysStart,
																		end: yesterday,
																	};
																case "4d":
																	const fourDaysStart =
																		new Date(
																			today
																		);
																	fourDaysStart.setDate(
																		fourDaysStart.getDate() -
																			4
																	);
																	return {
																		start: fourDaysStart,
																		end: yesterday,
																	};
																case "7d":
																	const weekStart =
																		new Date(
																			today
																		);
																	weekStart.setDate(
																		weekStart.getDate() -
																			7
																	);
																	return {
																		start: weekStart,
																		end: yesterday,
																	};
																case "14d":
																	const twoWeeksStart =
																		new Date(
																			today
																		);
																	twoWeeksStart.setDate(
																		twoWeeksStart.getDate() -
																			14
																	);
																	return {
																		start: twoWeeksStart,
																		end: yesterday,
																	};
																case "30d":
																	const monthStart =
																		new Date(
																			today
																		);
																	monthStart.setDate(
																		monthStart.getDate() -
																			30
																	);
																	return {
																		start: monthStart,
																		end: yesterday,
																	};
																case "60d":
																	const twoMonthsStart =
																		new Date(
																			today
																		);
																	twoMonthsStart.setDate(
																		twoMonthsStart.getDate() -
																			60
																	);
																	return {
																		start: twoMonthsStart,
																		end: yesterday,
																	};
																case "6m":
																	const sixMonthsStart =
																		new Date(
																			today
																		);
																	sixMonthsStart.setMonth(
																		sixMonthsStart.getMonth() -
																			6
																	);
																	return {
																		start: sixMonthsStart,
																		end: yesterday,
																	};
																case "1y":
																	const oneYearStart =
																		new Date(
																			today
																		);
																	oneYearStart.setFullYear(
																		oneYearStart.getFullYear() -
																			1
																	);
																	return {
																		start: oneYearStart,
																		end: yesterday,
																	};
																default:
																	return {
																		start: today,
																		end: today,
																	};
															}
														};

													const { start, end } =
														getPreviewDateRange();
													const selectedDates = [];
													if (start && end) {
														const currentDate =
															new Date(start);
														while (
															currentDate <= end
														) {
															selectedDates.push(
																new Date(
																	currentDate
																)
															);
															currentDate.setDate(
																currentDate.getDate() +
																	1
															);
														}
													}
													return (
														<div className="flex gap-4">
															<Calendar
																mode="multiple"
																selected={
																	selectedDates
																}
																onSelect={() => {}} // Read-only for preset periods
																className={cn(
																	"p-0 pointer-events-auto rounded-lg"
																)}
																disabled={(
																	date
																) =>
																	date >
																	new Date()
																}
																modifiers={{
																	range_start:
																		start
																			? [
																					start,
																			  ]
																			: [],
																	range_end:
																		end
																			? [
																					end,
																			  ]
																			: [],
																	range_middle:
																		selectedDates.slice(
																			1,
																			-1
																		),
																}}
																modifiersStyles={{
																	range_start:
																		{
																			backgroundColor:
																				"#3b82f6",
																			color: "white",
																		},
																	range_end: {
																		backgroundColor:
																			"#3b82f6",
																		color: "white",
																	},
																	range_middle:
																		{
																			backgroundColor:
																				"#dbeafe",
																			color: "#1e40af",
																		},
																}}
																month={
																	start ||
																	new Date()
																}
															/>
															<Calendar
																mode="multiple"
																selected={
																	selectedDates
																}
																onSelect={() => {}} // Read-only for preset periods
																className={cn(
																	"p-0 pointer-events-auto rounded-lg"
																)}
																disabled={(
																	date
																) =>
																	date >
																	new Date()
																}
																modifiers={{
																	range_start:
																		start
																			? [
																					start,
																			  ]
																			: [],
																	range_end:
																		end
																			? [
																					end,
																			  ]
																			: [],
																	range_middle:
																		selectedDates.slice(
																			1,
																			-1
																		),
																}}
																modifiersStyles={{
																	range_start:
																		{
																			backgroundColor:
																				"#3b82f6",
																			color: "white",
																		},
																	range_end: {
																		backgroundColor:
																			"#3b82f6",
																		color: "white",
																	},
																	range_middle:
																		{
																			backgroundColor:
																				"#dbeafe",
																			color: "#1e40af",
																		},
																}}
																month={
																	end ||
																	(start
																		? new Date(
																				start.getFullYear(),
																				start.getMonth() +
																					1,
																				1
																		  )
																		: new Date(
																				new Date().getFullYear(),
																				new Date().getMonth() +
																					1,
																				1
																		  ))
																}
															/>
														</div>
													);
												})()
											)}
										</div>
									</div>
									<div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setTempTimePeriod(
													filters.timePeriod
												);
												setTimePeriodOpen(false);
											}}
											className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50"
										>
											Cancel
										</Button>
										<Button
											size="sm"
											onClick={() => {
												onFilterChange(
													"timePeriod",
													tempTimePeriod
												);
												setTimePeriodOpen(false);
											}}
											className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
										>
											Update
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Compare With
							</span>
							<Select
								value={filters.timeComparison}
								onValueChange={(value) =>
									onFilterChange("timeComparison", value)
								}
							>
								<SelectTrigger className="h-9 px-4 text-xs border-gray-200 bg-white shadow-sm rounded-lg hover:border-gray-300 transition-colors min-w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
									<SelectItem
										value="no-comparison"
										className="text-xs rounded-md hover:bg-gray-50"
									>
										No comparison
									</SelectItem>
									<SelectItem
										value="previous-period"
										className="text-xs rounded-md hover:bg-gray-50"
									>
										Previous period
									</SelectItem>
									<SelectItem
										value="previous-year"
										className="text-xs rounded-md hover:bg-gray-50"
									>
										Previous year
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Generate Report and Save View Section */}
					<div className="mt-6 pt-4 border-t border-gray-100">
						<div className="flex items-center gap-4">
							<Button
								// onClick={onGenerateReport}
								onClick={() => setShowCustomizeModal(true)}
								size="sm"
								className="h-9 px-6 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
							>
								Generate Report
							</Button>
							<SaveViewDialog onSave={onSaveView} />
						</div>
					</div>

					<CustomizeTableModal
						open={showCustomizeModal}
						onOpenChange={setShowCustomizeModal}
						selectedMetrics={selectedMetrics}
						onMetricsChange={handleMetricsChange}
						onUpdatedMetrics={handleUpdatedMetrics}
						savedViews={savedTableViews}
						onSaveView={(view: any) => {
							// Logic to save a view
							setSavedTableViews((prev) => [...prev, view]);
						}}
						onLoadView={(viewId: any) => {
							const view = savedTableViews.find(
								(v) => v.id === viewId
							);
							if (view && view.metrics) {
								setSelectedMetrics(view.metrics);
							}
							return view; // Return the view so the modal can access it
						}}
					/>
				</div>
			)}
		</div>
	);
};
