import React, { useEffect, useState } from "react";
import {
	Button,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TextInput,
	TableCell,
	Dialog,
	DialogPanel,
} from "@tremor/react";
import { businessApi } from "../../../services/api";

const BusinessManagement: React.FC = React.memo(() => {
	const [openStatus, setOpenStatus] = useState(false);
	const [businessAccounts, setBusinessAccount] = useState<any[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		address: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

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
				business_name: formData.name,
				business_address: formData.address,
			};
			const response = await businessApi.create(request);
			alert("Business account created successfully!");
			setBusinessAccount((prev) => [...prev, response.data]);
			handleCancel();
		} catch (error) {
			console.error("Error creating business account:", error);
			alert("Failed to create business account");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: "",
			address: "",
		});
		setOpenStatus(false);
	};

	const isFormValid = formData.name.trim() && formData.address.trim();

	const handleDeleteClick = (business: any) => {
		setSelectedBusiness(business);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedBusiness?.id) {
			console.error("No business ID available for deletion");
			return;
		}

		try {
			setDeleteLoading(true);
			await businessApi.delete(selectedBusiness.id);

			// Update UI by removing the deleted business from state
			setBusinessAccount((prevBusinesses) =>
				prevBusinesses.filter(
					(business) => business.id !== selectedBusiness.id
				)
			);

			setDeleteDialogOpen(false);
			setSelectedBusiness(null);
		} catch (error) {
			console.error("Failed to delete business:", error);
			alert("Failed to delete business account");
		} finally {
			setDeleteLoading(false);
		}
	};

	useEffect(() => {
		const getBusinessList = async () => {
			try {
				const response = await businessApi.getAll();
				console.log(response.data);
				setBusinessAccount(response.data.businesses);
			} catch (err) {
				console.log(err);
			}
		};
		getBusinessList();
	}, []);

	return (
		<div className="mt-6 space-y-6">
			<div className="flex items-center gap-4 justify-end">
				<Button onClick={() => setOpenStatus(true)}>
					Add Business Account
				</Button>
			</div>
			<div>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeaderCell>Name</TableHeaderCell>
							<TableHeaderCell>Address</TableHeaderCell>
							<TableHeaderCell>Status</TableHeaderCell>
							<TableHeaderCell>Actions</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{businessAccounts.map((account: any) => (
							<TableRow key={account.id}>
								<TableCell className="text-black">
									{account.business_name}
								</TableCell>
								<TableCell>
									{account.business_address}
								</TableCell>
								<TableCell>
									{account.is_selected
										? "Active"
										: "Inactive"}
								</TableCell>
								<TableCell>
									<Button
										size="xs"
										variant="secondary"
										color="red"
										onClick={() =>
											handleDeleteClick(account)
										}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<Dialog open={openStatus} onClose={handleCancel} static={true}>
				<DialogPanel>
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-gray-900">
							Add Business Account
						</h3>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Business Name
							</label>
							<TextInput
								value={formData.name}
								onChange={(e) =>
									handleInputChange("name", e.target.value)
								}
								placeholder="Enter business name"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Business Address
							</label>
							<TextInput
								value={formData.address}
								onChange={(e) =>
									handleInputChange("address", e.target.value)
								}
								placeholder="Enter business address"
							/>
						</div>

						<div className="flex justify-end space-x-3">
							<Button
								variant="secondary"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={!isFormValid || isLoading}
							>
								{isLoading ? "Creating..." : "Create"}
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
			{/* Delete Confirmation Dialog */}
			{deleteDialogOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg max-w-md w-full">
						<h3 className="text-lg font-medium mb-4">
							Confirm Delete
						</h3>
						<p className="mb-6">
							Are you sure you want to delete "
							{selectedBusiness?.business_name}"?
						</p>
						<div className="flex justify-end space-x-3">
							<Button
								variant="secondary"
								onClick={() => {
									setDeleteDialogOpen(false);
									setSelectedBusiness(null);
								}}
								disabled={deleteLoading}
							>
								Cancel
							</Button>
							<Button
								color="red"
								onClick={handleConfirmDelete}
								disabled={deleteLoading}
							>
								{deleteLoading ? "Deleting..." : "Delete"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
});

export default BusinessManagement;
