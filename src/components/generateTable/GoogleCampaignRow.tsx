import GoogleAdSetRow from "./GoogleAdSetRow";

interface GoogleCampaignRowProps {
	campaign: any;
	tableData: any;
	metricsResult: any[];
	openCampaigns: { [key: string]: boolean };
	openAdSets: { [key: string]: boolean };
	onToggleCampaign: (campaignId: string) => void;
	onToggleAdSet: (adSetId: string) => void;
}

const GoogleCampaignRow: React.FC<GoogleCampaignRowProps> = ({
	campaign,
	tableData,
	metricsResult,
	openCampaigns,
	openAdSets,
	onToggleCampaign,
	onToggleAdSet,
}) => {
	const campaignId = campaign.campaign_id?.String || campaign.campaign_id;

	return (
		<>
			<tr className="bg-blue-50 font-bold">
				{tableData.staticFields.map((field: string) => (
					<td
						key={field}
						className="border border-gray-200 px-3 py-2 text-center cursor-pointer"
						style={{
							position: field === "Campaign Name" ? "sticky" : undefined,
							left: field === "Campaign Name" ? 0 : undefined,
							background: "#f9fafb",
							zIndex: field === "Campaign Name" ? 1 : undefined,
							fontWeight: field === "Campaign Name" ? "bold" : undefined,
						}}
						onClick={
							field === "Campaign Name"
								? () => onToggleCampaign(campaignId)
								: undefined
						}
					>
						{field === "Campaign Name" ? (
							<span className="flex flex-col items-center justify-center">
								<span className="flex items-center">
									{campaign.campaign_name || campaignId}
								</span>
								<span className="text-xs text-gray-400">{campaignId}</span>
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
									className="border border-gray-200 px-3 py-2 bg-white text-center"
								>
									0
								</td>
							))
						);
					}
					const campaignData = currentMetric.google[0].find(
						(c: any) => (c.campaign_id?.String || c.campaign_id) === campaignId
					);
					if (!campaignData) {
						// Render all event/metric cells as 0 if no campaign data for this timeframe
						return tableData.events.map((event: any) =>
							event.metrics.map((metric: string) => (
								<td
									key={tf + event.name + metric}
									className="border border-gray-200 px-3 py-2 bg-white text-center"
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
								campaignData?.adsets
									? campaignData.adsets.reduce(
											(sum: number, adset: any) =>
												sum +
												(adset.ads
													? adset.ads.reduce(
															(adSum: number, ad: any) =>
																typeof ad.insight?.[field] === "number"
																	? adSum + ad.insight[field]
																	: adSum,
															0
													  )
													: 0),
											0
									  )
									: 0;
							if (metric === "Google - Clicks") {
								value = getSum("clicks");
							} else if (metric === "Google - Impressions") {
								value = getSum("impressions");
							} else if (metric === "Google - CTR") {
								const clicks = getSum("clicks");
								const impressions = getSum("impressions");
								value =
									impressions > 0
										? ((clicks / impressions) * 100).toFixed(2) + "%"
										: "0.00%";
							} else if (metric === "Google - Cost Per Click") {
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
								value = getSum("average_cpc");
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
							}
							if (value === "" || value === undefined) value = 0;
							return (
								<td
									key={tf + event.name + metric}
									className="border border-gray-200 px-3 py-2 bg-white text-center"
								>
									{value}
								</td>
							);
						})
					);
				})}
			</tr>
			{openCampaigns[campaignId] &&
				Array.isArray(campaign.adsets) &&
				campaign.adsets.map((adset: any) => (
					<GoogleAdSetRow
						key={adset.adset_id}
						adset={adset}
						adSetId={adset.adset_id}
						campaign={campaign}
						campaignId={campaignId}
						tableData={tableData}
						metricsResult={metricsResult}
						openAdSets={openAdSets}
						onToggleAdSet={onToggleAdSet}
					/>
				))}
		</>
	);
};

export default GoogleCampaignRow;
