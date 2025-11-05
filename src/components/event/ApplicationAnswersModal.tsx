import React from "react";
import {
	Dialog,
	DialogPanel,
	Button,
	Card,
	Badge,
	Divider,
} from "@tremor/react";
import {
	FileText,
	CheckCircle,
	XCircle,
	MessageSquare,
	User,
	Clock,
	Loader2,
	Sparkles,
} from "lucide-react";

interface AnswerItem {
	question: string;
	answer: string;
}

interface ApplicationAnswersModalProps {
	open: boolean;
	onClose: () => void;
	answers: AnswerItem[] | null;
	loading: boolean;
}

const ApplicationAnswersModal: React.FC<ApplicationAnswersModalProps> = ({
	open,
	onClose,
	answers,
	loading,
}) => {
	if (loading) {
		return (
			<Dialog open={open} onClose={onClose} static={true}>
				<DialogPanel className="max-w-2xl">
					<div className="p-8 text-center">
						<div className="flex justify-center mb-6">
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
									<Loader2 className="w-8 h-8 text-white animate-spin" />
								</div>
								<div className="absolute -top-1 -right-1">
									<Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
								</div>
							</div>
						</div>
						<h3 className="text-2xl font-bold text-gray-800 mb-2">
							Fetching Application Answers
						</h3>
						<p className="text-gray-600 mb-6">
							Please wait while we retrieve the detailed
							responses...
						</p>
						<div className="flex justify-center">
							<div className="flex space-x-1">
								<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
								<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
								<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
							</div>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onClose={onClose} static={true}>
			<DialogPanel className="max-w-4xl max-h-[90vh] overflow-hidden animate-scaleIn">
				<div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
					{/* Header */}
					<div className="px-8 py-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm animate-fadeInUp">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
									<FileText className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-2xl font-bold text-gray-900">
										Application Answers
									</h3>
									<p className="text-sm text-gray-600">
										Detailed responses from the applicant
									</p>
								</div>
							</div>
							<Badge className="bg-blue-100 text-blue-800 border-blue-200">
								{answers?.length || 0} Questions
							</Badge>
						</div>
					</div>

					{/* Content */}
					<div className="p-8 max-h-[60vh] overflow-y-auto">
						{answers && answers.length > 0 ? (
							<div className="space-y-6">
								{answers.map((item, index) => (
									<Card
										key={index}
										className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm animate-fadeInUp hover:scale-[1.02] transform"
										style={{
											animationDelay: `${index * 0.1}s`,
										}}
									>
										<div className="p-6">
											<div className="flex items-start space-x-4">
												<div className="flex-shrink-0">
													<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
														{index + 1}
													</div>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between mb-3">
														<h4 className="text-lg font-semibold text-gray-900 leading-6">
															{item.question}
														</h4>
														<MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
													</div>
													<Divider className="my-3" />
													<div className="flex items-center space-x-3">
														{item.answer ===
														"true" ? (
															<>
																<CheckCircle className="w-5 h-5 text-green-500" />
																<span className="text-lg font-medium text-green-700">
																	Yes
																</span>
															</>
														) : item.answer ===
														  "false" ? (
															<>
																<XCircle className="w-5 h-5 text-red-500" />
																<span className="text-lg font-medium text-red-700">
																	No
																</span>
															</>
														) : (
															<>
																<User className="w-5 h-5 text-blue-500" />
																<span className="text-lg text-gray-800 font-medium">
																	{
																		item.answer
																	}
																</span>
															</>
														)}
													</div>
												</div>
											</div>
										</div>
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-12 animate-fadeInUp">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
									<FileText className="w-8 h-8 text-gray-400" />
								</div>
								<h4 className="text-lg font-medium text-gray-900 mb-2">
									No Answers Available
								</h4>
								<p className="text-gray-600">
									This application doesn't have any recorded
									answers yet.
								</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="px-8 py-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm animate-slideInRight">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2 text-sm text-gray-500">
								<Clock className="w-4 h-4" />
								<span>
									Last updated:{" "}
									{new Date().toLocaleDateString()}
								</span>
							</div>
							<div className="flex space-x-3">
								<Button
									variant="secondary"
									onClick={onClose}
									className="px-6 py-2 hover:bg-gray-100 transition-colors duration-200"
								>
									Close
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};

export default ApplicationAnswersModal;
