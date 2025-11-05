import React, { useState, useEffect, useRef } from "react";
import {
	Button,
	TextInput,
	Card,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	// TableBody,
	// TableCell,
	// Flex,
	// ProgressCircle,
	Title,
	TabGroup,
	TabList,
	Tab,
	Text,
} from "@tremor/react";
import { Plus, Filter, Check, Search } from "lucide-react";
import {
	DropdownMenuContent,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import { useSearchParams } from "react-router-dom";

import { eventApi } from "../../services/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
	columnsMap,
	dummyDataMap,
	// getColKeyMap,
} from "../../constants/eventTable";
import ApplicationAnswersModal from "../../components/event/ApplicationAnswersModal";
import EventDialog from "../../components/event/EventDialog";
import UserJourneyModal from "../../components/event/UserJourneyModal";
import LeadFormDialog from "../../components/event/LeadFormDialog";
import SetsSourceDialog from "../../components/event/SetsSourceDialog";
import OffersMadeSourceDialog from "../../components/event/OffersMadeSourceDialog";
import SalesSourceDialog from "../../components/event/SalesSourceDialog";
import BookCallSourceDialog from "../../components/event/BookCallSourceDialog";
import ApplicationSourceDialog from "../../components/event/ApplicationSourceDialog";
// import { formatDateWithUserPreferences } from "../../utils/dateFormatter";
// import EventTableBody from "../../components/event/EventTableBody";
import EventTableBody from "../../components/event/EventTableBody";

// import { ModeToggle } from "../components/ui/mode-toggle";

const eventOptions = [
	"Users",
	"Lead Form Submissions",
	"Applications",
	"Booked Calls",
	"Sets",
	"Offers Made",
	"Sales",
	"Add To Cart",
	"Checkout Initiated",
];

const Event: React.FC = () => {
	// const navigate = useNavigate();
	// const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	// Get tab from URL parameter, default to first option
	const urlTab = searchParams.get("tab");
	const initialSelectedOption =
		urlTab && eventOptions.includes(urlTab) ? urlTab : eventOptions[0];

	const [selectedOption, setSelectedOption] = useState<string>(
		initialSelectedOption
	);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [users, setUsers] = useState<any[]>([]);
	const [leadFormSubmissions, setLeadFormSubmissions] = useState<any[]>([]); // Add state for lead form submissions
	const [applications, setApplications] = useState<any[]>([]);
	const [bookedCalls, setBookedCalls] = useState<any[]>([]);
	const [sales, setSales] = useState<any[]>([]);
	const [sets, setSets] = useState<any[]>([]);
	const [offersMade, setOffersMade] = useState<any[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(false);
	// Add new state for answers modal
	const [showAnswersModal, setShowAnswersModal] = useState(false);
	const [selectedAnswers, setSelectedAnswers] = useState<any>(null);
	const [loadingAnswers, setLoadingAnswers] = useState<string | null>(null); // Track which specific button is loading
	// Add state for event dialog
	const [showEventDialog, setShowEventDialog] = useState(false);
	const [leadFormDialog, setLeadFormDialog] = useState(false);
	const [applicationSourceDialog, setApplicationSourceDialog] =
		useState(false);
	const [bookedCallSourceDialog, setBookedCallSourceDialog] = useState(false);
	const [setsSourceDialog, setSetsSourceDialog] = useState(false);
	const [offersMadeSourceDialog, setOffersMadeSourceDialog] = useState(false);
	const [salesSourceDialog, setSalesSourceDialog] = useState(false);

	// Add state for user journey modal
	const [showUserJourneyModal, setShowUserJourneyModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState("");
	const [selectedUserName, setSelectedUserName] = useState("");
	const [selecteduserEmail, setSelectedUserEmail] = useState("");
	const pageSize = 10;
	const columns = columnsMap[selectedOption] || [];
	// Add state for tooltip
	// const [showTooltip, setShowTooltip] = useState<string | null>(null);

	// new state for inline editing Biggest Impact 30
	// const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editingField, setEditingField] = useState<{
		rowId: string | null;
		col: string | null;
	}>({
		rowId: null,
		col: null,
	});
	const [editingValue, setEditingValue] = useState<string>("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>(columns);
	const toggleColumn = (column: string) => {
		setSelectedColumns((prev) => {
			if (prev.includes(column)) {
				// Remove the column if it's already selected
				return prev.filter((col) => col !== column);
			} else {
				// Add the column back in the original order
				return columns.filter(
					(col) => prev.includes(col) || col === column
				);
			}
		});
	};
	// column widths in px
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
		() =>
			columns.reduce((acc, c) => {
				if (
					c === "First Source" ||
					c === "Last Source" ||
					c === "Biggest Impact 30"
				) {
					acc[c] = 230; // Increased width for source columns
				} else {
					acc[c] = 150;
				}
				return acc;
			}, {} as Record<string, number>)
	);
	const resizingRef = useRef<{
		col: string | null;
		startX: number;
		startWidth: number;
	} | null>(null);
	const MIN_COL_WIDTH = 150;

	// Ensure widths exist for newly selected column sets
	useEffect(() => {
		setColumnWidths((prev) => {
			const next = { ...prev };
			columns.forEach((c) => {
				if (!next[c]) next[c] = 150;
			});
			// remove widths for columns no longer present (optional)
			Object.keys(next).forEach((k) => {
				if (!columns.includes(k)) delete next[k];
			});
			return next;
		});
	}, [columns]);

	// mouse handlers
	const handleMouseDown = (e: React.MouseEvent, col: string) => {
		e.preventDefault();
		resizingRef.current = {
			col,
			startX: e.clientX,
			startWidth: columnWidths[col] ?? 150,
		};

		const onMouseMove = (ev: MouseEvent) => {
			if (!resizingRef.current) return;
			const dx = ev.clientX - (resizingRef.current.startX || 0);
			const newWidth = Math.max(
				MIN_COL_WIDTH,
				(resizingRef.current.startWidth || 150) + dx
			);
			setColumnWidths((prev) => ({
				...prev,
				[resizingRef.current!.col!]: newWidth,
			}));
			// disable text select while dragging
			document.body.style.userSelect = "none";
		};

		const onMouseUp = () => {
			resizingRef.current = null;
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
			document.body.style.userSelect = "";
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	// helper to start editing
	const startEditing = (rowId: string, col: string, currentValue: string) => {
		console.log(currentValue);
		// Set default values for specific columns if no current value is provided
		let defaultValue = currentValue ?? "No showed";
		console.log(defaultValue);
		if (!currentValue) {
			if (col === "Grade") {
				defaultValue = "0"; // Default to "Unqualified"
			} else if (col === "Confirmation") {
				defaultValue = "Not Confirmed";
			} else if (col === "Show Status") {
				defaultValue = "0";
			} else if (col === "Funnel Type") {
				defaultValue = "Call Funnel";
			} else if (col === "Qualified") {
				defaultValue = "1"; // Default to "Unqualified"
			}
		} else {
			if (col === "Grade") {
				defaultValue = currentValue === "Qualified" ? "1" : "0";
			} else if (col === "Confirmation") {
				defaultValue = "Not Confirmed";
			} else if (col === "Show Status") {
				defaultValue = currentValue === "Showed" ? "1" : "0";
			} else if (col === "Funnel Type") {
				defaultValue = "Call Funnel";
			} else if (col === "Qualified") {
				defaultValue =
					currentValue === "Qualified"
						? "1"
						: currentValue === "Unqualified"
						? "0"
						: "-1";
			}
		}

		console.log(currentValue, defaultValue);

		// Handle specific conditions for Grade and Qualified
		if (col === "Grade" && currentValue === "1") {
			defaultValue = "Qualified";
		} else if (col === "Qualified" && currentValue === "true") {
			defaultValue = "Qualified";
		} else if (col === "Show Status" && currentValue === "showed") {
			defaultValue = "Showed";
		}

		setEditingField({ rowId, col });
		setEditingValue(defaultValue);
		// setShowTooltip(null);
	};

	// cancel edit
	const cancelEditing = () => {
		setEditingField({ rowId: null, col: null });
		setEditingValue("");
	};

	// save editing for regular fields
	const saveEditing = async (
		_row: any,
		rowId: string,
		col: string
	): Promise<void> => {
		try {
			console.log("Saving field:", col, "with value:", editingValue);

			const event_type =
				urlTab === "Applications"
					? "application"
					: urlTab === "Booked Calls"
					? "booking"
					: urlTab === "Sets"
					? "set"
					: urlTab === "Sales"
					? "sale"
					: urlTab === "Offers Made"
					? "offer_made"
					: urlTab === "Lead Form Submissions"
					? "lead_form_submission"
					: "";

			const field =
				col === "Grade"
					? "grade"
					: col === "Qualified"
					? "qualified"
					: col === "Show Status"
					? "show"
					: col === "Confirmation"
					? "confirmation"
					: col === "Product Name"
					? "product_name"
					: col === "Funnel Type"
					? "funnel_type"
					: col === "Total Amount"
					? "total_amount"
					: col === "Amount Paid"
					? "amount_paid"
					: col === "Rebill Period"
					? "rebill_period"
					: col === "Rebill Price"
					? "rebill_price"
					: col === "Number of Rebills"
					? "number_of_rebills"
					: col === "Quantity"
					? "quantity"
					: col === "Cost of Goods"
					? "cost_of_goods"
					: col === "Shipping Cost"
					? "shipping_cost"
					: col === "Taxes"
					? "taxes"
					: col === "Refund"
					? "refund"
					: "";

			const value =
				col === "Show Status" && editingValue === "1"
					? 1
					: col === "Show Status" && editingValue === "0"
					? 0
					: col === "Show Status" && editingValue === "-1"
					? -1
					: col === "Qualified" && editingValue === "1"
					? 1
					: col === "Qualified" && editingValue === "0"
					? 0
					: col === "Qualified" && editingValue === "-1"
					? -1
					: editingValue;

			// Persist the changes via API
			await eventApi.updateEventField(event_type, rowId, field, value);

			// Update the local state immediately
			const updateState = (
				stateUpdater: React.Dispatch<React.SetStateAction<any[]>>
			) => {
				stateUpdater((items: any[]) =>
					items.map((item: any) => {
						if (item.id === rowId) {
							const updatedItem = { ...item };

							// Update based on the field being edited
							if (col === "Grade") {
								updatedItem.grade = editingValue;
							} else if (col === "Qualified") {
								updatedItem.qualified = value;
							} else if (col === "Show Status") {
								updatedItem.show_status =
									value === 1
										? "Showed"
										: value === 0
										? "No showed"
										: "Pending";
							} else if (col === "Confirmation") {
								updatedItem.confirmation = editingValue;
							} else if (col === "Product Name") {
								updatedItem.product_name = editingValue;
							} else if (col === "Funnel Type") {
								updatedItem.funnel_type = editingValue;
							} else if (col === "Total Amount") {
								updatedItem.total_amount = editingValue;
							} else if (col === "Amount Paid") {
								updatedItem.amount_paid = editingValue;
							} else if (col === "Rebill Period") {
								updatedItem.rebill_period = editingValue;
							} else if (col === "Rebill Price") {
								updatedItem.rebill_price = editingValue;
							} else if (col === "Number of Rebills") {
								updatedItem.number_of_rebills = editingValue;
							} else if (col === "Quantity") {
								updatedItem.quantity = editingValue;
							} else if (col === "Cost of Goods") {
								updatedItem.cost_of_goods = editingValue;
							} else if (col === "Shipping Cost") {
								updatedItem.shipping_cost = editingValue;
							} else if (col === "Taxes") {
								updatedItem.taxes = editingValue;
							} else if (col === "Refund") {
								updatedItem.refund = editingValue;
							}

							return updatedItem;
						}
						return item;
					})
				);
			};

			// Update the appropriate state based on current tab
			switch (urlTab) {
				case "Applications":
					updateState(setApplications);
					break;
				case "Booked Calls":
					updateState(setBookedCalls);
					break;
				case "Sales":
					updateState(setSales);
					break;
				case "Sets":
					updateState(setSets);
					break;
				case "Offers Made":
					updateState(setOffersMade);
					break;
				default:
					break;
			}

			// Close editing mode
			setEditingField({ rowId: null, col: null });
			setEditingValue("");
		} catch (err) {
			console.error("Failed to persist field:", err);
		}
	};

	const saveBiggestImpactEditing = async (
		row: any,
		rowId: string,
		col: string
	): Promise<void> => {
		try {
			console.log("+_+_+_+_+_+_", editingValue);

			const event_type =
				urlTab === "Applications"
					? "application"
					: urlTab === "Booked Calls"
					? "booking"
					: urlTab === "Sets"
					? "set"
					: urlTab === "Sales"
					? "sale"
					: urlTab === "Offers Mode"
					? "offer_made"
					: urlTab === "Lead Form Submissions"
					? "lead_form_submission"
					: "";
			const field =
				col === "Grade"
					? "grade"
					: col === "Qualified"
					? "qualified"
					: col === "Biggest Impact 30"
					? "biggest_impact"
					: col === "Show Status"
					? "show"
					: "";

			const value =
				col === "Show Status" && editingValue === "1"
					? 1
					: col === "Show Status" && editingValue === "0"
					? 0
					: col === "Show Status" && editingValue === "-1"
					? -1
					: col === "Qualified" && editingValue === "1"
					? 1
					: col === "Qualified" && editingValue === "0"
					? 0
					: col === "Qualified" && editingValue === "-1"
					? -1
					: editingValue;

			// Persist the changes via API
			await eventApi.updateEventField(event_type, rowId, field, value);

			// Update the local state immediately for all relevant columns
			const updateState = (
				stateUpdater: React.Dispatch<React.SetStateAction<any[]>>
			) => {
				stateUpdater((items: any[]) =>
					items.map((item: any) => {
						if (item.id === rowId) {
							const updatedItem = { ...item };

							// Update based on the field being edited
							if (col === "Grade") {
								updatedItem.grade = editingValue;
							} else if (col === "Qualified") {
								updatedItem.qualified = value;
							} else if (col === "Biggest Impact 30") {
								updatedItem.biggest_impact_ad_id =
									row.biggest_impact_ad_id || editingValue;
								updatedItem.biggest_impact_name =
									row?.biggest_impact_name || "";
								updatedItem.biggest_impact_type =
									row?.biggest_impact_type || "";
							} else if (col === "Show Status") {
								console.log(updatedItem, value);
								// updatedItem.show_status = value;
								// Update display value immediately
								updatedItem.show_status =
									value === 1
										? "Showed"
										: value === 0
										? "No showed"
										: "Pending";
								console.log(updatedItem.show_status);
							}

							return updatedItem;
						}
						return item;
					})
				);
			};

			// Update the appropriate state based on current tab
			switch (urlTab) {
				case "Applications":
					updateState(setApplications);
					break;
				case "Booked Calls":
					updateState(setBookedCalls);
					break;
				case "Sales":
					updateState(setSales);
					break;
				case "Sets":
					updateState(setSets);
					break;
				case "Offers Made":
					updateState(setOffersMade);
					break;
				default:
					break;
			}

			// Close editing mode
			setEditingField({ rowId: null, col: null });
			setEditingValue("");
		} catch (err) {
			console.error("Failed to persist field:", err);
		}
	};
	// Add helper function to truncate text
	// const truncateText = (text: string, maxLength: number = 30) => {
	// 	if (!text || text.length <= maxLength) return text;
	// 	return text.substring(0, maxLength) + "...";
	// };

	// Update tableRows to include sets and offers made data
	const tableRows =
		selectedOption === "Users"
			? users
			: selectedOption === "Lead Form Submissions"
			? leadFormSubmissions
			: selectedOption === "Applications"
			? applications
			: selectedOption === "Booked Calls"
			? bookedCalls
			: selectedOption === "Sales"
			? sales
			: selectedOption === "Sets"
			? sets
			: selectedOption === "Offers Made"
			? offersMade
			: dummyDataMap[selectedOption] || [];

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const pagedRows =
		selectedOption === "Users" ||
		selectedOption === "Applications" ||
		selectedOption === "Booked Calls" ||
		selectedOption === "Sales" ||
		selectedOption === "Sets" ||
		selectedOption === "Offers Made"
			? tableRows
			: tableRows.slice((page - 1) * pageSize, page * pageSize);

	// Add function to get sales data
	const getAllSales = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllSales(page, pageSize, search);
			const { sales, totalCount } = response.data;
			setSales(sales);
			setTotalCount(totalCount);
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	const getAllUsers = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllUsers(page, pageSize, search);
			const { users, totalCount } = response.data;
			setUsers(users);
			setTotalCount(totalCount);
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	const getAllApplications = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllApplications(
				page,
				pageSize,
				search
			);
			const { applications, totalCount } = response.data;
			setApplications(applications);
			setTotalCount(totalCount);
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	const getAllBookedCalls = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllBookedCalls(
				page,
				pageSize,
				search
			);
			// Update this line to use 'bookings' instead of 'bookedCalls'
			const { bookings, totalCount } = response.data;
			setBookedCalls(bookings); // Set the bookings data to bookedCalls state
			setTotalCount(totalCount);
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	// Add function to get sets data
	const getAllSets = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllSets(page, pageSize, search);
			// Adjust based on your API response structure
			const { sets, totalCount } = response.data;
			setSets(sets || []);
			setTotalCount(totalCount || 0);
		} catch (error) {
			console.log(error);
			setSets([]);
			setTotalCount(0);
		}
		setLoading(false);
	};

	// Add function to get offers made data
	const getAllOffersMade = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllOffersMade(
				page,
				pageSize,
				search
			);
			// Adjust based on your API response structure
			const { offers, totalCount } = response.data;
			setOffersMade(offers || []);
			setTotalCount(totalCount || 0);
		} catch (error) {
			console.log(error);
			setOffersMade([]);
			setTotalCount(0);
		}
		setLoading(false);
	};

	// Add function to get lead form submissions data
	const getAllLeadFormSubmissions = async (search: string) => {
		setLoading(true);
		try {
			const response = await eventApi.getAllLeadFormSubmissions(
				page,
				pageSize,
				search
			);
			const { leadFormSubmissions, totalCount } = response.data;
			setLeadFormSubmissions(leadFormSubmissions || []);
			setTotalCount(totalCount || 0);
		} catch (error) {
			console.log(error);
			setLeadFormSubmissions([]);
			setTotalCount(0);
		}
		setLoading(false);
	};

	// Add function to get application answers
	const getApplicationAnswers = async (applicationId: string) => {
		setLoadingAnswers(applicationId); // Set the specific application ID as loading
		try {
			const response = await eventApi.getApplicationAnswer(applicationId);
			const data = await response.data;

			setSelectedAnswers(data);
			setShowAnswersModal(true);
		} catch (error) {
			console.error("Error fetching application answers:", error);
		} finally {
			setLoadingAnswers(null); // Clear loading state
		}
	};

	const getAllAddToCarts = async (search: string) => {
		console.log(search);
	};

	const getAllCheckOutInitiated = async (search: string) => {
		console.log(search);
	};

	// Add function to map selectedOption to API values
	const getEventTypeForAPI = (selectedOption: string): string => {
		const mapping: Record<string, string> = {
			"Lead Form Submissions": "lead_form_submission",
			Applications: "application",
			"Booked Calls": "booking",
			Sets: "set",
			"Offers Made": "offer_made",
			Sales: "sale",
		};
		return mapping[selectedOption] || selectedOption.toLowerCase();
	};

	const [biggestImpactOptions, setBiggestImpactOptions] = useState<any[]>([]);
	const [loadingBiggestImpact, setLoadingBiggestImpact] = useState(false);

	// Add function to fetch biggest impact data
	const fetchBiggestImpactData = async (rowId: string) => {
		setLoadingBiggestImpact(true);
		try {
			const response = await eventApi.getBiggestImpactOptions(
				getEventTypeForAPI(selectedOption),
				rowId
			);
			setBiggestImpactOptions(response.data || []);
		} catch (error) {
			console.error("Failed to fetch biggest impact options:", error);
			setBiggestImpactOptions([]);
		} finally {
			setLoadingBiggestImpact(false);
		}
	};

	// Fetch data when editing Biggest Impact field
	useEffect(() => {
		if (editingField.col === "Biggest Impact 30" && editingField.rowId) {
			fetchBiggestImpactData(editingField.rowId);
		}
	}, [editingField.col, editingField.rowId]);

	useEffect(() => {
		if (selectedOption === "Users") {
			getAllUsers(search);
		} else if (selectedOption === "Lead Form Submissions") {
			getAllLeadFormSubmissions(search);
		} else if (selectedOption === "Applications") {
			getAllApplications(search);
		} else if (selectedOption === "Booked Calls") {
			getAllBookedCalls(search);
		} else if (selectedOption === "Sales") {
			getAllSales(search);
		} else if (selectedOption === "Sets") {
			getAllSets(search);
		} else if (selectedOption === "Offers Made") {
			getAllOffersMade(search);
		} else if (selectedOption === "Add To Cart") {
			getAllAddToCarts(search);
		} else if (selectedOption === "Checkout Initiated") {
			getAllCheckOutInitiated(search);
		} else {
			// For other options, use dummy data and set count
			const dummyData = dummyDataMap[selectedOption] || [];
			setTotalCount(dummyData.length);
		}
	}, [page, pageSize, selectedOption]);

	const onSearch = async () => {
		if (selectedOption === "Users") {
			getAllUsers(search);
		} else if (selectedOption === "Lead Form Submissions") {
			getAllLeadFormSubmissions(search);
		} else if (selectedOption === "Applications") {
			getAllApplications(search);
		} else if (selectedOption === "Booked Calls") {
			getAllBookedCalls(search);
		} else if (selectedOption === "Sales") {
			getAllSales(search);
		} else if (selectedOption === "Sets") {
			getAllSets(search);
		} else if (selectedOption === "Offers Made") {
			getAllOffersMade(search);
		} else if (selectedOption === "Add To Cart") {
			getAllAddToCarts(search);
		} else if (selectedOption === "Checkout Initiated") {
			getAllCheckOutInitiated(search);
		} else {
			// For other options, use dummy data and set count
			const dummyData = dummyDataMap[selectedOption] || [];
			setTotalCount(dummyData.length);
		}
	};

	// Update URL when tab changes
	const handleTabChange = (index: number) => {
		const newOption = eventOptions[index];
		setSelectedOption(newOption);
		setPage(1);
		setSelectedColumns(columnsMap[newOption] || []);
		setSearch("");

		// Update URL parameter
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("tab", newOption);
		setSearchParams(newSearchParams);
	};

	const renderPageNumbers = () => {
		const pages = [];
		const totalPages = Math.floor(totalCount / 10) + 1;
		const currentPage = page;

		// Always show first page
		pages.push(
			<Button
				key={1}
				size="xs"
				variant={currentPage === 1 ? "primary" : "secondary"}
				onClick={() => setPage(1)}
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
					onClick={() => setPage(i)}
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
					onClick={() => setPage(totalPages)}
					className="mx-1"
				>
					{totalPages}
				</Button>
			);
		}

		return pages;
	};

	return (
		<div>
			<div className=" mb-4">
				<Title>Event</Title>
				<Text>
					View and update event details and their attributions.
				</Text>
			</div>

			<Card>
				<TabGroup
					index={eventOptions.indexOf(selectedOption)}
					onIndexChange={handleTabChange}
				>
					<TabList className="mt-2 mb-6">
						{eventOptions.map((option) => (
							<Tab
								key={option}
								className={`text-black ${
									selectedOption === option
										? "bg-blue-50 text-blue-600"
										: ""
								}`}
							>
								{option}
							</Tab>
						))}
					</TabList>
				</TabGroup>
				<div className="flex items-center gap-2 mb-4 justify-between">
					<div className="flex items-center gap-2">
						<TextInput
							placeholder={`Search ${selectedOption}`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									onSearch();
								}
							}}
							className="max-w-xl w-80"
						/>
						<Button variant="secondary" onClick={() => onSearch()}>
							<Search className="w-4 h-4 inline" />
						</Button>
						<Button
							variant="primary"
							onClick={() => setShowEventDialog(true)}
						>
							<Plus className="w-4 h-4 mr-1 inline" />
							{`Add ${selectedOption}`}
						</Button>
						{[
							"Lead Form Submissions",
							"Applications",
							"Booked Calls",
							"Sets",
							"Offers Made",
							"Sales",
						].includes(selectedOption) && (
							<Button
								variant="primary"
								onClick={() => {
									if (
										selectedOption ===
										"Lead Form Submissions"
									) {
										setLeadFormDialog(true);
									} else if (
										selectedOption === "Applications"
									) {
										setApplicationSourceDialog(true);
									} else if (
										selectedOption === "Booked Calls"
									) {
										setBookedCallSourceDialog(true);
									} else if (selectedOption === "Sets") {
										setSetsSourceDialog(true);
									} else if (
										selectedOption === "Offers Made"
									) {
										setOffersMadeSourceDialog(true);
									} else if (selectedOption === "Sales") {
										setSalesSourceDialog(true);
									}
								}}
							>
								{`${selectedOption} Sources`}
							</Button>
						)}
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							{/* <ModeToggle /> */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="secondary">
										<Filter className="w-4 h-4 mr-1 inline" />
										Columns
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="bg-white border border-gray-300 rounded-md shadow-lg p-2 w-48 z-[9999] fixed ml-[-50px]"
									sideOffset={10}
									align="start"
								>
									<DropdownMenuLabel className="text-gray-700 font-semibold mb-2">
										Toggle Columns
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="border-t border-gray-300 my-2" />
									{columns.map((col) => (
										<DropdownMenuCheckboxItem
											key={col}
											checked={selectedColumns.includes(
												col
											)}
											onCheckedChange={() =>
												toggleColumn(col)
											}
											className="flex items-center gap-2 px-2 py-1 text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
										>
											<div className="w-4 h-4 flex items-center justify-center">
												{selectedColumns.includes(
													col
												) && (
													<Check className="w-4 h-4 text-green-500" />
												)}
											</div>
											<span>{col}</span>
										</DropdownMenuCheckboxItem>
									))}
									<DropdownMenuSeparator className="border-t border-gray-300 my-2" />
									<Button
										variant="secondary"
										size="xs"
										onClick={() =>
											setSelectedColumns(columns)
										}
										className="w-full text-left px-2 py-1 text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
									>
										Select All
									</Button>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
				<Table
					className="no-vertical-padding"
					style={{
						tableLayout: "fixed",
					}}
				>
					<TableHead>
						<TableRow>
							{columns.map(
								(col) =>
									selectedColumns.includes(col) && (
										<TableHeaderCell
											key={col}
											style={{
												width: columnWidths[col] ?? 150,
												position: "relative",
												overflow: "hidden",
												whiteSpace: "nowrap",
												textOverflow: "ellipsis",
											}}
											className="!py-0"
										>
											<span className="pr-2">{col}</span>
											{/* resizer handle */}
											<div
												onMouseDown={(e) =>
													handleMouseDown(e, col)
												}
												style={{
													position: "absolute",
													top: 0,
													right: 0,
													bottom: 0,
													width: 8,
													cursor: "col-resize",
													zIndex: 20,
												}}
												className="pr-2 border-r border-solid"
											/>
										</TableHeaderCell>
									)
							)}
						</TableRow>
					</TableHead>

					<EventTableBody
						pagedRows={pagedRows}
						selectedColumns={selectedColumns}
						selectedOption={selectedOption}
						columnWidths={columnWidths}
						editingField={editingField}
						editingValue={editingValue}
						loadingAnswers={loadingAnswers}
						loadingBiggestImpact={loadingBiggestImpact}
						biggestImpactOptions={biggestImpactOptions}
						onStartEditing={startEditing}
						onCancelEditing={cancelEditing}
						onSaveEditing={saveEditing}
						onSaveBiggestImpactEditing={saveBiggestImpactEditing}
						onSetEditingValue={setEditingValue}
						onShowUserJourney={(userId, userName, userEmail) => {
							setSelectedUserId(userId);
							setSelectedUserName(userName);
							setSelectedUserEmail(userEmail);
							setShowUserJourneyModal(true);
						}}
						onGetApplicationAnswers={getApplicationAnswers}
					/>
				</Table>
				{totalPages > 1 && (
					<div className="flex justify-between items-center mt-4">
						<div>
							Showing {(page - 1) * pageSize + 1} to{" "}
							{Math.min(page * pageSize, totalCount)} of{" "}
							{totalCount} entries
						</div>
						<div className="flex gap-2">
							<Button
								size="xs"
								variant="secondary"
								disabled={page === 1}
								onClick={() => setPage(page - 1)}
							>
								Previous
							</Button>
							<div className="flex items-center gap-1">
								{renderPageNumbers()}
							</div>
							<Button
								size="xs"
								variant="secondary"
								disabled={page === totalPages}
								onClick={() => setPage(page + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				)}
				{/* Add Modal for displaying application answers */}
				<ApplicationAnswersModal
					open={showAnswersModal}
					onClose={() => setShowAnswersModal(false)}
					answers={selectedAnswers}
					loading={loadingAnswers !== null}
				/>
				{/* Add Event Dialog */}
				<EventDialog
					open={showEventDialog}
					eventType={selectedOption}
					onCancel={() => setShowEventDialog(false)}
					onOk={() => {
						// Refresh the data after successful creation
						if (selectedOption === "Users") {
							getAllUsers(search);
						} else if (selectedOption === "Applications") {
							getAllApplications(search);
						} else if (selectedOption === "Booked Calls") {
							getAllBookedCalls(search);
						} else if (selectedOption === "Sales") {
							getAllSales(search);
						} else if (selectedOption === "Sets") {
							getAllSets(search);
						} else if (selectedOption === "Offers Made") {
							getAllOffersMade(search);
						}
					}}
				/>
				<LeadFormDialog
					open={leadFormDialog}
					onClose={() => setLeadFormDialog(false)}
				/>
				<ApplicationSourceDialog
					open={applicationSourceDialog}
					onClose={() => setApplicationSourceDialog(false)}
				/>
				<BookCallSourceDialog
					open={bookedCallSourceDialog}
					onClose={() => setBookedCallSourceDialog(false)}
				/>
				<SetsSourceDialog
					open={setsSourceDialog}
					onClose={() => setSetsSourceDialog(false)}
				/>
				<OffersMadeSourceDialog
					open={offersMadeSourceDialog}
					onClose={() => setOffersMadeSourceDialog(false)}
				/>
				<SalesSourceDialog
					open={salesSourceDialog}
					onClose={() => setSalesSourceDialog(false)}
				/>
				{/* Add User Journey Modal */}
				<UserJourneyModal
					open={showUserJourneyModal}
					onClose={() => setShowUserJourneyModal(false)}
					userId={selectedUserId}
					userName={selectedUserName}
					userEmail={selecteduserEmail}
					option={selectedOption}
				/>
			</Card>
			{loading && (
				<LoadingSpinner
					fullScreen
					text="Loading user journey data..."
					size="lg"
				/>
			)}
		</div>
	);
};

export default Event;
