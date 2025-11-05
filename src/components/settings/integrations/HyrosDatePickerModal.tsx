import React, { useState } from "react";
import { Dialog, DialogPanel, Button } from "@tremor/react";
import { integrationApi } from "../../../services/api";

interface HyrosDatePickerModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const HyrosDatePickerModal: React.FC<HyrosDatePickerModalProps> = ({
	open,
	onClose,
	onSuccess,
}) => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [includeCalls, setIncludeCalls] = useState(false);
	const [includeSales, setIncludeSales] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const handleSubmit = async () => {
		setErrorMsg("");

		// if (!startDate || !endDate) {
		// 	setErrorMsg("Please select a start and end date.");
		// 	return;
		// }

		if (startDate && startDate < "2010-01-01") {
			setErrorMsg("Please select a date after 2010-01-01.");
			return;
		}

		setLoading(true);
		// console.log(includeCalls, includeSales, startDate, endDate);

		try {
			const data = {
				calls: {
					required: includeCalls,
					start_time: startDate,
					end_time: endDate,
				},
				sales: {
					required: includeSales,
					start_time: startDate,
					end_time: endDate,
				},
			};

			await integrationApi.syncHyrosData(data);
			onSuccess();
			onClose();
		} catch (error) {
			setErrorMsg("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-medium text-gray-900">
						Sync Data
					</h3>

					<div>
						<p className="mb-2 text-sm font-semibold">
							Select Date
						</p>
						<div className="flex gap-2">
							<input
								type="date"
								className="text-sm border px-3 py-2 rounded w-full"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								min="2010-01-01"
							/>
							<span className="self-center">~</span>
							<input
								type="date"
								className="text-sm border px-3 py-2 rounded w-full"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								min="2010-01-01"
							/>
						</div>
						<div className="mt-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
							<svg
								className="w-4 h-4 text-blue-400"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1.5 15.799 1.5 10S6.201-.5 12-.5s10.5 4.701 10.5 10.5-4.701 10.5-10.5 10.5z"
								/>
							</svg>
							<span>
								If fromDate is not selected, data will be
								retrieved from the oldest date, and if endDate
								is not selected, data will be retrieved up to
								the latest date.
							</span>
						</div>
					</div>

					<div>
						<p className="mb-2 text-sm font-semibold">
							Select Data
						</p>
						<div className="flex gap-6 text-sm ml-4 mt-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={includeCalls}
									onChange={() =>
										setIncludeCalls(!includeCalls)
									}
								/>
								<span>Calls</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={includeSales}
									onChange={() =>
										setIncludeSales(!includeSales)
									}
								/>
								<span>Sales</span>
							</label>
						</div>
					</div>

					{errorMsg && (
						<p className="text-red-500 text-sm">{errorMsg}</p>
					)}

					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={onClose}
							className="min-w-[100px]"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleSubmit}
							disabled={!includeCalls && !includeSales}
							loading={loading}
							className="min-w-[100px]"
						>
							Sync Data
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default HyrosDatePickerModal;
