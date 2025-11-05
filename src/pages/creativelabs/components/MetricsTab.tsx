import React, {
	useState,
	Fragment,
	useEffect,
	useMemo,
	useCallback,
} from "react";
import {
	Card,
	Text,
	Grid,
	Col,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Button,
	TabGroup,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	BarChart,
} from "@tremor/react";
import {
	ArrowTrendingUpIcon,
	CurrencyDollarIcon,
	CursorArrowRaysIcon,
	EyeIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { DroppableProps } from "react-beautiful-dnd";
import type { CustomTooltipProps } from "@tremor/react";
// import { CLIENT_ID } from "./data/config";
import { creativeBoardApi } from '../../../services/api';

// export const CLIENT_ID = 1;

interface MetricsTabProps {
  clientId: number;
	metrics: any;
	dailyMetrics: any[];
	conversions: any[] | null;
	platform: string;
	id?: string;
	accountId: string;
	isMetricsLoading: boolean;
	metricsError: string | null;
	isConversionsLoading: boolean;
	conversionsError: string | null;
	formatCurrency: (num: number) => string;
	formatNumber: (num: number) => string;
	onApplyMetrics: (selectedMetrics: string[]) => void;
	refetchConversions?: () => void;
}

interface Metric {
	name: string;
	subs?: string[];
}

interface SingleBarDataItem {
	name: string;
	value: number;
	percentage: string;
	spend: string;
}

interface StackedBarDataItem {
	name: string;
	[key: string]: number | string;
}

interface GroupedMetric {
	header: string;
	metrics: Metric[];
}

interface Category {
	name: string;
	metrics: (Metric | GroupedMetric)[];
}

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const animation = requestAnimationFrame(() => setEnabled(true));
		return () => {
			cancelAnimationFrame(animation);
			setEnabled(false);
		};
	}, []);
	if (!enabled) {
		return null;
	}
	return <Droppable {...props}>{children}</Droppable>;
};

const metaDefaultMetrics: string[] = [
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
	"# of applications Total",
	"Cost per application Total",
	"# of qualified applications Total",
	"Cost per qualified application Total",
	"# of unqualified applications Total",
	"Cost per unqualified application Total",
	"Qualified application % Total",
];

const googleDefaultMetrics: string[] = [
	"Spend",
	"Impressions",
	"CPM",
	"Clicks",
	"CTR",
	"Cost per click",
	"Video Views",
	"# of 25% watched video",
	"25% video watch rate",
	"# of 50% watched video",
	"50% video watch rate",
	"# of 75% watched video",
	"75% video watch rate",
	"# of 100% watched video",
	"100% video watch rate",
	"Conversions",
	"Cost per conversion",
	"Submit lead form",
	"Cost per submit lead form",
	"Book appointment",
	"Cost per booked appointment",
	"Contact",
	"Cost per contact",
	"Add to cart",
	"Cost per add to cart",
	"Begin checkout",
	"Cost per begin checkout",
	"Revenue",
	"ROAS",
	"Purchase",
	"Cost per purchase",
];

const pageMetricsCategory: Category = {
	name: "Page Metrics",
	metrics: [
		{
			header: "Visitor & Traffic Metrics",
			metrics: [
				{ name: "Visits", subs: ["Total", "First time"] },
				{ name: "% New Visits" },
				{ name: "Bot Traffic" },
			],
		},
		{
			header: "Cost & Quality Metrics",
			metrics: [
				{ name: "Cost per visit", subs: ["Total", "First time"] },
				{ name: "Click Quality (AA)" },
			],
		},
	],
};

const adAuditConversionCategory: Category = {
	name: "Ad Audit Conversion",
	metrics: [
		{
			header: "Lead Form Submissions",
			metrics: [
				{
					name: "# of lead form submissions",
					subs: ["Total", "First time"],
				},
				{
					name: "Cost per lead form submission",
					subs: ["Total", "First time"],
				},
			],
		},
		{
			header: "Applications",
			metrics: [
				{ name: "# of applications", subs: ["Total", "First time"] },
				{ name: "Cost per application", subs: ["Total", "First time"] },
				{
					name: "# of qualified applications",
					subs: ["Total", "First time"],
				},
				{
					name: "Cost per qualified application",
					subs: ["Total", "First time"],
				},
				{
					name: "# of unqualified applications",
					subs: ["Total", "First time"],
				},
				{
					name: "Cost per unqualified application",
					subs: ["Total", "First time"],
				},
				{
					name: "Qualified application %",
					subs: ["Total", "First time"],
				},
			],
		},
		{
			header: "Booked Call",
			metrics: [
				{ name: "# of calls", subs: ["Total", "First time"] },
				{ name: "Cost per call", subs: ["Total", "First time"] },
				{ name: "# of qualified calls", subs: ["Total", "First time"] },
				{
					name: "Cost per qualified booked call",
					subs: ["Total", "First time"],
				},
				{
					name: "# of unqualified calls",
					subs: ["Total", "First time"],
				},
				{
					name: "Cost per unqualified booked call",
					subs: ["Total", "First time"],
				},
				{ name: "# of calls showed", subs: ["Total", "First time"] },
				{
					name: "Cost per call that showed",
					subs: ["Total", "First time"],
				},
				{ name: "% of calls showed", subs: ["Total", "First time"] },
				{ name: "# of confirmed calls", subs: ["Total", "First time"] },
				{
					name: "Cost per confirmed call",
					subs: ["Total", "First time"],
				},
				{ name: "% of calls confirmed", subs: ["Total", "First time"] },
				{ name: "# of cancelled calls", subs: ["Total", "First time"] },
				{
					name: "% of calls that cancelled",
					subs: ["Total", "First time"],
				},
			],
		},
		{
			header: "Sets",
			metrics: [
				{ name: "# of sets", subs: ["Total", "First time"] },
				{ name: "Cost per set", subs: ["Total", "First time"] },
				{ name: "# of outbound sets", subs: ["Total", "First time"] },
				{
					name: "Cost per outbound set",
					subs: ["Total", "First time"],
				},
				{ name: "# of inbound sets", subs: ["Total", "First time"] },
				{ name: "Cost per inbound set", subs: ["Total", "First time"] },
				{ name: "# of shows from sets", subs: ["Total", "First time"] },
				{
					name: "Cost per show from sets",
					subs: ["Total", "First time"],
				},
				{ name: "Show % from sets", subs: ["Total", "First time"] },
			],
		},
		{
			header: "Add To Cart",
			metrics: [
				{ name: "# of add to carts" },
				{ name: "Cost per add to cart" },
			],
		},
		{
			header: "Offers Made",
			metrics: [
				{ name: "# of offers made" },
				{ name: "Cost per offer made" },
			],
		},
		{
			header: "Sales",
			metrics: [
				{ name: "# of sales" },
				{ name: "# of sales (New)" },
				{ name: "Cost per sale" },
				{ name: "Cost per sale (New)" },
				{ name: "Revenue" },
				{ name: "Revenue (New)" },
				{ name: "Cash Collected" },
				{ name: "Cash Collected (New)" },
				{ name: "AOV" },
				{ name: "AOV (New)" },
				{ name: "CAC (New)" },
				{ name: "ROAS" },
				{ name: "ROAS (New)" },
				{ name: "ROAS Cash Collected" },
				{ name: "ROAS Cash Collected (New)" },
				{ name: "Profit Based On Revenue" },
				{ name: "Profit Based On Cash Collected" },
				{ name: "# of refunds" },
				{ name: "# of refunds (New)" },
				{ name: "Refund Amount" },
				{ name: "Refund Amount (New)" },
				{ name: "Shipping" },
				{ name: "Shipping (New)" },
				{ name: "Tax" },
				{ name: "Tax (New)" },
				{ name: "Discounts" },
				{ name: "Discounts (New)" },
			],
		},
	],
};

const metaCategories: Category[] = [
	{
		name: "All",
		metrics: [],
	},
	{
		name: "Meta Reported",
		metrics: [
			{
				header: "Main Metrics",
				metrics: [
					{ name: "Spend" },
					{ name: "Impressions" },
					{ name: "CPM" },
					{ name: "Reach" },
					{ name: "Page view" },
					{ name: "Meta Click Quality" },
					{ name: "Read more rate" },
				],
			},
			{
				header: "Click-Related Metrics",
				metrics: [
					{ name: "Clicks" },
					{ name: "CTR" },
					{ name: "Cost per click" },
					{ name: "Link click" },
					{ name: "Cost per link click" },
				],
			},
			{
				header: "Post Engagement Metrics",
				metrics: [
					{ name: "Post engagement" },
					{ name: "Cost per post engagement" },
					{ name: "Post reaction" },
					{ name: "Cost per post reaction" },
					{ name: "Comment" },
					{ name: "Cost per comment" },
					{ name: "Post shares" },
					{ name: "Cost per share" },
					{ name: "Page like" },
					{ name: "Cost per page like" },
				],
			},
			{
				header: "Video View Metrics",
				metrics: [
					{ name: "Video Started" },
					{ name: "3 second video views" },
					{ name: "Cost per 3-second view" },
					{ name: "Hook rate" },
					{ name: "Thruplay" },
					{ name: "Cost per thruplay" },
					{ name: "Video hold rate" },
					{ name: "Video 30 second watch" },
					{ name: "Cost per video 30 second watch" },
					{ name: "# of 25% watched video" },
					{ name: "25% video watch rate" },
					{ name: "# of 50% watched video" },
					{ name: "50% video watch rate" },
					{ name: "# of 75% watched video" },
					{ name: "75% video watch rate" },
					{ name: "# of 95% watched video" },
					{ name: "95% video watch rate" },
					{ name: "# of 100% watched video" },
					{ name: "100% video watch rate" },
				],
			},
		],
	},
	pageMetricsCategory,
	adAuditConversionCategory,
];

const googleCategories: Category[] = [
	{
		name: "All",
		metrics: [],
	},
	{
		name: "Google Reported",
		metrics: [
			{
				header: "Main Metrics",
				metrics: [
					{ name: "Spend" },
					{ name: "Impressions" },
					{ name: "CPM" },
					{ name: "Clicks" },
					{ name: "CTR" },
					{ name: "Cost per click" },
				],
			},
			{
				header: "Video View Metrics",
				metrics: [
					{ name: "Video Views" },
					{ name: "# of 25% watched video" },
					{ name: "25% video watch rate" },
					{ name: "# of 50% watched video" },
					{ name: "50% video watch rate" },
					{ name: "# of 75% watched video" },
					{ name: "75% video watch rate" },
					{ name: "# of 100% watched video" },
					{ name: "100% video watch rate" },
				],
			},
			{
				header: "Conversion Metrics",
				metrics: [
					{ name: "Conversions" },
					{ name: "Cost per conversion" },
					{ name: "Submit lead form" },
					{ name: "Cost per submit lead form" },
					{ name: "Book appointment" },
					{ name: "Cost per booked appointment" },
					{ name: "Contact" },
					{ name: "Cost per contact" },
					{ name: "Add to cart" },
					{ name: "Cost per add to cart" },
					{ name: "Begin checkout" },
					{ name: "Cost per begin checkout" },
					{ name: "Purchase" },
					{ name: "Cost per purchase" },
					{ name: "Revenue" },
					{ name: "ROAS" },
				],
			},
		],
	},
	pageMetricsCategory,
	adAuditConversionCategory,
];

const customFormatCurrency = (num: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
};

const MetricsTab: React.FC<MetricsTabProps> = ({
  clientId,
	metrics,
	dailyMetrics,
	conversions,
	platform,
	id,
	accountId,
	isMetricsLoading,
	metricsError,
	isConversionsLoading,
	conversionsError,
	formatCurrency,
	formatNumber,
	onApplyMetrics,
	refetchConversions,
}) => {
	const defaultMetrics =
		platform === "Meta" ? metaDefaultMetrics : googleDefaultMetrics;
	const categories = platform === "Meta" ? metaCategories : googleCategories;

	const [selectedMetrics, setSelectedMetrics] =
		useState<string[]>(defaultMetrics);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("Default");
	const [savedViews, setSavedViews] = useState<
		{ id: number; name: string; metrics: string[] }[]
	>([]);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [localMetrics, setLocalMetrics] = useState<string[]>(defaultMetrics);
	const [localTemplate, setLocalTemplate] = useState<string>("Default");
	const [selectedCategory, setSelectedCategory] = useState<string>(
		platform === "Meta" ? "Meta Reported" : "Google Reported"
	);
	const [activeBreakdownTab, setActiveBreakdownTab] = useState(
		platform === "Meta" ? "Placement" : "Country/Region"
	);
	const [placementData, setPlacementData] = useState<any[]>([]);
	const [isPlacementLoading, setIsPlacementLoading] = useState(false);
	const [placementError, setPlacementError] = useState<string | null>(null);
	const [hasPlacementFetched, setHasPlacementFetched] = useState(false);
	const [countryData, setCountryData] = useState<any[]>([]);
	const [isCountryLoading, setIsCountryLoading] = useState(false);
	const [countryError, setCountryError] = useState<string | null>(null);
	const [hasCountryFetched, setHasCountryFetched] = useState(false);
	const [ageGenderData, setAgeGenderData] = useState<any[]>([]);
	const [isAgeGenderLoading, setIsAgeGenderLoading] = useState(false);
	const [ageGenderError, setAgeGenderError] = useState<string | null>(null);
	const [hasAgeGenderFetched, setHasAgeGenderFetched] = useState(false);
	const [openCategory, setOpenCategory] = useState<string | null>(null);
	const [localTemplateId, setLocalTemplateId] = useState<number | null>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
		null
	);
	const [pageMetrics, setPageMetrics] = useState<any>(null);
	const [isPageMetricsLoading, setIsPageMetricsLoading] = useState(false);
	const [pageMetricsError, setPageMetricsError] = useState<string | null>(
		null
	);
	const [hasPageMetricsFetched, setHasPageMetricsFetched] = useState(false);
	const [adAuditMetrics, setAdAuditMetrics] = useState<any>(null);
	const [isAdAuditLoading, setIsAdAuditLoading] = useState(false);
	const [adAuditError, setAdAuditError] = useState<string | null>(null);
	const [hasAdAuditFetched, setHasAdAuditFetched] = useState(false);
	const [isSavedViewsLoading, setIsSavedViewsLoading] = useState(false);

	// Load Bootstrap CSS
	useEffect(() => {
		const link = document.createElement("link");
		link.href =
			"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
		link.rel = "stylesheet";
		document.head.appendChild(link);

		// Add custom style to lower the legend dots slightly for better alignment with text
		const customStyle = document.createElement("style");
		customStyle.innerHTML = `
      .custom-placement-chart p {
       margin-bottom:0px;
      }
    `;
    document.head.appendChild(customStyle);
  
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(customStyle);
    };
  }, []);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const metricToGroup = useMemo(() => {
    const map: Record<string, { category: string; header: string }> = {};
    categories.forEach((cat) => {
      cat.metrics.forEach((item) => {
        if ('header' in item) {
          item.metrics.forEach((m) => {
            map[m.name] = { category: cat.name, header: item.header };
            if (m.subs) {
              m.subs.forEach((sub) => {
                map[`${m.name} ${sub}`] = { category: cat.name, header: item.header };
              });
            }
          });
        } else {
          map[item.name] = { category: cat.name, header: cat.name };
          if (item.subs) {
            item.subs.forEach((sub) => {
              map[`${item.name} ${sub}`] = { category: cat.name, header: cat.name };
            });
          }
        }
      });
    });
    return map;
  }, [categories]);

  const groupedSelected = useMemo(() => {
    const grouped: Record<string, Record<string, string[]>> = {};
    selectedMetrics.forEach((metric) => {
      const groupInfo = metricToGroup[metric] || { category: 'Other', header: 'Other' };
      const { category, header } = groupInfo;
      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][header]) {
        grouped[category][header] = [];
      }
      grouped[category][header].push(metric);
    });
    return grouped;
  }, [selectedMetrics, metricToGroup]);

  const displayGroups = useMemo(() => {
    const groups: { title: string; metrics: string[] }[] = [];
    categories.forEach((cat) => {
      if (groupedSelected[cat.name]) {
        Object.entries(groupedSelected[cat.name]).forEach(([header, metrics]) => {
          groups.push({ title: header, metrics });
        });
      }
    });
    return groups;
  }, [groupedSelected, categories]);

  // Fetch placement data - updated for live project
  useEffect(() => {
    if (activeBreakdownTab !== "Placement" || platform.toLowerCase() !== "meta" || hasPlacementFetched || isPlacementLoading) return;
  
    (async () => {
      setIsPlacementLoading(true);
      setPlacementError(null);
      try {
        const { data: json } = await creativeBoardApi.getCampaignPlacementMetrics({
          client_id: clientId,
          campaign_id: id!,
          platform: platform.toLowerCase().includes('google') ? 'google' : 'meta',
          ads_account_id: accountId,
        });
        if (!json.success) throw new Error(json.message || 'Failed to fetch placement metrics');
        setPlacementData(json.data || []);
      } catch (err: any) {
        setPlacementError(err?.message || 'Failed to fetch placement metrics');
        console.error('Placement metrics error:', err);
      } finally {
        setIsPlacementLoading(false);
        setHasPlacementFetched(true);
      }
    })();
  }, [activeBreakdownTab, platform, id, accountId, hasPlacementFetched, isPlacementLoading]);
  

  // Fetch country data - updated for live project
  useEffect(() => {
    if (activeBreakdownTab !== "Country/Region" || hasCountryFetched || isCountryLoading) return;
  
    (async () => {
      setIsCountryLoading(true);
      setCountryError(null);
      try {
        const { data: json } = await creativeBoardApi.getCampaignCountryMetrics({
          client_id: clientId,
          campaign_id: id!,
          platform: platform.toLowerCase().includes('google') ? 'google' : 'meta',
          ads_account_id: accountId,
        });
        if (!json.success) throw new Error(json.message || 'Failed to fetch country metrics');
        setCountryData(json.data || []);
      } catch (err: any) {
        setCountryError(err?.message || 'Failed to fetch country metrics');
        console.error('Country metrics error:', err);
      } finally {
        setIsCountryLoading(false);
        setHasCountryFetched(true);
      }
    })();
  }, [activeBreakdownTab, platform, id, accountId, hasCountryFetched, isCountryLoading]);
  

  // Fetch age/gender data - updated for live project
  useEffect(() => {
    if (activeBreakdownTab !== "Age/Gender" || platform.toLowerCase() !== "meta" || hasAgeGenderFetched || isAgeGenderLoading) return;
  
    (async () => {
      setIsAgeGenderLoading(true);
      setAgeGenderError(null);
      try {
        const { data: json } = await creativeBoardApi.getCampaignAgeGenderMetrics({
          client_id: clientId,
          campaign_id: id!,
          platform: 'meta',
          ads_account_id: accountId,
        });
        if (!json.success) throw new Error(json.message || 'Failed to fetch age/gender metrics');
        setAgeGenderData(json.data || []);
      } catch (err: any) {
        setAgeGenderError(err?.message || 'Failed to fetch age/gender metrics');
        console.error('Age/Gender metrics error:', err);
      } finally {
        setIsAgeGenderLoading(false);
        setHasAgeGenderFetched(true);
      }
    })();
  }, [activeBreakdownTab, platform, id, accountId, hasAgeGenderFetched, isAgeGenderLoading]);
  

  // Fetch page metrics - updated for live project
  useEffect(() => {
    if (hasPageMetricsFetched || isPageMetricsLoading) return;
  
    (async () => {
      setIsPageMetricsLoading(true);
      setPageMetricsError(null);
      try {
        const normalizedPlatform = platform.toLowerCase().includes('google') ? 'google' : 'meta';
        const { data: json } = await creativeBoardApi.getCampaignPageMetrics({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId,
        });
        if (!json.success) throw new Error(json.message || 'Failed to fetch page metrics');
        setPageMetrics(json.data || {});
      } catch (err: any) {
        setPageMetricsError(err?.message || 'Failed to fetch page metrics');
        console.error('Page metrics error:', err);
      } finally {
        setIsPageMetricsLoading(false);
        setHasPageMetricsFetched(true);
      }
    })();
  }, [platform, id, accountId, hasPageMetricsFetched, isPageMetricsLoading]);
  
  // Fetch ad audit metrics - updated for live project
  useEffect(() => {
    if (hasAdAuditFetched || isAdAuditLoading) return;
  
    (async () => {
      setIsAdAuditLoading(true);
      setAdAuditError(null);
      try {
        const normalizedPlatform = platform.toLowerCase().includes('google') ? 'google' : 'meta';
        const { data: json } = await creativeBoardApi.getCampaignAdAuditConversions({
          client_id: clientId,
          campaign_id: id!,
          platform: normalizedPlatform,
          ads_account_id: accountId,
        });
        if (!json.success) throw new Error(json.message || 'Failed to fetch ad audit metrics');
        setAdAuditMetrics(json.data || {});
      } catch (err: any) {
        setAdAuditError(err?.message || 'Failed to fetch ad audit metrics');
        console.error('Ad audit metrics error:', err);
      } finally {
        setIsAdAuditLoading(false);
        setHasAdAuditFetched(true);
      }
    })();
  }, [platform, id, accountId, hasAdAuditFetched, isAdAuditLoading]);
  

  const handleMetricToggle = (metric: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleDragEnd = (result: any, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!result.destination) return;
    setter((prev) => {
      const items = Array.from(prev);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      return items;
    });
  };

  const currentMetrics = categories.find((c) => c.name === selectedCategory)?.metrics || [];

  const renderClone = (provided: any, snapshot: any, rubric: any, localMetrics: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const metric = localMetrics[rubric.source.index];
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
      >
        <div className="flex items-center">
          <div
            {...provided.dragHandleProps}
            className="flex space-x-0.5 mr-3 cursor-move"
          >
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
          <span className="text-sm text-gray-700">{metric}</span>
        </div>
        <button
          onClick={() => handleMetricToggle(metric, setter)}
          className="text-red-500 hover:text-red-700"
        >
          x
        </button>
      </div>
    );
  };

  const isMetricInCategory = (categoryName: string, metric: string) => {
    const category = categories.find((c) => c.name === categoryName);
    if (!category) return false;
    return category.metrics.some((item) => {
      if ('header' in item) {
        return item.metrics.some((subM) =>
          subM.name === metric || (subM.subs && subM.subs.some((sub) => subM.name + " " + sub === metric))
        );
      } else {
        return item.name === metric;
      }
    });
  };

const getMetricValue = (metric: string, data: any) => {
    // Extract the metrics from the aggregate object
  const metricsData = data?.aggregate || data;
  if (platform.includes('Google')) { // Updated condition to handle 'Google Ads'
    switch (metric) {
      case "Spend":
        return formatCurrency(metricsData.spend || 0);
      case "Impressions":
        return formatNumber(metricsData.impressions || 0);
      case "CPM":
        return formatCurrency(metricsData.cpm || 0);
      case "Clicks":
        return formatNumber(metricsData.clicks || 0);
      case "CTR":
        return metricsData.ctr > 0 ? (metricsData.ctr * 100).toFixed(2) + '%' : '0%';
      case "Cost per click":
        return formatCurrency(metricsData.cpc || 0);
      case "Video Views":
        return formatNumber(metricsData.video_views || 0);
      case "# of 25% watched video":
        return formatNumber(metricsData.video_p25_watched_actions || 0);
      case "25% video watch rate":
        return metricsData.video_25_watch_rate > 0 ? (metricsData.video_25_watch_rate * 100).toFixed(2) + '%' : '0%';
      case "# of 50% watched video":
        return formatNumber(metricsData.video_p50_watched_actions || 0);
      case "50% video watch rate":
        return metricsData.video_50_watch_rate > 0 ? (metricsData.video_50_watch_rate * 100).toFixed(2) + '%' : '0%';
      case "# of 75% watched video":
        return formatNumber(metricsData.video_p75_watched_actions || 0);
      case "75% video watch rate":
        return metricsData.video_75_watch_rate > 0 ? (metricsData.video_75_watch_rate * 100).toFixed(2) + '%' : '0%';
      case "# of 100% watched video":
        return formatNumber(metricsData.video_p100_watched_actions || 0);
      case "100% video watch rate":
        return metricsData.video_100_watch_rate > 0 ? (metricsData.video_100_watch_rate * 100).toFixed(2) + '%' : '0%';
     
      // Google Conversion Metrics
      case "Conversions":
        return formatNumber(metricsData.all_conversions || metricsData.conversions || 0); // Prioritizes all_conversions for broader total
      case "Cost per conversion":
        const conversions = metricsData.all_conversions || metricsData.conversions || 0;
        const spend = metricsData.spend || 0;
        return conversions > 0 ? formatCurrency(spend / conversions) : '$0.00';
      case "Submit lead form":
        return formatNumber(metricsData.submit_lead_form || 0);
      case "Cost per submit lead form":
        const leadForms = metricsData.submit_lead_form || 0;
        return leadForms > 0 ? formatCurrency((metricsData.spend || 0) / leadForms) : '$0.00';
      case "Book appointment":
        return formatNumber(metricsData.book_appointment || 0);
      case "Cost per booked appointment":
        const appointments = metricsData.book_appointment || 0;
        return appointments > 0 ? formatCurrency((metricsData.spend || 0) / appointments) : '$0.00';
      case "Contact":
        return formatNumber(metricsData.contact || 0);
      case "Cost per contact":
        const contacts = metricsData.contact || 0;
        return contacts > 0 ? formatCurrency((metricsData.spend || 0) / contacts) : '$0.00';
      case "Add to cart":
        return formatNumber(metricsData.add_to_cart || 0);
      case "Cost per add to cart":
        const addToCarts = metricsData.add_to_cart || 0;
        return addToCarts > 0 ? formatCurrency((metricsData.spend || 0) / addToCarts) : '$0.00';
      case "Begin checkout":
        return formatNumber(metricsData.begin_checkout || 0);
      case "Cost per begin checkout":
        const checkouts = metricsData.begin_checkout || 0;
        return checkouts > 0 ? formatCurrency((metricsData.spend || 0) / checkouts) : '$0.00';
      case "Purchase":
        return formatNumber(metricsData.purchase || 0);
      case "Cost per purchase":
        const purchases = metricsData.purchase || 0;
        return purchases > 0 ? formatCurrency((metricsData.spend || 0) / purchases) : '$0.00';
      case "Revenue":
        return formatCurrency(adAuditMetrics?.revenue_total || metricsData.revenue || 0);
      case "ROAS":
        const revenue = adAuditMetrics?.revenue_total || metricsData.revenue || 0;
        const campaignSpend = metricsData.spend || 0;
        return campaignSpend > 0 ? (revenue / campaignSpend).toFixed(4) + 'x' : '0x';
      // Add common Ad Audit and Page Metrics cases for Google
      case "# of lead form submissions Total":
        return formatNumber(metricsData.submit_lead_form || 0);
      case "Cost per lead form submission Total":
        const leadFormsGA = metricsData.submit_lead_form || 0;
        return leadFormsGA > 0 ? formatCurrency((metricsData.spend || 0) / leadFormsGA) : '$0.00';
      case "# of lead form submissions First time":
      case "Cost per lead form submission First time":
        return 'N/A';
      case "# of applications Total":
        return formatNumber(adAuditMetrics?.total_applications || 0);
      case "Cost per application Total":
        return formatCurrency(adAuditMetrics?.cost_per_application_total || 0);
      case "# of applications First time":
        return formatNumber(adAuditMetrics?.first_time_applications || 0);
      case "Cost per application First time":
        return formatCurrency(adAuditMetrics?.cost_per_application_first_time || 0);
      case "# of qualified applications Total":
        return formatNumber(adAuditMetrics?.qualified_applications_total || 0);
      case "Cost per qualified application Total":
        return formatCurrency(adAuditMetrics?.cost_per_qualified_application_total || 0);
      case "# of unqualified applications Total":
        return formatNumber(adAuditMetrics?.unqualified_applications_total || 0);
      case "Cost per unqualified application Total":
        return formatCurrency(adAuditMetrics?.cost_per_unqualified_application_total || 0);
      case "Qualified application % Total":
        return adAuditMetrics?.qualified_application_percent_total > 0 ? (adAuditMetrics.qualified_application_percent_total).toFixed(2) + '%' : '0%';
      case "# of qualified applications First time":
        return formatNumber(adAuditMetrics?.qualified_applications_first_time || 0);
      case "Cost per qualified application First time":
        return formatCurrency(adAuditMetrics?.cost_per_qualified_application_first_time || 0);
      case "# of unqualified applications First time":
        return formatNumber(adAuditMetrics?.unqualified_applications_first_time || 0);
      case "Cost per unqualified application First time":
        return formatCurrency(adAuditMetrics?.cost_per_unqualified_application_first_time || 0);
      case "Qualified application % First time":
        return adAuditMetrics?.qualified_application_percent_first_time > 0 ? (adAuditMetrics.qualified_application_percent_first_time).toFixed(2) + '%' : '0%';
      case "# of calls Total":
        return formatNumber(adAuditMetrics?.total_calls || 0);
      case "Cost per call Total":
        return formatCurrency(adAuditMetrics?.cost_per_call_total || 0);
      case "# of qualified calls Total":
        return formatNumber(adAuditMetrics?.qualified_calls_total || 0);
      case "Cost per qualified booked call Total":
        return formatCurrency(adAuditMetrics?.cost_per_qualified_call_total || 0);
      case "# of unqualified calls Total":
        return formatNumber(adAuditMetrics?.unqualified_calls_total || 0);
      case "Cost per unqualified booked call Total":
        return formatCurrency(adAuditMetrics?.cost_per_unqualified_call_total || 0);
      case "# of calls showed Total":
        return formatNumber(adAuditMetrics?.calls_showed_total || 0);
      case "Cost per call that showed Total":
        return formatCurrency(adAuditMetrics?.cost_per_call_showed_total || 0);
      case "% of calls showed Total":
        return adAuditMetrics?.percent_calls_showed_total > 0 ? (adAuditMetrics.percent_calls_showed_total).toFixed(2) + '%' : '0%';
      case "# of confirmed calls Total":
        return formatNumber(adAuditMetrics?.confirmed_calls_total || 0);
      case "Cost per confirmed call Total":
        return formatCurrency(adAuditMetrics?.cost_per_confirmed_call_total || 0);
      case "% of calls confirmed Total":
        return adAuditMetrics?.percent_calls_confirmed_total > 0 ? (adAuditMetrics.percent_calls_confirmed_total).toFixed(2) + '%' : '0%';
      case "# of cancelled calls Total":
        return formatNumber(adAuditMetrics?.cancelled_calls_total || 0);
      case "% of calls that cancelled Total":
        return adAuditMetrics?.percent_calls_cancelled_total > 0 ? (adAuditMetrics.percent_calls_cancelled_total).toFixed(2) + '%' : '0%';
      case "# of calls First time":
        return formatNumber(adAuditMetrics?.first_time_calls || 0);
      case "Cost per call First time":
        return formatCurrency(adAuditMetrics?.cost_per_call_first_time || 0);
      case "# of qualified calls First time":
        return formatNumber(adAuditMetrics?.qualified_calls_first_time || 0);
      case "Cost per qualified booked call First time":
        return formatCurrency(adAuditMetrics?.cost_per_qualified_call_first_time || 0);
      case "# of unqualified calls First time":
        return formatNumber(adAuditMetrics?.unqualified_calls_first_time || 0);
      case "Cost per unqualified booked call First time":
        return formatCurrency(adAuditMetrics?.cost_per_unqualified_call_first_time || 0);
      case "# of calls showed First time":
        return formatNumber(adAuditMetrics?.calls_showed_first_time || 0);
      case "Cost per call that showed First time":
        return formatCurrency(adAuditMetrics?.cost_per_call_showed_first_time || 0);
      case "% of calls showed First time":
        return adAuditMetrics?.percent_calls_showed_first_time > 0 ? (adAuditMetrics.percent_calls_showed_first_time).toFixed(2) + '%' : '0%';
      case "# of confirmed calls First time":
        return formatNumber(adAuditMetrics?.confirmed_calls_first_time || 0);
      case "Cost per confirmed call First time":
        return formatCurrency(adAuditMetrics?.cost_per_confirmed_call_first_time || 0);
      case "% of calls confirmed First time":
        return adAuditMetrics?.percent_calls_confirmed_first_time > 0 ? (adAuditMetrics.percent_calls_confirmed_first_time).toFixed(2) + '%' : '0%';
      case "# of cancelled calls First time":
        return formatNumber(adAuditMetrics?.cancelled_calls_first_time || 0);
      case "% of calls that cancelled First time":
        return adAuditMetrics?.percent_calls_cancelled_first_time > 0 ? (adAuditMetrics.percent_calls_cancelled_first_time).toFixed(2) + '%' : '0%';
      case "# of sets Total":
        return formatNumber(adAuditMetrics?.total_sets || 0);
      case "Cost per set Total":
        return formatCurrency(adAuditMetrics?.cost_per_set_total || 0);
      case "# of outbound sets Total":
        return formatNumber(adAuditMetrics?.outbound_sets_total || 0);
      case "Cost per outbound set Total":
        return formatCurrency(adAuditMetrics?.cost_per_outbound_set_total || 0);
      case "# of inbound sets Total":
        return formatNumber(adAuditMetrics?.inbound_sets_total || 0);
      case "Cost per inbound set Total":
        return formatCurrency(adAuditMetrics?.cost_per_inbound_set_total || 0);
      case "# of shows from sets Total":
        return formatNumber(adAuditMetrics?.shows_from_sets_total || 0);
      case "Cost per show from sets Total":
        return formatCurrency(adAuditMetrics?.cost_per_show_from_sets_total || 0);
      case "Show % from sets Total":
        return adAuditMetrics?.show_percent_from_sets_total > 0 ? (adAuditMetrics.show_percent_from_sets_total).toFixed(2) + '%' : '0%';
      case "# of sets First time":
        return formatNumber(adAuditMetrics?.first_time_sets || 0);
      case "Cost per set First time":
        return formatCurrency(adAuditMetrics?.cost_per_set_first_time || 0);
      case "# of outbound sets First time":
        return formatNumber(adAuditMetrics?.outbound_sets_first_time || 0);
      case "Cost per outbound set First time":
        return formatCurrency(adAuditMetrics?.cost_per_outbound_set_first_time || 0);
      case "# of inbound sets First time":
        return formatNumber(adAuditMetrics?.inbound_sets_first_time || 0);
      case "Cost per inbound set First time":
        return formatCurrency(adAuditMetrics?.cost_per_inbound_set_first_time || 0);
      case "# of shows from sets First time":
        return formatNumber(adAuditMetrics?.shows_from_sets_first_time || 0);
      case "Cost per show from sets First time":
        return formatCurrency(adAuditMetrics?.cost_per_show_from_sets_first_time || 0);
      case "Show % from sets First time":
        return adAuditMetrics?.show_percent_from_sets_first_time > 0 ? (adAuditMetrics.show_percent_from_sets_first_time).toFixed(2) + '%' : '0%';
      case "# of add to carts":
        return formatNumber(metricsData.add_to_cart || 0);
      case "# of offers made":
        return formatNumber(adAuditMetrics?.offers_made_total || 0);
      case "Cost per offer made":
        return formatCurrency(adAuditMetrics?.cost_per_offer_made_total || 0);
      case "# of sales":
        return formatNumber(adAuditMetrics?.sales_total || 0);
      case "# of sales (New)":
        return formatNumber(adAuditMetrics?.sales_new || 0);
      case "Cost per sale":
        return formatCurrency(adAuditMetrics?.cost_per_sale_total || 0);
      case "Cost per sale (New)":
        return formatCurrency(adAuditMetrics?.cost_per_sale_new || 0);
      case "Revenue (New)":
        return formatCurrency(adAuditMetrics?.revenue_new || 0);
      case "Cash Collected":
        return formatCurrency(adAuditMetrics?.cash_collected_total || 0);
      case "Cash Collected (New)":
        return formatCurrency(adAuditMetrics?.cash_collected_new || 0);
      case "AOV":
        return formatCurrency(adAuditMetrics?.aov_total || 0);
      case "AOV (New)":
        return formatCurrency(adAuditMetrics?.aov_new || 0);
      case "CAC (New)":
        return formatCurrency(adAuditMetrics?.cac_new || 0);
      case "ROAS (New)":
        return (adAuditMetrics?.roas_new || 0).toFixed(4) + 'x';
      case "ROAS Cash Collected":
        return (adAuditMetrics?.roas_cash_collected_total || 0).toFixed(4) + 'x';
      case "ROAS Cash Collected (New)":
        return (adAuditMetrics?.roas_cash_collected_new || 0).toFixed(4) + 'x';
      case "Profit Based On Revenue":
        return formatCurrency(adAuditMetrics?.profit_revenue_total || 0);
      case "Profit Based On Cash Collected":
        return formatCurrency(adAuditMetrics?.profit_cash_collected_total || 0);
      case "# of refunds":
        return formatNumber(adAuditMetrics?.refunds_total || 0);
      case "# of refunds (New)":
        return formatNumber(adAuditMetrics?.refunds_new || 0);
      case "Refund Amount":
        return formatCurrency(adAuditMetrics?.refund_amount_total || 0);
      case "Refund Amount (New)":
        return formatCurrency(adAuditMetrics?.refund_amount_new || 0);
      case "Shipping":
        return formatCurrency(adAuditMetrics?.shipping_total || 0);
      case "Shipping (New)":
        return formatCurrency(adAuditMetrics?.shipping_new || 0);
      case "Tax":
        return formatCurrency(adAuditMetrics?.tax_total || 0);
      case "Tax (New)":
        return formatCurrency(adAuditMetrics?.tax_new || 0);
      case "Discounts":
        return formatCurrency(adAuditMetrics?.discounts_total || 0);
      case "Discounts (New)":
        return formatCurrency(adAuditMetrics?.discounts_new || 0);
      case "Visits Total":
        return formatNumber(pageMetrics?.total_visits || 0);
      case "Visits First time":
        return formatNumber(pageMetrics?.first_time_visits || 0);
      case "% New Visits":
        return pageMetrics?.percent_new_visits > 0 ? pageMetrics.percent_new_visits.toFixed(2) + '%' : '0%';
      case "Bot Traffic":
        return formatNumber(pageMetrics?.bot_traffic || 0);
      case "Cost per visit Total":
        return formatCurrency(pageMetrics?.cost_per_visit_total || 0);
      case "Cost per visit First time":
        return formatCurrency(pageMetrics?.cost_per_visit_first_time || 0);
      case "Click Quality (AA)":
        return pageMetrics?.click_quality_aa > 0 ? (pageMetrics.click_quality_aa * 100).toFixed(2) + '%' : '0%';
      case "Average Video View":
        return pageMetrics?.average_video_view >= 0 ? pageMetrics.average_video_view.toFixed(2) + 's' : 'N/A';
      default:
        return 'N/A';
    }
  }
  // Meta platform metrics
  switch (metric) {
    case "Spend":
      return formatCurrency(data.spend || 0);
    case "Impressions":
      return formatNumber(data.impressions || 0);
    case "CPM":
      return formatCurrency(data.cpm || 0);
    case "Reach":
      return formatNumber(data.reach || 0);
    case "Page view":
      return formatNumber(data.landing_page_view || 0);
    case "Meta Click Quality":
      return data.click_quality_aa > 0 ? (data.click_quality_aa * 100).toFixed(2) + '%' : '0%';
    case "Read more rate":
      return data.read_more_rate > 0 ? (data.read_more_rate * 100).toFixed(2) + '%' : '0%';
    case "Clicks":
      return formatNumber(data.clicks || 0);
    case "CTR":
      return data.ctr > 0 ? (data.ctr * 100).toFixed(2) + '%' : '0%';
    case "Cost per click":
      return formatCurrency(data.cpc || 0);
    case "Link click":
      return formatNumber(data.link_click || 0);
    case "Cost per link click":
      return formatCurrency(data.cost_per_link_click || 0);
    case "Post engagement":
      return formatNumber(data.post_engagement || 0);
    case "Cost per post engagement":
      return data.post_engagement > 0 ? formatCurrency(data.spend / data.post_engagement) : '$0.00';
    case "Post reaction":
      return formatNumber(data.post_reaction || 0);
    case "Cost per post reaction":
      return data.post_reaction > 0 ? formatCurrency(data.spend / data.post_reaction) : '$0.00';
    case "Comment":
      return formatNumber(data.commented || 0);
    case "Cost per comment":
      return data.commented > 0 ? formatCurrency(data.spend / data.commented) : '$0.00';
    case "Post shares":
      return formatNumber(data.post || 0);
    case "Cost per share":
      return data.post > 0 ? formatCurrency(data.spend / data.post) : '$0.00';
    case "Page like":
      return formatNumber(data.liked || 0);
    case "Cost per page like":
      return data.liked > 0 ? formatCurrency(data.spend / data.liked) : '$0.00';
    case "Video Started":
      return formatNumber(data.video_play_actions || 0);
    case "3 second video views":
      return formatNumber(data.video_views || 0);
    case "Cost per 3-second view":
      return data.video_views > 0 ? formatCurrency(data.spend / data.video_views) : '$0.00';
    case "Hook rate":
      return data.hook_rate > 0 ? (data.hook_rate * 100).toFixed(2) + '%' : '0%';
    case "Thruplay":
      return formatNumber(data.cost_per_thruplay > 0 ? data.spend / data.cost_per_thruplay : 0);
    case "Cost per thruplay":
      return formatCurrency(data.cost_per_thruplay || 0);
    case "Video hold rate":
      return data.video_view > 0 && data.cost_per_thruplay > 0 ? (((data.spend / data.cost_per_thruplay) / data.video_view) * 100).toFixed(2) + '%' : '0%';
    case "Video 30 second watch":
      return formatNumber(data.video_30_sec_watched_actions || 0);
    case "Cost per video 30 second watch":
      return data.video_30_sec_watched_actions > 0 ? formatCurrency(data.spend / data.video_30_sec_watched_actions) : '$0.00';
    case "# of 25% watched video":
      return formatNumber(data.video_p25_watched_actions || 0);
    case "25% video watch rate":
      return data.video_play_actions > 0 ? ((data.video_p25_watched_actions / data.video_play_actions) * 100).toFixed(2) + '%' : '0%';
    case "# of 50% watched video":
      return formatNumber(data.video_p50_watched_actions || 0);
    case "50% video watch rate":
      return data.video_play_actions > 0 ? ((data.video_p50_watched_actions / data.video_play_actions) * 100).toFixed(2) + '%' : '0%';
    case "# of 75% watched video":
      return formatNumber(data.video_p75_watched_actions || 0);
    case "75% video watch rate":
      return data.video_play_actions > 0 ? ((data.video_p75_watched_actions / data.video_play_actions) * 100).toFixed(2) + '%' : '0%';
    case "# of 95% watched video":
      return formatNumber(data.video_p95_watched_actions || 0);
    case "95% video watch rate":
      return data.video_play_actions > 0 ? ((data.video_p95_watched_actions / data.video_play_actions) * 100).toFixed(2) + '%' : '0%';
    case "# of 100% watched video":
      return formatNumber(data.video_p100_watched_actions || 0);
    case "100% video watch rate":
      return data.video_play_actions > 0 ? ((data.video_p100_watched_actions / data.video_play_actions) * 100).toFixed(2) + '%' : '0%';
    case "# of lead form submissions Total":
      return formatNumber(data.complete_registration || 0);
    case "Cost per lead form submission Total":
      return data.complete_registration > 0 ? formatCurrency(data.spend / data.complete_registration) : '$0.00';
    case "# of lead form submissions First time":
    case "Cost per lead form submission First time":
      return 'N/A';
    case "# of applications Total":
      return formatNumber(adAuditMetrics?.total_applications || 0);
    case "Cost per application Total":
      return formatCurrency(adAuditMetrics?.cost_per_application_total || 0);
    case "# of qualified applications Total":
      return formatNumber(adAuditMetrics?.qualified_applications_total || 0);
    case "Cost per qualified application Total":
      return formatCurrency(adAuditMetrics?.cost_per_qualified_application_total || 0);
    case "# of unqualified applications Total":
      return formatNumber(adAuditMetrics?.unqualified_applications_total || 0);
    case "Cost per unqualified application Total":
      return formatCurrency(adAuditMetrics?.cost_per_unqualified_application_total || 0);
    case "Qualified application % Total":
      return adAuditMetrics?.qualified_application_percent_total > 0 ? (adAuditMetrics.qualified_application_percent_total).toFixed(2) + '%' : '0%';
    case "# of applications First time":
      return formatNumber(adAuditMetrics?.first_time_applications || 0);
    case "Cost per application First time":
      return formatCurrency(adAuditMetrics?.cost_per_application_first_time || 0);
    case "# of qualified applications First time":
      return formatNumber(adAuditMetrics?.qualified_applications_first_time || 0);
    case "Cost per qualified application First time":
      return formatCurrency(adAuditMetrics?.cost_per_qualified_application_first_time || 0);
    case "# of unqualified applications First time":
      return formatNumber(adAuditMetrics?.unqualified_applications_first_time || 0);
    case "Cost per unqualified application First time":
      return formatCurrency(adAuditMetrics?.cost_per_unqualified_application_first_time || 0);
    case "Qualified application % First time":
      return adAuditMetrics?.qualified_application_percent_first_time > 0 ? (adAuditMetrics.qualified_application_percent_first_time).toFixed(2) + '%' : '0%';
    case "# of calls Total":
      return formatNumber(adAuditMetrics?.total_calls || 0);
    case "Cost per call Total":
      return formatCurrency(adAuditMetrics?.cost_per_call_total || 0);
    case "# of qualified calls Total":
      return formatNumber(adAuditMetrics?.qualified_calls_total || 0);
    case "Cost per qualified booked call Total":
      return formatCurrency(adAuditMetrics?.cost_per_qualified_call_total || 0);
    case "# of unqualified calls Total":
      return formatNumber(adAuditMetrics?.unqualified_calls_total || 0);
    case "Cost per unqualified booked call Total":
      return formatCurrency(adAuditMetrics?.cost_per_unqualified_call_total || 0);
    case "# of calls showed Total":
      return formatNumber(adAuditMetrics?.calls_showed_total || 0);
    case "Cost per call that showed Total":
      return formatCurrency(adAuditMetrics?.cost_per_call_showed_total || 0);
    case "% of calls showed Total":
      return adAuditMetrics?.percent_calls_showed_total > 0 ? (adAuditMetrics.percent_calls_showed_total).toFixed(2) + '%' : '0%';
    case "# of confirmed calls Total":
      return formatNumber(adAuditMetrics?.confirmed_calls_total || 0);
    case "Cost per confirmed call Total":
      return formatCurrency(adAuditMetrics?.cost_per_confirmed_call_total || 0);
    case "% of calls confirmed Total":
      return adAuditMetrics?.percent_calls_confirmed_total > 0 ? (adAuditMetrics.percent_calls_confirmed_total).toFixed(2) + '%' : '0%';
    case "# of cancelled calls Total":
      return formatNumber(adAuditMetrics?.cancelled_calls_total || 0);
    case "% of calls that cancelled Total":
      return adAuditMetrics?.percent_calls_cancelled_total > 0 ? (adAuditMetrics.percent_calls_cancelled_total).toFixed(2) + '%' : '0%';
    case "# of calls First time":
      return formatNumber(adAuditMetrics?.first_time_calls || 0);
    case "Cost per call First time":
      return formatCurrency(adAuditMetrics?.cost_per_call_first_time || 0);
    case "# of qualified calls First time":
      return formatNumber(adAuditMetrics?.qualified_calls_first_time || 0);
    case "Cost per qualified booked call First time":
      return formatCurrency(adAuditMetrics?.cost_per_qualified_call_first_time || 0);
    case "# of unqualified calls First time":
      return formatNumber(adAuditMetrics?.unqualified_calls_first_time || 0);
    case "Cost per unqualified booked call First time":
      return formatCurrency(adAuditMetrics?.cost_per_unqualified_call_first_time || 0);
    case "# of calls showed First time":
      return formatNumber(adAuditMetrics?.calls_showed_first_time || 0);
    case "Cost per call that showed First time":
      return formatCurrency(adAuditMetrics?.cost_per_call_showed_first_time || 0);
    case "% of calls showed First time":
      return adAuditMetrics?.percent_calls_showed_first_time > 0 ? (adAuditMetrics.percent_calls_showed_first_time).toFixed(2) + '%' : '0%';
    case "# of confirmed calls First time":
      return formatNumber(adAuditMetrics?.confirmed_calls_first_time || 0);
    case "Cost per confirmed call First time":
      return formatCurrency(adAuditMetrics?.cost_per_confirmed_call_first_time || 0);
    case "% of calls confirmed First time":
      return adAuditMetrics?.percent_calls_confirmed_first_time > 0 ? (adAuditMetrics.percent_calls_confirmed_first_time).toFixed(2) + '%' : '0%';
    case "# of cancelled calls First time":
      return formatNumber(adAuditMetrics?.cancelled_calls_first_time || 0);
    case "% of calls that cancelled First time":
      return adAuditMetrics?.percent_calls_cancelled_first_time > 0 ? (adAuditMetrics.percent_calls_cancelled_first_time).toFixed(2) + '%' : '0%';
    case "# of sets Total":
      return formatNumber(adAuditMetrics?.total_sets || 0);
    case "Cost per set Total":
      return formatCurrency(adAuditMetrics?.cost_per_set_total || 0);
    case "# of outbound sets Total":
      return formatNumber(adAuditMetrics?.outbound_sets_total || 0);
    case "Cost per outbound set Total":
      return formatCurrency(adAuditMetrics?.cost_per_outbound_set_total || 0);
    case "# of inbound sets Total":
      return formatNumber(adAuditMetrics?.inbound_sets_total || 0);
    case "Cost per inbound set Total":
      return formatCurrency(adAuditMetrics?.cost_per_inbound_set_total || 0);
    case "# of shows from sets Total":
      return formatNumber(adAuditMetrics?.shows_from_sets_total || 0);
    case "Cost per show from sets Total":
      return formatCurrency(adAuditMetrics?.cost_per_show_from_sets_total || 0);
    case "Show % from sets Total":
      return adAuditMetrics?.show_percent_from_sets_total > 0 ? (adAuditMetrics.show_percent_from_sets_total).toFixed(2) + '%' : '0%';
    case "# of sets First time":
      return formatNumber(adAuditMetrics?.first_time_sets || 0);
    case "Cost per set First time":
      return formatCurrency(adAuditMetrics?.cost_per_set_first_time || 0);
    case "# of outbound sets First time":
      return formatNumber(adAuditMetrics?.outbound_sets_first_time || 0);
    case "Cost per outbound set First time":
      return formatCurrency(adAuditMetrics?.cost_per_outbound_set_first_time || 0);
    case "# of inbound sets First time":
      return formatNumber(adAuditMetrics?.inbound_sets_first_time || 0);
    case "Cost per inbound set First time":
      return formatCurrency(adAuditMetrics?.cost_per_inbound_set_first_time || 0);
    case "# of shows from sets First time":
      return formatNumber(adAuditMetrics?.shows_from_sets_first_time || 0);
    case "Cost per show from sets First time":
      return formatCurrency(adAuditMetrics?.cost_per_show_from_sets_first_time || 0);
    case "Show % from sets First time":
      return adAuditMetrics?.show_percent_from_sets_first_time > 0 ? (adAuditMetrics.show_percent_from_sets_first_time).toFixed(2) + '%' : '0%';
    case "# of add to carts":
      return formatNumber(metricsData.add_to_cart || 0);
    case "# of offers made":
      return formatNumber(adAuditMetrics?.offers_made_total || 0);
    case "Cost per offer made":
      return formatCurrency(adAuditMetrics?.cost_per_offer_made_total || 0);
    case "# of sales":
      return formatNumber(adAuditMetrics?.sales_total || 0);
    case "# of sales (New)":
      return formatNumber(adAuditMetrics?.sales_new || 0);
    case "Cost per sale":
      return formatCurrency(adAuditMetrics?.cost_per_sale_total || 0);
    case "Cost per sale (New)":
      return formatCurrency(adAuditMetrics?.cost_per_sale_new || 0);
    case "Revenue (New)":
      return formatCurrency(adAuditMetrics?.revenue_new || 0);
    case "Cash Collected":
      return formatCurrency(adAuditMetrics?.cash_collected_total || 0);
    case "Cash Collected (New)":
      return formatCurrency(adAuditMetrics?.cash_collected_new || 0);
    case "AOV":
      return formatCurrency(adAuditMetrics?.aov_total || 0);
    case "AOV (New)":
      return formatCurrency(adAuditMetrics?.aov_new || 0);
    case "CAC (New)":
      return formatCurrency(adAuditMetrics?.cac_new || 0);
    case "ROAS (New)":
      return (adAuditMetrics?.roas_new || 0).toFixed(4) + 'x';
    case "ROAS Cash Collected":
      return (adAuditMetrics?.roas_cash_collected_total || 0).toFixed(4) + 'x';
    case "ROAS Cash Collected (New)":
      return (adAuditMetrics?.roas_cash_collected_new || 0).toFixed(4) + 'x';
    case "Profit Based On Revenue":
      return formatCurrency(adAuditMetrics?.profit_revenue_total || 0);
    case "Profit Based On Cash Collected":
      return formatCurrency(adAuditMetrics?.profit_cash_collected_total || 0);
    case "# of refunds":
      return formatNumber(adAuditMetrics?.refunds_total || 0);
    case "# of refunds (New)":
      return formatNumber(adAuditMetrics?.refunds_new || 0);
    case "Refund Amount":
      return formatCurrency(adAuditMetrics?.refund_amount_total || 0);
    case "Refund Amount (New)":
      return formatCurrency(adAuditMetrics?.refund_amount_new || 0);
    case "Shipping":
      return formatCurrency(adAuditMetrics?.shipping_total || 0);
    case "Shipping (New)":
      return formatCurrency(adAuditMetrics?.shipping_new || 0);
    case "Tax":
      return formatCurrency(adAuditMetrics?.tax_total || 0);
    case "Tax (New)":
      return formatCurrency(adAuditMetrics?.tax_new || 0);
    case "Discounts":
      return formatCurrency(adAuditMetrics?.discounts_total || 0);
    case "Discounts (New)":
      return formatCurrency(adAuditMetrics?.discounts_new || 0);
    case "Visits Total":
      return formatNumber(pageMetrics?.total_visits || 0);
    case "Visits First time":
      return formatNumber(pageMetrics?.first_time_visits || 0);
    case "% New Visits":
      return pageMetrics?.percent_new_visits > 0 ? pageMetrics.percent_new_visits.toFixed(2) + '%' : '0%';
    case "Bot Traffic":
      return formatNumber(pageMetrics?.bot_traffic || 0);
    case "Cost per visit Total":
      return formatCurrency(pageMetrics?.cost_per_visit_total || 0);
    case "Cost per visit First time":
      return formatCurrency(pageMetrics?.cost_per_visit_first_time || 0);
    case "Click Quality (AA)":
      return pageMetrics?.click_quality_aa > 0 ? (pageMetrics.click_quality_aa * 100).toFixed(2) + '%' : '0%';
    case "Average Video View":
      return pageMetrics?.average_video_view >= 0 ? pageMetrics.average_video_view.toFixed(2) + 's' : 'N/A';
    default:
      return 'N/A';
    }
  };

  const getCellValue = (metric: string, row: any) => {
    switch (metric) {
      case "Placement":
        return `${row.publisher_platform || ''} ${row.platform_position || ''}`.trim();
      case "Country":
        return row.region ? `${row.country} - ${row.region}` : row.country;
      case "Age/Gender":
        return row.age && row.gender ? `${row.age} / ${row.gender}` : 'N/A';
      default:
        return getMetricValue(metric, row);
    }
  };

  const getIconForMetric = (metricName: string) => {
    const name = metricName.toLowerCase();
    if (name.includes('spend') || name.includes('cost') || name.includes('revenue')) {
      return <CurrencyDollarIcon className="w-4 h-4 text-green-600" />;
    }
    if (name.includes('click') || name.includes('ctr')) {
      return <CursorArrowRaysIcon className="w-4 h-4 text-blue-600" />;
    }
    if (name.includes('view') || name.includes('impression') || name.includes('reach')) {
      return <EyeIcon className="w-4 h-4 text-purple-600" />;
    }
    return <ArrowTrendingUpIcon className="w-4 h-4 text-gray-600" />;
  };

  const reportedCategory = platform === "Meta" ? "Meta Reported" : "Google Reported";
  const placementInsightsMetrics = selectedMetrics.filter((metric) => isMetricInCategory(reportedCategory, metric) || isMetricInCategory("Ad Audit Conversion", metric) || isMetricInCategory("Page Metrics", metric));
  const countryInsightsMetrics = selectedMetrics.filter((metric) => isMetricInCategory(reportedCategory, metric) || isMetricInCategory("Ad Audit Conversion", metric) || isMetricInCategory("Page Metrics", metric));
  const ageGenderInsightsMetrics = selectedMetrics.filter((metric) => isMetricInCategory(reportedCategory, metric) || isMetricInCategory("Ad Audit Conversion", metric) || isMetricInCategory("Page Metrics", metric));

  const totalPlacementSpend = useMemo(() => {
    return placementData?.length > 0 ? placementData.reduce((sum, item) => sum + (item.spend || 0), 0) : 0;
  }, [placementData]);

  const totalCountrySpend = useMemo(() => {
    return countryData?.length > 0 ? countryData.reduce((sum, item) => sum + (item.spend || 0), 0) : 0;
  }, [countryData]);

  const totalAgeGenderSpend = useMemo(() => {
    return ageGenderData?.length > 0 ? ageGenderData.reduce((sum, item) => sum + (item.spend || 0), 0) : 0;
  }, [ageGenderData]);

  const formatPublisher = (pub: string) => pub ? pub.charAt(0).toUpperCase() + pub.slice(1) : 'Unknown';
  const formatPosition = (pos: string) => {
    if (!pos) return 'Unknown';
    return pos.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const uniquePositions = useMemo(() => {
    return placementData?.length > 0 ? [...new Set(placementData.map((item) => formatPosition(item.platform_position || 'Unknown')))] : [];
  }, [placementData]);

  const positionColors = ['#0eabc9', '#81a4b2', '#46778b', '#09445c', '#045779', '#0e6f97', '#1184b3', '#00d6ff', '#0ea5e9', '#16a0d8'];

  const groupedPlacement: Record<string, Record<string, number>> = useMemo(() => {
    if (!placementData?.length) return {};
    return placementData.reduce((acc, item) => {
      const pub = formatPublisher(item.publisher_platform || 'Unknown');
      const pos = formatPosition(item.platform_position || 'Unknown');
      if (!acc[pub]) {
        acc[pub] = {};
      }
      acc[pub][pos] = (acc[pub][pos] || 0) + (item.spend || 0);
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [placementData]);

  const placementBarData: StackedBarDataItem[] = useMemo(() => {
    if (!placementData?.length) return [];
    return Object.entries(groupedPlacement).map(([pub, posSpends]) => {
      const dataItem: StackedBarDataItem = { name: pub };
      uniquePositions.forEach((pos) => {
        dataItem[pos] = posSpends[pos] || 0;
      });
      return dataItem;
    }).sort((a, b) => {
      const totalA = uniquePositions.reduce((sum, pos) => sum + (a[pos] as number || 0), 0);
      const totalB = uniquePositions.reduce((sum, pos) => sum + (b[pos] as number || 0), 0);
      return totalB - totalA;
    });
  }, [groupedPlacement, uniquePositions]);

  const countryBarData: SingleBarDataItem[] = useMemo(() => {
    if (!countryData?.length) return [];
    return countryData.map((item) => ({
      name: item.country || 'Unknown',
      value: item.spend || 0,
      percentage: totalCountrySpend > 0 ? `${((item.spend || 0) / totalCountrySpend * 100).toFixed(2)}%` : '0%',
      spend: formatCurrency(item.spend || 0),
    })).sort((a, b) => b.value - a.value).slice(0, Math.min(10, countryData.length));
  }, [countryData, totalCountrySpend, formatCurrency]);

  const groupedAgeData: Record<string, { Male: number; Female: number }> = useMemo(() => {
    if (!ageGenderData?.length) return {};
    return ageGenderData.reduce((acc, item) => {
      const age = item.age || 'Unknown';
      const gender = item.gender ? item.gender.toLowerCase() : 'unknown';
      if (!acc[age]) {
        acc[age] = { Male: 0, Female: 0 };
      }
      if (gender === 'male') {
        acc[age].Male = item.spend || 0;
      } else if (gender === 'female') {
        acc[age].Female = item.spend || 0;
      }
      return acc;
    }, {} as Record<string, { Male: number; Female: number }>);
  }, [ageGenderData]);

  const ageGenderBarData = useMemo(() => {
    if (!ageGenderData?.length) return [];
    return Object.entries(groupedAgeData).map(([age, spends]) => ({
      name: age,
      Male: spends.Male,
      Female: spends.Female,
    })).sort((a, b) => {
      const getAgeKey = (ageStr: string) => {
        if (ageStr === 'Unknown') return 1000;
        const match = ageStr.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getAgeKey(a.name) - getAgeKey(b.name);
    });
  }, [groupedAgeData]);

  const customSingleTooltip = (props: CustomTooltipProps) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const data = props.payload[0].payload as SingleBarDataItem;
    return (
      <div className="p-2 bg-white border border-gray-200 rounded shadow">
        <p>{`${data.name}: ${data.percentage} of spend (${data.spend})`}</p>
      </div>
    );
  };

  const customStackedTooltip = (totalSpend: number) => (props: CustomTooltipProps) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const total = props.payload.reduce((sum, p) => sum + (typeof p.value === 'number' ? p.value : 0), 0);
    const percentage = totalSpend > 0 ? ((total / totalSpend) * 100).toFixed(2) + '%' : '0%';
    const spend = formatCurrency(total);
    const name = props.payload[0].payload.name;
    let content = `<p>${name}: ${percentage} (${spend})</p>`;
    props.payload.forEach((p) => {
      if (typeof p.value === 'number' && p.value > 0) {
        const perc = total > 0 ? (p.value / total * 100).toFixed(2) + '%' : '0%';
        content += `<p>${p.name}: ${perc} (${formatCurrency(p.value)})</p>`;
      }
    });
    return (
      <div className="p-2 bg-white border border-gray-200 rounded shadow" dangerouslySetInnerHTML={{ __html: content }} />
    );
  };

  const handleSelectView = (e: React.ChangeEvent<HTMLSelectElement>, setterMetrics: React.Dispatch<React.SetStateAction<string[]>>, setterTemplate: React.Dispatch<React.SetStateAction<string>>) => {
    const selectedName = e.target.value;
    setterTemplate(selectedName);
    if (selectedName === "Default") {
      setterMetrics(defaultMetrics);
      setLocalTemplateId(null);
    } else if (selectedName) {
      const view = savedViews.find((v) => v.name === selectedName);
      if (view) {
        setterMetrics(view.metrics);
        setLocalTemplateId(view.id);
      }
    }
  };

  const fetchSavedViews = useCallback(async () => {
    setIsSavedViewsLoading(true);
    try {
      const { data: json } = await creativeBoardApi.loadMetricsTemplates({
        client_id: clientId,
        account_id: accountId,
        platform: platform.toLowerCase().includes('google') ? 'google' : 'meta',
      });
      if (!json.success) throw new Error(json.message || 'Failed to fetch saved metrics templates');
      setSavedViews((json.templates || []).map((t: any) => ({
        id: t.id,
        name: t.template_name,
        metrics: t.selected_metrics || [],
      })));
    } catch (err) {
      console.error('loadMetricsTemplates error:', err);
    } finally {
      setIsSavedViewsLoading(false);
    }
  }, [accountId, platform]);
  
  const handleSaveView = async (localMetrics: string[]) => {
    const templateName = window.prompt('Enter metrics template name:');
    if (!templateName?.trim()) return;
    try {
      const { data: json } = await creativeBoardApi.saveMetricsTemplate({
        template_name: templateName.trim(),
        client_id: clientId,
        account_id: accountId,
        platform: platform.toLowerCase().includes('google') ? 'google' : 'meta',
        metrics: localMetrics,
      });
      if (!json.success) throw new Error(json.message || 'Failed to save metrics template');
      await fetchSavedViews();
      setLocalTemplate(templateName.trim());
      setLocalTemplateId(json.template.id);
      alert('Metrics template saved successfully!');
    } catch (err) {
      console.error('saveMetricsTemplate error:', err);
      alert('Failed to save metrics template. Please try again.');
    }
  };
  
  const handleUpdateView = async () => {
    if (!localTemplateId || localTemplate === "Default") return;
    try {
      const { data: json } = await creativeBoardApi.updateMetricsTemplate({
        id: localTemplateId,
        client_id: clientId,
        account_id: accountId,
        platform: platform.toLowerCase().includes('google') ? 'google' : 'meta',
        metrics: localMetrics,
      });
      if (!json.success) throw new Error(json.message || 'Failed to update metrics template');
      await fetchSavedViews();
      alert('Metrics template updated successfully!');
    } catch (err) {
      console.error('updateMetricsTemplate error:', err);
      alert('Failed to update metrics template. Please try again.');
    }
  };
  
  function isGroupedMetric(item: Metric | GroupedMetric): item is GroupedMetric {
    return 'header' in item;
  }

  function isMetric(item: Metric | GroupedMetric): item is Metric {
    return 'name' in item;
  }

  useEffect(() => {
    if (isFilterModalOpen) {
      fetchSavedViews();
      setLocalMetrics(selectedMetrics);
      setLocalTemplate(selectedTemplate);
      setLocalTemplateId(selectedTemplate === "Default" ? null : selectedTemplateId);
    }
  }, [isFilterModalOpen, fetchSavedViews, selectedMetrics, selectedTemplate, selectedTemplateId]);

  useEffect(() => {
    if (isFilterModalOpen && savedViews.length > 0 && localTemplate !== "Default" && localTemplateId === null) {
      const view = savedViews.find((v) => v.name === localTemplate);
      if (view) {
        setLocalTemplateId(view.id);
      }
    }
  }, [savedViews, isFilterModalOpen, localTemplate, localTemplateId]);

  // Log data for debugging
  useEffect(() => {
    // console.log('MetricsTab Data:', {
    //   platform,
    //   placementData,
    //   countryData,
    //   ageGenderData,
    // });
  }, [platform, placementData, countryData, ageGenderData]);

  return (
    <div className="light-mode">
      <Card className="bg-white p-4 rounded-lg border border-gray-200 my-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-base text-gray-800">{platform} Metrics</h3>
          <Button size="xs" variant="secondary" onClick={openFilterModal} className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-100 hover:text-blue-800 text-sm py-1 px-2 rounded font-semibold">
            Customize Table
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Overview of key performance metrics for the campaign.</p>
        {isMetricsLoading || isConversionsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading metrics...</p>
          </div>
        ) : metricsError || conversionsError ? (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {metricsError ? `Error loading metrics: ${metricsError}` : `Error loading conversions: ${conversionsError}`}
          </div>
        ) : metrics || (conversions && conversions.length > 0) ? (
          <Grid numItemsMd={3} numItemsLg={1} className="gap-6">
            {displayGroups.map((group, index) => (
              <Col key={index}>
                <Card className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <Text className="text-base font-semibold text-gray-800 mb-0">{group.title}</Text>
                  </div>
                  {(group.title === "Visitor & Traffic Metrics" || group.title === "Cost & Quality Metrics") && isPageMetricsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading page metrics...</p>
                    </div>
                  ) : (group.title === "Visitor & Traffic Metrics" || group.title === "Cost & Quality Metrics") && pageMetricsError ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded">Error loading page metrics: {pageMetricsError}</div>
                  ) : (group.title === "Lead Form Submissions" || group.title === "Applications" || group.title === "Booked Call" || group.title === "Sets" || group.title === "Add To Cart" || group.title === "Offers Made" || group.title === "Sales") && isAdAuditLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading ad audit metrics...</p>
                    </div>
                  ) : (group.title === "Lead Form Submissions" || group.title === "Applications" || group.title === "Booked Call" || group.title === "Sets" || group.title === "Add To Cart" || group.title === "Offers Made" || group.title === "Sales") && adAuditError ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded">Error loading ad audit metrics: {adAuditError}</div>
                  ) : (
                    <div className="flex flex-wrap -mx-2">
                      {group.metrics.map((metric, index) => (
                        <div className="w-full md:w-1/3 px-2 mb-2" key={index}>
                          <div className="flex justify-between items-center p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getIconForMetric(metric)}
                              <span className="text-sm font-medium text-gray-900 truncate">{metric}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{getMetricValue(metric, metrics)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">No metrics or conversions available</div>
        )}
      </Card>

      <Card className="bg-white p-4 rounded-lg border border-gray-200 my-4 shadow-sm">
        <h3 className="font-semibold text-base text-gray-800 mb-3">Breakdown Analysis</h3>
        <p className="text-sm text-gray-500 mb-4">Detailed breakdown of campaign performance by different dimensions.</p>
        <TabGroup onIndexChange={(index) => setActiveBreakdownTab(platform === "Meta" ? ['Placement', 'Age/Gender', 'Country/Region'][index] : 'Country/Region')}>
        <TabList className="mb-4">
          {([
            platform === "Meta" && (
              <Tab key="placement" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 ui-selected:text-blue-600 ui-selected:border-b-2 ui-selected:border-blue-600">
                Placement
              </Tab>
            ),
            platform === "Meta" && (
              <Tab key="age-gender" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 ui-selected:text-blue-600 ui-selected:border-b-2 ui-selected:border-blue-600">
                Age/Gender
              </Tab>
            ),
            <Tab key="country" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 ui-selected:text-blue-600 ui-selected:border-b-2 ui-selected:border-blue-600">
              Country/Region
            </Tab>
          ].filter(Boolean) as React.ReactElement[])}
        </TabList>
          <TabPanels>
            {platform === "Meta" && (
              <TabPanel>
                {isPlacementLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading placement metrics...</p>
                  </div>
                ) : placementError ? (
                  <div className="p-4 bg-red-100 text-red-700 rounded">Error loading placement metrics: {placementError}</div>
                ) : placementData.length > 0 ? (
                  <>
                    <Card className="mt-4 mb-6">
                      <h3 className="font-semibold text-base text-gray-800 mb-3">Placement Spend Distribution</h3>
                      <BarChart
                        data={placementBarData}
                        index="name"
                        categories={uniquePositions}
                        colors={positionColors.slice(0, uniquePositions.length)}
                        stack={true}
                        valueFormatter={(value: number) => formatCurrency(value)}
                        customTooltip={customStackedTooltip(totalPlacementSpend)}
                        rotateLabelX={{ angle: 0, verticalShift: 10, xAxisHeight: 80 }}
                        showGridLines={true}
                        className="px-2 custom-placement-chart"
                        yAxisWidth={70}
                        
                      />
                    </Card>
                    {placementInsightsMetrics.length > 0 ? (
                      <Table className="text-xs">
                        <TableHead>
                          <TableRow className="py-0.5">
                            <TableHeaderCell className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">Placement</TableHeaderCell>
                            {placementInsightsMetrics.map((metric) => (
                              <TableHeaderCell key={metric} className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">{metric}</TableHeaderCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {placementData.map((row: any, index: number) => (
                            <TableRow key={index} className="py-0.5">
                              <TableCell className="p-2 text-xs text-gray-600">{getCellValue("Placement", row)}</TableCell>
                              {placementInsightsMetrics.map((metric) => (
                                <TableCell key={metric} className="p-2 text-xs text-gray-600">{getMetricValue(metric, row)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">No placement metrics selected</div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">No placement data available</div>
                )}
              </TabPanel>
            )}
            {platform === "Meta" && (
              <TabPanel>
                {isAgeGenderLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading age/gender metrics...</p>
                  </div>
                ) : ageGenderError ? (
                  <div className="p-4 bg-red-100 text-red-700 rounded">Error loading age/gender metrics: {ageGenderError}</div>
                ) : ageGenderData.length > 0 ? (
                  <>
                    <Card className="mt-4 mb-6">
                      <h3 className="font-semibold text-base text-gray-800 mb-3">Age/Gender Spend Distribution</h3>
                      <BarChart
                        data={ageGenderBarData}
                        index="name"
                        categories={["Male", "Female"]}
                        colors={["blue", "pink"]}
                        stack={true}
                        valueFormatter={(value: number) => formatCurrency(value)}
                        customTooltip={customStackedTooltip(totalAgeGenderSpend)}
                        showGridLines={true}
                        className="px-2"
                        yAxisWidth={80}
                      />
                    </Card>
                    {ageGenderInsightsMetrics.length > 0 ? (
                      <Table className="text-xs">
                        <TableHead>
                          <TableRow className="py-0.5">
                            <TableHeaderCell className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">Age/Gender</TableHeaderCell>
                            {ageGenderInsightsMetrics.map((metric) => (
                              <TableHeaderCell key={metric} className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">{metric}</TableHeaderCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ageGenderData.map((row: any, index: number) => (
                            <TableRow key={index} className="py-0.5">
                              <TableCell className="p-2 text-xs text-gray-600">{getCellValue("Age/Gender", row)}</TableCell>
                              {ageGenderInsightsMetrics.map((metric) => (
                                <TableCell key={metric} className="p-2 text-xs text-gray-600">{getMetricValue(metric, row)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">No age/gender metrics selected</div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">No age/gender data available</div>
                )}
              </TabPanel>
            )}
            <TabPanel>
              {isCountryLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading country metrics...</p>
                </div>
              ) : countryError ? (
                <div className="p-4 bg-red-100 text-red-700 rounded">Error loading country metrics: {countryError}</div>
              ) : countryData.length > 0 ? (
                <>
                  <Card className="mt-4 mb-6">
                    <h3 className="font-semibold text-base text-gray-800 mb-3">Country Spend Distribution</h3>
                    <BarChart
                      data={countryBarData}
                      index="name"
                      categories={["value"]}
                      colors={["blue"]}
                      valueFormatter={(value: number) => formatCurrency(value)}
                      customTooltip={customSingleTooltip}
                      rotateLabelX={{ angle: 0, verticalShift: 10, xAxisHeight: 80 }}
                      showGridLines={true}
                      yAxisWidth={60}
                    />
                  </Card>
                  {countryInsightsMetrics.length > 0 ? (
                    <Table className="text-xs">
                      <TableHead>
                        <TableRow className="py-0.5">
                          <TableHeaderCell className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">Country</TableHeaderCell>
                          {countryInsightsMetrics.map((metric) => (
                            <TableHeaderCell key={metric} className="px-2 py-3 text-xs font-bold text-gray-700 border-b border-gray-300">{metric}</TableHeaderCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {countryData.map((row: any, index: number) => (
                          <TableRow key={index} className="py-0.5">
                            <TableCell className="p-2 text-xs text-gray-600">{getCellValue("Country", row)}</TableCell>
                            {countryInsightsMetrics.map((metric) => (
                              <TableCell key={metric} className="p-2 text-xs text-gray-600">{getMetricValue(metric, row)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">No country metrics selected</div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">No country data available</div>
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Card>

      <Transition appear show={isFilterModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeFilterModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                  <div className="relative">
                    {isSavedViewsLoading && (
                      <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-50">
                        <div className="text-gray-600">Loading...</div>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                      <h2 className="text-base leading-6 text-gray-800">Customize Table</h2>
                      <select
                        value={localTemplate}
                        onChange={(e) => handleSelectView(e, setLocalMetrics, setLocalTemplate)}
                        className="px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-40"
                      >
                        <option value="Default">Default</option>
                        {savedViews.map((view) => (
                          <option key={view.name} value={view.name}>
                            {view.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap -mx-4">
                      <div className="w-full md:w-1/4 px-4 border-r border-gray-100 pr-4 h-[400px]">
                        <h4 className="text-sm text-gray-700 mb-3">CATEGORY</h4>
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2">
                          {categories.map((category) => {
                            let description = '';
                            return (
                              <Fragment key={category.name}>
                                {category.metrics.some((item) => 'header' in item) ? (
                                  <details open={openCategory === category.name}>
                                    <summary
                                      className={`flex justify-between items-center px-2 rounded-md text-sm py-1 hover:text-indigo-600 ${selectedCategory === category.name ? 'bg-blue-100 text-indigo-900' : 'text-gray-700'} cursor-pointer`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const newOpen = openCategory === category.name ? null : category.name;
                                        setOpenCategory(newOpen);
                                        setSelectedCategory(category.name);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span>{category.name}</span>
                                        {description && <span className="text-xs text-gray-500">{description}</span>}
                                      </div>
                                      <span className={`arrow transition-transform duration-200 ${openCategory === category.name ? 'rotate-90' : ''}`}>›</span>
                                    </summary>
                                    <div className="ml-4 space-y-1 mt-2">
                                      {category.metrics.filter((item) => 'header' in item).map((item) => (
                                        <p key={(item as GroupedMetric).header} className="text-sm text-gray-600 py-0.5">
                                          {(item as GroupedMetric).header}
                                        </p>
                                      ))}
                                    </div>
                                  </details>
                                ) : (
                                  <div
                                    className={`px-2 rounded-md text-sm py-1 cursor-pointer hover:text-indigo-600 ${selectedCategory === category.name ? 'bg-blue-100 text-indigo-900' : 'text-gray-700'}`}
                                    onClick={() => {
                                      setOpenCategory(null);
                                      setSelectedCategory(category.name);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span>{category.name}</span>
                                      {description && <span className="text-xs text-gray-500">{description}</span>}
                                    </div>
                                  </div>
                                )}
                              </Fragment>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 px-4 h-[400px]">
                        <h4 className="text-sm text-gray-700 mb-3">METRICS</h4>
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-full px-2 p-1 mb-3 border border-gray-100 rounded-md focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                        />
                        <div className="max-h-[340px] overflow-y-auto pr-2">
                          {selectedCategory === "All" ? (
                            categories.filter((c) => c.name !== "All").map((category) => (
                              <div key={category.name} className="mt-1">
                                <h4 className="text-sm font-semibold text-gray-800 text-center py-2 rounded-md bg-gray-100">{category.name}</h4>
                                <div className="space-y-2 mt-2 mb-4">
                                  {category.metrics.map((item) => (
                                    <div key={isGroupedMetric(item) ? item.header : (isMetric(item) ? item.name : 'unknown')}>
                                      {isGroupedMetric(item) ? (
                                        <>
                                          <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 mt-3">{item.header}</h3>
                                          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            {item.metrics.map((subMetric) => (
                                              <div
                                                key={subMetric.name}
                                                className={`space-y-2 ${['Video Started', 'Hook rate', 'Video hold rate'].includes(subMetric.name) ? 'col-span-2' : ''}`}
                                              >
                                                <div className="flex items-center space-x-2">
                                                  <input
                                                    type="checkbox"
                                                    id={subMetric.name}
                                                    checked={subMetric.subs ? subMetric.subs.every((sub) => localMetrics.includes(subMetric.name + " " + sub)) : localMetrics.includes(subMetric.name)}
                                                    onChange={() => {
                                                      if (subMetric.subs) {
                                                        const allSelected = subMetric.subs.every((sub) => localMetrics.includes(subMetric.name + " " + sub));
                                                        if (allSelected) {
                                                          setLocalMetrics((prev) => prev.filter((m) => !subMetric.subs!.includes(m.replace(subMetric.name + " ", ""))));
                                                        } else {
                                                          const newSubs = subMetric.subs.filter((sub) => !localMetrics.includes(subMetric.name + " " + sub)).map((sub) => subMetric.name + " " + sub);
                                                          setLocalMetrics((prev) => [...prev, ...newSubs]);
                                                        }
                                                      } else {
                                                        handleMetricToggle(subMetric.name, setLocalMetrics);
                                                      }
                                                    }}
                                                    className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                                  />
                                                  <label htmlFor={subMetric.name} className="text-sm font-medium text-gray-900">
                                                    {subMetric.name}
                                                  </label>
                                                </div>
                                                {subMetric.subs && (
                                                  <div className="flex items-center space-x-6 ml-6">
                                                    {subMetric.subs.map((sub) => (
                                                      <div key={sub} className="flex items-center space-x-2">
                                                        <input
                                                          type="checkbox"
                                                          id={subMetric.name + " " + sub}
                                                          checked={localMetrics.includes(subMetric.name + " " + sub)}
                                                          onChange={() => handleMetricToggle(subMetric.name + " " + sub, setLocalMetrics)}
                                                          className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                                        />
                                                        <label htmlFor={subMetric.name + " " + sub} className="text-sm text-gray-600">
                                                          {sub}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </>
                                      ) : isMetric(item) ? (
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id={item.name}
                                            checked={item.subs ? item.subs.every((sub) => localMetrics.includes(item.name + " " + sub)) : localMetrics.includes(item.name)}
                                            onChange={() => {
                                              if (item.subs) {
                                                const allSelected = item.subs.every((sub) => localMetrics.includes(item.name + " " + sub));
                                                if (allSelected) {
                                                  setLocalMetrics((prev) => prev.filter((m) => !item.subs!.includes(m.replace(item.name + " ", ""))));
                                                } else {
                                                  const newSubs = item.subs.filter((sub) => !localMetrics.includes(item.name + " " + sub)).map((sub) => item.name + " " + sub);
                                                  setLocalMetrics((prev) => [...prev, ...newSubs]);
                                                }
                                              } else {
                                                handleMetricToggle(item.name, setLocalMetrics);
                                              }
                                            }}
                                            className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                          />
                                          <label htmlFor={item.name} className="text-sm font-medium text-gray-900">
                                            {item.name}
                                          </label>
                                        </div>
                                      ) : null}
                                      {isMetric(item) && item.subs && (
                                        <div className="flex items-center space-x-6 ml-6 mt-2">
                                          {item.subs.map((sub) => (
                                            <div key={sub} className="flex items-center space-x-2">
                                              <input
                                                type="checkbox"
                                                id={item.name + " " + sub}
                                                checked={localMetrics.includes(item.name + " " + sub)}
                                                onChange={() => handleMetricToggle(item.name + " " + sub, setLocalMetrics)}
                                                className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                              />
                                              <label htmlFor={item.name + " " + sub} className="text-sm text-gray-600">
                                                {sub}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            currentMetrics.map((item) => (
                              <div key={isGroupedMetric(item) ? item.header : (isMetric(item) ? item.name : 'unknown')}>
                                {isGroupedMetric(item) ? (
                                  <>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 mt-3">{item.header}</h3>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                      {item.metrics.map((subMetric) => (
                                        <div
                                          key={subMetric.name}
                                          className={`space-y-2 ${['Video Started', 'Hook rate', 'Video hold rate'].includes(subMetric.name) ? 'col-span-2' : ''}`}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={subMetric.name}
                                              checked={subMetric.subs ? subMetric.subs.every((sub) => localMetrics.includes(subMetric.name + " " + sub)) : localMetrics.includes(subMetric.name)}
                                              onChange={() => {
                                                if (subMetric.subs) {
                                                  const allSelected = subMetric.subs.every((sub) => localMetrics.includes(subMetric.name + " " + sub));
                                                  if (allSelected) {
                                                    setLocalMetrics((prev) => prev.filter((m) => !subMetric.subs!.includes(m.replace(subMetric.name + " ", ""))));
                                                  } else {
                                                    const newSubs = subMetric.subs.filter((sub) => !localMetrics.includes(subMetric.name + " " + sub)).map((sub) => subMetric.name + " " + sub);
                                                    setLocalMetrics((prev) => [...prev, ...newSubs]);
                                                  }
                                                } else {
                                                  handleMetricToggle(subMetric.name, setLocalMetrics);
                                                }
                                              }}
                                              className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                            />
                                            <label htmlFor={subMetric.name} className="text-sm font-medium text-gray-900">
                                              {subMetric.name}
                                            </label>
                                          </div>
                                          {subMetric.subs && (
                                            <div className="flex items-center space-x-6 ml-6">
                                              {subMetric.subs.map((sub) => (
                                                <div key={sub} className="flex items-center space-x-2">
                                                  <input
                                                    type="checkbox"
                                                    id={subMetric.name + " " + sub}
                                                    checked={localMetrics.includes(subMetric.name + " " + sub)}
                                                    onChange={() => handleMetricToggle(subMetric.name + " " + sub, setLocalMetrics)}
                                                    className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                                  />
                                                  <label htmlFor={subMetric.name + " " + sub} className="text-sm text-gray-600">
                                                    {sub}
                                                  </label>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                ) : isMetric(item) ? (
                                  <div className="mt-1">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={item.name}
                                        checked={item.subs ? item.subs.every((sub) => localMetrics.includes(item.name + " " + sub)) : localMetrics.includes(item.name)}
                                        onChange={() => {
                                          if (item.subs) {
                                            const allSelected = item.subs.every((sub) => localMetrics.includes(item.name + " " + sub));
                                            if (allSelected) {
                                              setLocalMetrics((prev) => prev.filter((m) => !item.subs!.includes(m.replace(item.name + " ", ""))));
                                            } else {
                                              const newSubs = item.subs.filter((sub) => !localMetrics.includes(item.name + " " + sub)).map((sub) => item.name + " " + sub);
                                              setLocalMetrics((prev) => [...prev, ...newSubs]);
                                            }
                                          } else {
                                            handleMetricToggle(item.name, setLocalMetrics);
                                          }
                                        }}
                                        className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                      />
                                      <label htmlFor={item.name} className="text-sm font-medium text-gray-900">
                                        {item.name}
                                      </label>
                                    </div>
                                    {item.subs && (
                                      <div className="flex items-center space-x-6 ml-6 mt-2">
                                        {item.subs.map((sub) => (
                                          <div key={sub} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={item.name + " " + sub}
                                              checked={localMetrics.includes(item.name + " " + sub)}
                                              onChange={() => handleMetricToggle(item.name + " " + sub, setLocalMetrics)}
                                              className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded bg-white"
                                            />
                                            <label htmlFor={item.name + " " + sub} className="text-sm text-gray-600">
                                              {sub}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-1/4 px-4 h-[400px]">
                        <h4 className="text-sm text-gray-700 mb-3">COLUMN ORDER</h4>
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-gray-500">({localMetrics.length}/50 Selected metrics)</span>
                          <button className="text-red-600 hover:underline" onClick={() => setLocalMetrics([])}>
                            Delete all
                          </button>
                        </div>
                        <DragDropContext onDragEnd={(result) => handleDragEnd(result, setLocalMetrics)}>
                          <StrictModeDroppable droppableId="selectedMetrics" renderClone={(provided, snapshot, rubric) => renderClone(provided, snapshot, rubric, localMetrics, setLocalMetrics)}>
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 max-h-[340px] overflow-y-auto pr-2"
                              >
                                {localMetrics.map((metric, index) => (
                                  <Draggable key={metric} draggableId={metric} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                                      >
                                        <div className="flex items-center">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="flex space-x-0.5 mr-3 cursor-move"
                                          >
                                            <div className="flex flex-col space-y-0.5">
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                            </div>
                                            <div className="flex flex-col space-y-0.5">
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                                            </div>
                                          </div>
                                          <span className="text-sm text-gray-700">{metric}</span>
                                        </div>
                                        <button
                                          onClick={() => handleMetricToggle(metric, setLocalMetrics)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          x
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </StrictModeDroppable>
                        </DragDropContext>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <div className="space-x-3">
                        <button
                          type="button"
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                          onClick={() => handleSaveView(localMetrics)}
                        >
                          Save View
                        </button>
                        {localTemplate !== "Default" && localTemplateId && (
                          <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                            onClick={handleUpdateView}
                          >
                            Update View
                        </button>
                        )}
                      </div>
                      <div className="space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          onClick={closeFilterModal}
                        >
                          Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            onClick={() => {
                              setSelectedMetrics(localMetrics);
                              setSelectedTemplate(localTemplate);
                              setSelectedTemplateId(localTemplateId);
                              onApplyMetrics(localMetrics);
                              
                              // Add these refetch triggers
                              setHasPageMetricsFetched(false);
                              setHasAdAuditFetched(false);
                              setHasPlacementFetched(false);
                              setHasCountryFetched(false);
                              setHasAgeGenderFetched(false);
                              refetchConversions?.(); // Trigger conversions refetch in parent

                              closeFilterModal();
                            }}
                          >
                          Apply
                        </button>
                      </div>
                    </div>
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

export default MetricsTab;
