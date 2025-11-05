import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import HyrosTagClassification from "../components/settings/integrations/HyrosTagClassification";

const IntegrationPage: React.FC = () => {
	const { integrationName } = useParams<{ integrationName: string }>();
	const navigate = useNavigate();
	const [isHyrosTagOpen, setIsHyrosTagOpen] = useState(false);

	const formatIntegrationName = (name: string) => {
		return name
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};
	console.log(integrationName);
	const isHyros = integrationName?.toLowerCase() === "hyros";

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<Title>
						{formatIntegrationName(integrationName || "")}{" "}
						Integration
					</Title>
					<Text>
						Manage your{" "}
						{formatIntegrationName(integrationName || "")}{" "}
						integration settings
					</Text>
				</div>
				<Button
					variant="secondary"
					onClick={() => navigate("/settings/integrations")}
				>
					Back to Integrations
				</Button>
			</div>

			<Card>
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Integration Status</h3>
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
							<span className="text-green-800 font-medium">
								Connected
							</span>
						</div>
						<p className="text-green-700 text-sm mt-2">
							Your {formatIntegrationName(integrationName || "")}{" "}
							integration is active and working properly.
						</p>
					</div>
				</div>
			</Card>

			{isHyros && (
				<Card>
					<div className="space-y-4">
						<h3 className="text-lg font-medium">
							Tag Classification
						</h3>
						<p className="text-gray-600">
							Configure your Hyros tag classifications for better
							tracking.
						</p>
						<Button
							variant="primary"
							onClick={() => setIsHyrosTagOpen(true)}
						>
							Configure Tags
						</Button>
					</div>
				</Card>
			)}

			<Card>
				<div className="space-y-4">
					<h3 className="text-lg font-medium">
						Integration Settings
					</h3>
					<p className="text-gray-600">
						Configure your{" "}
						{formatIntegrationName(integrationName || "")}{" "}
						integration settings here.
					</p>
					{/* Add integration-specific settings here */}
				</div>
			</Card>

			{isHyros && (
				<HyrosTagClassification
					open={isHyrosTagOpen}
					onClose={() => setIsHyrosTagOpen(false)}
					onSuccess={() => {
						setIsHyrosTagOpen(false);
						console.log("Tag classification completed");
					}}
				/>
			)}
		</div>
	);
};

export default IntegrationPage;
