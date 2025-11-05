import React from "react";
import { Card, Title, Text, Tab, TabGroup, TabList } from "@tremor/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const Settings: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Check if we're on the OnceHub page
	// const isOnceHubPage = location.pathname.endsWith("/integrations/oncehub");

	// Derive the selected tab directly from the URL
	const selectedTab = location.pathname.includes("/profile")
		? 0
		: location.pathname.includes("/business")
		? 1
		: location.pathname.includes("/integrations")
		? 2
		: location.pathname.includes("/urlrule")
		? 3
		: 4;

	// Handle tab changes
	const handleTabChange = (index: number) => {
		if (selectedTab === index) return; // Prevent unnecessary navigation
		navigate(
			index === 0
				? "/settings/profile"
				: index === 1
				? "/settings/business"
				: index === 2
				? "/settings/integrations"
				: "/settings/urlrule"
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<Title>Settings</Title>
				<Text>Manage your account settings and preferences</Text>
			</div>
			{/* {isOnceHubPage ? (
				<Outlet />
			) : ( */}
			<Card>
				<TabGroup index={selectedTab} onIndexChange={handleTabChange}>
					<TabList className="mt-8">
						<Tab>Profile</Tab>
						<Tab>Business Management</Tab>
						<Tab>Integrations</Tab>
						<Tab>URL Rule</Tab>
					</TabList>
					<div className="mt-6">
						<Outlet />
					</div>
				</TabGroup>
			</Card>
			{/* )} */}
		</div>
	);
};

export default Settings;
