import React, { useState } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { eventApi } from "../../services/api";

interface LeadDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const LeadDialog: React.FC<LeadDialogProps> = ({ open, onCancel, onOk }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		ips: "",
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
				// ips: formData.ips,
			};
			// Add API call to create lead
			const response = await eventApi.addUsers(request);
			const newItem = response.data; // Assuming the API returns the created item
			alert(response.data.message);
			if (
				response.data.message ===
				"The user already exists, so the user was successfully updated."
			) {
				return;
			}
			onOk(newItem);
			console.log(response.data);

			handleCancel();
		} catch (error) {
			console.error("Error creating lead:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			ips: "",
		});
		onCancel();
	};

	const isFormValid =
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim();

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Add Lead
					</h3>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								First Name *
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
								Last Name *
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
							Email *
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
							Phone *
						</label>
						<TextInput
							value={formData.phone}
							onChange={(e) =>
								handleInputChange("phone", e.target.value)
							}
							placeholder="Enter phone number"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							IPs
						</label>
						<TextInput
							value={formData.ips}
							onChange={(e) =>
								handleInputChange("ips", e.target.value)
							}
							placeholder="Enter IP addresses (comma separated)"
						/>
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
							Add Lead
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default LeadDialog;
