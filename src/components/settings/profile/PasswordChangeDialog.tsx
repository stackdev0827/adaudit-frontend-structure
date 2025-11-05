import React, { useState } from "react";
import { Dialog, DialogPanel, Button, TextInput } from "@tremor/react";
import { Eye, EyeOff } from "lucide-react";
import { profileApi } from "../../../services/api";

interface PasswordChangeDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
	open,
	onClose,
	onSuccess,
}) => {
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}

		if (!formData.newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (formData.newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters";
		} else if (
			!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)
		) {
			newErrors.newPassword =
				"Password must contain uppercase, lowercase, and number";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (formData.currentPassword === formData.newPassword) {
			newErrors.newPassword =
				"New password must be different from current password";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			// Replace with your actual API call
			await profileApi.changePassword({
				current_password: formData.currentPassword,
				new_password: formData.newPassword,
			});

			onSuccess();
			handleClose();
		} catch (error: any) {
			console.log(error);
			setErrors({
				currentPassword:
					error.response?.data || "Failed to change password",
			});
		} finally {
			console.log("-------");
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setErrors({});
		setShowPasswords({
			current: false,
			new: false,
			confirm: false,
		});
		onClose();
	};

	const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	return (
		<Dialog open={open} onClose={handleClose} static={true}>
			<DialogPanel>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Change Password
						</h3>

						{/* Current Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Current Password
							</label>
							<div className="relative">
								<TextInput
									type={
										showPasswords.current
											? "text"
											: "password"
									}
									placeholder="Enter current password"
									value={formData.currentPassword}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											currentPassword: e.target.value,
										}))
									}
									// error={!!errors.currentPassword}
									// errorMessage={errors.currentPassword}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2"
									onClick={() =>
										togglePasswordVisibility("current")
									}
								>
									{showPasswords.current ? (
										<EyeOff className="h-4 w-4 text-gray-400" />
									) : (
										<Eye className="h-4 w-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* New Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								New Password
							</label>
							<div className="relative">
								<TextInput
									type={
										showPasswords.new ? "text" : "password"
									}
									placeholder="Enter new password"
									value={formData.newPassword}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											newPassword: e.target.value,
										}))
									}
									error={!!errors.newPassword}
									errorMessage={errors.newPassword}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2"
									onClick={() =>
										togglePasswordVisibility("new")
									}
								>
									{showPasswords.new ? (
										<EyeOff className="h-4 w-4 text-gray-400" />
									) : (
										<Eye className="h-4 w-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Confirm New Password
							</label>
							<div className="relative">
								<TextInput
									type={
										showPasswords.confirm
											? "text"
											: "password"
									}
									placeholder="Confirm new password"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											confirmPassword: e.target.value,
										}))
									}
									error={!!errors.confirmPassword}
									errorMessage={errors.confirmPassword}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2"
									onClick={() =>
										togglePasswordVisibility("confirm")
									}
								>
									{showPasswords.confirm ? (
										<EyeOff className="h-4 w-4 text-gray-400" />
									) : (
										<Eye className="h-4 w-4 text-gray-400" />
									)}
								</button>
							</div>
							{errors.currentPassword && (
								<span className="text-sm text-red-500 pt-10">
									{errors.currentPassword}
								</span>
							)}
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								variant="secondary"
								type="button"
								onClick={handleClose}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								type="submit"
								disabled={loading}
								loading={loading}
							>
								Change Password
							</Button>
						</div>
					</div>
				</form>
			</DialogPanel>
		</Dialog>
	);
};

export default PasswordChangeDialog;
