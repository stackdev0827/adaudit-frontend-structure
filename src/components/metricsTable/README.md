# Metrics Table Component

This component creates a comprehensive table for displaying campaign metrics data based on the API response structure you provided.

## Files Created

1. **`MetricsTable.tsx`** - Main table component with expand/collapse functionality for campaigns and adsets
2. **`MetricsTableRow.tsx`** - Individual row component for each campaign with click-to-expand
3. **`MetricsAdsetRow.tsx`** - Individual row component for each adset with click-to-expand for ads
4. **`MetricsAdRow.tsx`** - Individual row component for each ad
5. **`MetricsTableDemo.tsx`** - Demo component with sample data and simulated adsets/ads
6. **`../types/metrics.ts`** - TypeScript types for the metrics data including adsets and ads
7. **`../pages/MetricsTablePage.tsx`** - Full page component that fetches real data

## Table Structure

### Static Fields (Left columns)

- Campaign
- totalSpend
- Budget
- Creatives
- Notes
- dateLaunched
- Audience
- Days

### Timeframes (Column groups)

- Yesterday
- 2 Days Ago
- Last 4 Days
- Last 7 Days
- Last 14 Days
- Last 30 Days
- Total

### Event & Metrics (Sub-columns for each timeframe)

- Sales
- Rev (Revenue)
- Cash (Cash Collected)
- ROAS Rev
- ROAS Cash
- newLeads
- totalLeads
- totalApplications
- Q Apps (Qualified Applications)
- unqualifiedApplications
- totalCalls
- qualifiedCalls
- unqualifiedCalls
- confirmedCalls
- callsShowed
- liveCalls
- totalCallsWithSalesRep\*
- qualifiedCallsWithSalesRep\*
- unqualifiedCallsWithSalesRep\*
- confirmedCallsWithSalesRep\*
- callsShowedWithSalesRep\*
- liveCallsWithSalesRep\*
- totalCallsWithSetter\*
- qualifiedCallsWithSetter\*
- unqualifiedCallsWithSetter\*
- confirmedCallsWithSetter\*
- callsShowedWithSetter\*
- liveCallsWithSetter\*
- totalSets
- outboundSets
- inboundSets
- setsNewOpportunity
- qualifiedSalesRepOpportunity
- totalQualifiedOpportunity
- newQualifiedOpportunity
- totalOffersMade
- totalAddToCart
- totalCustomEvents\*
- clicks (Meta link clicks)
- ctr (Meta CTR)
- costPerClick (Meta CPC)
- linkClicks (Meta link clicks)
- linkCtr (Meta CTR)
- costPerLinkClick (Meta CPLC)
- impressions (Meta impressions)
- cpm (Meta CPM)
- reach (Meta reach)
- videoWatchPercent (Meta video watch)
- thumbScrollStopRate\*
- clickQuality (Meta click quality)
- googleClicks
- googleCtr
- googleCostPerClick
- googleImpressions
- googleReach
- googleVideoWatchPercent

_Note: Fields marked with _ are not available in the current API response and show "-"

## Usage

### Using the Demo Component

```tsx
import MetricsTableDemo from "./components/metricsTable/MetricsTableDemo";

// In your component
<MetricsTableDemo />;
```

### Using with Real Data

```tsx
import MetricsTable from "./components/metricsTable/MetricsTable";
import { CampaignMetrics } from "./types/metrics";

const YourComponent = () => {
	const [metricsData, setMetricsData] = useState<CampaignMetrics[]>([]);

	// Fetch data using metricsApi.all()
	useEffect(() => {
		const fetchData = async () => {
			const response = await metricsApi.all(timeframes);
			setMetricsData(response.data.data);
		};
		fetchData();
	}, []);

	return <MetricsTable data={metricsData} />;
};
```

### Using the Full Page Component

Navigate to `/metrics-table` in your application to see the full page with data fetching.

## Routes Added

- `/metrics-table` - Full page with real API data
- `/metrics-demo` - Demo page with sample data

## Features

- **3-Level Hierarchy**: Campaigns → Adsets → Ads with full expand/collapse functionality
- **Expandable Campaigns**: Click on campaign names to expand and view adsets
- **Expandable Adsets**: Click on adset names to expand and view ads
- **Sticky Campaign Column**: The campaign name column stays fixed when scrolling horizontally
- **Responsive Design**: Horizontal scroll for large tables
- **Proper Data Mapping**: Maps API response fields to table columns
- **Error Handling**: Shows loading states and error messages
- **TypeScript Support**: Full type safety with defined interfaces
- **Loading Indicators**: Shows spinner when fetching adsets/ads data
- **Visual Hierarchy**: Different styling and icons for campaigns (📁/📂), adsets (blue), and ads (green with 🎯)

## API Integration

The component expects data from `metricsApi.all()` which should return:

```typescript
{
  status: "success",
  data: CampaignMetrics[]
}
```

Where `CampaignMetrics` follows the structure defined in `types/metrics.ts`.

### Adsets Data (Static)

When a campaign is clicked to expand, the component generates static sample adsets data based on the campaign's metrics. This simulates the API behavior without requiring a backend implementation.

**Static Adsets Generated:**

- **Adset 1**: "Campaign Name - Lookalike Audience" (60% of campaign metrics)
- **Adset 2**: "Campaign Name - Interest Targeting" (40% of campaign metrics)

Each adset includes:

- Static metrics (budget, audience, spend, etc.)
- All timeframe metrics proportionally distributed
- Realistic adset names and descriptions

### Ads Data (Static)

When an adset is clicked to expand, the component generates static sample ads data based on the adset's metrics.

**Static Ads Generated:**

- **Ad 1**: "Adset Name - Creative A" (50% of adset metrics) - "High performing video creative"
- **Ad 2**: "Adset Name - Creative B" (30% of adset metrics) - "Image carousel creative"
- **Ad 3**: "Adset Name - Creative C" (20% of adset metrics) - "Single image creative"

Each ad includes:

- Static metrics proportionally distributed from adset
- All timeframe metrics with realistic performance splits
- Creative type descriptions and performance notes

**Future API Integration:**
The component is designed to easily switch to real API calls. The expected API endpoint would be: `POST /admin/metrics/adsets`

**Request payload:**

```typescript
{
  campaign_id: string,
  yesterday: boolean,
  last_2_days: boolean,
  last_4_days: boolean,
  last_7_days: boolean,
  last_14_days: boolean,
  last_30_days: boolean,
  total: boolean
}
```

## Styling

The table uses Tailwind CSS classes and follows the existing design patterns in your application. The table includes:

- Border styling for clear cell separation
- Sticky positioning for the campaign column
- Color coding for different sections (static fields, timeframes)
- Responsive text sizing
- Hover effects and proper spacing

## Data Mapping Notes

Some requested metrics are mapped to available API fields:

- Sales Rep vs Setter calls: API doesn't distinguish, so same data is used
- Custom events: Not available in API, shows "-"
- Thumb scroll stop rate: Not available in API, shows "-"
- Link CTR: Uses same as CTR since API doesn't provide separate link CTR

The component is designed to be easily extensible when additional API fields become available.
