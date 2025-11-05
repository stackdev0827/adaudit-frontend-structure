import React from "react";
import { Dialog, DialogPanel, Button, Divider } from "@tremor/react";

interface OnceHubSyncStatusModalProps {
	open: boolean;
	onClose: () => void;
	status?: {
		calls: [number, number];
		sales: [number, number];
		clicks: [number, number];
	};
}

const OnceHubSyncStatusModal: React.FC<OnceHubSyncStatusModalProps> = ({
	open,
	onClose,
	status = {
		calls: [1, 1000],
		sales: [100, 923],
		clicks: [111, 1000],
	},
}) => (
	<Dialog open={open} onClose={onClose} static={true}>
		<DialogPanel>
			<div className="space-y-4">
				<h3 className="text-lg font-medium leading-6 text-gray-900">
					OnceHub Syncing Forms
				</h3>
				<Divider />
				<ul className="space-y-2">
					<li>
						<b>Calls</b> ({status.calls[0]}/{status.calls[1]})
					</li>
					<li>
						<b>Sales</b> ({status.sales[0]}/{status.sales[1]})
					</li>
					<li>
						<b>Clicks</b> ({status.clicks[0]}/{status.clicks[1]})
					</li>
				</ul>
				<div className="flex justify-end">
					<Button variant="primary" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</DialogPanel>
	</Dialog>
);

export default OnceHubSyncStatusModal;
