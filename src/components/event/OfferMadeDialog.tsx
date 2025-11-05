import React, { useState } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { eventApi } from "../../services/api";
import { TIMEZONES } from "../../constants/timezones";

interface OfferMadeDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const OfferMadeDialog: React.FC<OfferMadeDialogProps> = ({
	open,
	onCancel,
	onOk,
}) => {
	const [formData, setFormData] = useState({
		productName: "",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		offerDate: "",
		offerTime: "",
		offerTimezone: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const request = {
				first_name: formData.firstName,
				last_name: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				product_name: formData.productName,
			};
			const response = await eventApi.addOfferMade(request);
			alert(response.data.message);
			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating offer made:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			productName: "",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			offerDate: "",
			offerTime: "",
			offerTimezone: "",
		});
		onCancel();
	};

	const isFormValid =
		formData.productName.trim() &&
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim();
	// formData.offerDate.trim() &&
	// formData.offerTime.trim();

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Add Offer Made
					</h3>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Product Name
						</label>
						<TextInput
							value={formData.productName}
							onChange={(e) =>
								handleInputChange("productName", e.target.value)
							}
							placeholder="Enter product name"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								First Name
							</label>
							<TextInput
								value={formData.firstName}
								onChange={(e) =>
									handleInputChange(
										"firstName",
										e.target.value
									)
								}
								placeholder="Enter first name"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Last Name
							</label>
							<TextInput
								value={formData.lastName}
								onChange={(e) =>
									handleInputChange(
										"lastName",
										e.target.value
									)
								}
								placeholder="Enter last name"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<TextInput
							type="email"
							value={formData.email}
							onChange={(e) =>
								handleInputChange("email", e.target.value)
							}
							placeholder="Enter email address"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone
						</label>
						<TextInput
							value={formData.phone}
							onChange={(e) =>
								handleInputChange("phone", e.target.value)
							}
							placeholder="Enter phone number"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Offer Date
							</label>
							<TextInput
								type="date"
								value={formData.offerDate}
								onChange={(e) =>
									handleInputChange(
										"offerDate",
										e.target.value
									)
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Offer Time
							</label>
							<TextInput
								type="time"
								value={formData.offerTime}
								onChange={(e) =>
									handleInputChange(
										"offerTime",
										e.target.value
									)
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Offer Timezone
							</label>
							<select
								value={formData.offerTimezone}
								onChange={(e) =>
									handleInputChange(
										"offerTimezone",
										e.target.value
									)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Select timezone</option>
								{TIMEZONES.map((timezone) => (
									<option
										key={timezone.value}
										value={timezone.value}
									>
										{timezone.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleSubmit}
							disabled={!isFormValid}
							loading={isLoading}
						>
							Add Offer Made
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default OfferMadeDialog;
