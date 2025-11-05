import React, { useState } from "react";
import {
	Dialog,
	DialogPanel,
	Button,
	TextInput,
	Select,
	SelectItem,
} from "@tremor/react";
import moment from "moment-timezone";
import { TIMEZONES } from "../../constants/timezones";

import { eventApi } from "../../services/api";

interface SaleDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const SaleDialog: React.FC<SaleDialogProps> = ({ open, onCancel, onOk }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		purchaseEmail: "",
		customerPhone: "",
		bookingEmail: "",
		productName: "",
		grade: "",
		quantity: "",
		funnelType: "",
		orderId: "",
		taxes: "",
		shippingCost: "",
		costOfGoods: "",
		productId: "",
		sku: "",
		currency: "",
		discount: "",
		productPrice: "",
		amountPaid: "",
		saleDate: "",
		saleTime: "",
		saleTimezone: "",
		recurringPayment: false,
		rebillTimePeriod: "",
		timePeriodAmount: "",
		rebillPrice: "",
		numberOfRebills: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const combined = `${formData.saleDate}T${formData.saleTime}`;
			const zonedTime = moment.tz(combined, formData.saleTimezone);

			const request = {
				first_name: formData.firstName,
				last_name: formData.lastName,
				phone_number: formData.customerPhone,
				order_id: formData.orderId,
				date: zonedTime.format("YYYY-MM-DDTHH:mm:ssZ"),
				taxes: formData.taxes,
				shipping_cost: formData.shippingCost,
				discount: formData.discount,
				currency: formData.currency,
				cost_of_goods: parseFloat(formData.costOfGoods),
				funnel_type: parseInt(formData.funnelType),
				booked_call_email: formData.bookingEmail,
				purchase_email: formData.purchaseEmail,
				product_detail: [
					{
						product_id: formData.productId,
						product_name: formData.productName,
						price: parseFloat(formData.productPrice),
						amount_paid: parseFloat(formData.amountPaid),
						sku: formData.sku,
					},
				],
				recurring: [
					{
						recurring: formData.recurringPayment,
						rebill_time_period: formData.rebillTimePeriod,
						time_period_amount: parseInt(formData.timePeriodAmount),
						rebill_price: parseInt(formData.rebillPrice),
						number_of_rebills: parseFloat(formData.numberOfRebills),
					},
				],
			};
			const response = await eventApi.addSale(request);
			alert(response.data.message);
			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating sale:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			firstName: "",
			lastName: "",
			purchaseEmail: "",
			customerPhone: "",
			bookingEmail: "",
			productName: "",
			grade: "",
			quantity: "",
			funnelType: "",
			orderId: "",
			taxes: "",
			shippingCost: "",
			discount: "",
			currency: "",
			costOfGoods: "",
			productId: "",
			sku: "",
			productPrice: "",
			amountPaid: "",
			saleDate: "",
			saleTime: "",
			saleTimezone: "",
			recurringPayment: false,
			rebillTimePeriod: "",
			timePeriodAmount: "",
			rebillPrice: "",
			numberOfRebills: "",
		});
		onCancel();
	};

	const isFormValid =
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.purchaseEmail.trim() &&
		formData.customerPhone.trim() &&
		formData.productName.trim() &&
		formData.grade.trim() &&
		formData.funnelType.trim() &&
		formData.productPrice.trim() &&
		formData.amountPaid.trim() &&
		formData.saleDate.trim() &&
		formData.saleTime.trim();

	return (
		<Dialog open={open} onClose={handleCancel} static={true}>
			<DialogPanel>
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Add Sale
					</h3>

					<div className="space-y-6 h-[700px] overflow-y-auto">
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
								Purchase Email
							</label>
							<TextInput
								type="email"
								value={formData.purchaseEmail}
								onChange={(e) =>
									handleInputChange(
										"purchaseEmail",
										e.target.value
									)
								}
								placeholder="Enter purchase email address"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Customer Phone
							</label>
							<TextInput
								value={formData.customerPhone}
								onChange={(e) =>
									handleInputChange(
										"customerPhone",
										e.target.value
									)
								}
								placeholder="Enter customer phone number"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Booking Email (if different)
							</label>
							<TextInput
								type="email"
								value={formData.bookingEmail}
								onChange={(e) =>
									handleInputChange(
										"bookingEmail",
										e.target.value
									)
								}
								placeholder="Enter booking email if different"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Order ID
							</label>
							<TextInput
								value={formData.orderId}
								onChange={(e) =>
									handleInputChange("orderId", e.target.value)
								}
								placeholder="Enter Order ID"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Taxes
							</label>
							<TextInput
								value={formData.taxes}
								onChange={(e) =>
									handleInputChange("taxes", e.target.value)
								}
								placeholder="Enter Taxes"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Shipping Cost
							</label>
							<TextInput
								value={formData.shippingCost}
								onChange={(e) =>
									handleInputChange(
										"shippingCost",
										e.target.value
									)
								}
								placeholder="Enter shipping cost"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Discount
							</label>
							<TextInput
								value={formData.discount}
								onChange={(e) =>
									handleInputChange(
										"discount",
										e.target.value
									)
								}
								placeholder="Enter discount"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Currency
							</label>
							<TextInput
								value={formData.currency}
								onChange={(e) =>
									handleInputChange(
										"currency",
										e.target.value
									)
								}
								placeholder="Enter currency"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Cost of goods
							</label>
							<TextInput
								value={formData.costOfGoods}
								onChange={(e) =>
									handleInputChange(
										"costOfGoods",
										e.target.value
									)
								}
								placeholder="Enter cost of goods"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Product ID
							</label>
							<TextInput
								value={formData.productId}
								onChange={(e) =>
									handleInputChange(
										"productId",
										e.target.value
									)
								}
								placeholder="Enter product ID"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								SKU
							</label>
							<TextInput
								value={formData.sku}
								onChange={(e) =>
									handleInputChange("sku", e.target.value)
								}
								placeholder="Enter SKU"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Product Name
							</label>
							<TextInput
								value={formData.productName}
								onChange={(e) =>
									handleInputChange(
										"productName",
										e.target.value
									)
								}
								placeholder="Enter product name"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Grade
							</label>
							<Select
								value={formData.grade}
								onValueChange={(value) =>
									handleInputChange("grade", value)
								}
							>
								<SelectItem value="1">Cut</SelectItem>
								<SelectItem value="2">Below Average</SelectItem>
								<SelectItem value="3">Good</SelectItem>
								<SelectItem value="4">Great</SelectItem>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Qualified
							</label>
							<Select
								value={formData.quantity}
								onValueChange={(value) =>
									handleInputChange("quantity", value)
								}
							>
								<SelectItem value="true">Qualified</SelectItem>
								<SelectItem value="false">
									Unqualified
								</SelectItem>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Funnel Type
							</label>
							<Select
								value={formData.funnelType}
								onValueChange={(value) =>
									handleInputChange("funnelType", value)
								}
							>
								<SelectItem value="1">Call Funnel</SelectItem>
								<SelectItem value="2">eCom</SelectItem>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Product Price
								</label>
								<TextInput
									type="number"
									step="0.01"
									value={formData.productPrice}
									onChange={(e) =>
										handleInputChange(
											"productPrice",
											e.target.value
										)
									}
									placeholder="Enter product price"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Amount Paid
								</label>
								<TextInput
									type="number"
									step="0.01"
									value={formData.amountPaid}
									onChange={(e) =>
										handleInputChange(
											"amountPaid",
											e.target.value
										)
									}
									placeholder="Enter amount paid"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Sale Date
								</label>
								<TextInput
									type="date"
									value={formData.saleDate}
									onChange={(e) =>
										handleInputChange(
											"saleDate",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Sale Time
								</label>
								<TextInput
									type="time"
									value={formData.saleTime}
									onChange={(e) =>
										handleInputChange(
											"saleTime",
											e.target.value
										)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Sale Timezone
								</label>
								<select
									value={formData.saleTimezone}
									onChange={(e) =>
										handleInputChange(
											"saleTimezone",
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

						<div>
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={formData.recurringPayment}
									onChange={(e) =>
										handleInputChange(
											"recurringPayment",
											e.target.checked
										)
									}
									className="rounded border-gray-300"
								/>
								<span className="text-sm font-medium text-gray-700">
									Recurring Payment
								</span>
							</label>
						</div>

						{formData.recurringPayment && (
							<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
								<h4 className="text-md font-medium text-gray-900">
									Recurring Payment Details
								</h4>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Rebill Time Period
										</label>
										<Select
											value={formData.rebillTimePeriod}
											onValueChange={(value) =>
												handleInputChange(
													"rebillTimePeriod",
													value
												)
											}
										>
											<SelectItem value="Day">
												Day
											</SelectItem>
											<SelectItem value="Week">
												Week
											</SelectItem>
											<SelectItem value="Month">
												Month
											</SelectItem>
											<SelectItem value="Year">
												Year
											</SelectItem>
										</Select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Time Period Amount
										</label>
										<TextInput
											type="number"
											value={formData.timePeriodAmount}
											onChange={(e) =>
												handleInputChange(
													"timePeriodAmount",
													e.target.value
												)
											}
											placeholder="e.g., 1, 2, 3"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Rebill Price
										</label>
										<TextInput
											type="number"
											step="0.01"
											value={formData.rebillPrice}
											onChange={(e) =>
												handleInputChange(
													"rebillPrice",
													e.target.value
												)
											}
											placeholder="Enter rebill price"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Number of Rebills
										</label>
										<TextInput
											type="number"
											value={formData.numberOfRebills}
											onChange={(e) =>
												handleInputChange(
													"numberOfRebills",
													e.target.value
												)
											}
											placeholder="Enter number of rebills"
										/>
									</div>
								</div>
							</div>
						)}
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
							Add Sale
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default SaleDialog;
