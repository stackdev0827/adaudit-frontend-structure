import React, { useState } from "react";
import { Dialog, DialogPanel, Button, Switch, Card } from "@tremor/react";
import EventURLRule from "./EventURLRule";

interface LeadFormDialogProps {
	open: boolean;
	onClose: () => void;
}

const LeadFormDialog: React.FC<LeadFormDialogProps> = ({ open, onClose }) => {
	const [urlRule, setUrlRule] = useState(false);
	const [trackingStatus, setTrackingStatus] = useState(false);
	const [zapierDialogOpen, setZapierDialogOpen] = useState(false);

	const handleCancel = () => {
		onClose();
	};

	const onTracking = () => {
		setTrackingStatus(!trackingStatus);
	};

	const onUrlRule = () => {
		setUrlRule(!urlRule);
	};

	const handleZapierClick = () => {
		setZapierDialogOpen(true);
	};

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel className="max-w-[600px]">
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-9">
						Native Lead Form Submission Tracking
					</h3>

					<div className="space-y-3">
						<span>Automatic Lead Form Tracking</span>
						<div className="flex items-center justify-start gap-2">
							<Switch
								checked={trackingStatus}
								onChange={() => onTracking}
							/>
							<span className="text-sm font-medium">
								Automatic Lead Form Tracking
							</span>
						</div>
						<div className="flex items-center justify-start gap-2">
							<Switch checked={urlRule} onChange={onUrlRule} />
							<span className="text-sm font-medium">
								URL Based Lead Form Submission
							</span>
						</div>
						{urlRule && (
							<div className="mt-4 p-4 border border-gray-200 rounded-lg">
								<EventURLRule />
							</div>
						)}
						<Card
							className="w-32 h-32 flex flex-col items-center justify-center text-center p-4 hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
							onClick={() => handleZapierClick()}
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
					<div className="flex justify-end gap-2">
						<Button variant="secondary" onClick={handleCancel}>
							Cancel
						</Button>
					</div>
				</div>
			</DialogPanel>

			{/* Zapier Dialog */}
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
								Connect your lead form submissions to Zapier to
								automate workflows and integrate with other
								applications.
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
	);
};

export default LeadFormDialog;
