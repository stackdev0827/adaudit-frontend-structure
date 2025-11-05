export function getAllCampaigns(metricsResult: any[]) {
	const campaignMap: Record<string, any> = {};
	metricsResult.forEach((result: any) => {
		if (!result.value || !Array.isArray(result.value[0])) return;
		result.value[0].forEach((campaign: any) => {
			const campaignId = campaign.campaign_id?.String || campaign.campaign_id;
			if (!campaignMap[campaignId]) {
				campaignMap[campaignId] = { ...campaign, adsets: [], adsetsMap: {} };
			}
			const campaignObj = campaignMap[campaignId];
			if (Array.isArray(campaign.adsets)) {
				campaign.adsets.forEach((adset: any) => {
					const adSetId = adset.adset_id;
					if (!campaignObj.adsetsMap[adSetId]) {
						campaignObj.adsetsMap[adSetId] = { ...adset, ads: [] };
						campaignObj.adsets.push(campaignObj.adsetsMap[adSetId]);
					}
					const adsetObj = campaignObj.adsetsMap[adSetId];
					if (Array.isArray(adset.ads)) {
						adsetObj.ads = adsetObj.ads.concat(adset.ads);
					}
				});
			}
		});
	});
	return Object.values(campaignMap).map((c: any) => ({
		...c,
		adsets: c.adsets.map((a: any) => ({
			...a,
			ads: a.ads,
		})),
	}));
}

export function getAllGoogleCampaigns(metricsResult: any[]) {
	const campaignMap: Record<string, any> = {};
	metricsResult.forEach((result: any) => {
		if (!result.google || !Array.isArray(result.google[0])) return;
		result.google[0].forEach((campaign: any) => {
			const campaignId = campaign.campaign_id?.String || campaign.campaign_id;
			if (!campaignMap[campaignId]) {
				campaignMap[campaignId] = {
					...campaign,
					adgroups: [],
					adgroupsMap: {},
				};
			}
			const campaignObj = campaignMap[campaignId];
			if (Array.isArray(campaign.adgroups)) {
				campaign.adgroups.forEach((adgroup: any) => {
					const adGroupId = adgroup.adgroup_id;
					if (!campaignObj.adgroupsMap[adGroupId]) {
						campaignObj.adgroupsMap[adGroupId] = { ...adgroup, ads: [] };
						campaignObj.adgroups.push(campaignObj.adgroupsMap[adGroupId]);
					}
					const adgroupObj = campaignObj.adgroupsMap[adGroupId];
					if (Array.isArray(adgroup.ads)) {
						adgroupObj.ads = adgroupObj.ads.concat(adgroup.ads);
					}
				});
			}
		});
	});
	return Object.values(campaignMap).map((c: any) => ({
		...c,
		adgroups: c.adgroups.map((a: any) => ({
			...a,
			ads: a.ads,
		})),
	}));
}
