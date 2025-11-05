import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogPanel, ProgressCircle } from "@tremor/react";
import { integrationApi } from "../../../services/api";

const HyrosApiModal = ({
	open,
	onClose,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) => {
	const [apiToken, setApiToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [apiLists, setApiLists] = useState<string[]>([]);
	const [fetching, setFetching] = useState(false);

	useEffect(() => {
		if (!open) return;
		setFetching(true);
		const fetchAPILists = async () => {
			try {
				const lists = await integrationApi.getHyrosAPIList();
				setApiToken(lists.data[0]);
				setApiLists(lists.data || []);
			} catch (err) {
				setApiLists([]);
			} finally {
				setFetching(false);
			}
		};
		fetchAPILists();
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await integrationApi.updateApiHyros(apiToken);
			setApiToken("");
			onSuccess();
			onClose();
		} catch (err: any) {
			setError("Failed to connect Hyros");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} static={true}>
			<DialogPanel>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Connect Hyros
						</h3>
						<div>
							<label
								htmlFor="hyrosApiToken"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								API Token
							</label>
							<input
								className="border px-3 py-2 rounded w-full"
								defaultValue={apiLists[0]}
								onChange={(e) => setApiToken(e.target.value)}
								disabled={fetching}
							/>
						</div>
						{error && (
							<div className="text-red-500 mb-2">{error}</div>
						)}
						<div className="flex justify-end gap-2 items-center">
							{fetching && (
								<span className="animate-spin absolute left-0 ml-7">
									<ProgressCircle
										value={25}
										radius={8}
										strokeWidth={2}
										color="blue"
									/>
								</span>
							)}
							<Button
								variant="primary"
								type="submit"
								disabled={loading || fetching}
								loading={loading}
								className="min-w-[80px]"
							>
								Save
							</Button>
							<Button
								variant="secondary"
								type="button"
								onClick={onClose}
								disabled={loading || fetching}
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
								className="ml-3 min-w-[80px]"
							>
								Next
							</Button>
						</div>
					</div>
				</form>
			</DialogPanel>
		</Dialog>
	);
};

export default HyrosApiModal;
