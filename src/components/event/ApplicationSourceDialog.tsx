import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, Button, Card } from "@tremor/react";

interface ApplicationSourceDialogProps {
	open: boolean;
	onClose: () => void;
	// onOk: () => void;
}

const ApplicationSourceDialog: React.FC<ApplicationSourceDialogProps> = ({
	open,
	onClose,
	// onOk,
}) => {
	const navigate = useNavigate();
	const [zapierDialogOpen, setZapierDialogOpen] = useState(false);

	const handleCancel = () => {
		onClose();
	};

	const handleConnect = () => {
		navigate(`/settings/integrations/typeform`);
	};

	return (
		<>
			<Dialog open={open} onClose={handleCancel} static={true}>
				<DialogPanel className="max-w-xs">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-10">
							Application Sources
						</h3>

						<div className="flex gap-4 items-center justify-center">
							<Card
								className="w-32 h-32 flex flex-col items-center justify-center text-center p-4 hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
								onClick={() => handleConnect()}
							>
								<img
									src={"/logo/typeform.svg"}
									alt="logo"
									className="w-8 h-8 mb-2 object-contain"
								/>
								<span className="font-medium text-gray-700 group-hover:opacity-0 transition-opacity duration-300">
									Typeform
								</span>
								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<span className="font-medium text-blue-600 bg-white px-3 py-1 rounded-md shadow-md">
										Configure
									</span>
								</div>
							</Card>
							<Card
								className="w-32 h-32 flex flex-col items-center justify-center text-center p-4 hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
								onClick={() => setZapierDialogOpen(true)}
							>
								<img
									src={"/logo/zapier.svg"}
									alt="logo"
									className="w-8 h-8 mb-2 object-contain"
								/>
								<span className="font-medium text-gray-700 group-hover:opacity-0 transition-opacity duration-300">
									Zapier
								</span>
								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<span className="font-medium text-blue-600 bg-white px-3 py-1 rounded-md shadow-md">
										Configure
									</span>
								</div>
							</Card>
						</div>

						<div className="flex justify-end gap-2 mt-10">
							<Button variant="secondary" onClick={handleCancel}>
								Cancel
							</Button>
						</div>
					</div>
				</DialogPanel>
				<Dialog
					open={zapierDialogOpen}
					onClose={() => setZapierDialogOpen(false)}
					static={true}
				>
					<DialogPanel>
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Zapier Integration
							</h3>
							<div className="space-y-4">
								<p className="text-gray-600">
									Connect your lead form submissions to Zapier
									to automate workflows and integrate with
									other applications.
								</p>
								{/* Add your Zapier integration content here */}
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="secondary"
									onClick={() => setZapierDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									onClick={() => setZapierDialogOpen(false)}
								>
									Connect
								</Button>
							</div>
						</div>
					</DialogPanel>
				</Dialog>
			</Dialog>
		</>
	);
};

export default ApplicationSourceDialog;
