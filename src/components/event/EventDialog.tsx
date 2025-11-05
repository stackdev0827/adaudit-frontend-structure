import React from "react";
import LeadDialog from "./LeadDialog";
import OptInDialog from "./OptInDialog";
import ApplicationDialog from "./ApplicationDialog";
import BookCallDialog from "./BookCallDialog";
import SetDialog from "./SetDialog";
import OfferMadeDialog from "./OfferMadeDialog";
import SaleDialog from "./SaleDialog";

interface EventDialogProps {
	open: boolean;
	eventType: string;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
	open,
	eventType,
	onCancel,
	onOk,
}) => {
	const getDialogComponent = () => {
		switch (eventType) {
			case "Users":
				return (
					<LeadDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Lead Form Submissions":
				return (
					<OptInDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Applications":
				return (
					<ApplicationDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Booked Calls":
				return (
					<BookCallDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Sets":
				return (
					<SetDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Offers Made":
				return (
					<OfferMadeDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			case "Sales":
				return (
					<SaleDialog
						open={open}
						onCancel={onCancel}
						onOk={(newItem) => onOk(newItem)}
					/>
				);
			default:
				return null;
		}
	};

	return <>{getDialogComponent()}</>;
};

export default EventDialog;
