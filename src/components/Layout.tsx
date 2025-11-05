import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	Settings,
	LogOut,
	ChevronDown,
	ChevronRight,
	Globe,
	LineChart,
	Palette,
	UserPlus,
	Calendar,
} from "lucide-react";
import { removeToken } from "../utils/token";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../pages/reports/ui/dropdown-menu";
import { businessApi } from "../services/api";

const Layout: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
		{
			dashboard: false,
			insightsLab: false,
			creativeLab: false,
			audienceLab: false,
			trackingSetup: false,
		}
	);
	// const [showAccountDropdown, setShowAccountDropdown] = useState(false);
	const [currentAccount, setCurrentAccount] = useState("");
	const [businessAccounts, setBusinessAccount] = useState([]);

	// useEffect(() => {
	// 	window.location.reload();
	// }, [currentAccount]);

	// Check if the current path exactly matches the given path
	const isActive = (path: string) => location.pathname === path;

	// Check if the current path starts with any of the given paths
	const isMenuActive = (paths: string[]) =>
		paths.some((path) => location.pathname.startsWith(path));

	// Auto-expand menus based on current URL, but don't collapse other menus
	useEffect(() => {
		setExpandedMenus((prev) => {
			const newExpandedMenus = { ...prev };

			// Only expand menus, don't collapse them
			if (
				location.pathname === "/event" ||
				location.pathname === "/reports" ||
				location.pathname.startsWith("/insights-lab/")
			) {
				newExpandedMenus.insightsLab = true;
			}

			if (location.pathname.startsWith("/creative-lab/")) {
				newExpandedMenus.creativeLab = true;
			}

			if (location.pathname.startsWith("/audience-lab/")) {
				newExpandedMenus.audienceLab = true;
			}

			if (location.pathname.startsWith("/tracking-setup/")) {
				newExpandedMenus.trackingSetup = true;
			}

			return newExpandedMenus;
		});
	}, [location.pathname]);

	useEffect(() => {
		const getBusinessList = async () => {
			try {
				const response = await businessApi.getAll();
				console.log(response.data);
				setBusinessAccount(response.data.businesses);
				const selectedBusiness = response.data.businesses.find(
					(b: any) => b.is_selected
				);
				if (selectedBusiness) {
					setCurrentAccount(selectedBusiness.business_name);
				}
			} catch (err) {
				console.log(err);
			}
		};
		getBusinessList();
	}, []);

	// Toggle menu expansion without affecting other menus
	const toggleMenu = (menu: string) => {
		setExpandedMenus((prev) => ({
			...prev,
			[menu]: !prev[menu],
		}));
	};

	const handleLogout = () => {
		removeToken();
		navigate("/login");
	};

	const onChangeBusiness = async (account: any) => {
		try {
			await businessApi.changeBusinessAccount(account.id);
			setCurrentAccount(account.business_name);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<div className="w-64 bg-white shadow-lg overflow-y-auto">
				<div
					className="p-4 mt-1 border-b border-gray-200"
					onClick={() => navigate("/dashboard")}
				>
					{/* <h1 className="text-2xl font-bold text-blue-600">Ad Audit</h1> */}
					<img
						src="/logo/1.svg"
						alt="Logo"
						className="w-64"
						style={{
							filter: "drop-shadow(0 0 16px #3b82f6aa)",
						}}
					/>
				</div>
				<div className="relative border-2 m-4 rounded text-black">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50">
								<span className="text-sm font-medium text-black">
									{currentAccount}
								</span>
								<ChevronDown className="w-4 h-4 text-black" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="right"
							align="start"
							sideOffset={8}
							className="w-64 bg-white border-2 border-gray-300 rounded-lg shadow-lg"
						>
							{businessAccounts.map((account: any) => (
								<DropdownMenuItem
									key={account.id}
									onClick={() => {
										onChangeBusiness(account);
									}}
									className={
										currentAccount === account.business_name
											? "bg-blue-50 text-blue-600 py-4 rounded-md mx-1"
											: "cursor-pointer py-4 hover:bg-gray-50 rounded-md mx-1"
									}
								>
									{account?.business_name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<nav className="mt-4 text-black">
					{/* Dashboard */}
					<Link
						to="/dashboard"
						className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 ${
							isActive("/dashboard")
								? "bg-blue-50 text-blue-600"
								: "text-black"
						}`}
					>
						<LayoutDashboard className="w-4 h-4 mr-3" />
						<span className="text-[15px]">Dashboard</span>
					</Link>

					<Link
						to="/event"
						className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 ${
							isActive("/event")
								? "bg-blue-50 text-blue-600"
								: "text-black"
						}`}
					>
						<Calendar className="w-4 h-4 mr-3" />
						<span className="text-[15px]">Event</span>
					</Link>

					{/* Insights Lab */}
					<div>
						<button
							onClick={() => toggleMenu("insightsLab")}
							className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 w-full ${
								isMenuActive(["/insights-lab"]) ||
								isActive("/reports") ||
								isActive("/event")
									? "bg-blue-50 text-blue-600"
									: "text-black"
							}`}
						>
							<LineChart className="w-4 h-4 mr-3" />
							<span className="flex-1 text-left text-[15px]">
								Insights Lab
							</span>
							{expandedMenus.insightsLab ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</button>

						{expandedMenus.insightsLab && (
							<div className="pl-14 bg-gray-50">
								<Link
									to="/adaudit"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/adaudit")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Ad Audits
								</Link>
								<Link
									to="/reports"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/reports")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Reports
								</Link>
								<Link
									to="/funnel-insights"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/funnel-insights")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Funnel Insights
								</Link>
							</div>
						)}
					</div>

					{/* Creative Lab */}
					<div>
						<button
							onClick={() => toggleMenu("creativeLab")}
							className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 w-full ${
								isMenuActive(["/creative-lab"])
									? "bg-blue-50 text-blue-600"
									: "text-black"
							}`}
						>
							<Palette className="w-4 h-4 mr-3" />
							<span className="flex-1 text-left text-[15px]">
								Creative Lab
							</span>
							{expandedMenus.creativeLab ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</button>

						{expandedMenus.creativeLab && (
							<div className="pl-14 bg-gray-50">
								<Link
									to="/creative-lab/insights"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/creative-lab/insights")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Creative Insights
								</Link>
								<Link
									to="/creative-lab/board"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/creative-lab/board")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Creative Board
								</Link>
							</div>
						)}
					</div>

					{/* Audience Lab */}
					<div>
						<button
							onClick={() => toggleMenu("audienceLab")}
							className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 w-full ${
								isMenuActive(["/audience-lab"])
									? "bg-blue-50 text-blue-600"
									: "text-black"
							}`}
						>
							<UserPlus className="w-4 h-4 mr-3" />
							<span className="flex-1 text-left text-[15px]">
								Audience Lab
							</span>
							{expandedMenus.audienceLab ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</button>

						{expandedMenus.audienceLab && (
							<div className="pl-14 bg-gray-50">
								<Link
									to="/audience-lab/custom-audiences"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive(
											"/audience-lab/custom-audiences"
										)
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Custom Audiences
								</Link>
							</div>
						)}
					</div>

					{/* Tracking Set Up */}
					<div>
						<button
							onClick={() => toggleMenu("trackingSetup")}
							className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 w-full ${
								isMenuActive(["/tracking-setup"])
									? "bg-blue-50 text-blue-600"
									: "text-black"
							}`}
						>
							<Globe className="w-4 h-4 mr-3" />
							<span className="flex-1 text-left text-[15px]">
								Tracking Set Up
							</span>
							{expandedMenus.trackingSetup ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</button>

						{expandedMenus.trackingSetup && (
							<div className="pl-14 bg-gray-50">
								<Link
									to="/tracking-setup/domains"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/tracking-setup/domains")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Tracking Domains
								</Link>
								<Link
									to="/tracking-setup/event-types"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/tracking-setup/event-types")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Set Up for Event Types
								</Link>
								<Link
									to="/tracking-setup/pixel"
									className={`block py-2 text-sm hover:text-blue-600 ${
										isActive("/tracking-setup/pixel")
											? "text-blue-600 font-medium"
											: "text-black"
									}`}
								>
									Pixel Set Up
								</Link>
							</div>
						)}
					</div>

					<Link
						to="/settings"
						className={`flex items-center px-6 py-3 text-black hover:bg-blue-50 hover:text-blue-600 ${
							isMenuActive(["/settings"])
								? "bg-blue-50 text-blue-600"
								: ""
						}`}
					>
						<Settings className="w-4 h-4 mr-3" />
						<span className="text-[15px]">Settings</span>
					</Link>
				</nav>
				<div className="absolute bottom-0 w-64 p-4 border-t">
					<button
						onClick={handleLogout}
						className="flex items-center px-6 py-3 text-black hover:bg-red-50 hover:text-red-600 w-full"
					>
						<LogOut className="w-5 h-5 mr-3" />
						Logout
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<div className="p-8">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default Layout;
