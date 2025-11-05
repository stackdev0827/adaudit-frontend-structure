import React from "react";
import { Title, Text } from "@tremor/react";

const CustomAudiences: React.FC = () => {
	return (
		<div className="space-y-6">
			<div>
				<Title>Custom Audiences</Title>
				<Text>
					Comprehensive view of campaign performance across all timeframes
				</Text>
			</div>

			{/* Center only the COOMING SOON... message */}
			<div className="flex items-center justify-center min-h-[70vh]">
				<div className="text-center text-xl text-gray-400">Cooming Soon...</div>
			</div>
		</div>
	);
};

export default CustomAudiences;
