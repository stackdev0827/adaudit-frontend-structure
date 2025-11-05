// Types for metrics API response
export interface AdMetrics {
  meta: {
    ctr: number;
    cpc: number;
    link_clicks: number;
    cplc: number;
    impressions: number;
    cpm: number;
    reach: number;
    video_watch: number;
    click_quality: number;
  };
  google: {
    clicks: number;
    ctr: number;
    cpc: number;
    impressions: number;
    reach: number;
    video_watch: number;
  };
}

export interface Sales {
  count_of_sales: number;
  cost_per_sale: number;
  revenue: number;
  cash_collected: number;
  roas: number;
  roas_cash: number;
}

export interface LeadFormSubmissions {
  new: number;
  total: number;
}

export interface Applications {
  total: number;
  qualified: number;
  unqualified: number;
}

export interface BookedCalls {
  total: number;
  qualified: number;
  unqualified: number;
  confirmed: number;
  showed: number;
  live: number;
}

export interface Sets {
  total: number;
  outbound: number;
  inbound: number;
  new_opportunity: number;
  live: number;
}

export interface QualifiedOpportunities {
  total: number;
  live: number;
  new: number;
  live_new: number;
}

export interface Offers {
  total: number;
}

export interface AddToCarts {
  total: number;
}

export interface TimeframeMetrics {
  sales: Sales;
  lead_form_submissions: LeadFormSubmissions;
  applications: Applications;
  booked_calls: BookedCalls;
  sets: Sets;
  qualified_opportunities: QualifiedOpportunities;
  offers: Offers;
  add_to_carts: AddToCarts;
  ad_metrics: AdMetrics;
}

export interface StaticMetrics {
  budget: number;
  audience: number;
  days_live: number;
  total_spend: number;
  creatives: number;
  launch_date: string;
  notes: string;
}

export interface AdMetricsData {
  ad_id: string;
  ad_name: string;
  static_metrics?: {
    budget?: number;
    audience?: number;
    days_live?: number;
    total_spend?: number;
    creatives?: number;
    launch_date?: string;
    notes?: string;
  };
  timeframes: {
    yesterday: TimeframeMetrics;
    last_2_days: TimeframeMetrics;
    last_4_days: TimeframeMetrics;
    last_7_days: TimeframeMetrics;
    last_14_days: TimeframeMetrics;
    last_30_days: TimeframeMetrics;
    total: TimeframeMetrics;
  };
}

export interface AdsetMetrics {
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  static_metrics?: {
    budget?: number;
    audience?: number;
    days_live?: number;
    total_spend?: number;
    creatives?: number;
    launch_date?: string;
    notes?: string;
  };
  timeframes: {
    yesterday: TimeframeMetrics;
    last_2_days: TimeframeMetrics;
    last_4_days: TimeframeMetrics;
    last_7_days: TimeframeMetrics;
    last_14_days: TimeframeMetrics;
    last_30_days: TimeframeMetrics;
    total: TimeframeMetrics;
  };
  ads?: AdMetricsData[];
}

export interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  static_metrics: StaticMetrics;
  timeframes: {
    yesterday: TimeframeMetrics;
    last_2_days: TimeframeMetrics;
    last_4_days: TimeframeMetrics;
    last_7_days: TimeframeMetrics;
    last_14_days: TimeframeMetrics;
    last_30_days: TimeframeMetrics;
    total: TimeframeMetrics;
  };
  adsets?: AdsetMetrics[];
}

export interface MetricsApiResponse {
  status: string;
  data: CampaignMetrics[];
}
