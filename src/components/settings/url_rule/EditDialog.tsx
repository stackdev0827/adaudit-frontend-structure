import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { urlRuleApi } from "../../../services/api";

// Notification component
const Notification = ({
	message,
	type,
	onClose,
}: {
	message: string;
	type: "success" | "error";
	onClose: () => void;
}) => (
	<div
		className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${
			type === "success" ? "bg-green-600" : "bg-red-600"
		}`}
	>
		<span>{message}</span>
		<button className="ml-4 text-white font-bold" onClick={onClose}>
			&times;
		</button>
	</div>
);

interface EditDialogProps {
	open: boolean;
	onOk: (data: {
		name: string;
		wordstopage: string[];
		wordstoprevious: string[];
	}) => void;
	onCancel: () => void;
	initialValues?: {
		id: number;
		name: string;
		wordstopage: string[];
		wordstoprevious: string[];
	};
}

const EditDialog: React.FC<EditDialogProps> = ({
	open,
	onOk,
	onCancel,
	initialValues,
}) => {
	const id = initialValues?.id;
	const [name, setName] = useState(initialValues?.name || "");
	const [wordstopage, setWordsToPage] = useState<string[]>(
		initialValues?.wordstopage || []
	);
	const [wordstopageInput, setWordsToPageInput] = useState("");
	const [wordstoprevious, setWordsToPrevious] = useState<string[]>(
		initialValues?.wordstoprevious || []
	);
	const [wordstopreviousInput, setWordsToPreviousInput] = useState("");
	const [notification, setNotification] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [mode, setMode] = useState<"page" | "both">("page");
	const [matchType, setMatchType] = useState<"contains" | "exact_match">(
		"contains"
	);
	const [matchTypePage, setMatchTypePage] = useState<
		"contains" | "exact_match"
	>("contains");
	const [matchTypePrevious, setMatchTypePrevious] = useState<
		"contains" | "exact_match"
	>("contains");

	// Reset state when initialValues or open changes
	useEffect(() => {
		setName(initialValues?.name || "");
		setWordsToPage(initialValues?.wordstopage || []);
		setWordsToPageInput("");
		const previousWords = initialValues?.wordstoprevious || [];
		setWordsToPrevious(previousWords);
		setWordsToPreviousInput("");

		// Automatically switch to "both" mode if there are previous URL words
		if (previousWords.length > 0) {
			setMode("both");
		} else {
			setMode("page");
		}
	}, [initialValues, open]);

	const handleOk = async () => {
		if (!id) {
			console.error("No ID provided for editing rule");
			return;
		}

		setIsLoading(true);
		// console.log(id);
		const AddRulePayload = {
			name,
			words_for_page_url: wordstopage,
			words_for_previous_url: mode === "page" ? [] : wordstoprevious,
			match_type_for_page_url:
				mode === "both"
					? matchTypePage === "contains"
						? 1
						: 2
					: matchType === "contains"
					? 1
					: 2,
			match_type_for_previous_url:
				mode === "both" ? (matchTypePrevious === "contains" ? 1 : 2) : 0,
		};
		try {
			await urlRuleApi.edit(id, AddRulePayload);
			// setNotification({ message: "Rule edited successfully!", type: "success" });
			onOk({ name, wordstopage, wordstoprevious });
			onCancel();
			setName("");
			setWordsToPage([]);
			setWordsToPageInput("");
			setWordsToPrevious([]);
			setWordsToPreviousInput("");
		} catch (e) {
			// setNotification({ message: "Failed to edit rule.", type: "error" });
			console.log("error");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setName("");
		setWordsToPage([]);
		setWordsToPageInput("");
		setWordsToPrevious([]);
		setWordsToPreviousInput("");
		onCancel();
	};

	const handleAddWord = (
		value: string,
		list: string[],
		setList: React.Dispatch<React.SetStateAction<string[]>>,
		setInput: React.Dispatch<React.SetStateAction<string>>
	) => {
		const word = value.trim();
		if (word && !list.includes(word)) {
			setList([...list, word]);
		}
		setInput("");
	};

	const handleRemoveWord = (
		word: string,
		list: string[],
		setList: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		setList(list.filter((w) => w !== word));
	};

	return (
		<>
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}
			<Dialog open={open} onClose={handleCancel} static={true}>
				<DialogPanel>
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-gray-900">
							Edit URL Rule
						</h3>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Name
							</label>
							<TextInput
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter name"
							/>
						</div>
						<div className="flex border-b border-gray-200 pb-2">
							<button
								type="button"
								className={`px-4 py-1 rounded-t-md border-b-2 text-sm font-medium focus:outline-none transition-colors duration-150 ${
									mode === "page"
										? "border-blue-500 text-blue-700 bg-blue-50"
										: "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"
								}`}
								onClick={() => setMode("page")}
							>
								Only Page URL
							</button>
							<button
								type="button"
								className={`px-4 py-1 rounded-t-md border-b-2 text-sm font-medium focus:outline-none transition-colors duration-150 ${
									mode === "both"
										? "border-blue-500 text-blue-700 bg-blue-50"
										: "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"
								}`}
								onClick={() => setMode("both")}
							>
								Page URL & Previous URL
							</button>
						</div>
						{mode === "page" && (
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Words For Page URL
								</label>
								<TextInput
									value={wordstopageInput}
									onChange={(e) => setWordsToPageInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddWord(
												wordstopageInput,
												wordstopage,
												setWordsToPage,
												setWordsToPageInput
											);
										}
									}}
									placeholder="Type a word and press Enter"
								/>
								{wordstopage.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{wordstopage.map((word) => (
											<span
												key={word}
												className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
											>
												{word}
												<button
													type="button"
													className="ml-1 text-blue-500 hover:text-blue-700"
													onClick={() =>
														handleRemoveWord(word, wordstopage, setWordsToPage)
													}
													aria-label="Remove"
												>
													×
												</button>
											</span>
										))}
									</div>
								)}
								<div className="flex gap-4 mt-4 justify-end">
									<label className="flex items-center gap-1 text-sm cursor-pointer">
										<input
											type="radio"
											name="matchType"
											value="contains"
											checked={matchType === "contains"}
											onChange={() => setMatchType("contains")}
											className="accent-blue-500"
										/>
										Contains
									</label>
									<label className="flex items-center gap-1 text-sm cursor-pointer">
										<input
											type="radio"
											name="matchType"
											value="exact_match"
											checked={matchType === "exact_match"}
											onChange={() => setMatchType("exact_match")}
											className="accent-blue-500"
										/>
										Exact Match
									</label>
								</div>
							</div>
						)}
						{mode === "both" && (
							<div className="grid gap-4">
								<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Words For Page URL
									</label>
									<TextInput
										value={wordstopageInput}
										onChange={(e) => setWordsToPageInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddWord(
													wordstopageInput,
													wordstopage,
													setWordsToPage,
													setWordsToPageInput
												);
											}
										}}
										placeholder="Type a word and press Enter"
									/>
									{wordstopage.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{wordstopage.map((word) => (
												<span
													key={word}
													className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
												>
													{word}
													<button
														type="button"
														className="ml-1 text-blue-500 hover:text-blue-700"
														onClick={() =>
															handleRemoveWord(
																word,
																wordstopage,
																setWordsToPage
															)
														}
														aria-label="Remove"
													>
														×
													</button>
												</span>
											))}
										</div>
									)}
									<div className="flex gap-4 mt-4 justify-end">
										<label className="flex items-center gap-1 text-sm cursor-pointer">
											<input
												type="radio"
												name="matchTypePage"
												value="contains"
												checked={matchTypePage === "contains"}
												onChange={() => setMatchTypePage("contains")}
												className="accent-blue-500"
											/>
											Contains
										</label>
										<label className="flex items-center gap-1 text-sm cursor-pointer">
											<input
												type="radio"
												name="matchTypePage"
												value="exact_match"
												checked={matchTypePage === "exact_match"}
												onChange={() => setMatchTypePage("exact_match")}
												className="accent-blue-500"
											/>
											Exact Match
										</label>
									</div>
								</div>
								<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Words For Previous URL
									</label>
									<TextInput
										value={wordstopreviousInput}
										onChange={(e) => setWordsToPreviousInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddWord(
													wordstopreviousInput,
													wordstoprevious,
													setWordsToPrevious,
													setWordsToPreviousInput
												);
											}
										}}
										placeholder="Type a word and press Enter"
									/>
									{wordstoprevious.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{wordstoprevious.map((word) => (
												<span
													key={word}
													className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
												>
													{word}
													<button
														type="button"
														className="ml-1 text-green-500 hover:text-green-700"
														onClick={() =>
															handleRemoveWord(
																word,
																wordstoprevious,
																setWordsToPrevious
															)
														}
														aria-label="Remove"
													>
														×
													</button>
												</span>
											))}
										</div>
									)}
									<div className="flex gap-4 mt-4 justify-end">
										<label className="flex items-center gap-1 text-sm cursor-pointer">
											<input
												type="radio"
												name="matchTypePrevious"
												value="contains"
												checked={matchTypePrevious === "contains"}
												onChange={() => setMatchTypePrevious("contains")}
												className="accent-blue-500"
											/>
											Contains
										</label>
										<label className="flex items-center gap-1 text-sm cursor-pointer">
											<input
												type="radio"
												name="matchTypePrevious"
												value="exact_match"
												checked={matchTypePrevious === "exact_match"}
												onChange={() => setMatchTypePrevious("exact_match")}
												className="accent-blue-500"
											/>
											Exact Match
										</label>
									</div>
								</div>
							</div>
						)}

						<div className="flex justify-end gap-2 pt-2">
							<Button variant="secondary" onClick={handleCancel}>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleOk}
								disabled={
									!name.trim() || mode === "page"
										? wordstopage.length === 0
										: wordstopage.length === 0 || wordstoprevious.length === 0
								}
								loading={isLoading}
							>
								Edit
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		</>
	);
};

export default EditDialog;
