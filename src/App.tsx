import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
// import Reports from "./pages/Reports_Origin";
import Settings from "./pages/Settings";
import MetricsTablePage from "./pages/MetricsTablePage";
// import TrackingDomains from "./components/settings/TrackingDomains";
import Integrations from "./components/settings/integrations/Integrations";
import IntegrationsCopy from "./components/settings/integrations/IntegrationsCopy";
import OnceHubMasterPages from "./components/settings/integrations/OnceHubMasterPages";
import TypeformForms from "./components/settings/integrations/TypeformForms";
import PrivateRoute from "./components/PrivateRoute";
import GeneratedTablePage from "./pages/GeneratedTablePage";
import URLRule from "./components/settings/url_rule/URLRule";
import Event from "./pages/event/Event";
import AdAudit from "./pages/AdAudit";
import FunnelInsights from "./pages/FunnelInsights";
import Toast from "./components/ui/Toast";
import { useAppSelector, useAppDispatch } from "./hooks/reduxHooks";
import { handleTestSSE } from "./lib/handleTestSSE";
import { triggerSSE } from "./slices/toastSlice";
import Insights from "./pages/creativelabs/Insights";
import Board from "./pages/creativelabs/board";
import Campaign from "./pages/creativelabs/campaign";

import CustomAudiences from "./pages/CustomAudiences";
import EventTypes from "./pages/trackingsetup/EventTypes";
import Pixels from "./pages/trackingsetup/Pixels";
import { validationCheck } from "./services/api";
import { removeToken } from "./utils/token";
import ReportDetailPage from "./pages/ReportDetailPage";
import IntegrationPage from "./pages/IntegrationPage";
import IntegrationAccounts from "./components/settings/integrations/IntegrationAccounts";
import Calendly from "./components/settings/integrations/Calendly";
import Index from "./pages/Reports";
// import TrackingDomainsCopy from "./components/settings/TrackingDomains_Copy";
import { TrackingDomainTable } from "./components/settings/tracking_domain/TrackingDomainTable";
import MetaAds from "./components/settings/integrations/MetaAds";
import GoogleAds from "./components/settings/integrations/GoogleAds";
import ReportDisplay from "./pages/ReportDisplay";
import Profile from "./components/settings/profile/Profile";
import BusinessManagement from "./components/settings/business/BusinessManagement";

function App() {
	const dispatch = useAppDispatch();
	const triggerTestSSE = useAppSelector((state) => state.toast.triggerSSE);

	useEffect(() => {
		if (triggerTestSSE) {
			handleTestSSE(dispatch);
			// Optionally reset the trigger if you want one-shot
			dispatch(triggerSSE(false));
		}
	}, [triggerTestSSE, dispatch]);

	useEffect(() => {
		const validationToken = async () => {
			// Skip token validation on login and register pages
			const currentPath = window.location.pathname;
			if (currentPath === "/login" || currentPath === "/register") {
				return;
			}

			try {
				await validationCheck.status();
			} catch (error: any) {
				console.log(error.response?.data);

				// Check for 401 Unauthorized status or token expiration message
				if (
					error.response?.status === 401 ||
					error.response?.data === "token has expired"
				) {
					console.log("Authentication error - logging out user");
					removeToken();
					window.location.href = "/login";
				}
			}
		};
		validationToken();
	}, []);

	window.addEventListener("message", function (event) {
		// Optionally check event.origin here for security
		if (
			event.data &&
			event.data.type === "oauth_success" &&
			event.data.provider === "google-ads"
		) {
			// Redirect
			window.location.href = "/settings/integrations/google-ads/accounts";
		} else if (
			event.data &&
			event.data.type === "oauth_success" &&
			event.data.provider === "typeform"
		) {
			// Redirect
			window.location.href = "/settings/integrations/typeform";
		} else if (
			event.data &&
			event.data.type === "oauth_success" &&
			event.data.provider === "oncehub"
		) {
			// Redirect
			window.location.href = "/settings/integrations/oncehub";
		} else if (
			event.data &&
			event.data.type === "oauth_success" &&
			event.data.provider === "calendly"
		) {
			// Redirect
			window.location.href = "/settings/integrations/calendly";
		} else if (
			event.data &&
			event.data.type === "oauth_success" &&
			event.data.provider === "meta-ads"
		) {
			// Redirect
			window.location.href = "/settings/integrations/meta-ads/accounts";
		}
	});

	return (
		<>
			<Toast />
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						<Route
							index
							element={<Navigate to="/dashboard" replace />}
						/>
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="reports" element={<Index />} />
						<Route
							path="/adaudit/metrics/:date/:report_name"
							element={<ReportDetailPage />}
						/>
						<Route path="adaudit" element={<AdAudit />} />
						<Route
							path="/generated-table"
							element={<GeneratedTablePage />}
						/>
						<Route
							path="/adaudit/metrics"
							element={<MetricsTablePage />}
						/>
						<Route path="settings" element={<Settings />}>
							<Route
								index
								element={
									<Navigate to="/settings/profile" replace />
								}
							/>
							{/* <Route path="tracking-domains" element={<TrackingDomains />} /> */}
							<Route
								path="integrationsp"
								element={<Integrations />}
							/>
							<Route
								path="integrations"
								element={<IntegrationsCopy />}
							/>
							<Route path="profile" element={<Profile />} />

							<Route path="urlrule" element={<URLRule />} />
							<Route
								path="business"
								element={<BusinessManagement />}
							/>
						</Route>
						<Route path="event" element={<Event />} />
						<Route
							path="tracking-setup/domains"
							// element={<TrackingDomainsCopy />}
							element={<TrackingDomainTable />}
						/>
						<Route
							path="funnel-insights"
							element={<FunnelInsights />}
						/>
						<Route
							path="creative-lab/insights"
							element={<Insights />}
						/>
						<Route path="creative-lab/board" element={<Board />} />
						<Route
							path="creative-lab/campaign/:id"
							element={<Campaign />}
						/>
						<Route
							path="audience-lab/custom-audiences"
							element={<CustomAudiences />}
						/>
						<Route
							path="tracking-setup/event-types"
							element={<EventTypes />}
						/>
						<Route
							path="tracking-setup/pixel"
							element={<Pixels />}
						/>
						<Route
							path="/setting/integrations/:integrationName"
							element={<IntegrationPage />}
						/>
						<Route
							path="/settings/integrations/:integrationName/accounts"
							element={<IntegrationAccounts />}
						/>
						<Route
							path="/settings/integrations/oncehub"
							element={<OnceHubMasterPages />}
						/>
						<Route
							path="/settings/integrations/typeform"
							element={<TypeformForms />}
						/>
						<Route
							path="/settings/integrations/calendly"
							element={<Calendly />}
						/>
						<Route
							path="/settings/integrations/meta-ads"
							element={<MetaAds />}
						/>
						<Route
							path="/settings/integrations/google-ads"
							element={<GoogleAds />}
						/>
						<Route
							path="/report-display"
							element={<ReportDisplay />}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
