import React, { useEffect, useState, useRef } from "react";
// import { Card } from "@tremor/react";
import Select from "react-select";
import { metricsTableApi } from "../services/api";
import { FilterNode, FilterRule } from "./CreateReportDialog";
import { Input } from "../pages/reports/ui/input";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "../pages/reports/ui/dropdown-menu";
import { Checkbox } from "../pages/reports/ui/checkbox";

interface MainDialogProps {
	tableName: string;
	setTableName: (v: string) => void;
	filterTree: FilterNode;
	onClose: () => void;
	onCreate: () => void;
	handleTypeChange: (path: number[], newType: "NODE" | "AND" | "OR") => void;
	handleRuleChange: (
		path: number[],
		key: keyof FilterRule,
		value: any
	) => void;
	fieldOptions: { value: string; label: string }[];
	operatorOptionsMap: Record<string, string[]>;
}

const MainDialog: React.FC<MainDialogProps> = ({
	tableName,
	setTableName,
	filterTree,
	onClose,
	onCreate,
	handleTypeChange,
	handleRuleChange,
	fieldOptions,
	operatorOptionsMap,
}) => {
	// console.log(filterTree);
	const [campaignNames, setCampaignNames] = useState<string[]>(["..."]);
	const [adAccountIDs, setADAccountIDs] = useState<{
		[platform: string]: string[];
	}>({});
	const [adPlatforms, setAdPlatforms] = useState<string[]>(["..."]);

	const selectPortalTarget =
		typeof document !== "undefined"
			? (document.body as HTMLElement)
			: undefined;
	const selectPortalStyles = {
		menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
	};

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Add click outside handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// const selectTypeStyles = {
	// 	menuPortal: (base: any) => ({
	// 		...base,
	// 		zIndex: 9999,
	// 		color: "#2563eb",
	// 	}),
	// 	control: (base: any, state: any) => ({
	// 		...base,
	// 		borderTop: "none",
	// 		borderRight: "none",
	// 		borderLeft: "none",
	// 		borderBottom: "2px solid #2563eb",
	// 		boxShadow: "none",
	// 		"&:hover": {
	// 			borderBottom: "2px solid #2563eb",
	// 		},
	// 	}),
	// };

	const predefinedOptionsMap: Record<string, any> = {
		"Ad Account ID": adAccountIDs,
		"Lead Form ID": ["formA", "formB", "formC"],
		"Traffic Source": ["Facebook", "Google", "Instagram", "TikTok"],
		Funnel: ["Funnel 1", "Funnel 2", "Funnel 3"],
		"Campaign Name": campaignNames,
		// "Funnel URL" intentionally omitted
	};

	useEffect(() => {
		try {
			const getCampaignNames = async () => {
				const nameResponse = await metricsTableApi.getCampaignNames();
				setCampaignNames(nameResponse.data);
			};
			const getAdAccountID = async () => {
				const idResponse = await metricsTableApi.getAdAccountID();
				setADAccountIDs(idResponse.data);
			};
			const getAdPlatforms = async () => {
				const platformResponse = await metricsTableApi.getAdPlatforms();
				console.log(platformResponse.data.platforms);
				setAdPlatforms(platformResponse.data.platforms);
			};
			getCampaignNames();
			getAdAccountID();
			getAdPlatforms();
		} catch (error) {
			console.log(error);
		}
	}, []);

	// For Ad Account ID with logo
	const adAccountOptions = Object.entries(adAccountIDs).flatMap(
		([platform, ids]) =>
			ids.map((id: any) => ({
				value: id,
				label: (
					<span style={{ display: "flex", alignItems: "center" }}>
						{/* Column 1: Logo */}
						<span style={{ marginRight: 8 }}>
							{platform === "facebook" && (
								<img
									src="/logo/meta.svg"
									alt="Facebook"
									width={16}
									height={16}
								/>
							)}
							{platform === "google" && (
								<img
									src="/logo/google.svg"
									alt="Google"
									width={16}
									height={16}
								/>
							)}
						</span>

						{/* Column 2: Name (row 1) and ID (row 2) */}
						<span
							style={{ display: "flex", flexDirection: "column" }}
						>
							<span style={{ fontWeight: 500 }}>
								{id.name.String}
							</span>
							<span style={{ fontSize: 12, color: "#888" }}>
								Ads Account ID :{" "}
								{platform === "facebook"
									? id.ads_account_id.String
									: platform === "google"
									? id.ads_account_id.Int64
									: platform}
							</span>
						</span>
					</span>
				),
				platform,
			}))
	);

	const selectedAdAccountOptions = Object.entries(adAccountIDs).flatMap(
		([platform, ids]) =>
			ids.map((id: any) => ({
				value: id,
				label: (
					<span
						style={{ display: "flex", alignItems: "center" }}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
					>
						{/* Column 1: Logo */}
						<span style={{ marginRight: 8 }}>
							{platform === "facebook" && (
								<img
									src="/logo/meta.svg"
									alt="Facebook"
									width={16}
									height={16}
								/>
							)}
							{platform === "google" && (
								<img
									src="/logo/google.svg"
									alt="Google"
									width={16}
									height={16}
								/>
							)}
						</span>

						{/* Column 2: Name (row 1) and ID (row 2) */}
						<span
							style={{ display: "flex", flexDirection: "column" }}
						>
							<span style={{ fontWeight: 500 }}>
								{id.name.String}
							</span>
							<span style={{ fontSize: 12, color: "#888" }}>
								{platform === "facebook"
									? id.ads_account_id.String
									: platform === "google"
									? id.ads_account_id.Int64
									: platform}
							</span>
						</span>
					</span>
				),
				platform,
			}))
	);

	// For all other fields
	const getOptions = (field: string) => {
		if (field === "Ad Account ID") return adAccountOptions;
		const arr = predefinedOptionsMap[field];
		if (Array.isArray(arr)) {
			return arr.map((v: string) => ({
				value: v,
				label: v.length > 25 ? v.slice(0, 25) + "…" : v,
			}));
		}
		return [];
	};

	const renderFilterNode = (
		node: FilterNode,
		path: number[] = []
	): JSX.Element => {
		return (
			<div
				key={path.join("-")}
				className="border border-gray-200 rounded p-3 mb-2"
			>
				<div className="flex items-center gap-2 mb-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							{/* <Button
								variant="outline"
								className="w-32 justify-between"
							>
								{node.type}
								<ChevronDown className="w-4 h-4" />
							</Button> */}
							<span className="w-10 justify-between border-b border-[#2563eb] text-l text-[#2563eb] text-center cursor-pointer">
								{node.type}
							</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-white border border-gray-300 rounded-md shadow-lg">
							{[
								{ value: "NODE", label: "NODE" },
								{ value: "AND", label: "AND" },
								{ value: "OR", label: "OR" },
							].map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => {
										handleTypeChange(
											path,
											option.value as
												| "NODE"
												| "AND"
												| "OR"
										);
									}}
									className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded cursor-pointer text-l"
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{node.type === "NODE" && node.rule && (
					<div className="flex flex-wrap sm:flex-nowrap items-center space-x-0 sm:space-x-2 mb-2 gap-y-2">
						<div className="w-80">
							<Select
								className="w-full z-10"
								menuPortalTarget={selectPortalTarget}
								menuPosition="fixed"
								styles={selectPortalStyles}
								value={
									fieldOptions.find(
										(f) => f.value === node.rule?.field
									)
										? {
												value: node.rule.field,
												label:
													fieldOptions.find(
														(f) =>
															f.value ===
															node.rule?.field
													)?.label || node.rule.field,
										  }
										: null
								}
								onChange={(selected) => {
									handleRuleChange(path, "value", []);
									handleRuleChange(
										path,
										"field",
										selected ? selected.value : ""
									);
								}}
								options={fieldOptions.map((f) => ({
									value: f.value,
									label: f.label,
								}))}
								isClearable={false}
								placeholder="Select Field"
							/>
						</div>
						<div className="w-80">
							<Select
								className="w-full"
								menuPortalTarget={selectPortalTarget}
								menuPosition="fixed"
								styles={selectPortalStyles}
								value={
									node.rule.field && node.rule.operator
										? {
												value: node.rule.operator,
												label: node.rule.operator,
										  }
										: null
								}
								onChange={(selected) =>
									handleRuleChange(
										path,
										"operator",
										selected ? selected.value : ""
									)
								}
								options={
									node.rule.field
										? (
												operatorOptionsMap[
													node.rule.field
												] || []
										  ).map((op) => ({
												value: op,
												label: op,
										  }))
										: []
								}
								isDisabled={!node.rule.field}
								isClearable={false}
								placeholder="Select Operator"
							/>
						</div>
						<div className="w-full">
							{node.rule.field === "campaign_name" &&
							Array.isArray(
								predefinedOptionsMap["campaign_name"]
							) &&
							predefinedOptionsMap["campaign_name"].length > 0 ? (
								<Input
									className="border rounded px-2 py-0.5 text-sm w-full"
									value={
										node.rule.inputText ??
										(Array.isArray(node.rule.value)
											? node.rule.value[0] || ""
											: node.rule.value || "")
									}
									onChange={(e) => {
										handleRuleChange(
											path,
											"inputText",
											e.target.value
										);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											const searchValue =
												e.currentTarget.value.toLowerCase();
											const filtered = getOptions(
												"campaign_name"
											)
												.filter(
													(opt) =>
														typeof opt.label ===
															"string" &&
														opt.label
															.toLowerCase()
															.includes(
																searchValue
															)
												)
												.map((opt) => opt.value);
											handleRuleChange(
												path,
												"value",
												filtered
											);
										}
									}}
									placeholder="Type Campaign Name"
									autoComplete="off"
								/>
							) : node.rule.field === "traffic_source" ? (
								<Select
									className="w-full"
									menuPortalTarget={selectPortalTarget}
									menuPosition="fixed"
									styles={selectPortalStyles}
									value={
										Array.isArray(node.rule.value) &&
										node.rule.value.length > 0
											? {
													value: node.rule.value[0],
													label: (
														<span
															style={{
																display: "flex",
																alignItems:
																	"center",
															}}
														>
															<img
																src={
																	node.rule
																		.value[0] ===
																	"google"
																		? "/logo/google.svg"
																		: "/logo/meta.svg"
																}
																alt={
																	node.rule
																		.value[0] ===
																	"google"
																		? "Google"
																		: "Facebook"
																}
																width={16}
																height={16}
																style={{
																	marginRight: 8,
																}}
															/>
															{node.rule
																.value[0] ===
															"google"
																? "Google"
																: "Facebook"}
														</span>
													),
											  }
											: null
									}
									onChange={(selected) =>
										handleRuleChange(
											path,
											"value",
											selected ? [selected.value] : []
										)
									}
									options={adPlatforms.map((item: string) => {
										return {
											value:
												item === "Meta"
													? "facebook"
													: "google",
											label: (
												<span
													style={{
														display: "flex",
														alignItems: "center",
													}}
												>
													<img
														src={
															item === "Meta"
																? "/logo/meta.svg"
																: "/logo/google.svg"
														}
														alt={
															item === "Meta"
																? "Facebook"
																: "Google"
														}
														width={16}
														height={16}
														style={{
															marginRight: 8,
														}}
													/>
													{item === "Meta"
														? "Facebook"
														: "Google"}
												</span>
											),
										};
									})}
									// options={[
									// 	{
									// 		value: "google",
									// 		label: (
									// 			<span
									// 				style={{
									// 					display: "flex",
									// 					alignItems: "center",
									// 				}}
									// 			>
									// 				<img
									// 					src="/logo/google.svg"
									// 					alt="Google"
									// 					width={16}
									// 					height={16}
									// 					style={{
									// 						marginRight: 8,
									// 					}}
									// 				/>
									// 				Google
									// 			</span>
									// 		),
									// 	},
									// 	{
									// 		value: "facebook",
									// 		label: (
									// 			<span
									// 				style={{
									// 					display: "flex",
									// 					alignItems: "center",
									// 				}}
									// 			>
									// 				<img
									// 					src="/logo/meta.svg"
									// 					alt="Facebook"
									// 					width={16}
									// 					height={16}
									// 					style={{
									// 						marginRight: 8,
									// 					}}
									// 				/>
									// 				Facebook
									// 			</span>
									// 		),
									// 	},
									// ]}
									isClearable={false}
									placeholder="Select Traffic Source"
								/>
							) : node.rule.field === "ad_account_id" &&
							  adAccountOptions.length > 0 ? (
								<div className="relative" ref={dropdownRef}>
									<div
										className="flex w-full justify-between item-center cursor-pointer border border-solid border-[#cccccc] p-2"
										onClick={() =>
											setIsDropdownOpen(!isDropdownOpen)
										}
									>
										{Array.isArray(node.rule.value) &&
										node.rule.value.length > 0 ? (
											<div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto overflow-x-hidden w-full">
												{node.rule.value.map(
													(accountId: any) => {
														const account =
															selectedAdAccountOptions.find(
																(option) =>
																	option.value
																		.ads_account_id
																		?.String ===
																		accountId ||
																	option.value
																		.ads_account_id
																		?.Int64 ===
																		accountId
															);

														return account ? (
															<div
																key={accountId}
																className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	const currentValues =
																		Array.isArray(
																			node
																				.rule
																				?.value
																		)
																			? node
																					.rule
																					?.value
																			: [];
																	const newValues =
																		currentValues.filter(
																			(
																				v: any
																			) =>
																				v !==
																				accountId
																		);
																	handleRuleChange(
																		path,
																		"value",
																		newValues
																	);
																}}
															>
																{account.label}
																<span className="ml-1 cursor-pointer">
																	×
																</span>
															</div>
														) : null;
													}
												)}
											</div>
										) : (
											"Select Ad Account ID"
										)}
									</div>

									{isDropdownOpen && (
										<div
											className="fixed inset-0 z-[60]"
											style={{
												left:
													dropdownRef.current?.getBoundingClientRect()
														.left || 0,
												top:
													(dropdownRef.current?.getBoundingClientRect()
														.bottom || 0) + 4,
												width: "320px",
												height: "auto",
												maxHeight: "240px",
											}}
										>
											<div className="bg-white border border-gray-300 rounded shadow-lg overflow-y-auto max-h-60">
												{adAccountOptions.map(
													(option, index) => (
														<div
															key={`${
																option.value
																	?.ads_account_id
																	?.String ||
																option.value
																	?.ads_account_id
																	?.Int64
															}-${index}`}
															className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
														>
															<Checkbox
																checked={
																	Array.isArray(
																		node
																			.rule
																			?.value
																	)
																		? node.rule?.value.includes(
																				option
																					.value
																					.ads_account_id
																					?.String ||
																					option
																						.value
																						.ads_account_id
																						?.Int64
																		  )
																		: false
																}
																onCheckedChange={(
																	checked
																) => {
																	const currentValues =
																		Array.isArray(
																			node
																				.rule
																				?.value
																		)
																			? node
																					.rule
																					?.value
																			: [];
																	const newValues =
																		checked
																			? [
																					...currentValues,
																					option
																						.value
																						.ads_account_id
																						?.String ||
																						option
																							.value
																							.ads_account_id
																							?.Int64,
																			  ]
																			: currentValues.filter(
																					(
																						v: any
																					) =>
																						v !==
																						(option
																							.value
																							.ads_account_id
																							?.String ||
																							option
																								.value
																								.ads_account_id
																								?.Int64)
																			  );
																	handleRuleChange(
																		path,
																		"value",
																		newValues
																	);
																}}
															/>
															<div className="flex items-center w-full">
																{option.label}
															</div>
														</div>
													)
												)}
											</div>
										</div>
									)}
								</div>
							) : (
								<Input
									type="text"
									className="border rounded px-2 py-0.5 text-sm w-full"
									value={node.rule.value}
									onChange={(e) =>
										handleRuleChange(path, "value", [
											e.target.value,
										])
									}
									placeholder="Value"
								/>
							)}
						</div>
					</div>
				)}

				{(node.type === "AND" || node.type === "OR") &&
					node.children && (
						<div className="ml-4 space-y-2">
							{node.children.map((child, index) =>
								renderFilterNode(child, [...path, index])
							)}
						</div>
					)}
			</div>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 text-sm">
			<div className="bg-white rounded-lg shadow-lg p-6 w-[850px] h-[550px]">
				<h2 className="text-2xl font-semibold mb-2">Create Table</h2>
				<h6 className="mb-6 text-sm border-b border-gray-300">
					Configure your table filters and settings
				</h6>
				<div className="mb-4">
					<div className="mb-6">
						<label className="block font-medium mb-1">
							Table Name
						</label>
						<Input
							type="text"
							className="w-full border rounded px-2 py-1 text-sm"
							value={tableName}
							onChange={(e) => setTableName(e.target.value)}
							placeholder="Enter table name"
						/>
					</div>
					<div>
						<div className="flex items-center justify-between gap-4 mb-1">
							<span className="font-medium">Filter Rules</span>
						</div>
						<div className="flex flex-col gap-4 mt-2 overflow-y-auto border p-4 max-h-[250px]">
							{renderFilterNode(filterTree)}
						</div>
					</div>
				</div>
				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
						onClick={onCreate}
					>
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default MainDialog;
