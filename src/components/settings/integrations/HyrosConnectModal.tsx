// import React, { useState } from "react";
// import { integrationApi } from "../../services/api";

// const HyrosConnectModal = ({
// 	open,
// 	onClose,
// 	onSuccess,
// }: {
// 	open: boolean;
// 	onClose: () => void;
// 	onSuccess: () => void;
// }) => {
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState("");

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);
// 		setError("");
// 		try {
// 			const res = await integrationApi.connectHyros({ email, password });
// 			if (res.status < 200 || res.status >= 300)
// 				throw new Error("Failed to connect");

// 			onSuccess();
// 			onClose();
// 		} catch (err: any) {
// 			setError(err.message || "Error");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	if (!open) return null;
// 	return (
// 		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
// 			<div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
// 				<h2 className="text-lg font-bold mb-4">Connect Hyros</h2>
// 				<form onSubmit={handleSubmit}>
// 					<input
// 						className="border p-2 w-full mb-2"
// 						type="email"
// 						placeholder="Email"
// 						value={email}
// 						onChange={(e) => setEmail(e.target.value)}
// 						required
// 					/>
// 					<input
// 						className="border p-2 w-full mb-4"
// 						type="password"
// 						placeholder="Password"
// 						value={password}
// 						onChange={(e) => setPassword(e.target.value)}
// 						required
// 					/>
// 					{error && <div className="text-red-500 mb-2">{error}</div>}
// 					<div className="flex gap-2">
// 						<button
// 							type="submit"
// 							className="bg-blue-600 text-white px-4 py-2 rounded"
// 							disabled={loading}
// 						>
// 							{loading ? "Connecting..." : "Submit"}
// 						</button>
// 						<button
// 							type="button"
// 							className="bg-gray-200 px-4 py-2 rounded"
// 							onClick={onClose}
// 							disabled={loading}
// 						>
// 							Cancel
// 						</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };

// export default HyrosConnectModal;
import React, { useState } from "react";
import { integrationApi } from "../../../services/api";
import { Button, Divider, TextInput } from "@tremor/react";

const HyrosConnectModal = ({
	open,
	onClose,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await integrationApi.connectHyros({ email, password });
			if (res.status < 200 || res.status >= 300)
				throw new Error("Failed to connect");

			onSuccess();
			onClose();
		} catch (err: any) {
			setError(err.message || "Error");
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
			<div className="bg-white rounded-lg shadow-lg p-6 min-w-[370px]">
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Connect Hyros
						</h3>
						<Divider />
						<div>
							<label
								htmlFor="hyrosEmail"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<TextInput
								id="hyrosEmail"
								type="email"
								placeholder="Enter your Hyros email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div>
							<label
								htmlFor="hyrosPassword"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<TextInput
								id="hyrosPassword"
								type="password"
								placeholder="Enter your Hyros password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && (
							<div className="text-red-500 mb-2">{error}</div>
						)}
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								type="button"
								onClick={onClose}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								type="submit"
								disabled={loading || !email || !password}
								loading={loading}
							>
								{loading ? "Connecting..." : "Connect"}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default HyrosConnectModal;
