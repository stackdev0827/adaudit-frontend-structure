import React, { useState } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { eventApi } from "../../services/api";
import moment from "moment-timezone";
import { TIMEZONES } from "../../constants/timezones";

interface SetDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const SetDialog: React.FC<SetDialogProps> = ({ open, onCancel, onOk }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		setId: "",
		setWith: "",
		setter: "",
		notes: "",
		customerTimezone: "",
		durationWithCloser: "",
		setMadeDate: "",
		setMadeTime: "",
		setMadeTimezone: "",
		scheduledDate: "",
		scheduledTime: "",
		scheduledTimezone: "",
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

		const combinedScheduledTime = `${formData.scheduledDate}T${formData.scheduledTime}`;
		const zonedTimeScheduledTime = moment.tz(
			combinedScheduledTime,
			formData.scheduledTimezone
		);

		const combinedSetMadeTime = `${formData.scheduledDate}T${formData.scheduledTime}`;
		const zonedTimeSetMadeTime = moment.tz(
			combinedSetMadeTime,
			formData.scheduledTimezone
		);
		try {
			const request = {
				email: formData.email,
				first_name: formData.firstName,
				last_name: formData.lastName,
				phone: formData.phone,
				set_id: formData.setId,
				set_with: formData.setWith,
				setter: formData.setter,
				timezone: formData.customerTimezone,
				// status: formData.status
				setter_notes: formData.notes,
				start_time: zonedTimeScheduledTime.format(
					"YYYY-MM-DDTHH:mm:ssZ"
				),
				duration: parseInt(formData.durationWithCloser),
				event_time: zonedTimeSetMadeTime.format("YYYY-MM-DDTHH:mm:ssZ"),
			};

			const response = await eventApi.addSet(request);
			alert(response.data.message);

			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating set:", error);
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
			setId: "",
			setWith: "",
			setter: "",
			notes: "",
			customerTimezone: "",
			durationWithCloser: "",
			setMadeDate: "",
			setMadeTime: "",
			setMadeTimezone: "",
			scheduledDate: "",
			scheduledTime: "",
			scheduledTimezone: "",
		});
		onCancel();
	};

	const isFormValid =
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim() &&
		formData.durationWithCloser.trim() &&
		formData.setMadeDate.trim() &&
		formData.setMadeTime.trim() &&
		formData.scheduledDate.trim() &&
		formData.scheduledTime.trim();

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Add Set
					</h3>

					<div className="h-[700px] overflow-y-auto space-y-6">
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
								Duration of Call With Closer
							</label>
							<TextInput
								value={formData.durationWithCloser}
								onChange={(e) =>
									handleInputChange(
										"durationWithCloser",
										e.target.value
									)
								}
								placeholder="Enter duration (e.g., 45 minutes)"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Set ID
							</label>
							<TextInput
								value={formData.setId}
								onChange={(e) =>
									handleInputChange("setId", e.target.value)
								}
								placeholder="Enter Set ID"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Set With
							</label>
							<TextInput
								value={formData.setWith}
								onChange={(e) =>
									handleInputChange("setWith", e.target.value)
								}
								placeholder="Enter Set With"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Setter
							</label>
							<TextInput
								value={formData.setter}
								onChange={(e) =>
									handleInputChange("setter", e.target.value)
								}
								placeholder="Enter Setter"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Notes
							</label>
							<TextInput
								value={formData.notes}
								onChange={(e) =>
									handleInputChange("notes", e.target.value)
								}
								placeholder="Enter Notes"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Customer Timezone
							</label>
							<select
								value={formData.customerTimezone}
								onChange={(e) =>
									handleInputChange(
										"customerTimezone",
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

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Scheduled Date
								</label>
								<TextInput
									type="date"
									value={formData.scheduledDate}
									onChange={(e) =>
										handleInputChange(
											"scheduledDate",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Scheduled Time
								</label>
								<TextInput
									type="time"
									value={formData.scheduledTime}
									onChange={(e) =>
										handleInputChange(
											"scheduledTime",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Scheduled Timezone
								</label>
								<select
									value={formData.scheduledTimezone}
									onChange={(e) =>
										handleInputChange(
											"scheduledTimezone",
											e.target.value
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="UTC">UTC</option>
									<option value="Etc/GMT">Etc/GMT</option>
									<option value="Europe/London">
										Europe/London
									</option>
									<option value="Europe/Berlin">
										Europe/Berlin
									</option>
									<option value="Europe/Paris">
										Europe/Paris
									</option>
									<option value="Europe/Madrid">
										Europe/Madrid
									</option>
									<option value="Europe/Rome">
										Europe/Rome
									</option>
									<option value="Europe/Moscow">
										Europe/Moscow
									</option>
									<option value="Asia/Dubai">
										Asia/Dubai
									</option>
									<option value="Asia/Karachi">
										Asia/Karachi
									</option>
									<option value="Asia/Kolkata">
										Asia/Kolkata
									</option>
									<option value="Asia/Dhaka">
										Asia/Dhaka
									</option>
									<option value="Asia/Bangkok">
										Asia/Bangkok
									</option>
									<option value="Asia/Jakarta">
										Asia/Jakarta
									</option>
									<option value="Asia/Shanghai">
										Asia/Shanghai
									</option>
									<option value="Asia/Hong_Kong">
										Asia/Hong_Kong
									</option>
									<option value="Asia/Singapore">
										Asia/Singapore
									</option>
									<option value="Asia/Tokyo">
										Asia/Tokyo
									</option>
									<option value="Asia/Kathmandu">
										Asia/Kathmandu
									</option>
									<option value="Asia/Yangon">
										Asia/Yangon
									</option>
									<option value="Australia/Sydney">
										Australia/Sydney
									</option>
									<option value="Australia/Melbourne">
										Australia/Melbourne
									</option>
									<option value="Australia/Brisbane">
										Australia/Brisbane
									</option>
									<option value="Australia/Perth">
										Australia/Perth
									</option>
									<option value="Pacific/Auckland">
										Pacific/Auckland
									</option>
									<option value="Pacific/Fiji">
										Pacific/Fiji
									</option>
									<option value="Africa/Cairo">
										Africa/Cairo
									</option>
									<option value="Africa/Nairobi">
										Africa/Nairobi
									</option>
									<option value="Africa/Lagos">
										Africa/Lagos
									</option>
									<option value="Africa/Johannesburg">
										Africa/Johannesburg
									</option>
									<option value="America/New_York">
										America/New_York
									</option>
									<option value="America/Chicago">
										America/Chicago
									</option>
									<option value="America/Denver">
										America/Denver
									</option>
									<option value="America/Los_Angeles">
										America/Los_Angeles
									</option>
									<option value="America/Toronto">
										America/Toronto
									</option>
									<option value="America/Mexico_City">
										America/Mexico_City
									</option>
									<option value="America/Bogota">
										America/Bogota
									</option>
									<option value="America/Lima">
										America/Lima
									</option>
									<option value="America/Santiago">
										America/Santiago
									</option>
									<option value="America/Caracas">
										America/Caracas
									</option>
									<option value="America/Sao_Paulo">
										America/Sao_Paulo
									</option>
									<option value="America/Argentina/Buenos_Aires">
										America/Argentina/Buenos_Aires
									</option>
									<option value="America/Vancouver">
										America/Vancouver
									</option>
									<option value="America/Phoenix">
										America/Phoenix
									</option>
									<option value="America/Anchorage">
										America/Anchorage
									</option>
									<option value="Pacific/Honolulu">
										Pacific/Honolulu
									</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Set Made Date
								</label>
								<TextInput
									type="date"
									value={formData.setMadeDate}
									onChange={(e) =>
										handleInputChange(
											"setMadeDate",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Set Made Time
								</label>
								<TextInput
									type="time"
									value={formData.setMadeTime}
									onChange={(e) =>
										handleInputChange(
											"setMadeTime",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Set Made Timezone
								</label>
								<select
									value={formData.setMadeTimezone}
									onChange={(e) =>
										handleInputChange(
											"setMadeTimezone",
											e.target.value
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="UTC">UTC</option>
									<option value="Etc/GMT">Etc/GMT</option>
									<option value="Europe/London">
										Europe/London
									</option>
									<option value="Europe/Berlin">
										Europe/Berlin
									</option>
									<option value="Europe/Paris">
										Europe/Paris
									</option>
									<option value="Europe/Madrid">
										Europe/Madrid
									</option>
									<option value="Europe/Rome">
										Europe/Rome
									</option>
									<option value="Europe/Moscow">
										Europe/Moscow
									</option>
									<option value="Asia/Dubai">
										Asia/Dubai
									</option>
									<option value="Asia/Karachi">
										Asia/Karachi
									</option>
									<option value="Asia/Kolkata">
										Asia/Kolkata
									</option>
									<option value="Asia/Dhaka">
										Asia/Dhaka
									</option>
									<option value="Asia/Bangkok">
										Asia/Bangkok
									</option>
									<option value="Asia/Jakarta">
										Asia/Jakarta
									</option>
									<option value="Asia/Shanghai">
										Asia/Shanghai
									</option>
									<option value="Asia/Hong_Kong">
										Asia/Hong_Kong
									</option>
									<option value="Asia/Singapore">
										Asia/Singapore
									</option>
									<option value="Asia/Tokyo">
										Asia/Tokyo
									</option>
									<option value="Asia/Kathmandu">
										Asia/Kathmandu
									</option>
									<option value="Asia/Yangon">
										Asia/Yangon
									</option>
									<option value="Australia/Sydney">
										Australia/Sydney
									</option>
									<option value="Australia/Melbourne">
										Australia/Melbourne
									</option>
									<option value="Australia/Brisbane">
										Australia/Brisbane
									</option>
									<option value="Australia/Perth">
										Australia/Perth
									</option>
									<option value="Pacific/Auckland">
										Pacific/Auckland
									</option>
									<option value="Pacific/Fiji">
										Pacific/Fiji
									</option>
									<option value="Africa/Cairo">
										Africa/Cairo
									</option>
									<option value="Africa/Nairobi">
										Africa/Nairobi
									</option>
									<option value="Africa/Lagos">
										Africa/Lagos
									</option>
									<option value="Africa/Johannesburg">
										Africa/Johannesburg
									</option>
									<option value="America/New_York">
										America/New_York
									</option>
									<option value="America/Chicago">
										America/Chicago
									</option>
									<option value="America/Denver">
										America/Denver
									</option>
									<option value="America/Los_Angeles">
										America/Los_Angeles
									</option>
									<option value="America/Toronto">
										America/Toronto
									</option>
									<option value="America/Mexico_City">
										America/Mexico_City
									</option>
									<option value="America/Bogota">
										America/Bogota
									</option>
									<option value="America/Lima">
										America/Lima
									</option>
									<option value="America/Santiago">
										America/Santiago
									</option>
									<option value="America/Caracas">
										America/Caracas
									</option>
									<option value="America/Sao_Paulo">
										America/Sao_Paulo
									</option>
									<option value="America/Argentina/Buenos_Aires">
										America/Argentina/Buenos_Aires
									</option>
									<option value="America/Vancouver">
										America/Vancouver
									</option>
									<option value="America/Phoenix">
										America/Phoenix
									</option>
									<option value="America/Anchorage">
										America/Anchorage
									</option>
									<option value="Pacific/Honolulu">
										Pacific/Honolulu
									</option>
								</select>
							</div>
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
							Add Set
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default SetDialog;
