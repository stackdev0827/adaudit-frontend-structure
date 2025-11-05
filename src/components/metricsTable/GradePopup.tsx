import React from "react";
import { Card, Title, Text, List, ListItem } from "@tremor/react";

interface GradePopupProps {
	isOpen: boolean;
	onClose: () => void;
	data: any[];
	isLoading: boolean;
}

const GradePopup: React.FC<GradePopupProps> = ({
	isOpen,
	onClose,
	data,
	isLoading,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<Title>Campaign Grades History</Title>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						✕
					</button>
				</div>

				{isLoading ? (
					<div className="flex justify-center p-4">
						<div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
					</div>
				) : (
					<List>
						{data.length > 0 ? (
							data.map((grade, index) => (
								<ListItem key={index}>
									<div className="flex justify-between">
										<Text>
											{grade.date} {grade.grade}
										</Text>
									</div>
								</ListItem>
							))
						) : (
							<ListItem>No grade history available</ListItem>
						)}
					</List>
				)}
			</Card>
		</div>
	);
};

export default GradePopup;
