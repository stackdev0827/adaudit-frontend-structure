import React, { useState } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { useNavigate } from "react-router-dom";

interface APIModalProps {
	open?: boolean;
	onClose?: () => void;
	integrationName?: string;
}

const APIModal: React.FC<APIModalProps> = ({
	open = false,
	onClose = () => {},
	integrationName = "",
}) => {
	const [apiToken, setApiToken] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleConnect = async () => {
		setLoading(true);
		try {
			// console.log(`Connecting ${integrationName} with token:`, apiToken);
			// Add your API connection logic here

			// Reset and close
			setApiToken("");
			onClose();

			// Navigate to integration page
			navigate(
				`/integrations/${integrationName.toLowerCase().replace(/\s+/g, "-")}`
			);
		} catch (error) {
			console.error("Connection failed:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} static={true}>
			<DialogPanel>
				<div className="space-y-4">
					<h3 className="text-lg font-medium leading-6 text-gray-900">
						Connect {integrationName}
					</h3>
					<div>
						<label
							htmlFor="apiToken"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							API Token
						</label>
						<TextInput
							id="apiToken"
							placeholder={`Enter your ${integrationName} API token`}
							value={apiToken}
							onChange={(e) => setApiToken(e.target.value)}
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="secondary" onClick={onClose} disabled={loading}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleConnect}
							disabled={!apiToken || loading}
							loading={loading}
						>
							Connect
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default APIModal;
