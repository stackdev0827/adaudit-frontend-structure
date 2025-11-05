import React from "react";
import {
	TableBody,
	TableRow,
	TableCell,
	Button,
	TextInput,
} from "@tremor/react";
import { Check, X, Edit3, Map } from "lucide-react";
import { formatDateWithUserPreferences } from "../../utils/dateFormatter";
import { getColKeyMap } from "../../constants/eventTable";

interface EventTableBodyProps {
	pagedRows: any[];
	selectedColumns: string[];
	selectedOption: string;
	columnWidths: Record<string, number>;
	editingField: { rowId: string | null; col: string | null };
	editingValue: string;
	loadingAnswers: string | null;
	loadingBiggestImpact: boolean;
	biggestImpactOptions: any[];
	onStartEditing: (rowId: string, col: string, value: string) => void;
	onCancelEditing: () => void;
	onSaveEditing: (row: any, rowId: string, col: string) => void;
	onSaveBiggestImpactEditing: (row: any, rowId: string, col: string) => void;
	onSetEditingValue: (value: string) => void;
	onShowUserJourney: (
		userId: string,
		userName: string,
		userEmail: string
	) => void;
	onGetApplicationAnswers: (id: string) => void;
}

const EventTableBody: React.FC<EventTableBodyProps> = ({
	pagedRows,
	selectedColumns,
	selectedOption,
	columnWidths,
	editingField,
	editingValue,
	loadingAnswers,
	loadingBiggestImpact,
	biggestImpactOptions,
	onStartEditing,
	onCancelEditing,
	onSaveEditing,
	onSaveBiggestImpactEditing,
	onSetEditingValue,
	onShowUserJourney,
	onGetApplicationAnswers,
}) => {
	const renderCellContent = (row: any, col: string) => {
		if (col === "Select") {
			return <input type="checkbox" />;
		}

		if (col === "Actions") {
			return (
				<Button size="xs" variant="secondary" className="ml-2">
					Delete
				</Button>
			);
		}

		if (col === "User Journey") {
			return (
				<Button
					size="xs"
					variant="secondary"
					onClick={(e) => {
						e.stopPropagation();
						if (selectedOption === "Users") {
							onShowUserJourney(row.id, row.name, row.email);
						} else {
							onShowUserJourney(row.lead_id, row.name, row.email);
						}
					}}
				>
					<Map size={15} />
				</Button>
			);
		}

		if (col === "Form Answers") {
			return (
				<Button
					size="xs"
					variant="secondary"
					onClick={() => onGetApplicationAnswers(row.id)}
					disabled={loadingAnswers === row.id}
					loading={loadingAnswers === row.id}
				>
					{loadingAnswers === row.id ? "Loading..." : "View Answers"}
				</Button>
			);
		}

		// Map column names to row property keys
		const colKeyMap = getColKeyMap(selectedOption);
		const key = colKeyMap[col] || col.toLowerCase().replace(/\s+/g, "_");
		let value = row[key];

		// Handle null values
		if (value === null) value = "-";
		if (value === "") value = "-";

		// Handle Funnel Type display
		if (col === "Funnel Type" && value !== undefined && value !== "") {
			if (value === 1 || value === "1") {
				value = "Ecom Sale";
			} else if (value === 2 || value === "2") {
				value = "Call Funnel Sale";
			}
		}

		// Handle Grade, Qualified, Show Status
		if (["Grade", "Qualified", "Show Status"].includes(col)) {
			if (col === "Grade") {
				switch (value) {
					case 1:
					case "1":
						value = <span style={{ color: "red" }}>Cut</span>;
						break;
					case 2:
					case "2":
						value = (
							<span style={{ color: "orange" }}>
								Below Average
							</span>
						);
						break;
					case 3:
					case "3":
						value = <span style={{ color: "blue" }}>Good</span>;
						break;
					case 4:
					case "4":
						value = <span style={{ color: "green" }}>Great</span>;
						break;
					default:
						value = "-";
				}
			} else if (col === "Qualified") {
				value =
					value === -1
						? "Pending"
						: value === 1 || value === true
						? "Qualified"
						: "Unqualified";
			} else if (col === "Show Status") {
				value =
					value === -1
						? "Pending"
						: value === 1 || value === true
						? "Showed"
						: "No Showed";
			}
		}

		// Format currency columns
		if (
			[
				"Amount Billed",
				"Amount Paid",
				"Total Amount",
				"Cost of Goods",
				"Shipping Cost",
				"Taxes",
				"Refund",
				"Time Period Amount",
				"Rebill Price",
				"Item Discount",
			].includes(col) &&
			value !== undefined &&
			value !== "-"
		) {
			value = `$${Math.round(value * 1000000) / 1000000 || 0}`;
		}

		// Handle Phone numbers
		if (
			col === "Phone" &&
			value &&
			(typeof value === "string" || Array.isArray(value))
		) {
			let phoneNumbers;
			if (Array.isArray(value)) {
				phoneNumbers = value;
			} else if (value.includes(",")) {
				phoneNumbers = value.split(",").map((phone) => phone.trim());
			} else {
				phoneNumbers = value.match(/\+\d+/g) || [value];
			}

			value = (
				<div>
					{phoneNumbers.map((phone, index) => (
						<div key={index}>{phone}</div>
					))}
				</div>
			);
		}

		// Handle Rebill Period
		if (col === "Rebill Period") {
			const rebillPeriod = row["rebill_period"];
			const numberOfRebills = row["number_of_rebills"];
			value =
				rebillPeriod && numberOfRebills
					? `${numberOfRebills} ${rebillPeriod}`
					: "-";
		}

		// Handle Date formatting
		if (col === "Date Joined" || col === "Date") {
			value = formatDateWithUserPreferences(value);
		}

		// Check if field is editable
		const isEditable =
			(selectedOption === "Applications" &&
				["Grade", "Qualified"].includes(col)) ||
			(selectedOption === "Booked Calls" &&
				["Grade", "Qualified", "Confirmation", "Show Status"].includes(
					col
				)) ||
			(selectedOption === "Sets" && ["Show Status"].includes(col)) ||
			(selectedOption === "Offers Made" &&
				["Product Name"].includes(col)) ||
			(selectedOption === "Sales" &&
				[
					"Product Name",
					"Funnel Type",
					"Qualified",
					"Total Amount",
					"Amount Paid",
					"Rebill Period",
					"Rebill Price",
					"Number of Rebills",
					"Quantity",
					"Cost of Goods",
					"Shipping Cost",
					"Taxes",
					"Refund",
					"Biggest Impact 30",
				].includes(col)) ||
			col === "Biggest Impact 30";

		if (isEditable) {
			return (
				<div className="relative flex items-center gap-2">
					{editingField.rowId === row.id &&
					editingField.col === col ? (
						<>
							<button
								aria-label="Save"
								className="p-1 text-green-600"
								onClick={() => {
									if (col === "Biggest Impact 30") {
										onSaveBiggestImpactEditing(
											row,
											row.id,
											col
										);
									} else {
										onSaveEditing(row, row.id, col);
									}
								}}
							>
								<Check className="w-4 h-4" />
							</button>
							<button
								aria-label="Cancel"
								className="p-1 text-red-600"
								onClick={onCancelEditing}
							>
								<X className="w-4 h-4" />
							</button>
							{renderEditingInput(
								col,
								value,
								editingValue,
								onSetEditingValue,
								biggestImpactOptions,
								loadingBiggestImpact
							)}
						</>
					) : (
						<>
							<button
								aria-label="Edit"
								className="p-1 text-indigo-600"
								onClick={() =>
									onStartEditing(
										row.id,
										col,
										value !== undefined
											? value.toString()
											: ""
									)
								}
							>
								<Edit3 className="w-4 h-4" />
							</button>
							<span className="flex-1">
								{col === "Biggest Impact 30"
									? renderBiggestImpactDisplay(
											row,
											selectedOption
									  )
									: ["First Source", "Last Source"].includes(
											col
									  )
									? renderSourceDisplay(
											row,
											col,
											selectedOption
									  )
									: value !== undefined
									? value
									: "-"}
							</span>
						</>
					)}
				</div>
			);
		}

		// Handle source columns for non-editable fields
		if (["First Source", "Last Source"].includes(col)) {
			return (
				<div className="space-y-1">
					{renderSourceDisplay(row, col, selectedOption)}
				</div>
			);
		}

		return <span>{value !== undefined ? value : "-"}</span>;
	};

	const renderEditingInput = (
		col: string,
		value: any,
		editingValue: string,
		onSetEditingValue: (value: string) => void,
		biggestImpactOptions: any[],
		loadingBiggestImpact: boolean
	) => {
		if (
			[
				"Grade",
				"Qualified",
				"Confirmation",
				"Show Status",
				"Funnel Type",
			].includes(col)
		) {
			return (
				<select
					defaultValue={value}
					value={editingValue}
					onChange={(e) => onSetEditingValue(e.target.value)}
					className="border border-gray-300 rounded px-2 py-1"
				>
					{renderSelectOptions(col)}
				</select>
			);
		}

		if (col === "Biggest Impact 30") {
			return (
				<select
					value={editingValue}
					onChange={(e) => onSetEditingValue(e.target.value)}
					className="border border-gray-300 rounded px-2 py-1 w-full"
					disabled={loadingBiggestImpact}
				>
					<option value="">
						{loadingBiggestImpact ? "Loading..." : "Select option"}
					</option>
					{biggestImpactOptions.map((option, index) => (
						<option
							key={index}
							value={option.ID}
							data-type={option.Type}
							data-name={option.Name}
							title={`${option.Name} - ID: ${option.ID} (${option.Type})`}
						>
							{option.Type?.toLowerCase().includes("meta")
								? "📘 "
								: option.Type?.toLowerCase().includes("google")
								? "🔍 "
								: ""}
							{option.Name.length > 30
								? `${option.Name.substring(0, 30)}...`
								: option.Name}{" "}
							- ID: {option.ID}
						</option>
					))}
				</select>
			);
		}

		return (
			<TextInput
				value={editingValue}
				onChange={(e) => onSetEditingValue(e.target.value)}
				className="w-full"
			/>
		);
	};

	const renderSelectOptions = (col: string) => {
		switch (col) {
			case "Qualified":
				return (
					<>
						<option value="1">Qualified</option>
						<option value="0">Unqualified</option>
					</>
				);
			case "Grade":
				return (
					<>
						<option value="0">-</option>
						<option value="1">Cut</option>
						<option value="2">Below Average</option>
						<option value="3">Good</option>
						<option value="4">Great</option>
					</>
				);
			case "Confirmation":
				return (
					<>
						<option value="Confirmed">Confirmed</option>
						<option value="Not Confirmed">Not Confirmed</option>
					</>
				);
			case "Show Status":
				return (
					<>
						<option value="1">Showed</option>
						<option value="0">No Showed</option>
					</>
				);
			case "Funnel Type":
				return (
					<>
						<option value="Call Funnel">Call Funnel</option>
						<option value="eCommerce Funnel">
							eCommerce Funnel
						</option>
					</>
				);
			default:
				return null;
		}
	};

	const renderBiggestImpactDisplay = (row: any, selectedOption: string) => {
		return (
			<div className="space-y-1">
				{(() => {
					try {
						if (
							[
								"Users",
								"Lead Form Submissions",
								"Applications",
								"Booked Calls",
								"Sets",
								"Offers Made",
								"Sales",
								"Add To Cart",
								"Checkout Initiated",
							].includes(selectedOption)
						) {
							const prefix = "biggest_impact";
							const adId = row[`${prefix}_ad_id`];
							const name = row[`${prefix}_name`];
							const type = row[`${prefix}_type`];

							if (!adId && !name && !type) return <span>-</span>;

							return (
								<div className="text-xs">
									{type && (
										<div className="flex items-center gap-1 mb-1">
											{type
												.toLowerCase()
												.includes("meta") ||
											type
												.toLowerCase()
												.includes("facebook") ? (
												<img
													src="/logo/meta.svg"
													alt="Meta"
													width={12}
													height={12}
												/>
											) : type
													.toLowerCase()
													.includes("google") ? (
												<img
													src="/logo/google.svg"
													alt="Google"
													width={12}
													height={12}
												/>
											) : null}
											{name && (
												<span className="font-medium">
													{name}
												</span>
											)}
										</div>
									)}
									{adId && (
										<div className="text-gray-500">
											ID: {adId}
										</div>
									)}
								</div>
							);
						}
					} catch (e) {
						return <span>-</span>;
					}
				})()}
			</div>
		);
	};

	const renderSourceDisplay = (
		row: any,
		col: string,
		selectedOption: string
	) => {
		try {
			if (
				[
					"Users",
					"Lead Form Submissions",
					"Applications",
					"Booked Calls",
					"Sets",
					"Offers Made",
					"Sales",
					"Add To Cart",
					"Checkout Initiated",
				].includes(selectedOption)
			) {
				let prefix = "";
				if (col === "First Source") prefix = "first_click";
				else if (col === "Last Source") prefix = "last_click";

				const adId = row[`${prefix}_ad_id`];
				const name = row[`${prefix}_name`];
				const type = row[`${prefix}_type`];

				if (!adId && !name && !type) return <span>-</span>;

				return (
					<div className="text-xs">
						{type && (
							<div className="flex items-center gap-1 mb-1">
								{type.toLowerCase().includes("meta") ||
								type.toLowerCase().includes("facebook") ? (
									<img
										src="/logo/meta.svg"
										alt="Meta"
										width={12}
										height={12}
									/>
								) : type.toLowerCase().includes("google") ? (
									<img
										src="/logo/google.svg"
										alt="Google"
										width={12}
										height={12}
									/>
								) : null}
								{name && (
									<span className="font-medium">{name}</span>
								)}
							</div>
						)}
						{adId && (
							<div className="text-gray-500">ID: {adId}</div>
						)}
					</div>
				);
			}
		} catch (e) {
			return <span>-</span>;
		}
	};

	return (
		<TableBody className="text-black">
			{pagedRows.length > 0 ? (
				pagedRows.map((row, index) => (
					<TableRow key={`${row.id}-${index}`}>
						{selectedColumns.map((col) => (
							<TableCell
								key={col}
								style={{
									width: columnWidths[col] ?? 150,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{renderCellContent(row, col)}
							</TableCell>
						))}
					</TableRow>
				))
			) : (
				<TableRow>
					<TableCell colSpan={selectedColumns.length}>
						<div className="flex justify-center py-10">
							No data available
						</div>
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	);
};

export default EventTableBody;
