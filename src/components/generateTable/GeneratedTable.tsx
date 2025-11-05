import CampaignRow from "./CampaignRow";
import GoogleCampaignRow from "./GoogleCampaignRow";

interface EventType {
	name: string;
	metrics: string[];
}

interface TableDataType {
	staticFields: string[];
	timeFrames?: string[];
	events: EventType[];
}

interface CampaignType {
	campaign_id?: { String?: string } | string;
	// add other campaign fields as needed
}

interface GeneratedTableProps {
	tableData: TableDataType;
	metricsResult: any;
	allCampaigns: CampaignType[];
	googleCampaigns: CampaignType[];
	openCampaigns: any;
	openAdSets: any;
	onToggleCampaign: (id: string) => void;
	onToggleAdSet: (id: string) => void;
}

const GeneratedTable: React.FC<GeneratedTableProps> = ({
	tableData,
	metricsResult,
	allCampaigns = [],
	googleCampaigns = [],
	openCampaigns,
	openAdSets,
	onToggleCampaign,
	onToggleAdSet,
}) => (
	<div className="overflow-x-auto">
		<table className="min-w-full border-separate border-spacing-0 text-xs mb-8 rounded-lg overflow-hidden">
			<thead>
				<tr>
					{tableData.staticFields.map((field: string) => (
						<th
							key={field}
							rowSpan={2}
							className="border border-gray-200 px-3 py-2 bg-gray-100 font-semibold text-center align-middle"
							style={{
								position: field === "Campaign Name" ? "sticky" : undefined,
								left: field === "Campaign Name" ? 0 : undefined,
								zIndex: field === "Campaign Name" ? 2 : undefined,
								background: "#f3f4f6",
							}}
						>
							{field}
						</th>
					))}
					{tableData.timeFrames &&
						tableData.timeFrames.map((tf: string) => (
							<th
								key={tf}
								colSpan={
									tableData.events
										? tableData.events.reduce(
												(acc: number, event: any) => acc + event.metrics.length,
												0
										  )
										: 0
								}
								className="border border-gray-200 px-3 py-2 bg-gray-100 font-semibold text-center"
							>
								{tf}
							</th>
						))}
				</tr>
				<tr>
					{tableData.timeFrames &&
						tableData.timeFrames.map((tf: string) =>
							tableData.events.map((event: any) =>
								event.metrics.map((metric: string) => (
									<th
										key={tf + event.name + metric}
										className="border border-gray-200 px-3 py-2 bg-gray-100 font-semibold text-center"
									>
										{event.name} - {metric}
									</th>
								))
							)
						)}
				</tr>
			</thead>
			<tbody>
				{allCampaigns.map((campaign: any) => (
					<CampaignRow
						key={campaign.campaign_id?.String || campaign.campaign_id}
						campaign={campaign}
						tableData={tableData}
						metricsResult={metricsResult}
						openCampaigns={openCampaigns}
						openAdSets={openAdSets}
						onToggleCampaign={onToggleCampaign}
						onToggleAdSet={onToggleAdSet}
					/>
				))}
				{googleCampaigns.map((campaign: any) => (
					<GoogleCampaignRow
						key={campaign.campaign_id?.String || campaign.campaign_id}
						campaign={campaign}
						tableData={tableData}
						metricsResult={metricsResult}
						openCampaigns={openCampaigns}
						openAdSets={openAdSets}
						onToggleCampaign={onToggleCampaign}
						onToggleAdSet={onToggleAdSet}
					/>
				))}
			</tbody>
		</table>
	</div>
);

export default GeneratedTable;
