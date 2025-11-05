import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Card, Badge, Button, Title, Text } from "@tremor/react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, PlayIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MetricsTab from "./components/MetricsTab";
import { creativeBoardApi } from "../../services/api";
import { getToken } from '../../utils/token';
/* ------------------ client_id from JWT (no edits to token.ts) ------------------ */
function getClientIdFromLocalToken(): number | undefined {
  const t = getToken();
  if (!t) return;
  const part = t.split('.')[1];
  if (!part) return;
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  try {
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(json);
    return payload?.id; // id === client_id
  } catch {
    return;
  }
}


const useClientId = () => {
  return useMemo(() => {
    const cid = getClientIdFromLocalToken();
    if (cid != null) return cid;
    const cached = localStorage.getItem('client_id');
    return cached ? Number(cached) : undefined;
  }, []);
};


/** ---- client_id resolver (dynamic) ---- */
function resolveClientId(location: ReturnType<typeof useLocation>, defaultId = 1): number {
  // 1) from router state
  const stateClient = (location.state as any)?.clientId;
  if (stateClient != null && !Number.isNaN(Number(stateClient))) return Number(stateClient);

  // 2) from URL ?client_id=...
  const qs = new URLSearchParams(location.search);
  const qsClient = qs.get("client_id");
  if (qsClient != null && !Number.isNaN(Number(qsClient))) return Number(qsClient);

  // 3) from localStorage
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("client_id");
    if (stored != null && !Number.isNaN(Number(stored))) return Number(stored);
  }

  // 4) from env (e.g. Vite)
  const envVal = (import.meta as any)?.env?.VITE_CLIENT_ID;
  if (envVal != null && !Number.isNaN(Number(envVal))) return Number(envVal);

  // 5) fallback
  return defaultId;
}

/** ---- platform helpers ---- */
function deriveNormalizedPlatform(input?: string): "meta" | "google" {
  const p = (input || "").toLowerCase();
  if (p.includes("google")) return "google";
  if (p.includes("facebook") || p.includes("meta")) return "meta";
  return "meta";
}

const PlatformLogo = ({ platform }: { platform: string }) => {
  if (platform === "Meta")
    return (
      <div className="platform-logo facebook-logo">
        <span className="logo-text">f</span>
      </div>
    );
  if (platform === "Google Ads")
    return (
      <div className="platform-logo google-logo">
        <span className="logo-text">G</span>
      </div>
    );
  return (
    <div className="platform-logo generic-logo">
      <span className="logo-text">?</span>
    </div>
  );
};

const Campaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // read platform/account from router state (if provided)
  const { platform: rawPlatform, accountId } =
    (location.state as { platform?: string; accountId?: string; clientId?: number }) || {};

  const clientId = useClientId();

  if (!clientId) {
    return <div className="p-4">Please login again. Client ID not found.</div>;
  }

  // normalize platform
  const normalizedPlatform = deriveNormalizedPlatform(rawPlatform);
  const platformName = normalizedPlatform === "google" ? "Google Ads" : "Meta";

  // state
  const [campaignData, setCampaignData] = useState<any>(null);
  const [adGroups, setAdGroups] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [creatives, setCreatives] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [dailyMetrics, setDailyMetrics] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[] | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdGroupsLoading, setIsAdGroupsLoading] = useState(true);
  const [isAdsLoading, setIsAdsLoading] = useState(true);
  const [isCreativesLoading, setIsCreativesLoading] = useState(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [isConversionsLoading, setIsConversionsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [creativesError, setCreativesError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [conversionsError, setConversionsError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "creatives">("overview");

  const metaMetrics = [
    "Spend",
    "Impressions",
    "CPM",
    "Reach",
    "Clicks",
    "CTR",
    "Cost per click",
    "Link click",
    "Cost per link click",
    "Read more rate",
    "Hook rate",
    "Video hold rate",
    "Visits Total",
    "Cost per visit Total",
    "Click Quality (AA)",
    "# of sales",
    "Cost per sale",
    "Revenue",
    "Cash Collected",
  ];
  const googleMetrics = ["Spend", "Impressions", "CPM", "Clicks", "CTR", "Cost per click"];

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    normalizedPlatform === "google" ? googleMetrics : metaMetrics
  );
  useEffect(() => {
    setSelectedMetrics(normalizedPlatform === "google" ? googleMetrics : metaMetrics);
  }, [normalizedPlatform]);

  const refetchConversions = () => {
    setConversions(null);
    setConversionsError(null);
    setIsConversionsLoading(false);
  };

  // Load Bootstrap CSS
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  /** --------------------- FETCH: Campaign --------------------- */
  useEffect(() => {
    if (!normalizedPlatform || !accountId || !id || !clientId) {
      setError("Missing client ID, platform, account ID, or campaign ID");
      setIsLoading(false);
      return;
    }
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: json } = await creativeBoardApi.getCampaign({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId!,
        });
        if (!json.success) throw new Error(json.message || "Failed to fetch campaign data");
        setCampaignData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch campaign data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [id, normalizedPlatform, accountId, clientId]);

  /** --------------------- FETCH: Ad Groups / Ad Sets --------------------- */
  useEffect(() => {
    if (!normalizedPlatform || !id || !accountId || !clientId) return;
    setIsAdGroupsLoading(true);
    const run = async () => {
      try {
        const { data: json } = await creativeBoardApi.getAdGroups({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId!,
        });
        if (!json.success) throw new Error(json.message || "Failed to fetch ad groups");
        setAdGroups(json.data || []);
      } catch (err) {
        console.error("Error fetching ad groups:", err);
      } finally {
        setIsAdGroupsLoading(false);
      }
    };
    run();
  }, [id, normalizedPlatform, accountId, clientId]);

  /** --------------------- FETCH: Ads --------------------- */
  useEffect(() => {
    if (!normalizedPlatform || !id || !accountId || !clientId) return;
    setIsAdsLoading(true);
    const run = async () => {
      try {
        const { data: json } = await creativeBoardApi.getAds({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId!,
        });
        if (!json.success) throw new Error(json.message || "Failed to fetch ads");
        setAds(json.data || []);
      } catch (err) {
        console.error("Error fetching ads:", err);
      } finally {
        setIsAdsLoading(false);
      }
    };
    run();
  }, [id, normalizedPlatform, accountId, clientId]);

  /** --------------------- FETCH: Creatives (on demand) --------------------- */
  useEffect(() => {
    if (activeTab !== "creatives" || creatives || creativesError) return;
    if (!normalizedPlatform || !id || !accountId || !clientId) return;
    setIsCreativesLoading(true);
    setCreativesError(null);
    const run = async () => {
      try {
        const { data: json } = await creativeBoardApi.getCreatives({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId!,
        });
        if (!json.success) throw new Error(json.message || "Failed to fetch creatives");
        setCreatives(json.data || { media: [], texts: [] });
      } catch (err) {
        setCreativesError(err instanceof Error ? err.message : "Failed to fetch creatives");
        console.error(err);
      } finally {
        setIsCreativesLoading(false);
      }
    };
    run();
  }, [activeTab, id, normalizedPlatform, accountId, clientId, creatives, creativesError]);

  /** --------------------- FETCH: Metrics --------------------- */
  const fetchMetrics = async (metricsToFetch: string[]) => {
    if (!normalizedPlatform || !id || !accountId || !clientId) return;
    setIsMetricsLoading(true);
    setMetricsError(null);
    try {
      const payload = {
        client_id: clientId,
        campaign_id: id!,
        platform: normalizedPlatform,
        ads_account_id: accountId!,
        metrics: metricsToFetch,
      };
      const { data: json } =
        normalizedPlatform === "google"
          ? await creativeBoardApi.getCampaignMetricsGoogle(payload)
          : await creativeBoardApi.getCampaignMetricsMeta(payload);

      if (!json.success) throw new Error(json.message || "Failed to fetch metrics");
      setMetrics(json.data?.aggregate || {});
      setDailyMetrics(json.data?.daily || []);
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : "Failed to fetch metrics");
      console.error(err);
    } finally {
      setIsMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedMetrics);
  }, [id, normalizedPlatform, accountId, clientId]);

  /** --------------------- FETCH: Conversions (on demand) --------------------- */
  useEffect(() => {
    if (activeTab !== "metrics" || conversions !== null || conversionsError) return;
    if (!normalizedPlatform || !id || !accountId || !clientId) return;
    setIsConversionsLoading(true);
    setConversionsError(null);
    const run = async () => {
      try {
        const { data: json } = await creativeBoardApi.getCampaignConversions({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId!,
        });
        if (!json.success) throw new Error(json.message || "Failed to fetch conversions");
        setConversions(json.data || []);
      } catch (err) {
        setConversionsError(err instanceof Error ? err.message : "Failed to fetch conversions");
        console.error(err);
      } finally {
        setIsConversionsLoading(false);
      }
    };
    run();
  }, [activeTab, id, normalizedPlatform, accountId, clientId, conversions, conversionsError]);

  const handleApplyMetrics = (newSelectedMetrics: string[]) => {
    setSelectedMetrics(newSelectedMetrics);
    fetchMetrics(newSelectedMetrics);
  };

  const formatDateWithTimezone = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "N/A";
    let offsetStr = "";
    let cleanDateStr = dateStr;
    const offsetMatch = dateStr.match(/([+-]\d{2}:\d{2}|Z|[+-]\d{4})$/);
    if (offsetMatch) {
      cleanDateStr = dateStr.replace(offsetMatch[0], "");
      let offset = offsetMatch[0];
      if (offset === "Z") {
        offsetStr = " (GMT +0)";
      } else {
        if (offset.length === 5) {
          offset = offset.slice(0, 3) + ":" + offset.slice(3);
        }
        offsetStr = ` (GMT ${offset})`;
      }
    }
    const date = new Date(cleanDateStr);
    if (isNaN(date.getTime())) return "N/A";
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "2-digit" };
    return date.toLocaleDateString("en-US", options) + offsetStr;
  };

  const getStatusColor = (s: string | null | undefined) => {
    if (!s) return "gray";
    const upper = s.toUpperCase();
    if (upper === "ACTIVE" || upper === "ENABLED") return "emerald";
    if (upper === "PAUSED") return "slate";
    return "gray";
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const formatIncome = (ranges: string | null): string => {
    if (!ranges) return "N/A";
    return ranges
      .split(",")
      .map((range) => {
        let clean = range.replace("INCOME_RANGE_", "").replace(/_/g, "-");
        if (clean.endsWith("-UP")) {
          clean = clean.replace("-UP", "+") + "%";
        } else {
          clean = clean + "%";
        }
        return clean;
      })
      .join(", ");
  };

  const handlePreviewClick = (asset: any) => setSelectedAsset(asset);
  const closeModal = () => setSelectedAsset(null);

  const formatCurrency = (num: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);

  const formatNumber = (num: number): string => num.toLocaleString("en-US");

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading campaign data...</p>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!campaignData) return <div className="text-center py-5">No campaign data found</div>;

  const dateCreated = formatDateWithTimezone(campaignData.created_time || campaignData.start_date);
  const dateLaunched = formatDateWithTimezone(campaignData.start_date);
  const datePaused =
    campaignData.end_date &&
    (campaignData.status === "PAUSED" || campaignData.status === "Paused")
      ? formatDateWithTimezone(campaignData.end_date)
      : "N/A";
  const totalSpend = campaignData.total_spend || 0;

  let dailyBudget = campaignData.daily_budget || 0;
  if (normalizedPlatform === "meta" && dailyBudget > 0) dailyBudget /= 100;
  else if (normalizedPlatform === "google" && dailyBudget > 0) dailyBudget /= 1_000_000;

  const budgetType = dailyBudget > 0 ? "Daily Budget" : "Lifetime Budget";
  const objective = campaignData.objective || "N/A";
  const biddingStrategy = campaignData.bidding_strategy || "N/A";
  const targetCPA = campaignData.target_cpa || 0;
  const lastUpdated = formatDateWithTimezone(campaignData.updated_time);

  return (
    <div className="space-y-6">
      <div className="container-fluid px-1 py-2">
        <div className="d-flex mb-4">
          <Button variant="secondary" size="xs" onClick={() => navigate(-1)}>
            <span className="flex items-center">
              <ChevronLeftIcon className="h-5 w-6 mr-1" />
              Back to Campaigns
            </span>
          </Button>
        </div>

        <div className="d-flex items-center gap-2">
          <PlatformLogo platform={platformName} />
          <Title className="mb-1 ml-1">{campaignData.name}</Title>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Text>Campaign ID: {campaignData.campaign_id}</Text>
          <Text className="text-slate-600">•</Text>
          <Text>Last updated: {lastUpdated}</Text>
        </div>

        <div className="mt-6 border-slate-700">
          <div className="flex space-x-8">
            <button
              className={`pb-1 px-1 text-sm font-medium ${
                activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-400 hover:text-slate-300"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`pb-1 px-1 text-sm font-medium ${
                activeTab === "metrics" ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-400 hover:text-slate-300"
              }`}
              onClick={() => setActiveTab("metrics")}
            >
              Metrics
            </button>
            <button
              className={`pb-1 px-1 text-sm font-medium ${
                activeTab === "creatives" ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-400 hover:text-slate-300"
              }`}
              onClick={() => setActiveTab("creatives")}
            >
              Creatives
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <Card className="p-4 my-4">
              <Title>Campaign Timeline & Spend</Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                <div>
                  <Text className="text-sm text-gray-500">Date Created</Text>
                  <Text>{dateCreated}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Date Launched</Text>
                  <Text>{dateLaunched}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Date Paused</Text>
                  <Text>{datePaused}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Total Spend</Text>
                  <Text>{formatCurrency(totalSpend)}</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4 my-4">
              <Title>Campaign Configuration</Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                <div>
                  <Text className="text-sm text-gray-500">Status</Text>
                  <Badge color={getStatusColor(campaignData.status)}>{campaignData.status || "N/A"}</Badge>
                </div>

                {normalizedPlatform === "google" && campaignData.serving_status && (
                  <div>
                    <Text className="text-sm text-gray-500">Serving Status</Text>
                    <Text>{campaignData.serving_status}</Text>
                  </div>
                )}

                <div>
                  <Text className="text-sm text-gray-500">Budget Type</Text>
                  <Text>{budgetType}</Text>
                </div>

                {dailyBudget > 0 && (
                  <div>
                    <Text className="text-sm text-gray-500">Daily Budget</Text>
                    <Text>{formatCurrency(dailyBudget)}</Text>
                  </div>
                )}

                {objective !== "N/A" && (
                  <div>
                    <Text className="text-sm text-gray-500">Objective</Text>
                    <Text>{objective}</Text>
                  </div>
                )}

                <div>
                  <Text className="text-sm text-gray-500">Bidding Strategy</Text>
                  <Text>{biddingStrategy}</Text>
                </div>

                {normalizedPlatform === "google" && campaignData.payment_mode && (
                  <div>
                    <Text className="text-sm text-gray-500">Payment Mode</Text>
                    <Text>{campaignData.payment_mode}</Text>
                  </div>
                )}

                {normalizedPlatform === "google" && campaignData.bidding_strategy_system_status && (
                  <div>
                    <Text className="text-sm text-gray-500">Bidding Strategy System Status</Text>
                    <Text>{campaignData.bidding_strategy_system_status}</Text>
                  </div>
                )}

                {normalizedPlatform === "google" && campaignData.advertising_channel_type && (
                  <div>
                    <Text className="text-sm text-gray-500">Advertising Channel Type</Text>
                    <Text>{campaignData.advertising_channel_type}</Text>
                  </div>
                )}

                {normalizedPlatform === "google" && campaignData.ad_serving_optimization_status && (
                  <div>
                    <Text className="text-sm text-gray-500">Ad Serving Optimization Status</Text>
                    <Text>{campaignData.ad_serving_optimization_status}</Text>
                  </div>
                )}

                <div>
                  <Text className="text-sm text-gray-500">Target CPA</Text>
                  <Text>{formatCurrency(targetCPA)}</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4 my-4">
              <Title>{normalizedPlatform === "google" ? "Ad Groups" : "Ad Sets"}</Title>
              <div className="divide-y divide-gray-200">
                {isAdGroupsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <Text className="mt-3">
                      Loading {normalizedPlatform === "google" ? "ad groups" : "ad sets"}...
                    </Text>
                  </div>
                ) : (
                  <>
                    {adGroups.map((group, index) => (
                      <div key={index} className="py-4">
                        <div className="flex justify-between items-start">
                          <div className="w-50">
                            <Text className="font-semibold">{group.name}</Text>
                            <Text className="text-sm text-gray-600">
                              ID: {group.id} · Type: {group.type || "N/A"}
                            </Text>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end">
                              <Text className="text-blue-600 font-semibold mb-0">
                                {formatCurrency(group.total_spend)}
                              </Text>
                              <Badge color={getStatusColor(group.status)} className="ml-2">
                                {group.status}
                              </Badge>
                            </div>
                            <Text className="text-xs text-gray-500">Total Spend</Text>
                          </div>
                        </div>

                        <div className="row mx-0">
                          {group.audiences && group.audiences.length >= 1 && (
                            <div className="col-md-4 mt-2 py-4 border pt-2">
                              <Text className="text-sm text-gray-500 mb-2">Targeting</Text>
                              <div className="space-y-2">
                                {group.audiences.map((a: any, idx: number) => {
                                  if (normalizedPlatform === "meta") {
                                    const parseMetaAudienceName = (name: string) => {
                                      const sections = name.split(" | ");
                                      const parsed: { [key: string]: string } = {};
                                      sections.forEach((section) => {
                                        const [key, value] = section.split(": ");
                                        if (key && value) {
                                          let cleanVal = value.trim();
                                          if (cleanVal.startsWith('"') && cleanVal.endsWith('"')) {
                                            cleanVal = cleanVal.slice(1, -1);
                                          }
                                          if (key === "Location" || key === "Interests") {
                                            cleanVal = cleanVal
                                              .split(", ")
                                              .map((s) => s.replace(/"/g, ""))
                                              .join(", ");
                                          }
                                          if (key === "Interests") {
                                            cleanVal = cleanVal.replace(/^Interests: /, "");
                                          }
                                          if (cleanVal !== "null") {
                                            parsed[key] = cleanVal;
                                          }
                                        }
                                      });
                                      return parsed;
                                    };
                                    const parsed = parseMetaAudienceName(a.name);
                                    return (
                                      <div key={idx}>
                                        {parsed.Location && (
                                          <Text className="text-xs">
                                            <b>Locations: {parsed.Location}</b>
                                          </Text>
                                        )}
                                        {parsed.Age && <Text className="text-xs">Age: {parsed.Age}</Text>}
                                        {parsed.Interests && (
                                          <Text className="text-xs">Interests: {parsed.Interests}</Text>
                                        )}
                                        <Text className="text-xs">
                                          ID: {a.audience_id}
                                          {a.income_ranges !== ""
                                            ? ` · Income: ${formatIncome(a.income_ranges)}`
                                            : ""}
                                          {" · Status: " + a.status}
                                        </Text>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div key={idx}>
                                        <Text className="text-sm font-semibold">{a.name}</Text>
                                        <Text className="text-xs">
                                          ID: {a.audience_id}
                                          {a.income_ranges !== ""
                                            ? ` · Income: ${formatIncome(a.income_ranges)}`
                                            : ""}
                                          {" · Status: " + a.status}
                                        </Text>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          )}

                          {group.placements && group.placements.length > 0 && (
                            <div className="col-md-4 mt-2 py-4 border pt-2">
                              <Text className="text-sm text-gray-500 mb-2">Placements</Text>
                              <div className="space-y-2">
                                {group.placements.map((p: any, idx: number) => (
                                  <div key={idx}>
                                    <Text className="text-sm font-semibold">{p.name}</Text>
                                    <Text className="text-xs">{"Status: " + p.status}</Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {group.custom_audiences && group.custom_audiences.length > 0 && (
                            <div className="col-md-4 mt-2 py-4 border pt-2">
                              <Text className="text-sm text-gray-500 mb-2">Custom Audiences</Text>
                              <div className="space-y-2">
                                {group.custom_audiences.map((ca: any, idx: number) => (
                                  <div key={idx}>
                                    <Text className="text-sm font-semibold">{ca.name}</Text>
                                    <Text className="text-xs">ID: {ca.audience_id} · Status: {ca.status}</Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {adGroups.length === 0 && (
                      <Text className="text-center py-4 text-gray-500">
                        No {normalizedPlatform === "google" ? "ad groups" : "ad sets"} found
                      </Text>
                    )}
                  </>
                )}
              </div>
            </Card>

            <Card className="p-4 my-4">
              <Title>Ads</Title>
              <div className="divide-y divide-gray-200">
                {isAdsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <Text className="mt-3">Loading ads...</Text>
                  </div>
                ) : (
                  <>
                    {ads.map((ad, index) => (
                      <div key={index} className="flex justify-between items-start py-4">
                        <div className="w-50">
                          <Text className="font-semibold">{ad.name}</Text>
                          <Text className="text-sm text-gray-600">
                            ID: {ad.id} · Ad Group ID: {ad.ad_group_id || "N/A"} · Type: {ad.type || "N/A"}
                          </Text>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end">
                            <Text className="text-blue-600 font-semibold">{formatCurrency(ad.total_spend)}</Text>
                            <Badge color={getStatusColor(ad.status)} className="ml-2">
                              {ad.status}
                            </Badge>
                          </div>
                          <Text className="text-xs text-gray-500">Total Spend</Text>
                        </div>
                      </div>
                    ))}
                    {ads.length === 0 && <Text className="text-center py-4 text-gray-500">No ads found</Text>}
                  </>
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === "metrics" && (
          <MetricsTab
            clientId={clientId}
            metrics={metrics}
            dailyMetrics={dailyMetrics}
            conversions={conversions}
            platform={platformName}
            id={id!}
            accountId={accountId!}
            isMetricsLoading={isMetricsLoading}
            metricsError={metricsError}
            isConversionsLoading={isConversionsLoading}
            conversionsError={conversionsError}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            onApplyMetrics={handleApplyMetrics}
            refetchConversions={refetchConversions}
          />
        )}

        {activeTab === "creatives" && (
          <>
            {isCreativesLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <Text className="mt-3">Loading creatives...</Text>
              </div>
            ) : creativesError ? (
              <div className="alert alert-danger">Error: {creativesError}</div>
            ) : creatives ? (
              <>
                <Card className="p-4 my-4">
                  <div className="flex justify-between items-center mb-4">
                    <Title>Media</Title>
                    <Text className="text-sm text-gray-500">{creatives.media?.length || 0} assets</Text>
                  </div>

                  {creatives.media && creatives.media.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {creatives.media.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <div className="relative cursor-pointer group" onClick={() => handlePreviewClick(item)}>
                            <div className="h-48 overflow-hidden bg-gray-100">
                              <img
                                src={
                                  item.type === "video"
                                    ? item.thumbnail_url ||
                                      (item.platform === "google" && item.video_id
                                        ? `https://img.youtube.com/vi/${item.video_id}/0.jpg`
                                        : item.media_url)
                                    : item.media_url
                                }
                                alt={item.asset_name || "Media"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {item.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayIcon className="h-12 w-12 text-white opacity-80" />
                                </div>
                              )}
                            </div>
                            <div className="absolute top-2 left-2 flex gap-2">
                              <Badge size="sm" className="rounded-md bg-white !text-black border-0 text-xs">
                                {item.type.toUpperCase()}
                              </Badge>
                              <Badge size="sm" className="rounded-md bg-white !text-black border-0 text-xs">
                                {item.variants === "Yes" || item.variant_id ? "Variant" : "Original"}
                              </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Button variant="light" size="xs" className="bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 shadow">
                                <EyeIcon className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <Text className="font-semibold mb-2 truncate" title={item.asset_name || "N/A"}>
                              {truncateText(item.asset_name || "N/A", 30)}
                            </Text>
                            <div className="space-y-2 mb-3">
                              <div className="flex items-start">
                                <Text className="text-xs text-gray-500 min-w-[70px]">Asset ID:</Text>
                                <Text className="text-xs truncate ml-1" title={item.asset_id}>
                                  {truncateText(item.asset_id, 20)}
                                </Text>
                              </div>
                              {item.variants === "Yes" || item.variant_id ? (
                                <div className="flex items-start">
                                  <Text className="text-xs text-gray-500 min-w-[70px]">Variant ID:</Text>
                                  <Text className="text-xs truncate ml-1" title={item.variant_id || "N/A"}>
                                    {truncateText(item.variant_id || "N/A", 20)}
                                  </Text>
                                </div>
                              ) : null}
                              <div className="flex items-start">
                                <Text className="text-xs text-gray-500 min-w-[70px]">Ad ID:</Text>
                                <Text className="text-xs truncate ml-1" title={item.ad_id || "N/A"}>
                                  {truncateText(item.ad_id || "N/A", 20)}
                                </Text>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Impr.</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(item.impressions || 0)}</Text>
                                </div>
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Clicks</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(item.clicks || 0)}</Text>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {item.type === "video" && (
                                  <div className="flex justify-between">
                                    <Text className="text-gray-500">Views</Text>
                                    <Text className="text-gray-700 font-semibold">{formatNumber(item.views || 0)}</Text>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Cost</Text>
                                  <Text className="text-gray-700 font-semibold">{formatCurrency(item.cost || 0)}</Text>
                                </div>
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Conv.</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(item.conversions || 0)}</Text>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className="text-center py-8 text-gray-500">No media assets found</Text>
                  )}
                </Card>

                <Card className="p-4 my-4">
                  <div className="flex justify-between items-center mb-4">
                    <Title>Text Assets</Title>
                    <Text className="text-sm text-gray-500">{creatives.texts?.length || 0} assets</Text>
                  </div>

                  {creatives.texts && creatives.texts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {creatives.texts.map((txt: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <Badge size="sm" className="rounded-md bg-white !text-black border-0 text-xs">
                                {txt.sub_type || "TEXT"}
                              </Badge>
                              <Badge size="sm" className="rounded-md bg-white !text-black border-0 text-xs">
                                {txt.variants === "Yes" || txt.variant_id ? "Variant" : "Original"}
                              </Badge>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md mb-3">
                              <Text className="text-sm line-clamp-3" title={txt.text}>
                                {txt.text}
                              </Text>
                            </div>
                            <div className="space-y-2 mb-3">
                              <div className="flex items-start">
                                <Text className="text-xs text-gray-500 min-w-[70px]">Asset ID:</Text>
                                <Text className="text-xs truncate ml-1" title={txt.asset_id}>
                                  {truncateText(txt.asset_id, 20)}
                                </Text>
                              </div>
                              {txt.variants === "Yes" || txt.variant_id ? (
                                <div className="flex items-start">
                                  <Text className="text-xs text-gray-500 min-w-[70px]">Variant ID:</Text>
                                  <Text className="text-xs truncate ml-1" title={txt.variant_id || "N/A"}>
                                    {truncateText(txt.variant_id || "N/A", 20)}
                                  </Text>
                                </div>
                              ) : null}
                              <div className="flex items-start">
                                <Text className="text-xs text-gray-500 min-w-[70px]">Ad ID:</Text>
                                <Text className="text-xs truncate ml-1" title={txt.ad_id || "N/A"}>
                                  {truncateText(txt.ad_id || "N/A", 20)}
                                </Text>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Impr.</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(txt.impressions || 0)}</Text>
                                </div>
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Clicks</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(txt.clicks || 0)}</Text>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Cost</Text>
                                  <Text className="text-gray-700 font-semibold">{formatCurrency(txt.cost || 0)}</Text>
                                </div>
                                <div className="flex justify-between">
                                  <Text className="text-gray-500">Conv.</Text>
                                  <Text className="text-gray-700 font-semibold">{formatNumber(txt.conversions || 0)}</Text>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className="text-center py-8 text-gray-500">No text assets found</Text>
                  )}
                </Card>
              </>
            ) : (
              <Text className="text-center py-5">No creatives data available</Text>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      <Transition appear show={!!selectedAsset} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {selectedAsset?.asset_name || "Asset Preview"}
                  </Dialog.Title>

                  <div className="mt-2">
                    {selectedAsset?.type === "video" ? (
                      selectedAsset.platform === "google" && selectedAsset.video_id ? (
                        <iframe
                          width="100%"
                          height="400"
                          src={`https://www.youtube.com/embed/${selectedAsset.video_id}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : selectedAsset.platform === "facebook" && selectedAsset.media_url ? (
                        <iframe
                          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                            `https://www.facebook.com${selectedAsset.media_url}`
                          )}&show_text=0&width=560`}
                          width="100%"
                          height="400"
                          style={{ border: "none", overflow: "hidden" }}
                          scrolling="no"
                          frameBorder="0"
                          allowFullScreen={true}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      ) : (
                        <Text>No video available</Text>
                      )
                    ) : (
                      <img
                        src={selectedAsset?.media_url}
                        alt={selectedAsset?.asset_name || "Preview"}
                        className="w-full h-auto max-h-[70vh] object-contain"
                      />
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="secondary" size="xs" onClick={closeModal}>
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Campaign;
