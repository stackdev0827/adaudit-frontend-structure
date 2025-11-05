import React from "react";
import { AdMetricsData, TimeframeMetrics } from "../../types/metrics";

interface MetricsAdRowProps {
  ad: AdMetricsData;
  staticFields: string[];
  timeframes: string[];
  eventMetrics: string[];
}

const MetricsAdRow: React.FC<MetricsAdRowProps> = ({
  ad,
  staticFields,
  timeframes,
  eventMetrics,
}) => {
  // Helper function to get static field value for ad
  const getStaticFieldValue = (field: string): string | number => {
    switch (field) {
      case "Campaign":
        return ad.ad_name;
      case "totalSpend":
        return ad.static_metrics?.total_spend?.toFixed(2) || "-";
      case "Budget":
        return ad.static_metrics?.budget?.toFixed(2) || "-";
      case "Creatives":
        return ad.static_metrics?.creatives || "-";
      case "Notes":
        return ad.static_metrics?.notes || "-";
      case "dateLaunched":
        return ad.static_metrics?.launch_date 
          ? new Date(ad.static_metrics.launch_date).toLocaleDateString()
          : "-";
      case "Audience":
        return ad.static_metrics?.audience?.toLocaleString() || "-";
      case "Days":
        return ad.static_metrics?.days_live || "-";
      default:
        return "";
    }
  };

  // Helper function to get timeframe data
  const getTimeframeData = (timeframeName: string): TimeframeMetrics | null => {
    const timeframeMap: { [key: string]: keyof typeof ad.timeframes } = {
      "Yesterday": "yesterday",
      "2 Days Ago": "last_2_days",
      "Last 4 Days": "last_4_days", 
      "Last 7 Days": "last_7_days",
      "Last 14 Days": "last_14_days",
      "Last 30 Days": "last_30_days",
      "Total": "total"
    };
    
    const key = timeframeMap[timeframeName];
    return key ? ad.timeframes[key] : null;
  };

  // Helper function to get metric value from timeframe data
  const getMetricValue = (timeframeData: TimeframeMetrics | null, metric: string): string => {
    if (!timeframeData) return "-";

    switch (metric) {
      case "Sales":
        return timeframeData.sales.count_of_sales.toString();
      case "Rev":
        return timeframeData.sales.revenue.toFixed(2);
      case "Cash":
        return timeframeData.sales.cash_collected.toFixed(2);
      case "ROAS Rev":
        return timeframeData.sales.roas.toFixed(2);
      case "ROAS Cash":
        return timeframeData.sales.roas_cash.toFixed(2);
      case "newLeads":
        return timeframeData.lead_form_submissions.new.toString();
      case "totalLeads":
        return timeframeData.lead_form_submissions.total.toString();
      case "totalApplications":
        return timeframeData.applications.total.toString();
      case "Q Apps":
        return timeframeData.applications.qualified.toString();
      case "unqualifiedApplications":
        return timeframeData.applications.unqualified.toString();
      case "totalCalls":
        return timeframeData.booked_calls.total.toString();
      case "qualifiedCalls":
        return timeframeData.booked_calls.qualified.toString();
      case "unqualifiedCalls":
        return timeframeData.booked_calls.unqualified.toString();
      case "confirmedCalls":
        return timeframeData.booked_calls.confirmed.toString();
      case "callsShowed":
        return timeframeData.booked_calls.showed.toString();
      case "liveCalls":
        return timeframeData.booked_calls.live.toString();
      // Note: The API doesn't seem to have separate sales rep vs setter data
      // Using the same booked_calls data for now
      case "totalCallsWithSalesRep":
      case "totalCallsWithSetter":
        return timeframeData.booked_calls.total.toString();
      case "qualifiedCallsWithSalesRep":
      case "qualifiedCallsWithSetter":
        return timeframeData.booked_calls.qualified.toString();
      case "unqualifiedCallsWithSalesRep":
      case "unqualifiedCallsWithSetter":
        return timeframeData.booked_calls.unqualified.toString();
      case "confirmedCallsWithSalesRep":
      case "confirmedCallsWithSetter":
        return timeframeData.booked_calls.confirmed.toString();
      case "callsShowedWithSalesRep":
      case "callsShowedWithSetter":
        return timeframeData.booked_calls.showed.toString();
      case "liveCallsWithSalesRep":
      case "liveCallsWithSetter":
        return timeframeData.booked_calls.live.toString();
      case "totalSets":
        return timeframeData.sets.total.toString();
      case "outboundSets":
        return timeframeData.sets.outbound.toString();
      case "inboundSets":
        return timeframeData.sets.inbound.toString();
      case "setsNewOpportunity":
        return timeframeData.sets.new_opportunity.toString();
      case "qualifiedSalesRepOpportunity":
        return timeframeData.sets.live.toString();
      case "totalQualifiedOpportunity":
        return timeframeData.qualified_opportunities.total.toString();
      case "newQualifiedOpportunity":
        return timeframeData.qualified_opportunities.new.toString();
      case "totalOffersMade":
        return timeframeData.offers.total.toString();
      case "totalAddToCart":
        return timeframeData.add_to_carts.total.toString();
      case "totalCustomEvents":
        return "-"; // Not available in API
      case "clicks":
        return timeframeData.ad_metrics.meta.link_clicks.toString();
      case "ctr":
        return timeframeData.ad_metrics.meta.ctr.toFixed(2);
      case "costPerClick":
        return timeframeData.ad_metrics.meta.cpc.toFixed(2);
      case "linkClicks":
        return timeframeData.ad_metrics.meta.link_clicks.toString();
      case "linkCtr":
        return timeframeData.ad_metrics.meta.ctr.toFixed(2);
      case "costPerLinkClick":
        return timeframeData.ad_metrics.meta.cplc.toFixed(2);
      case "impressions":
        return timeframeData.ad_metrics.meta.impressions.toString();
      case "cpm":
        return timeframeData.ad_metrics.meta.cpm.toFixed(2);
      case "reach":
        return timeframeData.ad_metrics.meta.reach.toString();
      case "videoWatchPercent":
        return timeframeData.ad_metrics.meta.video_watch.toString();
      case "thumbScrollStopRate":
        return "-"; // Not available in API
      case "clickQuality":
        return timeframeData.ad_metrics.meta.click_quality.toFixed(1);
      case "googleClicks":
        return timeframeData.ad_metrics.google.clicks.toString();
      case "googleCtr":
        return timeframeData.ad_metrics.google.ctr.toFixed(2);
      case "googleCostPerClick":
        return timeframeData.ad_metrics.google.cpc.toFixed(2);
      case "googleImpressions":
        return timeframeData.ad_metrics.google.impressions.toString();
      case "googleReach":
        return timeframeData.ad_metrics.google.reach.toString();
      case "googleVideoWatchPercent":
        return timeframeData.ad_metrics.google.video_watch.toString();
      default:
        return "-";
    }
  };

  return (
    <tr className="bg-green-50">
      {/* Static Fields */}
      {staticFields.map((field) => (
        <td
          key={field}
          className="border border-gray-200 px-3 py-2 text-center"
          style={{
            position: field === "Campaign" ? "sticky" : undefined,
            left: field === "Campaign" ? 0 : undefined,
            background: field === "Campaign" ? "#f0fdf4" : undefined,
            zIndex: field === "Campaign" ? 1 : undefined,
          }}
        >
          {field === "Campaign" ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-green-800">
                🎯 {getStaticFieldValue(field)}
              </span>
              <span className="text-xs text-gray-500">{ad.ad_id}</span>
            </div>
          ) : (
            getStaticFieldValue(field)
          )}
        </td>
      ))}
      
      {/* Timeframe Metrics */}
      {timeframes.map((timeframe) => {
        const timeframeData = getTimeframeData(timeframe);
        return eventMetrics.map((metric) => (
          <td
            key={`${timeframe}-${metric}`}
            className="border border-gray-200 px-2 py-2 text-center text-xs"
          >
            {getMetricValue(timeframeData, metric)}
          </td>
        ));
      })}
    </tr>
  );
};

export default MetricsAdRow;
