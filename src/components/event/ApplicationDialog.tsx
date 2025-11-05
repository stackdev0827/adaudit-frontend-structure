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
import { Plus, X } from "lucide-react"; // Import icons
import { eventApi } from "../../services/api";
import moment from "moment-timezone";
import { TIMEZONES } from "../../constants/timezones";

// Define interface for question-answer pairs
interface QuestionAnswer {
	question: string;
	answer: string;
}

// Form Submission Modal Component
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

interface ApplicationDialogProps {
	open: boolean;
	onCancel: () => void;
	onOk: (newItem?: any) => void;
}

const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
	open,
	onCancel,
	onOk,
}) => {
	const [formData, setFormData] = useState({
		appName: "",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		ips: "",
		grade: "",
		qualified: "",
		applicationDate: "",
		applicationTime: "",
		applicationTimezone: "",
		formPlatform: "",
		formPId: "",
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
			const combined = `${formData.applicationDate}T${formData.applicationTime}`;

			// interpret it as local time in that timezone
			const zonedTime = moment.tz(combined, formData.applicationTimezone);

			const qualified = formData.qualified === "true" ? true : false;

			const request = {
				first_name: formData.firstName,
				last_name: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				form_platform: formData.formPlatform,
				form_id: formData.formPId,
				app_name: formData.appName,
				grade: parseInt(formData.grade),
				qualified: qualified,
				ip: formData.ips,
				form_submission: formSubmissionData,
				event_time: zonedTime.format("YYYY-MM-DDTHH:mm:ssZ"),
			};
			const response = await eventApi.addApplication(request);
			console.log(request);
			alert(response.data.message);
			onOk(request);
			handleCancel();
		} catch (error) {
			console.error("Error creating application:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			appName: "",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			ips: "",
			grade: "",
			qualified: "",
			applicationDate: "",
			applicationTime: "",
			applicationTimezone: "",
			formPlatform: "",
			formPId: "",
		});
		setFormSubmissionData({});
		setFormStatus(false);
		onCancel();
	};

	const handleFormSubmit = (data: Record<string, string>) => {
		setFormSubmissionData(data);
		setFormStatus(true);
	};

	const isFormValid =
		formData.appName.trim() &&
		formData.firstName.trim() &&
		formData.lastName.trim() &&
		formData.email.trim() &&
		formData.phone.trim() &&
		formData.grade.trim() &&
		formData.applicationDate.trim() &&
		formData.applicationTime.trim();

	return (
		<>
			<Dialog open={open} onClose={handleCancel} static={true}>
				<DialogPanel>
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-gray-900">
							Add Application
						</h3>

						<div className="h-[700px] overflow-y-auto space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									App Name
								</label>
								<TextInput
									value={formData.appName}
									onChange={(e) =>
										handleInputChange(
											"appName",
											e.target.value
										)
									}
									placeholder="Enter application name"
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

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									External Form Platform
								</label>
								<TextInput
									value={formData.formPlatform}
									onChange={(e) =>
										handleInputChange(
											"formPlatform",
											e.target.value
										)
									}
									placeholder="Enter qualification details"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									External Form ID
								</label>
								<TextInput
									value={formData.formPId}
									onChange={(e) =>
										handleInputChange(
											"formPId",
											e.target.value
										)
									}
									placeholder="Enter qualification details"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Date
									</label>
									<TextInput
										type="date"
										value={formData.applicationDate}
										onChange={(e) =>
											handleInputChange(
												"applicationDate",
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
										value={formData.applicationTime}
										onChange={(e) =>
											handleInputChange(
												"applicationTime",
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
										value={formData.applicationTimezone}
										onChange={(e) =>
											handleInputChange(
												"applicationTimezone",
												e.target.value
											)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
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
								Add Application
							</Button>
						</div>
					</div>
				</DialogPanel>
			</Dialog>

			{/* Form Submission Modal */}
			<FormSubmissionModal
				open={showFormModal}
				onClose={() => setShowFormModal(false)}
				onSubmit={handleFormSubmit}
			/>
		</>
	);
};

export default ApplicationDialog;
