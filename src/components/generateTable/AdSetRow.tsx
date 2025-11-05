import AdRow from "./AdRow";

type AdSetRowProps = {
	adset: any;
	adSetId: string;
	campaign: any;
	campaignId: string;
	tableData: any;
	metricsResult: any[];
	openAdSets: { [key: string]: boolean };
	onToggleAdSet: (adSetId: string) => void;
};

const AdSetRow = ({
	adset,
	adSetId,
	campaign,
	campaignId,
	tableData,
	metricsResult,
	openAdSets,
	onToggleAdSet,
}: AdSetRowProps) => {
	const displayedAds = (adset.ads || []).filter((ad: any, adIdx: number) => {
		let totalClicks = 0;
		tableData.timeFrames.forEach((tfInner: string) => {
			const metricInner = metricsResult.find((d: any) => d.label === tfInner);
			if (!metricInner) return;
			const campaignInner = metricInner.value[0].find(
				(c: any) => (c.campaign_id?.String || c.campaign_id) === campaignId
			);
			const adsetInner = campaignInner?.adsets?.find(
				(a: any) => a.adset_id === adSetId
			);
			const adForTimeFrame = adsetInner?.ads?.[adIdx];
			if (typeof adForTimeFrame?.insight?.clicks === "number") {
				totalClicks += adForTimeFrame.insight.clicks;
			}
		});
		return totalClicks > 0;
	});

	return (
		<>
			<tr className="bg-blue-100">
				{tableData.staticFields.map((field: string) => (
					<td
						key={field}
						className="border border-gray-200 px-3 py-2 text-center cursor-pointer"
						style={{
							position: field === "Campaign Name" ? "sticky" : undefined,
							left: field === "Campaign Name" ? 0 : undefined,
							background: "#f9fafb",
							zIndex: field === "Campaign Name" ? 1 : undefined,
						}}
						onClick={
							field === "Campaign Name"
								? () => onToggleAdSet(adSetId)
								: undefined
						}
					>
						{field === "Campaign Name" ? (
							<span className="flex flex-col items-center justify-center">
								<span className="flex items-center">
									{adset.adset_name || adSetId}
								</span>
								<span className="text-xs text-gray-400">{adSetId}</span>
							</span>
						) : (
							""
						)}
					</td>
				))}
				{tableData.timeFrames.map((tf: string) => {
					const currentMetric = metricsResult.find((d: any) => d.label === tf);
					if (!currentMetric) {
						// Render all event/metric cells as 0 if no metric data for this timeframe
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
					const campaignData = currentMetric.value[0].find(
						(c: any) => (c.campaign_id?.String || c.campaign_id) === campaignId
					);
					const adsetData = campaignData?.adsets?.find(
						(a: any) => a.adset_id === adSetId
					);
					if (!adsetData) {
						// Render all event/metric cells as 0 if no adset data for this timeframe
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
							const getSum = (field: string) =>
								displayedAds.reduce((sum: number, ad: any, adIdx: number) => {
									const adForTimeFrame = adsetData?.ads?.[adIdx];
									return (
										sum +
										(typeof adForTimeFrame?.insight?.[field] === "number"
											? adForTimeFrame.insight[field]
											: 0)
									);
								}, 0);
							if (metric === "Meta - Clicks") {
								value = getSum("clicks");
							} else if (metric === "Meta - Impressions") {
								value = getSum("impressions");
							} else if (metric === "Meta - CTR") {
								const clicks = getSum("clicks");
								const impressions = getSum("impressions");
								value =
									impressions > 0
										? ((clicks / impressions) * 100).toFixed(2) + "%"
										: "0.00%";
							} else if (metric === "Meta - Cost Per Click") {
								const clicks = getSum("clicks");
								const spend = getSum("spend");
								value = clicks > 0 ? (spend / clicks).toFixed(2) : 0;
							} else if (metric === "# of Link Clicks") {
								value = getSum("link_click");
							} else if (metric === "Meta - Link CTR") {
								const linkClicks = getSum("link_click");
								const impressions = getSum("impressions");
								value =
									impressions > 0
										? ((linkClicks / impressions) * 100).toFixed(2) + "%"
										: "0.00%";
							} else if (metric === "Meta - Cost Per Link Click") {
								const linkClicks = getSum("link_click");
								const spend = getSum("spend");
								value = linkClicks > 0 ? (spend / linkClicks).toFixed(2) : 0;
							} else if (metric === "Meta - CPM") {
								const impressions = getSum("impressions");
								const spend = getSum("spend");
								value =
									impressions > 0
										? ((spend / impressions) * 1000).toFixed(2)
										: 0;
							} else if (metric === "Meta - Reach") {
								value = getSum("reach");
							} else if (metric === "Meta - Video Watch %") {
								value = getSum("video_avg_time_watched_actions");
							} else if (metric === "Meta - Cost Per Thruplay") {
								const sumThruplay = getSum("cost_per_thruplay");
								const adCount = displayedAds.length;
								value = adCount > 0 ? (sumThruplay / adCount).toFixed(2) : 0;
							}
							if (value === "" || value === undefined) value = 0;
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
			{openAdSets[adSetId] &&
				Array.isArray(adset.ads) &&
				displayedAds.map((ad: any, adIdx: number) => (
					<AdRow
						key={`${ad.ad_id || ""}_${adIdx}`}
						ad={ad}
						adIdx={adIdx}
						adset={adset}
						adSetId={adSetId}
						campaignId={campaignId}
						tableData={tableData}
						metricsResult={metricsResult}
					/>
				))}
		</>
	);
};

export default AdSetRow;
