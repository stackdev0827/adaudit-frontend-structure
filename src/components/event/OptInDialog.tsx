import React, { useState } from "react";
import {
	Dialog,
	DialogPanel,
	Button,
	TextInput,
	// Select,
	// SelectItem,
} from "@tremor/react";
import { eventApi } from "../../services/api";
import moment from "moment-timezone";
import { TIMEZONES } from "../../constants/timezones";

interface OptInDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const OptInDialog: React.FC<OptInDialogProps> = ({ open, onCancel, onOk }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		ips: "",
		// source: "",
		// sourceTag: "",
		optInDate: "",
		optInTime: "",
		optInTimezone: "",
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
			const combined = `${formData.optInDate}T${formData.optInTime}`;

			// interpret it as local time in that timezone
			const zonedTime = moment.tz(combined, formData.optInTimezone);

			const request = {
				email: formData.email,
				first_name: formData.firstName,
				last_name: formData.lastName,
				ip: formData.ips,
				event_time: zonedTime.format("YYYY-MM-DDTHH:mm:ssZ"),
			};
			const response = await eventApi.addOptIn(request);
			alert(response.data.message);
			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating opt-in:", error);
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
			// source: "",
			// sourceTag: "",
			optInDate: "",
			optInTime: "",
			optInTimezone: "",
		});
		onCancel();
	};

	const isFormValid =
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim() &&
		// formData.source.trim() &&
		formData.optInDate.trim() &&
		formData.optInTime.trim();

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Add Opt In
					</h3>

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

					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Source *
						</label>
						<Select
							value={formData.source}
							onValueChange={(value) =>
								handleInputChange("source", value)
							}
						>
							<SelectItem value="Paid">Paid</SelectItem>
							<SelectItem value="Organic">Organic</SelectItem>
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Source Tag
						</label>
						<TextInput
							value={formData.sourceTag}
							onChange={(e) =>
								handleInputChange("sourceTag", e.target.value)
							}
							placeholder="Enter source tag"
						/>
					</div> */}

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Date
							</label>
							<TextInput
								type="date"
								value={formData.optInDate}
								onChange={(e) =>
									handleInputChange(
										"optInDate",
										e.target.value
									)
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Time
							</label>
							<TextInput
								type="time"
								value={formData.optInTime}
								onChange={(e) =>
									handleInputChange(
										"optInTime",
										e.target.value
									)
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Timezone
							</label>
							<select
								value={formData.optInTimezone}
								onChange={(e) =>
									handleInputChange(
										"optInTimezone",
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
							Add Opt In
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default OptInDialog;
