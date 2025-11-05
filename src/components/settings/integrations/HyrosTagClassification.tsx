import { useState, useMemo, useEffect, useRef } from "react";
import { Button, ProgressCircle } from "@tremor/react";
import { integrationApi } from "../../../services/api";

const CATEGORIES = [
	"Set - Call",
	"Confirmed - Call",
	"Qualified - Call",
	"Show - Call",
	"No Show - Call",
	"Call Funnel - Sale",
	"Ecomm Funnel - Sale",
];

const initialAssignments: Record<string, Set<string>> = {};
CATEGORIES.forEach((cat) => (initialAssignments[cat] = new Set()));

const HyrosTagClassification = ({
	open,
	onClose,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) => {
	const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
	const [search, setSearch] = useState("");
	const [assignments, setAssignments] = useState(initialAssignments);
	const [tags, setTags] = useState<
		{
			id: string;
			name: string;
			call_type?: string;
			funnel_type?: string;
		}[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [submitLoading, setSubmitLoading] = useState(false);
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	// Fetch tags from backend
	const fetchTags = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await integrationApi.getTags();
			setTags(response.data);
		} catch (err) {
			setError("Failed to load tags");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open) fetchTags();
	}, [open]);

	// Filter tags by search
	const filteredTags = useMemo(
		() =>
			tags.filter((tag) =>
				tag.name.toLowerCase().includes(search.toLowerCase())
			),
		[search, tags]
	);

	// Default check for tags by call_type.String and funnel_type.String values
	useEffect(() => {
		if (!tags.length) return;
		const newAssignments: typeof assignments = {};
		CATEGORIES.forEach((cat) => {
			newAssignments[cat] = new Set(assignments[cat]);
		});
		tags.forEach((tag) => {
			// For call_type.String, match to the correct call category
			if (tag.call_type) {
				const callType = tag.call_type.trim();
				const callCatMap: Record<string, string> = {
					Set: "Set - Call",
					Confirmed: "Confirmed - Call",
					Qualified: "Qualified - Call",
					Show: "Show - Call",
					"Not Show": "No Show - Call",
				};
				const cat = callCatMap[callType];
				if (cat) newAssignments[cat].add(tag.id);
			}
			// For funnel_type.String, match to the correct sale category
			if (tag.funnel_type) {
				const funnelType = tag.funnel_type.trim();
				const funnelCatMap: Record<string, string> = {
					"Call Funnel": "Call Funnel - Sale",
					"Ecomm Funnel": "Ecomm Funnel - Sale",
				};
				const cat = funnelCatMap[funnelType];
				if (cat) newAssignments[cat].add(tag.id);
			}
		});
		setAssignments(newAssignments);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tags]);

	// Tags assigned to the selected category
	const assignedTags = assignments[selectedCategory];

	const handleToggleTag = (tagId: string) => {
		setAssignments((prev) => {
			const newSet = new Set(prev[selectedCategory]);
			if (newSet.has(tagId)) {
				newSet.delete(tagId);
			} else {
				newSet.add(tagId);
			}
			return { ...prev, [selectedCategory]: newSet };
		});
	};

	const handleCategoryClick = (cat: string) => {
		setSelectedCategory(cat);
		// Auto-check tags whose call_type or funnel_type String matches the category
		setAssignments((prev) => {
			const newAssignments = { ...prev };
			const tagIdsToCheck = tags
				.filter((tag) => {
					if (cat.endsWith("Call") && tag.call_type) {
						return tag.call_type === cat;
					}
					if (cat.endsWith("Sale") && tag.funnel_type) {
						return tag.funnel_type === cat;
					}
					return false;
				})
				.map((tag) => tag.id);
			const newSet = new Set(newAssignments[cat]);
			tagIdsToCheck.forEach((id) => newSet.add(id));
			newAssignments[cat] = newSet;
			return newAssignments;
		});
	};

	useEffect(() => {
		if (open && dialogRef.current && !dialogRef.current.open) {
			dialogRef.current.showModal();
		} else if (!open && dialogRef.current && dialogRef.current.open) {
			dialogRef.current.close();
		}
	}, [open]);

	if (!open) return null; // Optionally keep for SSR safety

	return (
		<dialog
			ref={dialogRef}
			className="z-50 rounded-lg shadow-lg w-[900px] max-w-full h-[80vh] p-0 overflow-hidden flex items-center justify-center"
			style={{
				padding: 0,
				border: "none",
				background: "transparent",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				marginTop: "100px",
			}}
			// Prevent closing with ESC or clicking outside
			onCancel={(e) => {
				e.preventDefault();
			}}
		>
			<div className="relative bg-white rounded-lg flex w-full h-full">
				{/* Left Panel: Categories */}
				<div className="w-1/4 border-r p-4 bg-gray-50 overflow-y-auto">
					<h2 className="font-bold mb-4">Categories</h2>
					<ul className="text-sm">
						{CATEGORIES.map((cat) => (
							<li
								key={cat}
								className={`cursor-pointer px-2 py-2 rounded mb-1 ${
									selectedCategory === cat
										? "bg-blue-100 font-semibold"
										: "hover:bg-gray-100"
								}`}
								onClick={() => handleCategoryClick(cat)}
							>
								{cat}
							</li>
						))}
					</ul>
				</div>

				{/* Right Panel: Tags */}
				<div className="flex-1 p-4 flex flex-col h-full relative">
					<div className="flex items-center mb-4 mt-8">
						<input
							className="border px-3 py-2 rounded w-full text-sm"
							placeholder="Search tags..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					{loading ? (
						<div className="flex flex-1 items-center justify-center h-full">
							<span className="animate-spin mb-10">
								<ProgressCircle
									value={25}
									radius={16}
									strokeWidth={2}
									color="blue"
								/>
							</span>
						</div>
					) : error ? (
						<div className="text-red-500">{error}</div>
					) : (
						<>
							<div className="overflow-y-auto flex-1">
								{filteredTags.map((tag) => (
									<div
										key={tag.id}
										className={`flex items-center border rounded px-3 py-2 cursor-pointer ${
											assignedTags.has(tag.id)
												? "bg-blue-50 border-blue-400"
												: "hover:bg-gray-50"
										}`}
										onClick={() => handleToggleTag(tag.id)}
									>
										<input
											type="checkbox"
											checked={assignedTags.has(tag.id)}
											readOnly
											className="mr-2"
										/>
										<span className="text-sm">
											{tag.name}
										</span>
									</div>
								))}
							</div>
							<div className="mt-4 flex justify-end gap-2">
								<Button
									className="bg-blue-600 text-white px-6 py-2 rounded shadow text-xs min-w-[80px]"
									onClick={async () => {
										setSubmitLoading(true);
										const allAssignments: {
											Call: { [tagId: string]: string };
											Sale: { [tagId: string]: string };
										} = {
											Call: {},
											Sale: {},
										};

										// Map Call types
										[
											"Set - Call",
											"Confirmed - Call",
											"Qualified - Call",
											"Show - Call",
											"No Show - Call",
										].forEach((cat) => {
											const type =
												cat === "Set - Call"
													? "Set"
													: cat === "Confirmed - Call"
													? "Confirmed"
													: cat === "Qualified - Call"
													? "Qualified"
													: cat === "Show - Call"
													? "Show"
													: cat === "No Show - Call"
													? "Not Show"
													: "";
											assignments[cat].forEach(
												(tagId) => {
													allAssignments.Call[tagId] =
														type;
												}
											);
										});

										// Map Sale types
										[
											"Call Funnel - Sale",
											"Ecomm Funnel - Sale",
										].forEach((cat) => {
											const type =
												cat === "Call Funnel - Sale"
													? "Call Funnel"
													: "Ecomm Funnel";
											assignments[cat].forEach(
												(tagId) => {
													allAssignments.Sale[tagId] =
														type;
												}
											);
										});
										try {
											await integrationApi.saveTagAssignments(
												allAssignments
											);
											onSuccess();
											onClose();
											if (dialogRef.current)
												dialogRef.current.close();
										} catch (err) {
											console.error(
												"Failed to save assignments",
												err
											);
										} finally {
											setSubmitLoading(false);
										}
									}}
									disabled={submitLoading}
									loading={submitLoading}
								>
									Save
								</Button>
								<Button
									variant="secondary"
									type="button"
									onClick={onClose}
									disabled={loading}
									className="min-w-[80px]"
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									type="button"
									onClick={() => {
										onSuccess();
										onClose();
									}}
									className="min-w-[80px] ml-3"
								>
									Next
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</dialog>
	);
};

export default HyrosTagClassification;
