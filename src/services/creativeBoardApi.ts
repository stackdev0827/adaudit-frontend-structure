// services/creativeBoardApi.ts
import axiosInstance from "./axios";
import { CREATIVE_BOARD_API } from "../constants/api";


// ---------- CREATIVE BOARD -------

// Helper (top of file or near API)
const csv = (v?: string[] | readonly string[]) =>
	Array.isArray(v) && v.length ? v.join(',') : undefined;
  
  type NumStr = number | string;
  
  export interface CampaignQuery {
	client_id: NumStr;
	page?: number;
	limit?: number;
	search_term?: string;
	status_filter?: string[];       // ['Active','Paused',...]
	platforms?: string[];           // ['Meta','Google Ads']
	meta_account_ids?: string[];    // ['act_123','act_456']
	google_account_ids?: string[];  // ['123-456-7890', ...]
  }

  export interface HeadlinesQuery {
    client_id: NumStr;
    page?: number;
    limit?: number;
    asset_type_filter?: string[];
    meta_account_ids?: string[];
    google_account_ids?: string[];
    group_text?: number; // 1 to enable grouping (originals only)
  }

  export interface HeadlineVariantsQuery {
    client_id: NumStr;
    internal_asset_id: string;
    platform: string;
  }

  export interface TextGroupsQuery {
    client_id: NumStr;
    platform: string;
    exclude_id: string;
  }

  export interface PromoteTextVariantPayload {
    client_id: NumStr;
    platform: string;
    asset_id: string;
    variant_id: string | null;
  }

  export interface SetTextAsVariantPayload {
    client_id: NumStr;
    platform: string;
    asset_id: string;
    target_internal_asset_id: string;
  }

  export interface MoveTextVariantPayload {
    client_id: NumStr;
    platform: string;
    asset_id: string;
    variant_id: string | null;
    target_internal_asset_id: string;
  }

// services/api.ts (near other types/helpers)

export interface MediaListQuery {
  client_id: NumStr;
  page?: number;
  limit?: number;
  media_type_filter?: string[];
  meta_account_ids?: string[];
  google_account_ids?: string[];
  group_media?: number; // 1 to group originals-only
}

export interface MediaVariantsQuery {
  client_id: NumStr;
  internal_asset_id: string;
  platform: string; // 'facebook' | 'google'
}

export interface CampaignScopedPayload {
  client_id: NumStr;
  campaign_id: NumStr;
  platform: 'meta' | 'google';     // you normalize this in the UI
  ads_account_id: string;          // the connected ads account id
}

export interface CampaignMetricsPayload extends CampaignScopedPayload {
  metrics: string[];               // which metrics to aggregate
}

export interface CampaignScope {
	client_id: number | string;
	campaign_id: number | string;
	platform: 'meta' | 'google';
	ads_account_id: string;
  }

  export const creativeBoardApi = {
	getConnectedAccounts: (clientId: number | string) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CONNECTED_ACCOUNTS, { client_id: clientId });
	},
	// Accepts a number flag and forwards it as a query param
	getHeadlinesTypes: (type: number) => {
		return axiosInstance.get(CREATIVE_BOARD_API.HEADLINES_TYPES, {
		params: { get_types: type },
		});
	},

	getCampaigns: (q: CampaignQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.CAMPAIGNS, {
		params: {
			client_id: q.client_id,
			page: q.page ?? 1,
			limit: q.limit ?? 50,
			search_term: q.search_term,
			status_filter: csv(q.status_filter),
			platforms: csv(q.platforms),
			meta_account_ids: csv(q.meta_account_ids),
			google_account_ids: csv(q.google_account_ids),
		},
		});
	},

	getMediaTypes: (type: number) => {
		return axiosInstance.get(CREATIVE_BOARD_API.MEDIA_TYPES, {
		  params: { get_types: type }, // 1 = return only types
		});
	  },

	getHeadlines: (q: HeadlinesQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.HEADLINES, {
		params: {
			client_id: q.client_id,
			page: q.page ?? 1,
			limit: q.limit ?? 50,
			asset_type_filter: csv(q.asset_type_filter),
			meta_account_ids: csv(q.meta_account_ids),
			google_account_ids: csv(q.google_account_ids),
			group_text: q.group_text,
		},
		});
	},

	getHeadlineVariants: (q: HeadlineVariantsQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.HEADLINE_VARIANTS, {
		params: {
			client_id: String(q.client_id),        
			internal_asset_id: q.internal_asset_id,
			platform: platformForApi(q.platform),    
		},
		});
	},

	getTextGroups: (q: TextGroupsQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.TEXT_GROUPS, {
		params: {
			client_id: String(q.client_id),
			platform: platformForApi(q.platform),
			exclude_id: q.exclude_id,               // optional is fine if undefined
		},
		});
	},
	
	promoteTextVariant: (p: PromoteTextVariantPayload) => {
		return axiosInstance.post(
		CREATIVE_BOARD_API.PROMOTE_TEXT_VARIANT,
		{
			client_id: String(p.client_id),
			platform: platformForApi(p.platform),
			asset_id: p.asset_id,
			variant_id: p.variant_id,               
		},
		{ headers: { 'Content-Type': 'application/json' } }
		);
	},

	setTextAsVariant: (p: SetTextAsVariantPayload) => {
		return axiosInstance.post(
		  CREATIVE_BOARD_API.SET_TEXT_AS_VARIANT,
		  {
			client_id: String(p.client_id),                 
			platform: platformForApi(p.platform),          
			asset_id: p.asset_id,
			target_internal_asset_id: p.target_internal_asset_id,
		  },
		  { headers: { 'Content-Type': 'application/json' } }
		);
	  },

	  moveTextVariant: (p: MoveTextVariantPayload) => {
		return axiosInstance.post(
		  CREATIVE_BOARD_API.MOVE_TEXT_VARIANT,
		  {
			client_id: String(p.client_id),                
			platform: platformForApi(p.platform),        
			asset_id: p.asset_id,
			variant_id: p.variant_id,                      
			target_internal_asset_id: p.target_internal_asset_id,
		  },
		  { headers: { 'Content-Type': 'application/json' } }
		);
	  },
  
	  getMediaList: (q: MediaListQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.MEDIA, {
		  params: {
			client_id: String(q.client_id),
			page: q.page ?? 1,
			limit: q.limit ?? 10,
			media_type_filter: csv(q.media_type_filter),
			meta_account_ids: csv(q.meta_account_ids),
			google_account_ids: csv(q.google_account_ids),
			group_media: q.group_media, // 1 or undefined
		  },
		});
	  },
	  
	  getMediaVariants: (q: MediaVariantsQuery) => {
		return axiosInstance.get(CREATIVE_BOARD_API.MEDIA_VARIANTS, {
		  params: {
			client_id: String(q.client_id),
			internal_asset_id: q.internal_asset_id,
			platform: q.platform, // keep 'facebook'/'google' unless your backend wants different slugs
		  },
		});
	  },

	  getCampaign: (p: CampaignScopedPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN, p);
	  },
	
	  getAdGroups: (p: CampaignScopedPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.ADGROUPS, p);
	  },
	
	  getAds: (p: CampaignScopedPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.ADS, p);
	  },
	
	  getCreatives: (p: CampaignScopedPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CREATIVES, p);
	  },
	
	  getCampaignMetricsMeta: (p: CampaignMetricsPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_METRICS_META, p);
	  },
	
	  getCampaignMetricsGoogle: (p: CampaignMetricsPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_METRICS_GOOGLE, p);
	  },
	
	  getCampaignConversions: (p: CampaignScopedPayload) => {
		return axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_CONVERSIONS, p);
	  },

	  getCampaignPlacementMetrics: (p: CampaignScope) =>
		axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_PLACEMENT_METRICS, p),
	
	  getCampaignCountryMetrics: (p: CampaignScope) =>
		axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_COUNTRY_METRICS, p),
	
	  getCampaignAgeGenderMetrics: (p: CampaignScope) =>
		axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_AGE_GENDER_METRICS, p),
	
	  getCampaignPageMetrics: (p: CampaignScope) =>
		axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_PAGE_METRICS, p),
	
	  getCampaignAdAuditConversions: (p: CampaignScope) =>
		axiosInstance.post(CREATIVE_BOARD_API.CAMPAIGN_AD_AUDIT_CONVERSIONS, p),
	
	  // Templates
	  loadMetricsTemplates: (params: { client_id: string | number; account_id: string; platform: 'meta' | 'google' }) =>
		axiosInstance.get(CREATIVE_BOARD_API.METRICS_TEMPLATES_LOAD, { params }),
	
	  saveMetricsTemplate: (body: {
		template_name: string;
		client_id: string | number;
		account_id: string;
		platform: 'meta' | 'google';
		metrics: string[];
	  }) => axiosInstance.post(CREATIVE_BOARD_API.METRICS_TEMPLATES_SAVE, body),
	
	  updateMetricsTemplate: (body: {
		id: number;
		client_id: string | number;
		account_id: string;
		platform: 'meta' | 'google';
		metrics: string[];
	  }) => axiosInstance.post(CREATIVE_BOARD_API.METRICS_TEMPLATES_UPDATE, body),
  };

  const platformForApi = (p: string) =>
	p === 'facebook' ? 'facebook' : p === 'google' ? 'google' : p;