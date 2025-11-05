import React, { useState } from "react";
import {
	Dialog,
	DialogPanel,
	Button,
	TextInput,
	Select,
	SelectItem,
	Card,
} from "@tremor/react";
import moment from "moment-timezone";
import { TIMEZONES } from "../../constants/timezones";

import { Plus, X } from "lucide-react";
import { eventApi } from "../../services/api";

interface BookCallDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

interface QuestionAnswer {
	question: string;
	answer: string;
}

const FormSubmissionModal = ({
	open,
	onClose,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Record<string, string>) => void;
}) => {
	const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([
		{ question: "", answer: "" },
	]);

	const handleAddPair = () => {
		setQuestionAnswers([...questionAnswers, { question: "", answer: "" }]);
	};

	const handleRemovePair = (index: number) => {
		const newPairs = [...questionAnswers];
		newPairs.splice(index, 1);
		setQuestionAnswers(newPairs);
	};

	const handleChange = (
		index: number,
		field: "question" | "answer",
		value: string
	) => {
		const newPairs = [...questionAnswers];
		newPairs[index][field] = value;
		setQuestionAnswers(newPairs);
	};

	const handleSubmit = () => {
		// Filter out empty pairs and convert to object format
		const validPairs = questionAnswers.filter(
			(pair) => pair.question.trim() !== "" && pair.answer.trim() !== ""
		);

		// Convert array to object format: {"question1": "answer1", "question2": "answer2"}
		const formattedData = validPairs.reduce((acc, pair) => {
			acc[pair.question] = pair.answer;
			return acc;
		}, {} as Record<string, string>);

		onSubmit(formattedData);
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} static={true}>
			<DialogPanel className="max-w-2xl">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-semibold text-gray-900">
							Form Submission Details
						</h3>
						<Button variant="secondary" size="xs" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						{questionAnswers.map((pair, index) => (
							<Card key={index} className="p-4">
								<div className="flex justify-between items-start mb-2">
									<h4 className="text-sm font-medium">
										Question/Answer Pair #{index + 1}
									</h4>
									{questionAnswers.length > 1 && (
										<Button
											variant="light"
											color="red"
											size="xs"
											onClick={() =>
												handleRemovePair(index)
											}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Question
										</label>
										<TextInput
											value={pair.question}
											onChange={(e) =>
												handleChange(
													index,
													"question",
													e.target.value
												)
											}
											placeholder="Enter question"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Answer
										</label>
										<TextInput
											value={pair.answer}
											onChange={(e) =>
												handleChange(
													index,
													"answer",
													e.target.value
												)
											}
											placeholder="Enter answer"
										/>
									</div>
								</div>
							</Card>
						))}
					</div>

					<div className="flex justify-between">
						<Button
							variant="secondary"
							onClick={handleAddPair}
							icon={Plus}
						>
							Add Question/Answer
						</Button>
						<Button
							variant="primary"
							onClick={handleSubmit}
							disabled={questionAnswers.every(
								(pair) =>
									pair.question.trim() === "" ||
									pair.answer.trim() === ""
							)}
						>
							Submit
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

const BookCallDialog: React.FC<BookCallDialogProps> = ({
	open,
	onCancel,
	onOk,
}) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		bookedCallWith: "",
		callName: "",
		grade: "",
		qualified: "",
		callDate: "",
		callTime: "",
		callTimezone: "",
		duration: "",
		bookingOwner: "",
		bookingDate: "",
		bookingTime: "",
		bookingTimezone: "",
		bookingPlatform: "",
		bookingEventId: "",
		bookingStatus: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [formStatus, setFormStatus] = useState(false);
	const [showFormModal, setShowFormModal] = useState(false);
	const [formSubmissionData, setFormSubmissionData] = useState<
		Record<string, string>
	>({});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const qualified = formData.qualified === "true" ? true : false;

			const combinedBooingTime = `${formData.bookingDate}T${formData.bookingTime}`;
			const zonedTimeBooking = moment.tz(
				combinedBooingTime,
				formData.bookingTimezone
			);

			const combinedCallTime = `${formData.callDate}T${formData.callTime}`;
			const zonedTimeCall = moment.tz(
				combinedCallTime,
				formData.callTimezone
			);

			const request = {
				email: formData.email,
				booking_platform: formData.bookingPlatform,
				tracking_id: formData.bookingEventId,
				booking_status: formData.bookingStatus,
				booking_page_name: formData.callName,
				page_id: "",
				booking_owner: formData.bookingOwner,
				booked_call_with: formData.bookedCallWith,
				form_submission: formSubmissionData,
				booking_time: zonedTimeBooking.format("YYYY-MM-DDTHH:mm:ssZ"),
				duration: parseInt(formData.duration),
				status: formData.bookingStatus,
				ip: formData.phone,
				qualified: qualified,
				grade: parseInt(formData.grade),
				event_time: zonedTimeCall.format("YYYY-MM-DDTHH:mm:ssZ"),
			};

			const response = await eventApi.addBookedCall(request);
			alert(response.data.message);
			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating booked call:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFormSubmit = (data: Record<string, string>) => {
		setFormSubmissionData(data);
		setFormStatus(true);
	};

	const handleCancel = () => {
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			bookedCallWith: "",
			callName: "",
			grade: "",
			qualified: "",
			callDate: "",
			callTime: "",
			callTimezone: "",
			duration: "",
			bookingOwner: "",
			bookingDate: "",
			bookingTime: "",
			bookingTimezone: "",
			bookingPlatform: "",
			bookingEventId: "",
			bookingStatus: "",
		});
		setFormSubmissionData({});
		setFormStatus(false);
		onCancel();
	};

	const isFormValid =
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim() &&
		formData.bookedCallWith.trim() &&
		formData.callName.trim() &&
		formData.grade.trim() &&
		formData.callDate.trim() &&
		formData.callTime.trim() &&
		formData.bookingDate.trim() &&
		formData.bookingTime.trim();

	return (
		<>
			<Dialog open={open} onClose={handleCancel} static={true}>
				<DialogPanel>
					<div className="space-y-6 ">
						<h3 className="text-lg font-semibold text-gray-900">
							Add Booked Call
						</h3>
						<div className="h-[700px] overflow-y-auto space-y-6">
							<div className="grid grid-cols-2 gap-4 ">
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
										handleInputChange(
											"email",
											e.target.value
										)
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
										handleInputChange(
											"phone",
											e.target.value
										)
									}
									placeholder="Enter phone number"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Booked Call With
								</label>
								<TextInput
									value={formData.bookedCallWith}
									onChange={(e) =>
										handleInputChange(
											"bookedCallWith",
											e.target.value
										)
									}
									placeholder="Enter who the call is booked with"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Booking Page Name
								</label>
								<TextInput
									value={formData.callName}
									onChange={(e) =>
										handleInputChange(
											"callName",
											e.target.value
										)
									}
									placeholder="Enter call name"
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
									<SelectItem value="2">
										Below Average
									</SelectItem>
									<SelectItem value="3">Good</SelectItem>
									<SelectItem value="4">Great</SelectItem>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Qualified
								</label>
								<Select
									value={formData.qualified}
									onValueChange={(value) =>
										handleInputChange("qualified", value)
									}
								>
									<SelectItem value="true">
										Qualified
									</SelectItem>
									<SelectItem value="false">
										Unqualified
									</SelectItem>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Call Date
									</label>
									<TextInput
										type="date"
										value={formData.callDate}
										onChange={(e) =>
											handleInputChange(
												"callDate",
												e.target.value
											)
										}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Call Time
									</label>
									<TextInput
										type="time"
										value={formData.callTime}
										onChange={(e) =>
											handleInputChange(
												"callTime",
												e.target.value
											)
										}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Call Timezone
									</label>
									<select
										value={formData.callTimezone}
										onChange={(e) =>
											handleInputChange(
												"callTimezone",
												e.target.value
											)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="">
											Select timezone
										</option>
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
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Duration
								</label>
								<TextInput
									value={formData.duration}
									onChange={(e) =>
										handleInputChange(
											"duration",
											e.target.value
										)
									}
									placeholder="Enter call duration (e.g., 30 minutes)"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Booking Owner
								</label>
								<TextInput
									value={formData.bookingOwner}
									onChange={(e) =>
										handleInputChange(
											"bookingOwner",
											e.target.value
										)
									}
									placeholder="Enter booking owner"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Booking Platform
								</label>
								<TextInput
									value={formData.bookingPlatform}
									onChange={(e) =>
										handleInputChange(
											"bookingPlatform",
											e.target.value
										)
									}
									placeholder="Enter booking platform"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Booking Event ID
								</label>
								<TextInput
									value={formData.bookingEventId}
									onChange={(e) =>
										handleInputChange(
											"bookingEventId",
											e.target.value
										)
									}
									placeholder="Enter booking event id"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Status
								</label>
								<TextInput
									value={formData.bookingStatus}
									onChange={(e) =>
										handleInputChange(
											"bookingStatus",
											e.target.value
										)
									}
									placeholder="Enter booking status"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Booking Date *
									</label>
									<TextInput
										type="date"
										value={formData.bookingDate}
										onChange={(e) =>
											handleInputChange(
												"bookingDate",
												e.target.value
											)
										}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Booking Time *
									</label>
									<TextInput
										type="time"
										value={formData.bookingTime}
										onChange={(e) =>
											handleInputChange(
												"bookingTime",
												e.target.value
											)
										}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Booking Timezone
									</label>

									<select
										value={formData.bookingTimezone}
										onChange={(e) =>
											handleInputChange(
												"bookingTimezone",
												e.target.value
											)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="">
											Select timezone
										</option>
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
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Form Submission
								</label>
								<div className="flex items-center gap-2">
									<Button
										onClick={() => setShowFormModal(true)}
										className="text-sm font-medium"
										variant={
											formStatus ? "secondary" : "primary"
										}
									>
										{formStatus
											? "Edit Form Submission"
											: "Add Form Submission"}
									</Button>
									{formStatus && (
										<span className="text-sm text-green-600">
											✓ {formSubmissionData.length}{" "}
											question(s) added
										</span>
									)}
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
								Add Booked Call
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
			<FormSubmissionModal
				open={showFormModal}
				onClose={() => setShowFormModal(false)}
				onSubmit={handleFormSubmit}
			/>
		</>
	);
};

export default BookCallDialog;
