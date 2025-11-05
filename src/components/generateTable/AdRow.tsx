type AdRowProps = {
	ad: any;
	adIdx: number;
	adset: any;
	adSetId: string;
	campaignId: string;
	tableData: any;
	metricsResult: any[];
};

const AdRow = ({
	ad,
	adIdx,
	adset,
	adSetId,
	campaignId,
	tableData,
	metricsResult,
}: AdRowProps) => (
	<tr key={`${ad.ad_id || ""}_${adIdx}`}>
		{tableData.staticFields.map((field: string) => (
			<td
				key={field}
				className="border border-gray-200 px-3 py-2 text-center"
				style={{
					position: field === "Campaign Name" ? "sticky" : undefined,
					left: field === "Campaign Name" ? 0 : undefined,
					background: "#f9fafb",
					zIndex: field === "Campaign Name" ? 1 : undefined,
				}}
			>
				{field === "Campaign Name" ? (
					<span className="flex flex-col items-center justify-center">
						<span>{ad.ad_name}</span>
						<span className="text-xs text-gray-400">{ad.ad_id}</span>
					</span>
				) : field === "Ad Set Name" ? (
					<span className="flex flex-col items-center justify-center">
						<span>{adset.adset_name || adSetId}</span>
						<span className="text-xs text-gray-400">{ad.adset_id}</span>
					</span>
				) : field === "Ad Name" ? (
					<span className="flex flex-col items-center justify-center">
						<span>{ad.ad_name || ad.ad_id}</span>
						<span className="text-xs text-gray-400">{ad.ad_id}</span>
					</span>
				) : (
					""
				)}
			</td>
		))}
		{tableData.timeFrames.map((tf: string) => {
			const currentMetric = metricsResult.find((d: any) => d.label === tf);
			const campaignData = currentMetric.value[0].find(
				(c: any) => (c.campaign_id?.String || c.campaign_id) === campaignId
			);
			const adsetData = campaignData?.adsets?.find(
				(a: any) => a.adset_id === adSetId
			);
			const adForTimeFrame = adsetData?.ads?.[adIdx];
			return tableData.events.map((event: any) =>
				event.metrics.map((metric: string) => {
					let value = "";
					if (metric === "Meta - Clicks") {
						value = adForTimeFrame?.insight?.clicks ?? "";
					} else if (metric === "Meta - Impressions") {
						value = adForTimeFrame?.insight?.impressions ?? "";
					} else if (metric === "Meta - CTR") {
						const clicks = adForTimeFrame?.insight?.clicks ?? 0;
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						value =
							impressions > 0
								? ((clicks / impressions) * 100).toFixed(2) + "%"
								: "";
					} else if (metric === "Meta - Cost Per Click") {
						const clicks = adForTimeFrame?.insight?.clicks ?? 0;
						const spend = adForTimeFrame?.insight?.spend ?? 0;
						value = clicks > 0 ? (spend / clicks).toFixed(2) : "";
					} else if (metric === "# of Link Clicks") {
						value = adForTimeFrame?.insight?.link_click ?? "";
					} else if (metric === "Meta - Link CTR") {
						const linkClicks = adForTimeFrame?.insight?.link_click ?? 0;
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						value =
							impressions > 0
								? ((linkClicks / impressions) * 100).toFixed(2) + "%"
								: "";
					} else if (metric === "Meta - Cost Per Link Click") {
						const linkClicks = adForTimeFrame?.insight?.link_click ?? 0;
						const spend = adForTimeFrame?.insight?.spend ?? 0;
						value = linkClicks > 0 ? (spend / linkClicks).toFixed(2) : "";
					} else if (metric === "Meta - CPM") {
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						const spend = adForTimeFrame?.insight?.spend ?? 0;
						value =
							impressions > 0 ? ((spend / impressions) * 1000).toFixed(2) : "";
					} else if (metric === "Meta - Reach") {
						value = adForTimeFrame?.insight?.reach ?? "";
					} else if (metric === "Meta - Video Watch %") {
						value =
							adForTimeFrame?.insight?.video_avg_time_watched_actions ?? "";
					} else if (metric === "Meta - Cost Per Thruplay") {
						value = adForTimeFrame?.insight?.cost_per_thruplay ?? "";
					}

					return (
						<td
							key={tf + event.name + metric}
							className="border border-gray-200 px-3 py-2 text-center"
						>
							{value}
						</td>
					);
				})
			);
		})}
	</tr>
);

export default AdRow;
