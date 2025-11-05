import { Badge } from "../ui/badge";
import {
	formatCurrency,
	formatNumber,
	formatPercentage,
} from "../../../lib/utils";

export const renderCellContent = (metric: any, item: any) => {
	switch (metric.id) {
		// --- Platform Reported --- //
		case "spend":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.platform_reported?.spend != null
							? formatCurrency(item.platform_reported.spend)
							: "-"}
					</div>
				</div>
			);
		case "status":
			return (
				<Badge
					variant={
						item?.platform_reported?.status === "Active"
							? "default"
							: "secondary"
					}
					className="text-xs"
				>
					{item?.platform_reported?.status != null
						? item.platform_reported.status
						: "-"}
				</Badge>
			);
		case "impressions":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.platform_reported?.impressions != null
							? formatNumber(item.platform_reported.impressions)
							: "-"}
					</div>
				</div>
			);
		case "budget":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.platform_reported?.budget != null
							? item.platform_reported.budget
							: "-"}
					</div>
				</div>
			);
		// --- Platform Reported --- //

		// --- Page Metrics --- //
		case "visits":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.visits != null
							? formatNumber(item?.page_metrics?.visits)
							: "-"}
					</div>
				</div>
			);
		case "newVisits":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.first_visits != null
							? formatPercentage(item.page_metrics.first_visits)
							: "-"}
					</div>
				</div>
			);
		case "costPerVisit":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.cp_visit != null
							? formatPercentage(item.page_metrics.cp_visit)
							: "-"}
					</div>
				</div>
			);
		case "costPerNewVisit":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.cp_visit_new != null
							? formatPercentage(item.page_metrics.cp_visit_new)
							: "-"}
					</div>
				</div>
			);
		case "percentNewVisits":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.first_visits_percent != null
							? formatNumber(
									item.page_metrics.first_visits_percent
							  )
							: "-"}
					</div>
				</div>
			);
		case "clickQuality":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.click_quality != null
							? formatNumber(item.page_metrics.click_quality)
							: "-"}
					</div>
				</div>
			);
		case "botTraffic":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.page_metrics?.bot_traffic != null
							? formatNumber(item.page_metrics.bot_traffic)
							: "-"}
					</div>
				</div>
			);
		// --- Page Metrics --- //

		// --- Lead Form Submissions --- //
		case "leadFormSubmissions":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.lead_form_submissions?.total != null
							? formatNumber(item.lead_form_submissions.total)
							: "-"}
					</div>
				</div>
			);
		case "leadFormSubmissionsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.lead_form_submissions?.total_new != null
							? formatNumber(item.lead_form_submissions.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerLeadForm":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.lead_form_submissions?.cp_total != null
							? formatNumber(item.lead_form_submissions.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerLeadFormNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.lead_form_submissions?.cp_total_new != null
							? formatNumber(
									item.lead_form_submissions.cp_total_new
							  )
							: "-"}
					</div>
				</div>
			);
		// --- Lead Form Submissions --- //

		// --- Sales --- //
		case "sales":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.total != null
							? formatNumber(item.sales.total)
							: "-"}
					</div>
				</div>
			);
		case "salesNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.total_new != null
							? formatNumber(item.sales.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerSale":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.cp_total != null
							? formatNumber(item.sales.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerSaleNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.cp_total_new != null
							? formatNumber(item.sales.cp_total_new)
							: "-"}
					</div>
				</div>
			);
		case "revenue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.revenue != null
							? formatNumber(item.sales.revenue)
							: "-"}
					</div>
				</div>
			);
		case "revenueNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.revenue_new != null
							? formatNumber(item.sales.revenue_new)
							: "-"}
					</div>
				</div>
			);
		case "cashCollected":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.cash_collected != null
							? formatNumber(item.sales.cash_collected)
							: "-"}
					</div>
				</div>
			);
		case "cashCollectedNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.cash_collected_new != null
							? formatNumber(item.sales.cash_collected_new)
							: "-"}
					</div>
				</div>
			);
		case "aov":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.aov != null
							? formatNumber(item.sales.aov)
							: "-"}
					</div>
				</div>
			);
		case "aovNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.aov_new != null
							? formatNumber(item.sales.aov_new)
							: "-"}
					</div>
				</div>
			);
		case "cac":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.cac != null
							? formatNumber(item.sales.cac)
							: "-"}
					</div>
				</div>
			);
		case "roas":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.roas != null
							? formatNumber(item.sales.roas)
							: "-"}
					</div>
				</div>
			);
		case "roasNew":
			return (
				<div className="space-y-6">
					<div className="text-gray-900 text-xs">
						{item?.sales?.roas_new != null
							? formatNumber(item.sales.roas_new)
							: "-"}
					</div>
				</div>
			);
		case "roasCashCollected":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.roas_cash_collected?.total != null
							? formatNumber(item.sales.roas_cash_collected.total)
							: "-"}
					</div>
				</div>
			);
		case "roasCashCollectedNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.roas_cash_collected?.first_time != null
							? formatNumber(
									item.sales.roas_cash_collected.first_time
							  )
							: "-"}
					</div>
				</div>
			);
		case "profitBasedOnCashCollected":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.profit_based_on_cash_collected != null
							? formatNumber(
									item.sales.profit_based_on_cash_collected
							  )
							: "-"}
					</div>
				</div>
			);
		case "profitBasedOnRevenue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.profit_based_on_revenue != null
							? formatNumber(item.sales.profit_based_on_revenue)
							: "-"}
					</div>
				</div>
			);
		case "refunds":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.refunds?.total != null
							? formatNumber(item.sales.refunds.total)
							: "-"}
					</div>
				</div>
			);
		case "refundsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.refunds?.first_time != null
							? formatNumber(item.sales.refunds.first_time)
							: "-"}
					</div>
				</div>
			);
		case "refundAmount":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.refund_amount?.total != null
							? formatNumber(item.sales.refund_amount.total)
							: "-"}
					</div>
				</div>
			);
		case "refundAmountNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.refund_amount?.first_time != null
							? formatNumber(item.sales.refund_amount.first_time)
							: "-"}
					</div>
				</div>
			);
		case "shipping":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.shipping?.total != null
							? formatNumber(item.sales.shipping.total)
							: "-"}
					</div>
				</div>
			);
		case "shippingNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.shipping?.first_time != null
							? formatNumber(item.sales.shipping.first_time)
							: "-"}
					</div>
				</div>
			);
		case "tax":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.tax?.total != null
							? formatNumber(item.sales.tax.total)
							: "-"}
					</div>
				</div>
			);
		case "taxNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.tax?.first_time != null
							? formatNumber(item.sales.tax.first_time)
							: "-"}
					</div>
				</div>
			);
		case "discounts":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.discounts?.total != null
							? formatNumber(item.sales.discounts.total)
							: "-"}
					</div>
				</div>
			);
		case "discountsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sales?.discounts?.first_time != null
							? formatNumber(item.sales.discounts.first_time)
							: "-"}
					</div>
				</div>
			);
		// --- Sales --- //

		// --- Applications --- //
		case "applications":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.total != null
							? formatNumber(item.applications.total)
							: "-"}
					</div>
				</div>
			);
		case "applicationsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.total_new != null
							? formatNumber(item.applications.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerApplication":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_total != null
							? formatNumber(item.applications.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerApplicationNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_total_new != null
							? formatNumber(item.applications.cp_total_new)
							: "-"}
					</div>
				</div>
			);
		case "qualifiedApplications":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.qualified != null
							? formatNumber(item.applications.qualified)
							: "-"}
					</div>
				</div>
			);
		case "qualifiedApplicationsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.qualified_new != null
							? formatNumber(item.applications.qualified_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerQualifiedApp":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_qualified != null
							? formatNumber(item.applications.cp_qualified)
							: "-"}
					</div>
				</div>
			);
		case "costPerQualifiedAppNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_qualified_new != null
							? formatNumber(item.applications.cp_qualified_new)
							: "-"}
					</div>
				</div>
			);
		case "unqualifiedApplications":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.unqualified != null
							? formatNumber(item.applications.unqualified)
							: "-"}
					</div>
				</div>
			);
		case "unqualifiedApplicationsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.unqualified_new != null
							? formatNumber(item.applications.unqualified_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerUnqualifiedApp":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_unqualified != null
							? formatNumber(item.applications.cp_unqualified)
							: "-"}
					</div>
				</div>
			);
		case "costPerUnqualifiedAppNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.applications?.cp_unqualified_new != null
							? formatNumber(item.applications.cp_unqualified_new)
							: "-"}
					</div>
				</div>
			);
		// --- Applications --- //

		// --- Booked Call --- //
		case "calls":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.total != null
							? formatNumber(item.booked_calls.total)
							: "-"}
					</div>
				</div>
			);
		case "callsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.total_new != null
							? formatNumber(item.booked_calls.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerCall":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_total != null
							? formatNumber(item.booked_calls.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerCallNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_total_new != null
							? formatNumber(item.booked_calls.cp_total_new)
							: "-"}
					</div>
				</div>
			);
		case "qualifiedCalls":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.qualified != null
							? formatNumber(item.booked_calls.qualified)
							: "-"}
					</div>
				</div>
			);
		case "qualifiedCallsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.qualified_new != null
							? formatNumber(item.booked_calls.qualified_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerQualifiedCall":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_qualified != null
							? formatNumber(item.booked_calls.cp_qualified)
							: "-"}
					</div>
				</div>
			);
		case "costPerQualifiedCallNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_qualified_new != null
							? formatNumber(item.booked_calls.cp_qualified_new)
							: "-"}
					</div>
				</div>
			);
		case "unqualifiedCalls":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.unqualified != null
							? formatNumber(item.booked_calls.unqualified)
							: "-"}
					</div>
				</div>
			);
		case "unqualifiedCallsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.unqualified_new != null
							? formatNumber(item.booked_calls.unqualified_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerUnqualifiedCall":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_unqualified != null
							? formatNumber(item.booked_calls.cp_unqualified)
							: "-"}
					</div>
				</div>
			);
		case "costPerUnqualifiedCallNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_unqualified_new != null
							? formatNumber(item.booked_calls.cp_unqualified_new)
							: "-"}
					</div>
				</div>
			);
		case "callsShowed":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.showed != null
							? formatNumber(item.booked_calls.showed)
							: "-"}
					</div>
				</div>
			);
		case "callsShowedNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.showed_new != null
							? formatNumber(item.booked_calls.showed_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerCallShowed":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_showed != null
							? formatNumber(item.booked_calls.cp_showed)
							: "-"}
					</div>
				</div>
			);
		case "costPerCallShowedNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.booked_calls?.cp_showed_new != null
							? formatNumber(item.booked_calls.cp_showed_new)
							: "-"}
					</div>
				</div>
			);
		// --- Booked Call --- //

		// --- Sets --- //
		case "sets":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.total != null
							? formatNumber(item.sets.total)
							: "-"}
					</div>
				</div>
			);
		case "setsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.total_new != null
							? formatNumber(item.sets.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerSet":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_total != null
							? formatNumber(item.sets.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerSetNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_total_new != null
							? formatNumber(item.sets.cp_total_new)
							: "-"}
					</div>
				</div>
			);
		case "outboundSets":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.outbound != null
							? formatNumber(item.sets.outbound)
							: "-"}
					</div>
				</div>
			);
		case "outboundSetsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.outbound_new != null
							? formatNumber(item.sets.outbound_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerOutboundSet":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_outbound != null
							? formatNumber(item.sets.cp_outbound)
							: "-"}
					</div>
				</div>
			);
		case "costPerOutboundSetNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_outbound_new != null
							? formatNumber(item.sets.cp_outbound_new)
							: "-"}
					</div>
				</div>
			);
		case "inboundSets":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.inbound != null
							? formatNumber(item.sets.inbound)
							: "-"}
					</div>
				</div>
			);
		case "inboundSetsNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.inbound_new != null
							? formatNumber(item.sets.inbound_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerInboundSet":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_inbound != null
							? formatNumber(item.sets.cp_inbound)
							: "-"}
					</div>
				</div>
			);
		case "costPerInboundSetNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.sets?.cp_inbound_new != null
							? formatNumber(item.sets.cp_inbound_new)
							: "-"}
					</div>
				</div>
			);
		// --- Sets --- //

		// --- Add To Cart --- //
		// --- Add To Cart --- //

		// --- Offers Made --- //
		case "offersMade":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.offers_made?.total != null
							? formatNumber(item.offers_made.total)
							: "-"}
					</div>
				</div>
			);
		case "offersMadeNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.offers_made?.total_new != null
							? formatNumber(item.offers_made.total_new)
							: "-"}
					</div>
				</div>
			);
		case "costPerOfferMade":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.offers_made?.cp_total != null
							? formatNumber(item.offers_made.cp_total)
							: "-"}
					</div>
				</div>
			);
		case "costPerOfferMadeNew":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.offers_made?.cp_total_new != null
							? formatNumber(item.offers_made.cp_total_new)
							: "-"}
					</div>
				</div>
			);
		// --- Offers Made --- //

		// --- Meta --- //
		case "metaCpm":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cpm != null
							? formatCurrency(item.meta_reported.cpm)
							: "-"}
					</div>
				</div>
			);
		case "metaClicks":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{formatNumber(item.metaClicks)}
					</div>
				</div>
			);
		case "metaReach":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.reach != null
							? formatNumber(item.meta_reported.reach)
							: "-"}
					</div>
				</div>
			);
		case "metaCtr":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.ctr != null
							? formatNumber(item.meta_reported.ctr)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerClick":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_click != null
							? formatNumber(item.meta_reported.cost_per_click)
							: "-"}
					</div>
				</div>
			);
		case "metaLinkClick":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.link_click != null
							? formatNumber(item.meta_reported.link_click)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerLinkClick":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_link_click != null
							? formatNumber(
									item.meta_reported.cost_per_link_click
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaOutboundClicks":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.outbound_clicks != null
							? formatNumber(item.meta_reported.outbound_clicks)
							: "-"}
					</div>
				</div>
			);
		case "metaOutboundCtr":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.outbound_ctr != null
							? formatNumber(item.meta_reported.outbound_ctr)
							: "-"}
					</div>
				</div>
			);
		case "metaPageView":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.page_view != null
							? formatNumber(item.meta_reported.page_view)
							: "-"}
					</div>
				</div>
			);
		case "metaClickQuality":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.meta_click_quality != null
							? formatNumber(
									item.meta_reported.meta_click_quality
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaReadMoreRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.read_more_rate != null
							? formatNumber(item.meta_reported.read_more_rate)
							: "-"}
					</div>
				</div>
			);
		case "metaPostEngagement":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.post_engagement != null
							? formatNumber(item.meta_reported.post_engagement)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerPostEngagement":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_post_engagement != null
							? formatNumber(
									item.meta_reported.cost_per_post_engagement
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaPostReaction":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.post_reaction != null
							? formatNumber(item.meta_reported.post_reaction)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerPostReaction":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_post_reaction != null
							? formatNumber(
									item.meta_reported.cost_per_post_reaction
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaComment":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.comment != null
							? formatNumber(item.meta_reported.comment)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerComment":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_comment != null
							? formatNumber(item.meta_reported.cost_per_comment)
							: "-"}
					</div>
				</div>
			);
		case "metaPostShares":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.post_shares != null
							? formatNumber(item.meta_reported.post_shares)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerShare":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_share != null
							? formatNumber(item.meta_reported.cost_per_share)
							: "-"}
					</div>
				</div>
			);
		case "metaPageLike":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.page_like != null
							? formatNumber(item.meta_reported.page_like)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerPageLike":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_page_like != null
							? formatNumber(
									item.meta_reported.cost_per_page_like
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaHookRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.hook_rate != null
							? formatNumber(item.meta_reported.hook_rate)
							: "-"}
					</div>
				</div>
			);
		case "metaThruplay":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.thruplay != null
							? formatNumber(item.meta_reported.thruplay)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerThruplay":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.cost_per_thruplay != null
							? formatNumber(item.meta_reported.cost_per_thruplay)
							: "-"}
					</div>
				</div>
			);
		case "metaVideoHoldRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.video_hold_rate != null
							? formatNumber(item.meta_reported.video_hold_rate)
							: "-"}
					</div>
				</div>
			);
		case "metaVideo30SecondWatch":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.video_30_second_watch != null
							? formatNumber(
									item.meta_reported.video_30_second_watch
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerVideo30SecondWatch":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_per_video_30_second_watch !=
						null
							? formatNumber(
									item.meta_reported
										.count_per_video_30_second_watch
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta25PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_25p_watched_video != null
							? formatNumber(
									item.meta_reported
										.count_of_25p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta25PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.n25p_video_watch_rate != null
							? formatNumber(
									item.meta_reported.n25p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta50PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_50p_watched_video != null
							? formatNumber(
									item.meta_reported
										.count_of_50p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta50PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.n50p_video_watch_rate != null
							? formatNumber(
									item.meta_reported.n50p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta75PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_75p_watched_video != null
							? formatNumber(
									item.meta_reported
										.count_of_75p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta75PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.n75p_video_watch_rate != null
							? formatNumber(
									item.meta_reported.n75p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta95PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_95p_watched_video != null
							? formatNumber(
									item.meta_reported
										.count_of_95p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta95PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_100p_watched_video !=
						null
							? formatNumber(
									item.meta_reported
										.count_of_100p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta100PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.count_of_100p_watched_video !=
						null
							? formatNumber(
									item.meta_reported
										.count_of_100p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "meta100PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_reported?.n100p_video_watch_rate != null
							? formatNumber(
									item.meta_reported.n100p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaSearch":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.search != null
							? formatNumber(item.meta_conversion.search)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerSearch":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_search != null
							? formatNumber(item.meta_conversion.cost_per_search)
							: "-"}
					</div>
				</div>
			);
		case "metaSubmitApplication":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.submit_application != null
							? formatNumber(
									item.meta_conversion.submit_application
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerSubmitApplication":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_submit_application !=
						null
							? formatNumber(
									item.meta_conversion
										.cost_per_submit_application
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaPurchase":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.purchase != null
							? formatNumber(item.meta_conversion.purchase)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerPurchase":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_purchase != null
							? formatNumber(
									item.meta_conversion.cost_per_purchase
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaRevenue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.revenue != null
							? formatNumber(item.meta_conversion.revenue)
							: "-"}
					</div>
				</div>
			);
		case "metaRoas":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.roas != null
							? formatNumber(item.meta_conversion.roas)
							: "-"}
					</div>
				</div>
			);
		case "metaAverageOrderValue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.average_order_value != null
							? formatNumber(
									item.meta_conversion.average_order_value
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaAddToCart":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.add_to_cart != null
							? formatNumber(item.meta_conversion.add_to_cart)
							: "-"}
					</div>
				</div>
			);
		case "metaAddToCartToPurchaseRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.add_to_cat_to_purchase_rate !=
						null
							? formatNumber(
									item.meta_conversion
										.add_to_cat_to_purchase_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaAddPaymentInfo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.add_payment_info != null
							? formatNumber(
									item.meta_conversion.add_payment_info
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerAddPaymentInfo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_add_payment_info !=
						null
							? formatNumber(
									item.meta_conversion
										.cost_per_add_payment_info
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCompleteRegistration":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.complete_registration != null
							? formatNumber(
									item.meta_conversion.complete_registration
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerCompleteRegistration":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion
							?.cost_per_complete_registration != null
							? formatNumber(
									item.meta_conversion
										.cost_per_complete_registration
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaContact":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.contact != null
							? formatNumber(item.meta_conversion.contact)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerContact":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_contact != null
							? formatNumber(
									item.meta_conversion.cost_per_contact
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCustomizeProduct":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.customize_product != null
							? formatNumber(
									item.meta_conversion.customize_product
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerCustomizeProduct":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_customize_product !=
						null
							? formatNumber(
									item.meta_conversion
										.cost_per_customize_product
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaDonate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.donate != null
							? formatNumber(item.meta_conversion.donate)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerDonate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_donate != null
							? formatNumber(item.meta_conversion.cost_per_donate)
							: "-"}
					</div>
				</div>
			);
		case "metaDonateAmount":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.donate_amount != null
							? formatNumber(item.meta_conversion.donate_amount)
							: "-"}
					</div>
				</div>
			);
		case "metaFindLocation":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.find_location != null
							? formatNumber(item.meta_conversion.find_location)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerFindLocation":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_find_location != null
							? formatNumber(
									item.meta_conversion.cost_per_find_location
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaSchedule":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.schedule != null
							? formatNumber(item.meta_conversion.schedule)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerSchedule":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_schedule != null
							? formatNumber(
									item.meta_conversion.cost_per_schedule
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaSubmitApplicationToScheduleRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion
							?.submit_application_to_schedule_rate != null
							? formatNumber(
									item.meta_conversion
										.submit_application_to_schedule_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaStartTrial":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.start_trial != null
							? formatNumber(item.meta_conversion.start_trial)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerStartTrial":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_start_trial != null
							? formatNumber(
									item.meta_conversion.cost_per_start_trial
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaSubscribe":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.subscribe != null
							? formatNumber(item.meta_conversion.subscribe)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerSubscribe":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_subscribe != null
							? formatNumber(
									item.meta_conversion.cost_per_subscribe
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaViewContent":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.view_content != null
							? formatNumber(item.meta_conversion.view_content)
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerViewContent":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_view_content != null
							? formatNumber(
									item.meta_conversion.cost_per_view_content
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaRegistrationsCompleted":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.registrations_completed != null
							? formatNumber(
									item.meta_conversion.registrations_completed
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerRegistrationCompleted":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion
							?.cost_per_registration_completed != null
							? formatNumber(
									item.meta_conversion
										.cost_per_registration_completed
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaSubscriptions":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.subscriptions != null
							? formatNumber(item.meta_conversion.subscriptions)
							: "-"}
					</div>
				</div>
			);
		case "metaSubscriptionValue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.subscription_value != null
							? formatNumber(
									item.meta_conversion.subscription_value
							  )
							: "-"}
					</div>
				</div>
			);
		case "metaCostPerSubscription":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.meta_conversion?.cost_per_subscription != null
							? formatNumber(
									item.meta_conversion.cost_per_subscription
							  )
							: "-"}
					</div>
				</div>
			);
		// --- Meta --- //

		// --- Google --- //
		case "googleImpressions":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.impressions != null
							? formatNumber(item.google_reported.impressions)
							: "-"}
					</div>
				</div>
			);
		case "googleCpm":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.cpm != null
							? formatCurrency(item.google_reported.cpm)
							: "-"}
					</div>
				</div>
			);
		case "googleClicks":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.clicks != null
							? formatNumber(item.google_reported.clicks)
							: "-"}
					</div>
				</div>
			);
		case "googleCtr":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.ctr != null
							? formatPercentage(item.google_reported.ctr)
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerClick":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.cost_per_click != null
							? formatCurrency(
									item.google_reported.cost_per_click
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleVideoViews":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.video_views != null
							? formatNumber(item.google_reported.video_views)
							: "-"}
					</div>
				</div>
			);
		case "google25PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.count_of_25p_watched_video !=
						null
							? formatNumber(
									item.google_reported
										.count_of_25p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "google25PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.n25p_video_watch_rate != null
							? formatPercentage(
									item.google_reported.n25p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "google50PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.count_of_50p_watched_video !=
						null
							? formatNumber(
									item.google_reported
										.count_of_50p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "google50PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.n50p_video_watch_rate != null
							? formatPercentage(
									item.google_reported.n50p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "google75PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.count_of_75p_watched_video !=
						null
							? formatNumber(
									item.google_reported
										.count_of_75p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "google75PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.n75p_video_watch_rate != null
							? formatPercentage(
									item.google_reported.n75p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "google100PercentWatchedVideo":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.count_of_100p_watched_video !=
						null
							? formatNumber(
									item.google_reported
										.count_of_100p_watched_video
							  )
							: "-"}
					</div>
				</div>
			);
		case "google100PercentVideoWatchRate":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_reported?.n100p_video_watch_rate != null
							? formatPercentage(
									item.google_reported.n100p_video_watch_rate
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleConversions":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.conversions != null
							? formatNumber(item.google_conversion.conversions)
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerConversion":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_conversion != null
							? formatCurrency(
									item.google_conversion.cost_per_conversion
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleSubmitLeadForm":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.submit_lead_form != null
							? formatNumber(
									item.google_conversion.submit_lead_form
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerSubmitLeadForm":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_submit_lead_form !=
						null
							? formatCurrency(
									item.google_conversion
										.cost_per_submit_lead_form
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleBookAppointment":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.book_appointment != null
							? formatNumber(
									item.google_conversion.book_appointment
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerBookedAppointment":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_booked_appointment !=
						null
							? formatCurrency(
									item.google_conversion
										.cost_per_booked_appointment
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleContact":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.contact != null
							? formatNumber(item.google_conversion.contact)
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerContact":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_contact != null
							? formatCurrency(
									item.google_conversion.cost_per_contact
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleAddToCart":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.add_to_cart != null
							? formatNumber(item.google_conversion.add_to_cart)
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerAddToCart":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_add_to_cart != null
							? formatCurrency(
									item.google_conversion.cost_per_add_to_cart
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleBeginCheckout":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.begin_checkout != null
							? formatNumber(
									item.google_conversion.begin_checkout
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerBeginCheckout":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_begin_checkout !=
						null
							? formatCurrency(
									item.google_conversion
										.cost_per_begin_checkout
							  )
							: "-"}
					</div>
				</div>
			);
		case "googleRevenue":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.revenue != null
							? formatCurrency(item.google_conversion.revenue)
							: "-"}
					</div>
				</div>
			);
		case "googleRoas":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.roas != null
							? item.google_conversion.roas.toFixed(2)
							: "-"}
					</div>
				</div>
			);
		case "googlePurchase":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.purchase != null
							? formatNumber(item.google_conversion.purchase)
							: "-"}
					</div>
				</div>
			);
		case "googleCostPerPurchase":
			return (
				<div className="space-y-2">
					<div className="text-gray-900 text-xs">
						{item?.google_conversion?.cost_per_purchase != null
							? formatCurrency(
									item.google_conversion.cost_per_purchase
							  )
							: "-"}
					</div>
				</div>
			);
		// --- Google --- //
		default:
			return <div className="text-gray-400 text-sm">—</div>;
	}
};
