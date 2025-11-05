import React, { useEffect, useState } from "react";
import {
	Button,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
} from "@tremor/react";
import { urlRuleApi } from "../../services/api";
import AddDialog from "../settings/url_rule/AddDialog";

import EditDialog from "../settings/url_rule/EditDialog";

const ConfirmDialog = ({
	open,
	onOk,
	onCancel,
	message,
}: {
	open: boolean;
	onOk: () => void;
	onCancel: () => void;
	message: string;
}) => (
	<div
		className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${
			open ? "" : "hidden"
		}`}
	>
		<div className="bg-white rounded-lg shadow-lg p-6 w-80">
			<div className="mb-4 text-gray-800">{message}</div>
			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onOk}>
					OK
				</Button>
			</div>
		</div>
	</div>
);

const EventURLRule: React.FC = React.memo(() => {
	const [isAddDialogStatus, setIsAddDialogStatus] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [rules, setRules] = useState<any[]>([]);
	const [editRule, setEditRule] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);
	const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const getData = async () => {
		try {
			const result = await urlRuleApi.getLeadFormUrlRule();
			setRules(result.data);
		} catch (err) {
			setError("Failed to load rules");
		} finally {
			setLoading(false);
		}
	};

	// Simulate API fetch for now
	useEffect(() => {
		setLoading(true);
		setError("");

		getData();
	}, []);

	const totalItems = rules.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalItems);
	const paginatedRules = rules.slice(startIndex, endIndex);

	const handlePageChange = (newPage: any) => {
		setCurrentPage(newPage);
	};

	// const handlePageSizeChange = (value: any) => {
	// 	const newPageSize = parseInt(value);
	// 	setPageSize(newPageSize);
	// 	setCurrentPage(1); // Reset to first page when changing page size
	// };

	const renderPagination = () => {
		const renderPageNumbers = () => {
			const pages = [];

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
					<Button
						size="xs"
						variant="secondary"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						Previous
					</Button>
					<div className="flex items-center gap-1">
						{renderPageNumbers()}
					</div>
					<Button
						size="xs"
						variant="secondary"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						Next
					</Button>
				</div>
				<div className="text-sm text-gray-600 ml-2">
					{totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
					{totalItems}{" "}
				</div>
			</div>
		);
	};

	const handleAddrule = async () => {
		console.log("It is ok");
		setIsAddDialogStatus(true);
	};

	return (
		<div className="mt-6 space-y-6">
			<div className="flex items-center gap-4 justify-end">
				<Button onClick={handleAddrule}>Add New Rule</Button>
			</div>
			<div>
				<Table className="h-[400px]">
					<TableHead>
						<TableRow>
							<TableHeaderCell>Words to Page Url</TableHeaderCell>
							<TableHeaderCell>
								Words to Previous Page
							</TableHeaderCell>
							<TableHeaderCell>Created At</TableHeaderCell>
							{/* <TableHeaderCell>Actions</TableHeaderCell> */}
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRules.map((rule) => (
							<TableRow key={rule.id}>
								{/* <TableCell>{rule.name}</TableCell> */}
								<TableCell>
									{Array.isArray(rule.words_for_page_url)
										? rule.words_for_page_url.join(", ")
										: rule.wordstopage}
								</TableCell>
								<TableCell>
									{Array.isArray(rule.words_for_previous_url)
										? rule.words_for_previous_url.join(", ")
										: rule.wordstoprevious}
								</TableCell>
								<TableCell>
									{new Date(rule.created_at).toLocaleString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{!loading && !error && rules.length > 0 && renderPagination()}
			{editDialogOpen && (
				<EditDialog
					open={editDialogOpen}
					onCancel={() => {
						setEditDialogOpen(false);
						setEditRule(null);
					}}
					onOk={() => {
						setEditDialogOpen(false);
						setEditRule(null);
						getData();
					}}
					initialValues={
						editRule
							? {
									id: editRule.id,
									name: editRule.name,
									wordstopage: Array.isArray(
										editRule.words_for_page_url
									)
										? editRule.words_for_page_url
										: [],
									wordstoprevious: Array.isArray(
										editRule.words_for_previous_url
									)
										? editRule.words_for_previous_url
										: [],
							  }
							: undefined
					}
				/>
			)}
			<ConfirmDialog
				open={confirmOpen}
				message="Are you sure you want to delete this rule?"
				onCancel={() => {
					setConfirmOpen(false);
					setDeleteRuleId(null);
				}}
				onOk={async () => {
					if (deleteRuleId != null) {
						setDeletingRuleId(deleteRuleId);
						setConfirmOpen(false);
						try {
							await urlRuleApi.delete(deleteRuleId);

							// Update UI directly by removing the deleted rule from state
							setRules((prevRules) =>
								prevRules.filter(
									(rule) => rule.id !== deleteRuleId
								)
							);

							setDeleteRuleId(null);
							setDeletingRuleId(null);
						} catch (err) {
							setError("Failed to delete rule");
							setDeletingRuleId(null);
						}
					}
				}}
			/>
			{loading && (
				<div className="flex items-center justify-center">
					<div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					<span className="ml-2 text-gray-600">Loading...</span>
				</div>
			)}
			<AddDialog
				open={isAddDialogStatus}
				onCancel={() => setIsAddDialogStatus(false)}
				onOk={() => getData()}
			/>
		</div>
	);
});

export default EventURLRule;
