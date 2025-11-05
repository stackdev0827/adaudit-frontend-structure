import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Search, Trash2, GripVertical, Save } from "lucide-react";
import { cn } from "../../lib/utils";

// Meta logo component
const MetaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
	</svg>
);

// Google logo component
const GoogleLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			fill="#4285F4"
		/>
		<path
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			fill="#34A853"
		/>
		<path
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			fill="#FBBC05"
		/>
		<path
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			fill="#EA4335"
		/>
	</svg>
);

interface SelectedMetric {
	id: string;
	name: string;
	category: string;
	enabled: boolean;
}

interface CustomizeTableModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedMetrics: SelectedMetric[];
	onMetricsChange: (metrics: SelectedMetric[]) => void;
	onUpdatedMetrics: (metrics: any, changedMetrics: SelectedMetric[]) => void;
	savedViews?: Array<{
		id: string;
		name: string;
		metrics: SelectedMetric[];
	}>;
	onSaveView?: (name: string, metrics: SelectedMetric[]) => void;
	onLoadView?: (
		viewId: string
	) => { id: string; name: string; metrics: SelectedMetric[] } | undefined;
}

interface Metric {
	id: string;
	name: string;
	category: string;
	enabled: boolean;
}

interface Category {
	id: string;
	name: string;
	metrics: Metric[];
}

interface MetricGroup {
	title: string;
	metrics: Metric[];
}

interface CategoryWithGroups extends Category {
	groups?: MetricGroup[];
}

const updatedMetrics = {
	platform_reported: {
		spend: false,
		impressions: false,
		budget: false,
		status: false,
	},
	page_metrics: {
		visits: { total: false, first_time: false },
		cp_visit: { total: false, first_time: false },
		percent_new_visits: false,
		click_quality: false,
		bot_traffic: false,
		avg_video_view: false,
	},
	lead_form_submissions: {
		total: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
	},
	applications: {
		total: { total: false, first_time: false },
		qualified: { total: false, first_time: false },
		unqualified: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
		cp_qualified: { total: false, first_time: false },
		cp_unqualified: { total: false, first_time: false },
		qualified_percent: { total: false, first_time: false },
	},
	booked_calls: {
		total: { total: false, first_time: false },
		qualified: { total: false, first_time: false },
		unqualified: { total: false, first_time: false },
		confirmed: { total: false, first_time: false },
		showed: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
		cp_qualified: { total: false, first_time: false },
		cp_unqualified: { total: false, first_time: false },
		cp_confirmed: { total: false, first_time: false },
		cp_showed: { total: false, first_time: false },
		percent_showed: { total: false, first_time: false },
		percent_confirmed: { total: false, first_time: false },
		cancelled: { total: false, first_time: false },
		percent_cancelled: { total: false, first_time: false },
	},
	sets: {
		total: { total: false, first_time: false },
		outbound: { total: false, first_time: false },
		inbound: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
		cp_outbound: { total: false, first_time: false },
		cp_inbound: { total: false, first_time: false },
		shows_from_sets: { total: false, first_time: false },
		cp_shows_from_sets: { total: false, first_time: false },
		show_percent_from_sets: { total: false, first_time: false },
	},
	sales: {
		total: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
		revenue: { total: false, first_time: false },
		cash_collected: { total: false, first_time: false },
		aov: { total: false, first_time: false },
		cac: false,
		roas: { total: false, first_time: false },
		roas_cash_collected: { total: false, first_time: false },
		profit_based_on_revenue: false,
		profit_based_on_cash_collected: false,
		refunds: { total: false, first_time: false },
		refund_amount: { total: false, first_time: false },
		shipping: { total: false, first_time: false },
		tax: { total: false, first_time: false },
		discounts: { total: false, first_time: false },
	},
	offers_made: {
		total: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
	},
	add_to_cart: {
		total: { total: false, first_time: false },
		cp_total: { total: false, first_time: false },
	},
	meta_reported: {
		cpm: false,
		reach: false,
		clicks: false,
		ctr: false,
		cost_per_click: false,
		link_click: false,
		cost_per_link_click: false,
		outbound_clicks: false,
		outbound_ctr: false,
		page_view: false,
		meta_click_quality: false,
		read_more_rate: false,
		post_engagement: false,
		cost_per_post_engagement: false,
		post_reaction: false,
		cost_per_post_reaction: false,
		comment: false,
		cost_per_comment: false,
		post_shares: false,
		cost_per_share: false,
		page_like: false,
		cost_per_page_like: false,
		video_started: false,
		n3_second_video_views: false,
		cost_per_n3_second_view: false,
		hook_rate: false,
		thruplay: false,
		cost_per_thruplay: false,
		video_hold_rate: false,
		video_30_second_watch: false,
		count_per_video_30_second_watch: false,
		count_of_25p_watched_video: false,
		n25p_video_watch_rate: false,
		count_of_50p_watched_video: false,
		n50p_video_watch_rate: false,
		count_of_75p_watched_video: false,
		n75p_video_watch_rate: false,
		count_of_95p_watched_video: false,
		n95p_video_watch_rate: false,
		count_of_100p_watched_video: false,
		n100p_video_watch_rate: false,
	},
	meta_conversion: {
		lead: false,
		cost_per_lead: false,
		search: false,
		cost_per_search: false,
		submit_application: false,
		purchase: false,
		cost_per_purchase: false,
		revenue: false,
		roas: false,
		average_order_value: false,
		add_to_cart: false,
		add_to_cat_to_purchase_rate: false,
		add_payment_info: false,
		cost_per_add_payment_info: false,
		complete_registration: false,
		cost_per_complete_registration: false,
		contact: false,
		cost_per_contact: false,
		customize_product: false,
		cost_per_customize_product: false,
		donate: false,
		cost_per_donate: false,
		donate_amount: false,
		find_location: false,
		cost_per_find_location: false,
		schedule: false,
		cost_per_schedule: false,
		submit_application_to_schedule_rate: false,
		cost_per_submit_application: false,
		start_trial: false,
		cost_per_start_trial: false,
		subscribe: false,
		cost_per_subscribe: false,
		view_content: false,
		cost_per_view_content: false,
		registrations_completed: false,
		cost_per_registration_completed: false,
		subscriptions: false,
		subscription_value: false,
		cost_per_subscription: false,
	},
	google_reported: {
		impressions: false,
		cpm: false,
		clicks: false,
		ctr: false,
		cost_per_click: false,
		video_views: false,
		count_of_25p_watched_video: false,
		n25p_video_watch_rate: false,
		count_of_50p_watched_video: false,
		n50p_video_watch_rate: false,
		count_of_75p_watched_video: false,
		n75p_video_watch_rate: false,
		count_of_95p_watched_video: false,
		n95p_video_watch_rate: false,
		count_of_100p_watched_video: false,
		n100p_video_watch_rate: false,
	},
	google_conversion: {
		conversions: false,
		cost_per_conversion: false,
		submit_lead_form: false,
		cost_per_submit_lead_form: false,
		booked_appointment: false,
		cost_per_booked_appointment: false,
		contact: false,
		const_per_contact: false,
		add_to_cart: false,
		cost_per_add_to_cart: false,
		begin_checkout: false,
		cost_per_begin_checkout: false,
		revenue: false,
		roas: false,
		purchase: false,
		cost_per_purchase: false,
	},
};

const mockCategories: CategoryWithGroups[] = [
	{
		id: "all",
		name: "All",
		metrics: [],
	},
	{
		id: "platformReported",
		name: "Platform Reported",
		metrics: [],
		groups: [
			{
				title: "Platform Reported",
				metrics: [
					{
						id: "spend",
						name: "Spend",
						category: "platformReported",
						enabled: false,
					},
					{
						id: "impressions",
						name: "Impressions",
						category: "platformReported",
						enabled: false,
					},
					{
						id: "budget",
						name: "Budget",
						category: "platformReported",
						enabled: false,
					},
					{
						id: "status",
						name: "Status",
						category: "platformReported",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "pageMetrics",
		name: "Page Metrics",
		metrics: [],
		groups: [
			{
				title: "Page Metrics",
				metrics: [
					{
						id: "visits",
						name: "Visits",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "newVisits",
						name: "Visits (New)",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "costPerVisit",
						name: "Cost per visit",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "costPerNewVisit",
						name: "Cost per visit (New)",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "percentNewVisits",
						name: "% New Visits",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "clickQuality",
						name: "Click Quality (AA)",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "botTraffic",
						name: "Bot Traffic",
						category: "pageMetrics",
						enabled: false,
					},
					{
						id: "avgVideoView",
						name: "Average Video View",
						category: "pageMetrics",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "leadForms",
		name: "Lead Form Submissions",
		metrics: [],
		groups: [
			{
				title: "Lead Form Submissions",
				metrics: [
					{
						id: "leadFormSubmissions",
						name: "# lead form submissions",
						category: "leadForms",
						enabled: false,
					},
					{
						id: "leadFormSubmissionsNew",
						name: "# lead form submissions (New)",
						category: "leadForms",
						enabled: false,
					},
					{
						id: "costPerLeadForm",
						name: "Cost per lead form submissions",
						category: "leadForms",
						enabled: false,
					},
					{
						id: "costPerLeadFormNew",
						name: "Cost per lead form submissions (New)",
						category: "leadForms",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "sales",
		name: "Sales",
		metrics: [],
		groups: [
			{
				title: "Sales",
				metrics: [
					{
						id: "sales",
						name: "# of sales",
						category: "sales",
						enabled: false,
					},
					{
						id: "salesNew",
						name: "# of sales (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "costPerSale",
						name: "Cost per sale",
						category: "sales",
						enabled: false,
					},
					{
						id: "costPerSaleNew",
						name: "Cost per sale (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "revenue",
						name: "Revenue",
						category: "sales",
						enabled: false,
					},
					{
						id: "revenueNew",
						name: "Revenue (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "cashCollected",
						name: "Cash Collected",
						category: "sales",
						enabled: false,
					},
					{
						id: "cashCollectedNew",
						name: "Cash Collected (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "aov",
						name: "AOV",
						category: "sales",
						enabled: false,
					},
					{
						id: "aovNew",
						name: "AOV (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "cac",
						name: "CAC",
						category: "sales",
						enabled: false,
					},
					{
						id: "roas",
						name: "ROAS",
						category: "sales",
						enabled: false,
					},
					{
						id: "roasNew",
						name: "ROAS (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "roasCashCollected",
						name: "ROAS Cash Collected",
						category: "sales",
						enabled: false,
					},
					{
						id: "roasCashCollectedNew",
						name: "ROAS Cash Collected (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "profitBasedOnRevenue",
						name: "Profit Based On Revenue",
						category: "sales",
						enabled: false,
					},
					{
						id: "profitBasedOnCashCollected",
						name: "Profit Based On Cash Collected",
						category: "sales",
						enabled: false,
					},
					{
						id: "refunds",
						name: "# of refunds",
						category: "sales",
						enabled: false,
					},
					{
						id: "refundsNew",
						name: "# of refunds (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "refundAmount",
						name: "Refund Amount",
						category: "sales",
						enabled: false,
					},
					{
						id: "refundAmountNew",
						name: "Refund Amount (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "shipping",
						name: "Shipping",
						category: "sales",
						enabled: false,
					},
					{
						id: "shippingNew",
						name: "Shipping (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "tax",
						name: "Tax",
						category: "sales",
						enabled: false,
					},
					{
						id: "taxNew",
						name: "Tax (New)",
						category: "sales",
						enabled: false,
					},
					{
						id: "discounts",
						name: "Discounts",
						category: "sales",
						enabled: false,
					},
					{
						id: "discountsNew",
						name: "Discounts (New)",
						category: "sales",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "applications",
		name: "Applications",
		metrics: [],
		groups: [
			{
				title: "Applications",
				metrics: [
					{
						id: "applications",
						name: "# of applications",
						category: "applications",
						enabled: false,
					},
					{
						id: "applicationsNew",
						name: "# of applications (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerApplication",
						name: "Cost per application",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerApplicationNew",
						name: "Cost per application (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "qualifiedApplications",
						name: "# of qualified applications",
						category: "applications",
						enabled: false,
					},
					{
						id: "qualifiedApplicationsNew",
						name: "# of qualified applications (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerQualifiedApp",
						name: "Cost per qualified application",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerQualifiedAppNew",
						name: "Cost per qualified application (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "unqualifiedApplications",
						name: "# of unqualified applications",
						category: "applications",
						enabled: false,
					},
					{
						id: "unqualifiedApplicationsNew",
						name: "# of unqualified applications (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerUnqualifiedApp",
						name: "Cost per unqualified application",
						category: "applications",
						enabled: false,
					},
					{
						id: "costPerUnqualifiedAppNew",
						name: "Cost per unqualified application (New)",
						category: "applications",
						enabled: false,
					},
					{
						id: "qualifiedAppPercent",
						name: "Qualified application %",
						category: "applications",
						enabled: false,
					},
					{
						id: "qualifiedAppPercentNew",
						name: "Qualified application % (New)",
						category: "applications",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "bookedCalls",
		name: "Booked Call",
		metrics: [],
		groups: [
			{
				title: "Booked Call",
				metrics: [
					{
						id: "calls",
						name: "# of calls",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "callsNew",
						name: "# of calls (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerCall",
						name: "Cost per call",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerCallNew",
						name: "Cost per call (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "qualifiedCalls",
						name: "# of qualified Calls",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "qualifiedCallsNew",
						name: "# of qualified calls (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerQualifiedCall",
						name: "Cost per qualified booked call",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerQualifiedCallNew",
						name: "Cost per qualified booked call (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "unqualifiedCalls",
						name: "# of unqualified calls",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "unqualifiedCallsNew",
						name: "# of unqualified calls (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerUnqualifiedCall",
						name: "Cost per unqualified booked call",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerUnqualifiedCallNew",
						name: "Cost per unqualified booked call (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "callsShowed",
						name: "# of calls showed",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "callsShowedNew",
						name: "# of calls showed (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerCallShowed",
						name: "Cost per call that showed",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerCallShowedNew",
						name: "Cost per call that showed (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsShowed",
						name: "% of calls showed",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsShowedNew",
						name: "% of calls showed (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "confirmedCalls",
						name: "# of confirmed calls",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "confirmedCallsNew",
						name: "# of confirmed calls (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerConfirmedCall",
						name: "Cost per confirmed call",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "costPerConfirmedCallNew",
						name: "Cost per confirmed call (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsConfirmed",
						name: "% of calls confirmed",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsConfirmedNew",
						name: "% of calls confirmed (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "cancelledCalls",
						name: "# of cancelled calls",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "cancelledCallsNew",
						name: "# of cancelled calls (New)",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsCancelled",
						name: "% of calls that cancelled",
						category: "bookedCalls",
						enabled: false,
					},
					{
						id: "percentCallsCancelledNew",
						name: "% of calls that cancelled (New)",
						category: "bookedCalls",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "sets",
		name: "Sets",
		metrics: [],
		groups: [
			{
				title: "Sets",
				metrics: [
					{
						id: "sets",
						name: "# of sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "setsNew",
						name: "# of sets (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerSet",
						name: "Cost per set",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerSetNew",
						name: "Cost per set (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "outboundSets",
						name: "# of outbound sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "outboundSetsNew",
						name: "# of outbound sets (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerOutboundSet",
						name: "Cost per outbound set",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerOutboundSetNew",
						name: "Cost per outbound set (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "inboundSets",
						name: "# of inbound sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "inboundSetsNew",
						name: "# of inbound sets (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerInboundSet",
						name: "Cost per inbound set",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerInboundSetNew",
						name: "Cost per inbound set (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "showsFromSets",
						name: "# of shows from sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "showsFromSetsNew",
						name: "# of shows from sets (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerShowFromSets",
						name: "Cost per show from sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "costPerShowFromSetsNew",
						name: "Cost per show from sets (New)",
						category: "sets",
						enabled: false,
					},
					{
						id: "showPercentFromSets",
						name: "Show % from sets",
						category: "sets",
						enabled: false,
					},
					{
						id: "showPercentFromSetsNew",
						name: "Show % from sets (New)",
						category: "sets",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "addToCart",
		name: "Add To Cart & Offers",
		metrics: [],
		groups: [
			{
				title: "Add To Cart",
				metrics: [
					{
						id: "addToCart",
						name: "# of add to carts",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "costPerAddToCart",
						name: "Cost per add to cart",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "addToCartNew",
						name: "# of add to carts (New)",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "costPerAddToCartNew",
						name: "Cost per add to cart (New)",
						category: "addToCart",
						enabled: false,
					},
				],
			},
			{
				title: "Offers Made",
				metrics: [
					{
						id: "offersMade",
						name: "# of offers made",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "costPerOfferMade",
						name: "Cost per offer made",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "offersMadeNew",
						name: "# of offers made (New)",
						category: "addToCart",
						enabled: false,
					},
					{
						id: "costPerOfferMadeNew",
						name: "Cost per offer made (New)",
						category: "addToCart",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "metaReported",
		name: "Meta reported",
		metrics: [],
		groups: [
			{
				title: "Meta reported",
				metrics: [
					{
						id: "metaCpm",
						name: "CPM",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaReach",
						name: "Reach",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaClicks",
						name: "Clicks",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCtr",
						name: "CTR",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerClick",
						name: "Cost per click",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaLinkClick",
						name: "Link click",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerLinkClick",
						name: "Cost per link click",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaOutboundClicks",
						name: "Outbound clicks",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaOutboundCtr",
						name: "Outbound CTR",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPageView",
						name: "Page view",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaClickQuality",
						name: "Meta Click Quality",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaReadMoreRate",
						name: "Read more rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPostEngagement",
						name: "Post engagement",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerPostEngagement",
						name: "Cost per post engagement",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPostReaction",
						name: "Post reaction",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerPostReaction",
						name: "Cost per post reaction",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaComment",
						name: "Comment",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerComment",
						name: "Cost per comment",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPostShares",
						name: "Post shares",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerShare",
						name: "Cost per share",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPageLike",
						name: "Page like",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerPageLike",
						name: "Cost per page like",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta3SecondVideoViews",
						name: "3 second video views",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPer3SecondView",
						name: "Cost per 3-second view",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaHookRate",
						name: "Hook rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaThruplay",
						name: "thruplay",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerThruplay",
						name: "Cost per thruplay",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaVideoHoldRate",
						name: "Video hold rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaVideo30SecondWatch",
						name: "Video 30 second watch",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerVideo30SecondWatch",
						name: "Cost per video 30 second watch",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta25PercentWatchedVideo",
						name: "# of 25% watched video",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta25PercentVideoWatchRate",
						name: "25% video watch rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta50PercentWatchedVideo",
						name: "# of 50% watched video",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta50PercentVideoWatchRate",
						name: "50% video watch rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta75PercentWatchedVideo",
						name: "# of 75% watched video",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta75PercentVideoWatchRate",
						name: "75% video watch rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta95PercentWatchedVideo",
						name: "# of 95% watched video",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta95PercentVideoWatchRate",
						name: "95% video watch rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta100PercentWatchedVideo",
						name: "# of 100% watched video",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "meta100PercentVideoWatchRate",
						name: "100% video watch rate",
						category: "metaReported",
						enabled: false,
					},
				],
			},
			{
				title: "Meta conversions",
				metrics: [
					{
						id: "metaSearch",
						name: "Search",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerSearch",
						name: "Cost per search",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSubmitApplication",
						name: "Submit application",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerSubmitApplication",
						name: "Cost per submit application",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaPurchase",
						name: "Purchase",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerPurchase",
						name: "Cost per purchase",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaRevenue",
						name: "Revenue",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaRoas",
						name: "ROAS",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaAverageOrderValue",
						name: "Average order value",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaAddToCart",
						name: "Add to cart",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaAddToCartToPurchaseRate",
						name: "Add to cart to purchase rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaAddPaymentInfo",
						name: "Add payment info",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerAddPaymentInfo",
						name: "Cost per add payment info",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCompleteRegistration",
						name: "Complete registration",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerCompleteRegistration",
						name: "Cost per complete registration",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaContact",
						name: "Contact",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerContact",
						name: "Cost per contact",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCustomizeProduct",
						name: "Customize product",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerCustomizeProduct",
						name: "Cost per customize product",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaDonate",
						name: "Donate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerDonate",
						name: "Cost per donate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaDonateAmount",
						name: "Donate ammount",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaFindLocation",
						name: "Find location",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerFindLocation",
						name: "Cost per find location",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSchedule",
						name: "Schedule",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerSchedule",
						name: "Cost per schedule",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSubmitApplicationToScheduleRate",
						name: "Submit application to schedule rate",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaStartTrial",
						name: "Start trial",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerStartTrial",
						name: "Cost per start trial",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSubscribe",
						name: "Subscribe",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerSubscribe",
						name: "Cost per subscribe",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaViewContent",
						name: "View content",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerViewContent",
						name: "Cost per view content",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaRegistrationsCompleted",
						name: "Registrations completed",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerRegistrationCompleted",
						name: "Cost per registration completed",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSubscriptions",
						name: "Subscriptions",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaSubscriptionValue",
						name: "Subscription value",
						category: "metaReported",
						enabled: false,
					},
					{
						id: "metaCostPerSubscription",
						name: "Cost per subscription",
						category: "metaReported",
						enabled: false,
					},
				],
			},
		],
	},
	{
		id: "googleReported",
		name: "Google Reported",
		metrics: [],
		groups: [
			{
				title: "Google Reported",
				metrics: [
					{
						id: "googleImpressions",
						name: "Impressions",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCpm",
						name: "CPM",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleClicks",
						name: "Clicks",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCtr",
						name: "CTR",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerClick",
						name: "Cost per click",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleVideoViews",
						name: "Video Views",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google25PercentWatchedVideo",
						name: "# of 25% watched video",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google25PercentVideoWatchRate",
						name: "25% video watch rate",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google50PercentWatchedVideo",
						name: "# of 50% watched video",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google50PercentVideoWatchRate",
						name: "50% video watch rate",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google75PercentWatchedVideo",
						name: "# of 75% watched video",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google75PercentVideoWatchRate",
						name: "75% video watch rate",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google100PercentWatchedVideo",
						name: "# of 100% watched video",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "google100PercentVideoWatchRate",
						name: "100% video watch rate",
						category: "googleReported",
						enabled: false,
					},
				],
			},
			{
				title: "Google conversions",
				metrics: [
					{
						id: "googleConversions",
						name: "Conversions",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerConversion",
						name: "Cost per conversion",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleSubmitLeadForm",
						name: "Submit lead form",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerSubmitLeadForm",
						name: "Cost per submit lead form",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleBookAppointment",
						name: "Book appointment",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerBookedAppointment",
						name: "Cost per booked appointmnet",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleContact",
						name: "Contact",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerContact",
						name: "Cost per contact",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleAddToCart",
						name: "Add to cart",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerAddToCart",
						name: "Cost per add to cart",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleBeginCheckout",
						name: "Begin checkout",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerBeginCheckout",
						name: "Cost per begin checkout",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleRevenue",
						name: "Revenue",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleRoas",
						name: "ROAS",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googlePurchase",
						name: "Purchase",
						category: "googleReported",
						enabled: false,
					},
					{
						id: "googleCostPerPurchase",
						name: "Cost per purchase",
						category: "googleReported",
						enabled: false,
					},
				],
			},
		],
	},
];

export const CustomizeTableModal = ({
	open,
	onOpenChange,
	selectedMetrics,
	onMetricsChange,
	onUpdatedMetrics,
	savedViews,
	onSaveView,
	onLoadView,
}: CustomizeTableModalProps) => {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const [orderedEnabledMetrics, setOrderedEnabledMetrics] = useState<
		SelectedMetric[]
	>([]);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [viewName, setViewName] = useState("");
	const [metrics, setMetrics] = useState(() => {
		const allMetrics: Metric[] = [];
		mockCategories.forEach((category) => {
			allMetrics.push(...category.metrics);
			if (category.groups) {
				category.groups.forEach((group) => {
					allMetrics.push(...group.metrics);
				});
			}
		});

		// Sync with selectedMetrics from table
		const syncedMetrics = allMetrics.map((metric) => {
			const selectedMetric = selectedMetrics.find(
				(sm) => sm.id === metric.id
			);
			return {
				...metric,
				enabled: selectedMetric?.enabled || metric.enabled,
			};
		});

		return syncedMetrics;
	});

	// Initialize orderedEnabledMetrics when component mounts or selectedMetrics changes
	useEffect(() => {
		if (selectedMetrics.length > 0) {
			console.log(selectedMetrics);
			setOrderedEnabledMetrics(selectedMetrics.filter((m) => m.enabled));

			// Update the metrics state to reflect the current selections
			setMetrics((prevMetrics) =>
				prevMetrics.map((metric) => {
					const selectedMetric = selectedMetrics.find(
						(sm) => sm.id === metric.id
					);
					return {
						...metric,
						enabled: selectedMetric?.enabled || false,
					};
				})
			);
		}
	}, [selectedMetrics]);

	// Use orderedEnabledMetrics instead of computing from metrics
	const enabledMetrics =
		orderedEnabledMetrics.length > 0
			? orderedEnabledMetrics
			: metrics.filter((metric) => metric.enabled);

	const getFilteredMetrics = () => {
		let filteredMetrics = metrics;

		if (selectedCategory !== "all") {
			filteredMetrics = metrics.filter(
				(metric) => metric.category === selectedCategory
			);
		}

		if (searchTerm) {
			filteredMetrics = filteredMetrics.filter((metric) =>
				metric.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return filteredMetrics;
	};

	const groupRelatedMetrics = (metrics: Metric[]) => {
		const grouped: Array<{ base: Metric; new?: Metric; baseName: string }> =
			[];
		const processed = new Set<string>();

		metrics.forEach((metric) => {
			if (processed.has(metric.id)) return;

			const isNewMetric = metric.name.includes("(New)");

			if (!isNewMetric) {
				// This is a base metric, look for its "(New)" counterpart
				const newVersion = metrics.find(
					(m) =>
						m.name.includes("(New)") &&
						m.category === metric.category &&
						(m.name === `${metric.name} (New)` ||
							m.name
								.replace(" (New)", "")
								.replace("(New)", "")
								.trim() === metric.name.trim())
				);

				grouped.push({
					base: metric,
					new: newVersion,
					baseName: metric.name,
				});

				processed.add(metric.id);
				if (newVersion) processed.add(newVersion.id);
			}
		});

		// Add any remaining "(New)" metrics that didn't have a base match
		metrics.forEach((metric) => {
			if (!processed.has(metric.id) && metric.name.includes("(New)")) {
				const baseName = metric.name
					.replace(" (New)", "")
					.replace("(New)", "")
					.trim();
				grouped.push({
					base: metric,
					baseName: baseName || metric.name,
				});
				processed.add(metric.id);
			}
		});

		return grouped;
	};

	const getGroupedMetrics = () => {
		if (selectedCategory === "all") {
			// For "All", show grouped structure
			const groups: MetricGroup[] = [];
			mockCategories.forEach((category) => {
				if (category.groups) {
					category.groups.forEach((group) => {
						const filteredMetrics = searchTerm
							? group.metrics.filter((metric) =>
									metric.name
										.toLowerCase()
										.includes(searchTerm.toLowerCase())
							  )
							: group.metrics;
						if (filteredMetrics.length > 0) {
							groups.push({
								title: group.title,
								metrics: filteredMetrics,
							});
						}
					});
				}
			});
			return groups;
		} else {
			// For specific categories, check if they have groups
			const category = mockCategories.find(
				(cat) => cat.id === selectedCategory
			);
			if (category?.groups) {
				return category.groups
					.map((group) => ({
						title: group.title,
						metrics: searchTerm
							? group.metrics.filter((metric) =>
									metric.name
										.toLowerCase()
										.includes(searchTerm.toLowerCase())
							  )
							: group.metrics,
					}))
					.filter((group) => group.metrics.length > 0);
			}
		}
		return null;
	};

	const toggleMetric = (metricId: string) => {
		console.log(metrics);
		const metric = metrics.find((m) => m.id === metricId);
		console.log(metric);
		if (!metric) return;

		setMetrics((prev) =>
			prev.map((m) =>
				m.id === metricId ? { ...m, enabled: !m.enabled } : m
			)
		);

		// Update orderedEnabledMetrics
		if (metric.enabled) {
			// Remove from ordered list
			setOrderedEnabledMetrics((prev) =>
				prev.filter((m) => m.id !== metricId)
			);
		} else {
			// Add to ordered list
			setOrderedEnabledMetrics((prev) => [
				...prev,
				{
					id: metric.id,
					name: metric.name,
					category: metric.category,
					enabled: true,
				},
			]);
		}

		// Update the filter based on metricId
		// const updatedMetrics = {
		// 	...mockCategories[0].filter,
		// };

		// Map metricId to filter structure
		const newEnabledState = !metric.enabled;

		// Platform Reported metrics
		if (metricId === "spend") {
			updatedMetrics.platform_reported.spend = newEnabledState;
		} else if (metricId === "impressions") {
			updatedMetrics.platform_reported.impressions = newEnabledState;
		} else if (metricId === "budget") {
			updatedMetrics.platform_reported.budget = newEnabledState;
		} else if (metricId === "status") {
			updatedMetrics.platform_reported.status = newEnabledState;
		}
		// Meta ad metrics
		if (metricId === "metaCpm") {
			updatedMetrics.meta_reported.cpm = newEnabledState;
		} else if (metricId === "metaReach") {
			updatedMetrics.meta_reported.reach = newEnabledState;
		} else if (metricId === "metaClicks") {
			updatedMetrics.meta_reported.clicks = newEnabledState;
		} else if (metricId === "metaCtr") {
			updatedMetrics.meta_reported.ctr = newEnabledState;
		} else if (metricId === "metaCostPerClick") {
			updatedMetrics.meta_reported.cost_per_click = newEnabledState;
		} else if (metricId === "metaLinkClick") {
			updatedMetrics.meta_reported.link_click = newEnabledState;
		} else if (metricId === "metaCostPerLinkClick") {
			updatedMetrics.meta_reported.cost_per_link_click = newEnabledState;
		} else if (metricId === "metaOutboundClicks") {
			updatedMetrics.meta_reported.outbound_clicks = newEnabledState;
		} else if (metricId === "metaOutboundCtr") {
			updatedMetrics.meta_reported.outbound_ctr = newEnabledState;
		} else if (metricId === "metaPageViews") {
			updatedMetrics.meta_reported.page_view = newEnabledState;
		} else if (metricId === "metaClickQuality") {
			updatedMetrics.meta_reported.meta_click_quality = newEnabledState;
		} else if (metricId === "metaReadMoreRate") {
			updatedMetrics.meta_reported.read_more_rate = newEnabledState;
		} else if (metricId === "metaPostEngagement") {
			updatedMetrics.meta_reported.post_engagement = newEnabledState;
		} else if (metricId === "metaCostPerPostEngagement") {
			updatedMetrics.meta_reported.cost_per_post_engagement =
				newEnabledState;
		} else if (metricId === "metaPostReactions") {
			updatedMetrics.meta_reported.post_reaction = newEnabledState;
		} else if (metricId === "metaCostPerPostReactions") {
			updatedMetrics.meta_reported.cost_per_post_reaction =
				newEnabledState;
		} else if (metricId === "metaComments") {
			updatedMetrics.meta_reported.comment = newEnabledState;
		} else if (metricId === "metaCostPerComments") {
			updatedMetrics.meta_reported.cost_per_comment = newEnabledState;
		} else if (metricId === "metaPostShares") {
			updatedMetrics.meta_reported.post_shares = newEnabledState;
		} else if (metricId === "metaCostPerShares") {
			updatedMetrics.meta_reported.cost_per_share = newEnabledState;
		} else if (metricId === "metaPageLikes") {
			updatedMetrics.meta_reported.page_like = newEnabledState;
		} else if (metricId === "metaCostPerPageLikes") {
			updatedMetrics.meta_reported.cost_per_page_like = newEnabledState;
		} else if (metricId === "meta3SecondVideoViews") {
			updatedMetrics.meta_reported.n3_second_video_views =
				newEnabledState;
		} else if (metricId === "metaCostPer3SecondViews") {
			updatedMetrics.meta_reported.cost_per_n3_second_view =
				newEnabledState;
		} else if (metricId === "metaHookRate") {
			updatedMetrics.meta_reported.hook_rate = newEnabledState;
		} else if (metricId === "metaThruplay") {
			updatedMetrics.meta_reported.thruplay = newEnabledState;
		} else if (metricId === "metaCostPerThruplay") {
			updatedMetrics.meta_reported.cost_per_thruplay = newEnabledState;
		} else if (metricId === "metaVideoHoldRate") {
			updatedMetrics.meta_reported.video_hold_rate = newEnabledState;
		} else if (metricId === "metaVideo30SecondWatch") {
			updatedMetrics.meta_reported.video_30_second_watch =
				newEnabledState;
		} else if (metricId === "metaCostPerVideo30SecondWatch") {
			updatedMetrics.meta_reported.count_per_video_30_second_watch =
				newEnabledState;
		} else if (metricId === "meta25PercentWatchedVideo") {
			updatedMetrics.meta_reported.count_of_25p_watched_video =
				newEnabledState;
		} else if (metricId === "meta25PercentVideoWatchRate") {
			updatedMetrics.meta_reported.n25p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "meta50PercentWatchedVideo") {
			updatedMetrics.meta_reported.count_of_50p_watched_video =
				newEnabledState;
		} else if (metricId === "meta50PercentVideoWatchRate") {
			updatedMetrics.meta_reported.n50p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "meta75PercentWatchedVideo") {
			updatedMetrics.meta_reported.count_of_75p_watched_video =
				newEnabledState;
		} else if (metricId === "meta75PercentVideoWatchRate") {
			updatedMetrics.meta_reported.n75p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "meta95PercentWatchedVideo") {
			updatedMetrics.meta_reported.count_of_95p_watched_video =
				newEnabledState;
		} else if (metricId === "meta95PercentVideoWatchRate") {
			updatedMetrics.meta_reported.n95p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "meta100PercentWatchedVideo") {
			updatedMetrics.meta_reported.count_of_100p_watched_video =
				newEnabledState;
		} else if (metricId === "meta100PercentVideoWatchRate") {
			updatedMetrics.meta_reported.n100p_video_watch_rate =
				newEnabledState;
		}
		// Google ad metrics
		else if (metricId === "googleImpressions") {
			updatedMetrics.google_reported.impressions = newEnabledState;
		} else if (metricId === "googleCpm") {
			updatedMetrics.google_reported.cpm = newEnabledState;
		} else if (metricId === "googleClicks") {
			updatedMetrics.google_reported.clicks = newEnabledState;
		} else if (metricId === "googleCtr") {
			updatedMetrics.google_reported.ctr = newEnabledState;
		} else if (metricId === "googleCostPerClick") {
			updatedMetrics.google_reported.cost_per_click = newEnabledState;
		} else if (metricId === "googleVideoViews") {
			updatedMetrics.google_reported.video_views = newEnabledState;
		} else if (metricId === "google25PercentWatchedVideo") {
			updatedMetrics.google_reported.count_of_25p_watched_video =
				newEnabledState;
		} else if (metricId === "google25PercentVideoWatchRate") {
			updatedMetrics.google_reported.n25p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "google50PercentWatchedVideo") {
			updatedMetrics.google_reported.count_of_50p_watched_video =
				newEnabledState;
		} else if (metricId === "google50PercentVideoWatchRate") {
			updatedMetrics.google_reported.n50p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "google75PercentWatchedVideo") {
			updatedMetrics.google_reported.count_of_75p_watched_video =
				newEnabledState;
		} else if (metricId === "google75PercentVideoWatchRate") {
			updatedMetrics.google_reported.n75p_video_watch_rate =
				newEnabledState;
		} else if (metricId === "google100PercentWatchedVideo") {
			updatedMetrics.google_reported.count_of_100p_watched_video =
				newEnabledState;
		} else if (metricId === "google100PercentVideoWatchRate") {
			updatedMetrics.google_reported.n100p_video_watch_rate =
				newEnabledState;
		}
		// Google conversion metrics
		else if (metricId === "googleConversions") {
			updatedMetrics.google_conversion.conversions = newEnabledState;
		} else if (metricId === "googleCostPerConversion") {
			updatedMetrics.google_conversion.cost_per_conversion =
				newEnabledState;
		} else if (metricId === "googleSubmitLeadForm") {
			updatedMetrics.google_conversion.submit_lead_form = newEnabledState;
		} else if (metricId === "googleCostPerSubmitLeadForm") {
			updatedMetrics.google_conversion.cost_per_submit_lead_form =
				newEnabledState;
		} else if (metricId === "googleBookedAppointment") {
			updatedMetrics.google_conversion.booked_appointment =
				newEnabledState;
		} else if (metricId === "googleCostPerBookedAppointment") {
			updatedMetrics.google_conversion.cost_per_booked_appointment =
				newEnabledState;
		} else if (metricId === "googleContact") {
			updatedMetrics.google_conversion.contact = newEnabledState;
		} else if (metricId === "googleCostPerContact") {
			updatedMetrics.google_conversion.const_per_contact =
				newEnabledState;
		} else if (metricId === "googleAddToCart") {
			updatedMetrics.google_conversion.add_to_cart = newEnabledState;
		} else if (metricId === "googleCostPerAddToCart") {
			updatedMetrics.google_conversion.cost_per_add_to_cart =
				newEnabledState;
		} else if (metricId === "googleBeginCheckout") {
			updatedMetrics.google_conversion.begin_checkout = newEnabledState;
		} else if (metricId === "googleCostPerBeginCheckout") {
			updatedMetrics.google_conversion.cost_per_begin_checkout =
				newEnabledState;
		} else if (metricId === "googleRevenue") {
			updatedMetrics.google_conversion.revenue = newEnabledState;
		} else if (metricId === "googleRoas") {
			updatedMetrics.google_conversion.roas = newEnabledState;
		} else if (metricId === "googlePurchase") {
			updatedMetrics.google_conversion.purchase = newEnabledState;
		} else if (metricId === "googleCostPerPurchase") {
			updatedMetrics.google_conversion.cost_per_purchase =
				newEnabledState;
		}
		// Applications
		else if (metricId === "applications") {
			updatedMetrics.applications.total.total = newEnabledState;
		} else if (metricId === "applicationsNew") {
			updatedMetrics.applications.total.first_time = newEnabledState;
		} else if (metricId === "qualifiedApplications") {
			updatedMetrics.applications.qualified.total = newEnabledState;
		} else if (metricId === "qualifiedApplicationsNew") {
			updatedMetrics.applications.qualified.first_time = newEnabledState;
		} else if (metricId === "unqualifiedApplications") {
			updatedMetrics.applications.unqualified.total = newEnabledState;
		} else if (metricId === "unqualifiedApplicationsNew") {
			updatedMetrics.applications.unqualified.first_time =
				newEnabledState;
		} else if (metricId === "costPerApplication") {
			updatedMetrics.applications.cp_total.total = newEnabledState;
		} else if (metricId === "costPerApplicationNew") {
			updatedMetrics.applications.cp_total.first_time = newEnabledState;
		} else if (metricId === "costPerQualifiedApp") {
			updatedMetrics.applications.cp_qualified.total = newEnabledState;
		} else if (metricId === "costPerQualifiedAppNew") {
			updatedMetrics.applications.cp_qualified.first_time =
				newEnabledState;
		} else if (metricId === "costPerUnqualifiedApp") {
			updatedMetrics.applications.cp_unqualified.total = newEnabledState;
		} else if (metricId === "costPerUnqualifiedAppNew") {
			updatedMetrics.applications.cp_unqualified.first_time =
				newEnabledState;
		}
		// Booked Calls
		else if (metricId === "calls") {
			updatedMetrics.booked_calls.total.total = newEnabledState;
		} else if (metricId === "callsNew") {
			updatedMetrics.booked_calls.total.first_time = newEnabledState;
		} else if (metricId === "qualifiedCalls") {
			updatedMetrics.booked_calls.qualified.total = newEnabledState;
		} else if (metricId === "qualifiedCallsNew") {
			updatedMetrics.booked_calls.qualified.first_time = newEnabledState;
		} else if (metricId === "unqualifiedCalls") {
			updatedMetrics.booked_calls.unqualified.total = newEnabledState;
		} else if (metricId === "unqualifiedCallsNew") {
			updatedMetrics.booked_calls.unqualified.first_time =
				newEnabledState;
		} else if (metricId === "confirmedCalls") {
			updatedMetrics.booked_calls.confirmed.total = newEnabledState;
		} else if (metricId === "confirmedCallsNew") {
			updatedMetrics.booked_calls.confirmed.first_time = newEnabledState;
		} else if (metricId === "showedCalls") {
			updatedMetrics.booked_calls.showed.total = newEnabledState;
		} else if (metricId === "showedCallsNew") {
			updatedMetrics.booked_calls.showed.first_time = newEnabledState;
		} else if (metricId === "costPerCall") {
			updatedMetrics.booked_calls.cp_total.total = newEnabledState;
		} else if (metricId === "costPerCallNew") {
			updatedMetrics.booked_calls.cp_total.first_time = newEnabledState;
		}
		// Page Metrics
		else if (metricId === "visits") {
			updatedMetrics.page_metrics.visits.total = newEnabledState;
		} else if (metricId === "newVisits") {
			updatedMetrics.page_metrics.visits.first_time = newEnabledState;
		} else if (metricId === "costPerVisit") {
			updatedMetrics.page_metrics.cp_visit.total = newEnabledState;
		} else if (metricId === "costPerNewVisit") {
			updatedMetrics.page_metrics.cp_visit.first_time = newEnabledState;
		} else if (metricId === "percentNewVisits") {
			updatedMetrics.page_metrics.percent_new_visits = newEnabledState;
		} else if (metricId === "clickQuality") {
			updatedMetrics.page_metrics.click_quality = newEnabledState;
		} else if (metricId === "botTraffic") {
			updatedMetrics.page_metrics.bot_traffic = newEnabledState;
		} else if (metricId === "avgVideoView") {
			updatedMetrics.page_metrics.avg_video_view = newEnabledState;
		}
		// Lead Form Submissions
		else if (metricId === "leadFormSubmissions") {
			updatedMetrics.lead_form_submissions.total.total = newEnabledState;
		} else if (metricId === "leadFormSubmissionsNew") {
			updatedMetrics.lead_form_submissions.total.first_time =
				newEnabledState;
		} else if (metricId === "costPerLeadForm") {
			updatedMetrics.lead_form_submissions.cp_total.total =
				newEnabledState;
		} else if (metricId === "costPerLeadFormNew") {
			updatedMetrics.lead_form_submissions.cp_total.first_time =
				newEnabledState;
		}
		// Sets
		else if (metricId === "sets") {
			updatedMetrics.sets.total.total = newEnabledState;
		} else if (metricId === "setsNew") {
			updatedMetrics.sets.total.first_time = newEnabledState;
		} else if (metricId === "costPerSet") {
			updatedMetrics.sets.cp_total.total = newEnabledState;
		} else if (metricId === "costPerSetNew") {
			updatedMetrics.sets.cp_total.first_time = newEnabledState;
		} else if (metricId === "outboundSets") {
			updatedMetrics.sets.outbound.total = newEnabledState;
		} else if (metricId === "outboundSetsNew") {
			updatedMetrics.sets.outbound.first_time = newEnabledState;
		} else if (metricId === "costPerOutboundSet") {
			updatedMetrics.sets.cp_outbound.total = newEnabledState;
		}
		// Sales
		else if (metricId === "sales") {
			updatedMetrics.sales.total.total = newEnabledState;
		} else if (metricId === "salesNew") {
			updatedMetrics.sales.total.first_time = newEnabledState;
		} else if (metricId === "costPerSale") {
			updatedMetrics.sales.cp_total.total = newEnabledState;
		} else if (metricId === "costPerSaleNew") {
			updatedMetrics.sales.cp_total.first_time = newEnabledState;
		} else if (metricId === "revenue") {
			updatedMetrics.sales.revenue.total = newEnabledState;
		} else if (metricId === "revenueNew") {
			updatedMetrics.sales.revenue.first_time = newEnabledState;
		} else if (metricId === "cashCollected") {
			updatedMetrics.sales.cash_collected.total = newEnabledState;
		} else if (metricId === "cashCollectedNew") {
			updatedMetrics.sales.cash_collected.first_time = newEnabledState;
		} else if (metricId === "aov") {
			updatedMetrics.sales.aov.total = newEnabledState;
		} else if (metricId === "aovNew") {
			updatedMetrics.sales.aov.first_time = newEnabledState;
		} else if (metricId === "cac") {
			updatedMetrics.sales.cac = newEnabledState;
		} else if (metricId === "roas") {
			updatedMetrics.sales.roas.total = newEnabledState;
		} else if (metricId === "roasNew") {
			updatedMetrics.sales.roas.first_time = newEnabledState;
		} else if (metricId === "roasCashCollected") {
			updatedMetrics.sales.roas_cash_collected.total = newEnabledState;
		} else if (metricId === "roasCashCollectedNew") {
			updatedMetrics.sales.roas_cash_collected.first_time =
				newEnabledState;
		} else if (metricId === "profitBasedOnCashCollected") {
			updatedMetrics.sales.profit_based_on_cash_collected =
				newEnabledState;
		} else if (metricId === "profitBasedOnRevenue") {
			updatedMetrics.sales.profit_based_on_revenue = newEnabledState;
		} else if (metricId === "refunds") {
			updatedMetrics.sales.refunds.total = newEnabledState;
		} else if (metricId === "refundsNew") {
			updatedMetrics.sales.refunds.first_time = newEnabledState;
		} else if (metricId === "refundAmount") {
			updatedMetrics.sales.refund_amount.total = newEnabledState;
		} else if (metricId === "refundAmountNew") {
			updatedMetrics.sales.refund_amount.first_time = newEnabledState;
		} else if (metricId === "shipping") {
			updatedMetrics.sales.shipping.total = newEnabledState;
		} else if (metricId === "shippingNew") {
			updatedMetrics.sales.shipping.first_time = newEnabledState;
		} else if (metricId === "tax") {
			updatedMetrics.sales.tax.total = newEnabledState;
		} else if (metricId === "taxNew") {
			updatedMetrics.sales.tax.first_time = newEnabledState;
		} else if (metricId === "discounts") {
			updatedMetrics.sales.discounts.total = newEnabledState;
		} else if (metricId === "discountsNew") {
			updatedMetrics.sales.discounts.first_time = newEnabledState;
		}
		// Offers Made
		else if (metricId === "offersMade") {
			updatedMetrics.offers_made.total.total = newEnabledState;
		} else if (metricId === "costPerOfferMade") {
			updatedMetrics.offers_made.cp_total.total = newEnabledState;
		} else if (metricId === "offersMadeNew") {
			updatedMetrics.offers_made.total.first_time = newEnabledState;
		} else if (metricId === "costPerOfferMade") {
			updatedMetrics.offers_made.cp_total.first_time = newEnabledState;
		}
		// Add to Cart
		else if (metricId === "addToCart") {
			updatedMetrics.add_to_cart.total.total = newEnabledState;
		} else if (metricId === "costPerAddToCart") {
			updatedMetrics.add_to_cart.cp_total.total = newEnabledState;
		} else if (metricId === "addToCart") {
			updatedMetrics.add_to_cart.total.first_time = newEnabledState;
		} else if (metricId === "costPerAddToCart") {
			updatedMetrics.add_to_cart.cp_total.first_time = newEnabledState;
		}

		console.log(updatedMetrics);
	};

	const removeSelectedMetric = (metricId: string) => {
		setMetrics((prev) =>
			prev.map((metric) =>
				metric.id === metricId ? { ...metric, enabled: false } : metric
			)
		);

		// Remove from ordered list
		setOrderedEnabledMetrics((prev) =>
			prev.filter((m) => m.id !== metricId)
		);
	};

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOverIndex(index);
	};

	const handleDragLeave = () => {
		setDragOverIndex(null);
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();

		if (draggedIndex === null) return;

		// Create a new array from the current ordered enabled metrics
		const newOrderedMetrics = [...orderedEnabledMetrics];
		const draggedItem = newOrderedMetrics[draggedIndex];

		// Remove dragged item
		newOrderedMetrics.splice(draggedIndex, 1);

		// Insert at new position
		newOrderedMetrics.splice(dropIndex, 0, draggedItem);

		// Update the ordered state
		setOrderedEnabledMetrics(newOrderedMetrics);

		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleApply = () => {
		// Apply the changes to the table in the correct order using orderedEnabledMetrics
		const changedMetrics = orderedEnabledMetrics.map((metric) => ({
			id: metric.id,
			name: metric.name,
			category: metric.category,
			enabled: metric.enabled,
		}));
		onMetricsChange(changedMetrics);
		onUpdatedMetrics(updatedMetrics, changedMetrics);
		onOpenChange(false);
	};

	const handleSaveView = () => {
		if (viewName.trim() && onSaveView) {
			const finalMetrics =
				orderedEnabledMetrics.length > 0
					? orderedEnabledMetrics
					: enabledMetrics;
			onSaveView(viewName.trim(), finalMetrics);
			setViewName("");
			setShowSaveDialog(false);
		}
	};

	const handleLoadView = (viewId: string) => {
		if (onLoadView) {
			const view = onLoadView(viewId);
			if (view && view.metrics) {
				// Update all internal state to match the loaded view
				const loadedMetrics = view.metrics;

				// Update the main metrics state
				setMetrics((prevMetrics) =>
					prevMetrics.map((metric) => {
						const loadedMetric = loadedMetrics.find(
							(lm) => lm.id === metric.id
						);
						return {
							...metric,
							enabled: loadedMetric?.enabled || false,
						};
					})
				);

				// Update ordered enabled metrics
				setOrderedEnabledMetrics(
					loadedMetrics.filter((m) => m.enabled)
				);
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white">
				<DialogHeader className="px-6 py-4 border-b border-gray-200">
					<DialogTitle className="text-lg font-medium text-gray-900">
						Customize table
					</DialogTitle>
				</DialogHeader>

				<div className="flex h-[600px]">
					{/* Categories */}
					<div className="w-80 border-r border-gray-200 bg-white">
						<div className="p-4 border-b border-gray-100">
							<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
								CATEGORY
							</h3>
							<div className="space-y-1">
								{mockCategories.map((category) => (
									<div
										key={category.id}
										className={cn(
											"px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 transition-colors",
											selectedCategory === category.id
												? "bg-blue-50 text-blue-600 font-medium"
												: "text-gray-700"
										)}
										onClick={() =>
											setSelectedCategory(category.id)
										}
									>
										{category.name}
										{category.name === "Custom metrics" && (
											<span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
												NEW
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Metrics */}
					<div className="flex-1 border-r border-gray-200 bg-white">
						<div className="p-4 border-b border-gray-100">
							<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
								METRICS
							</h3>
							<div className="relative mb-4">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input
									placeholder="Search..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="pl-10 h-9 text-sm bg-white border-gray-300"
								/>
							</div>
						</div>

						<div className="p-4 max-h-[480px] overflow-y-auto">
							{(() => {
								const groupedMetrics = getGroupedMetrics();
								if (groupedMetrics) {
									return (
										<div className="space-y-6">
											{groupedMetrics.map((group) => (
												<div key={group.title}>
													<h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
														{group.title}
													</h3>
													<div className="grid grid-cols-2 gap-x-8 gap-y-4">
														{groupRelatedMetrics(
															group.metrics
														).map(
															(
																metricGroup,
																index
															) => (
																<div
																	key={`${group.title}-${index}`}
																	className="space-y-2"
																>
																	<div className="flex items-center space-x-2">
																		<Checkbox
																			checked={
																				metrics.find(
																					(
																						m
																					) =>
																						m.id ===
																						metricGroup
																							.base
																							.id
																				)
																					?.enabled ||
																				false
																			}
																			onCheckedChange={() =>
																				toggleMetric(
																					metricGroup
																						.base
																						.id
																				)
																			}
																			className="border-gray-300"
																		/>
																		<span className="text-sm font-medium text-gray-900 flex items-center gap-2">
																			{metricGroup
																				.base
																				.category ===
																				"metaReported" && (
																				<MetaLogo className="w-4 h-4 text-blue-600" />
																			)}
																			{metricGroup
																				.base
																				.category ===
																				"googleReported" && (
																				<GoogleLogo className="w-4 h-4" />
																			)}
																			{
																				metricGroup.baseName
																			}
																		</span>
																	</div>
																	{metricGroup.new && (
																		<div className="flex items-center space-x-6 ml-6">
																			<div className="flex items-center space-x-2">
																				<Checkbox
																					checked={
																						metrics.find(
																							(
																								m
																							) =>
																								m.id ===
																								metricGroup
																									.base
																									.id
																						)
																							?.enabled ||
																						false
																					}
																					onCheckedChange={() =>
																						toggleMetric(
																							metricGroup
																								.base
																								.id
																						)
																					}
																					className="border-gray-300"
																				/>
																				<span className="text-sm text-gray-600">
																					Total
																				</span>
																			</div>
																			<div className="flex items-center space-x-2">
																				<Checkbox
																					checked={
																						metrics.find(
																							(
																								m
																							) =>
																								m.id ===
																								metricGroup
																									.new
																									?.id
																						)
																							?.enabled ||
																						false
																					}
																					onCheckedChange={() =>
																						toggleMetric(
																							metricGroup.new!
																								.id
																						)
																					}
																					className="border-gray-300"
																				/>
																				<span className="text-sm text-gray-600">
																					First
																					time
																				</span>
																			</div>
																		</div>
																	)}
																</div>
															)
														)}
													</div>
												</div>
											))}
										</div>
									);
								} else {
									// For categories without groups, show flat structure
									return (
										<div className="grid grid-cols-2 gap-x-8 gap-y-4">
											{groupRelatedMetrics(
												getFilteredMetrics()
											).map((metricGroup, index) => (
												<div
													key={index}
													className="space-y-2"
												>
													<div className="flex items-center space-x-2">
														<Checkbox
															checked={
																metrics.find(
																	(m) =>
																		m.id ===
																		metricGroup
																			.base
																			.id
																)?.enabled ||
																false
															}
															onCheckedChange={() =>
																toggleMetric(
																	metricGroup
																		.base.id
																)
															}
															className="border-gray-300"
														/>
														<span className="text-sm font-medium text-gray-900">
															{
																metricGroup.baseName
															}
														</span>
													</div>
													{metricGroup.new && (
														<div className="flex items-center space-x-6 ml-6">
															<div className="flex items-center space-x-2">
																<Checkbox
																	checked={
																		metrics.find(
																			(
																				m
																			) =>
																				m.id ===
																				metricGroup
																					.base
																					.id
																		)
																			?.enabled ||
																		false
																	}
																	onCheckedChange={() =>
																		toggleMetric(
																			metricGroup
																				.base
																				.id
																		)
																	}
																	className="border-gray-300"
																/>
																<span className="text-sm text-gray-600">
																	Total
																</span>
															</div>
															<div className="flex items-center space-x-2">
																<Checkbox
																	checked={
																		metrics.find(
																			(
																				m
																			) =>
																				m.id ===
																				metricGroup
																					.new
																					?.id
																		)
																			?.enabled ||
																		false
																	}
																	onCheckedChange={() =>
																		toggleMetric(
																			metricGroup.new!
																				.id
																		)
																	}
																	className="border-gray-300"
																/>
																<span className="text-sm text-gray-600">
																	First time
																</span>
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									);
								}
							})()}
						</div>
					</div>

					{/* Column Order */}
					<div className="w-80 bg-white">
						<div className="p-4 border-b border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
									COLUMN ORDER
								</h3>
								<Button
									variant="ghost"
									size="sm"
									className="text-xs text-red-600 hover:text-red-700 p-0 h-auto"
									onClick={() =>
										setMetrics((prev) =>
											prev.map((m) => ({
												...m,
												enabled: false,
											}))
										)
									}
								>
									Delete all
								</Button>
							</div>
							<div className="text-xs text-gray-600">
								({enabledMetrics.length}) Selected metrics
							</div>
						</div>

						<div className="p-4 max-h-[480px] overflow-y-auto">
							<div className="space-y-2">
								{enabledMetrics.map((metric, index) => (
									<div
										key={metric.id}
										draggable
										onDragStart={(e) =>
											handleDragStart(e, index)
										}
										onDragOver={(e) =>
											handleDragOver(e, index)
										}
										onDragLeave={handleDragLeave}
										onDrop={(e) => handleDrop(e, index)}
										onDragEnd={handleDragEnd}
										className={cn(
											"flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move transition-all",
											draggedIndex === index &&
												"opacity-50",
											dragOverIndex === index &&
												draggedIndex !== index &&
												"border-blue-500 bg-blue-50"
										)}
									>
										<div className="flex items-center space-x-3 flex-1">
											<GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
											<div className="flex-1">
												<div className="text-sm font-medium text-gray-900 flex items-center gap-2">
													{metric.category ===
														"metaReported" && (
														<MetaLogo className="w-4 h-4 text-blue-600" />
													)}
													{metric.category ===
														"googleReported" && (
														<GoogleLogo className="w-4 h-4" />
													)}
													{metric.name}
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="ghost"
												size="sm"
												className="p-1 h-auto text-red-600 hover:text-red-700"
												onClick={() =>
													removeSelectedMetric(
														metric.id
													)
												}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
					<div className="flex items-center gap-3">
						{savedViews && savedViews.length > 0 && (
							<Select onValueChange={handleLoadView}>
								<SelectTrigger className="w-48 h-8 text-xs">
									<SelectValue placeholder="Load saved view..." />
								</SelectTrigger>
								<SelectContent>
									{savedViews.map((view) => (
										<SelectItem
											key={view.id}
											value={view.id}
											className="text-xs"
										>
											{view.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowSaveDialog(true)}
							className="h-8 text-xs px-3"
						>
							<Save className="w-3 h-3 mr-1" />
							Save View
						</Button>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="px-6 py-2 text-sm border-gray-300 hover:bg-gray-50"
						>
							CANCEL
						</Button>
						<Button
							onClick={handleApply}
							className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
						>
							APPLY
						</Button>
					</div>
				</div>
			</DialogContent>

			{/* Save View Dialog */}
			<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Save View</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Input
							placeholder="Enter view name..."
							value={viewName}
							onChange={(e) => setViewName(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleSaveView()
							}
						/>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={() => setShowSaveDialog(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSaveView}
								disabled={!viewName.trim()}
								className="flex-1"
							>
								Save
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
};
