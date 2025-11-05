type GoogleAdRowProps = {
	ad: any;
	adIdx: number;
	adset: any;
	adSetId: string;
	campaignId: string;
	tableData: any;
	metricsResult: any[];
};

const GoogleAdRow = ({
	ad,
	adIdx,
	adset,
	adSetId,
	campaignId,
	tableData,
	metricsResult,
}: GoogleAdRowProps) => (
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
			if (!currentMetric) {
				return tableData.events.map((event: any) =>
					event.metrics.map((metric: string) => (
						<td
							key={tf + event.name + metric}
							className="border border-gray-200 px-3 py-2 text-center"
						>
							0
						</td>
					))
				);
			}
			const campaignData = currentMetric.google[0].find(
				(c: any) => (c.campaign_id?.String || c.campaign_id) === campaignId
			);
			const adsetData = campaignData?.adsets?.find(
				(a: any) => a.adset_id === adSetId
			);
			const adForTimeFrame = adsetData?.ads?.[adIdx];
			if (!adForTimeFrame) {
				return tableData.events.map((event: any) =>
					event.metrics.map((metric: string) => (
						<td
							key={tf + event.name + metric}
							className="border border-gray-200 px-3 py-2 text-center"
						>
							0
						</td>
					))
				);
			}
			return tableData.events.map((event: any) =>
				event.metrics.map((metric: string) => {
					let value: string | number = 0;
					if (metric === "Google - Clicks") {
						value = adForTimeFrame?.insight?.clicks ?? 0;
					} else if (metric === "Google - Impressions") {
						value = adForTimeFrame?.insight?.impressions ?? 0;
					} else if (metric === "Google - CTR") {
						const clicks = adForTimeFrame?.insight?.clicks ?? 0;
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						value =
							impressions > 0
								? ((clicks / impressions) * 100).toFixed(2) + "%"
								: "0.00%";
					} else if (metric === "Google - Cost Per Click") {
						value = adForTimeFrame?.insight?.average_cpc ?? 0;
					} else if (metric === "# of Link Clicks") {
						value = adForTimeFrame?.insight?.link_click ?? 0;
					} else if (metric === "Meta - Link CTR") {
						const linkClicks = adForTimeFrame?.insight?.link_click ?? 0;
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						value =
							impressions > 0
								? ((linkClicks / impressions) * 100).toFixed(2) + "%"
								: "0.00%";
					} else if (metric === "Meta - Cost Per Link Click") {
						const linkClicks = adForTimeFrame?.insight?.link_click ?? 0;
						const spend = adForTimeFrame?.insight?.spend ?? 0;
						value = linkClicks > 0 ? Number((spend / linkClicks).toFixed(2)) : 0;
					} else if (metric === "Meta - CPM") {
						const impressions = adForTimeFrame?.insight?.impressions ?? 0;
						const spend = adForTimeFrame?.insight?.spend ?? 0;
						value =
							impressions > 0 ? Number(((spend / impressions) * 1000).toFixed(2)) : 0;
					} else if (metric === "Meta - Reach") {
						value = adForTimeFrame?.insight?.reach ?? 0;
					} else if (metric === "Meta - Video Watch %") {
						value = adForTimeFrame?.insight?.video_avg_time_watched_actions ?? 0;
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

export default GoogleAdRow;
