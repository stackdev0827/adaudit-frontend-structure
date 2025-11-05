import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainDialog from "./MainDialog";
import SuccessDialog from "./SuccessDialog";

export interface FilterRule {
	field: string;
	operator: string;
	value: string[];
	inputText?: string; // Add this optional property
}

export interface FilterNode {
	type: "NODE" | "AND" | "OR";
	rule?: FilterRule; // Only for NODE type
	children?: FilterNode[]; // Only for AND/OR type
}

export interface FilterGroup {
	logic: "AND" | "OR";
	rules: FilterRule[];
}

interface CreateReportDialogProps {
	// open: boolean;
	onClose: () => void;
	// selectedType: string | null;
	onApply?: (payload: any) => void;
	initialTableName?: string;
	initialReportName?: string;
	initialDate?: string;
	onTableNameChange?: (tableName: string) => void; // Add this prop to send tableName to parent
}

// const fieldOptions = [
// 	{ value: "Campaign Name", label: "Campaign Name" },
// 	{ value: "Funnel URL", label: "Funnel URL" },
// 	{ value: "Ad Account ID", label: "Ad Account ID" },
// 	{ value: "Lead Form ID", label: "Lead Form ID" },
// 	{ value: "Traffic Source", label: "Traffic Source" },
// 	{ value: "Funnel", label: "Funnel" },
// ];

const fieldOptions = [
	{ value: "campaign_name", label: "Campaign Name" },
	{ value: "funnel_url", label: "Funnel URL" },
	{ value: "ad_account_id", label: "Ad Account ID" },
	{ value: "lead_form_id", label: "Lead Form ID" },
	{ value: "traffic_source", label: "Traffic Source" },
	{ value: "funnel", label: "Funnel" },
];
const operatorOptionsMap: Record<string, string[]> = {
	campaign_name: [
		"Contains",
		"Not Contain",
		"Equals",
		"Starts With",
		"Ends With",
	],
	funnel_url: [
		"Not Contain",
		"Contains",
		"Equals",
		"Starts With",
		"Ends With",
	],
	ad_account_id: ["Is", "Is Not"],
	lead_form_id: ["Is", "Is Not"],
	traffic_source: ["Is", "Is Not"],
	funnel: ["Is", "Is Not"],
};

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
	// open,
	onClose,
	// selectedType,
	onApply,
	initialTableName = "",
	initialDate,
	onTableNameChange,
}) => {
	const [tableName, setTableName] = useState(initialTableName);
	const [filterTree, setFilterTree] = useState<FilterNode>({
		type: "NODE",
		rule: { field: "campaign_name", operator: "Contains", value: [] },
	});
	const [showSuccess, setShowSuccess] = useState(false);
	const { report_name } = useParams<{
		report_name: string;
	}>();

	// Update tableName when initialTableName changes
	useEffect(() => {
		if (initialTableName) {
			setTableName(initialTableName);
		}
	}, [initialTableName]);

	// Custom tableName setter that also notifies parent
	const handleTableNameChange = (newTableName: string) => {
		setTableName(newTableName);
		if (onTableNameChange) {
			onTableNameChange(newTableName);
		}
	};

	const handleClose = () => {
		console.log("------------");
		setShowSuccess(false);
		setTableName("");
		setFilterTree({
			type: "NODE",
			rule: { field: "campaign_name", operator: "Is", value: [] },
		});
		onClose();
	};

	const updateFilterNode = (path: number[], updates: Partial<FilterNode>) => {
		const updateNode = (
			node: FilterNode,
			currentPath: number[]
		): FilterNode => {
			if (currentPath.length === 0) {
				return { ...node, ...updates };
			}

			const [index, ...restPath] = currentPath;
			if (node.children && index < node.children.length) {
				return {
					...node,
					children: node.children.map((child, i) =>
						i === index ? updateNode(child, restPath) : child
					),
				};
			}
			return node;
		};

		setFilterTree((prev) => updateNode(prev, path));
	};

	const handleTypeChange = (
		path: number[],
		newType: "NODE" | "AND" | "OR"
	) => {
		if (newType === "NODE") {
			updateFilterNode(path, {
				type: "NODE",
				rule: { field: "campaign_name", operator: "Is", value: [] },
				children: undefined,
			});
		} else {
			updateFilterNode(path, {
				type: newType,
				rule: undefined,
				children: [
					{
						type: "NODE",
						rule: {
							field: "campaign_name",
							operator: "Is",
							value: [],
						},
					},
					{
						type: "NODE",
						rule: {
							field: "campaign_name",
							operator: "Is",
							value: [],
						},
					},
				],
			});
		}
	};

	const handleRuleChange = (
		path: number[],
		key: keyof FilterRule,
		value: any
	) => {
		console.log(path, key, value);
		const updateRule = (
			node: FilterNode,
			currentPath: number[]
		): FilterNode => {
			if (currentPath.length === 0 && node.rule) {
				let updatedRule = { ...node.rule, [key]: value };

				// When field changes, reset operator to first available option
				if (key === "field" && typeof value === "string") {
					const availableOperators = operatorOptionsMap[value] || [];
					if (availableOperators.length > 0) {
						updatedRule.operator = availableOperators[0];
					}
				}

				return {
					...node,
					rule: updatedRule,
				};
			}

			const [index, ...restPath] = currentPath;
			if (node.children && index < node.children.length) {
				return {
					...node,
					children: node.children.map((child, i) =>
						i === index ? updateRule(child, restPath) : child
					),
				};
			}
			console.log(node);
			return node;
		};

		setFilterTree((prev) => updateRule(prev, path));
	};

	const handleCreate = () => {
		if (!tableName.trim()) {
			alert("Table Name is required.");
			return;
		}
		console.log({ tableName, filterTree });
		// onClose();
		setShowSuccess(true);
	};

	const handleSuccessClose = () => {
		setShowSuccess(false);
		setTableName("");
		setFilterTree({
			type: "NODE",
			rule: { field: "campaign_name", operator: "Is", value: [] },
		});
	};

	// Handle receiving the payload from SuccessDialog and passing it up
	const handleApplyPayload = (payload: any) => {
		if (onApply) {
			// Include the table name in the payload
			onApply({
				...payload,
				tableName: tableName,
				reportName: report_name,
			});
		}
		handleSuccessClose();
	};

	if (showSuccess) {
		return (
			<SuccessDialog
				onClose={handleSuccessClose}
				tableName={tableName}
				reportName={report_name || ""}
				reportDate={initialDate || ""}
				// selectedType={selectedType}
				filterTree={filterTree}
				onApply={handleApplyPayload}
			/>
		);
	}

	return (
		<MainDialog
			tableName={tableName}
			setTableName={handleTableNameChange} // Use the custom handler that notifies parent
			filterTree={filterTree}
			onClose={handleClose}
			onCreate={handleCreate}
			// updateFilterNode={updateFilterNode}
			handleTypeChange={handleTypeChange}
			handleRuleChange={handleRuleChange}
			fieldOptions={fieldOptions}
			operatorOptionsMap={operatorOptionsMap}
		/>
	);
};

export default CreateReportDialog;
