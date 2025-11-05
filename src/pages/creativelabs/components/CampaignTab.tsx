import React from "react";
import {
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Grid,
  Col,
  Button,
} from "@tremor/react";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  status: string;
  servingStatus: string | null;
  startDate: string;
  objective: string;
  platform: string;
  accountId: string;
}

interface Props {
  campaigns: Campaign[];
  viewMode: "table" | "grid";
  getStatusColor: (status: string) => string;
}

const PlatformLogo = ({ platform }: { platform: string }) => {
  if (platform === 'Meta') return <div className="platform-logo facebook-logo"><span className="logo-text">f</span></div>;
  if (platform === 'Google Ads') return <div className="platform-logo google-logo"><span className="logo-text">G</span></div>;
  return <div className="platform-logo generic-logo"><span className="logo-text">?</span></div>;
};

const CampaignTab: React.FC<Props> = ({
  campaigns,
  viewMode,
  getStatusColor,
}) => {
  const navigate = useNavigate();
  const handleClick = (id: string, platform: string, accountId: string) => {
    navigate(`/creative-lab/campaign/${id}`, { state: { platform, accountId } });
  };

  return viewMode === "table" ? (
    <Card className="table-card py-2 px-0">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="table-header">Ad Account ID</TableHeaderCell>
            <TableHeaderCell className="table-header">Name</TableHeaderCell>
            <TableHeaderCell className="table-header"> Status</TableHeaderCell>
            <TableHeaderCell className="table-header">Platform</TableHeaderCell>
            <TableHeaderCell className="table-header">Start Date</TableHeaderCell>
            <TableHeaderCell className="table-header">Objective</TableHeaderCell>
            <TableHeaderCell className="table-header">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign) => {
            const platformName = campaign.platform === 'meta' ? 'Meta' : 'Google Ads';
            return (
              <TableRow
                key={campaign.id}
                className="table-row cursor-pointer transition"
                onClick={() => handleClick(campaign.id, campaign.platform, campaign.accountId)}
              >
                <TableCell className="table-cell font-medium py-3 text-xs">{campaign.accountId}</TableCell>
                <TableCell className="table-cell py-3">
                  <div className="max-w-[280px] truncate text-xs" title={campaign.name}>
                    {campaign.name}
                  </div>
                  <div className="text-xs text-gray-500  text-xs">ID: {campaign.id}</div>
                </TableCell>
                <TableCell className="table-cell py-3 text-xs">
                  <Badge color={getStatusColor(campaign.status)} size="xs">
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="table-cell py-3 text-xs">
                  <div className="flex items-center gap-2">
                    <PlatformLogo platform={platformName} />
                    {platformName}
                  </div>
                </TableCell>
                <TableCell className="table-cell py-3 text-xs">{campaign.startDate}</TableCell>
                <TableCell className="table-cell py-3 text-xs">{campaign.objective}</TableCell>
                <TableCell className="table-cell py-3 text-xs">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={(e) => { e.stopPropagation(); handleClick(campaign.id, campaign.platform, campaign.accountId); }}
                  >
                    <span className="!text-xs">See Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  ) : (
    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
      {campaigns.map((campaign) => {
        const platformName = campaign.platform === 'meta' ? 'Meta' : 'Google Ads';
        return (
          <Col key={campaign.id}>
            <Card
              className="grid-card cursor-pointer hover:shadow-lg transition"
              onClick={() => handleClick(campaign.id, campaign.platform, campaign.accountId)}
            >
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-id">Ad Account ID: {campaign.accountId}</div>
                  <div className="flex items-center gap-2">
                    <PlatformLogo platform={platformName} />
                    <h5 className="card-title">{campaign.name}</h5>
                  </div>
                  <div className="text-xs text-gray-500">Campaign ID: {campaign.id}</div>
                </div>
                <button className="action-btn">⋯</button>
              </div>
              <div className="card-subtitle">Started: {campaign.startDate}</div>
              <div className="card-badges">
                <Badge color={getStatusColor(campaign.status)} size="xs">
                  {campaign.status}
                </Badge>
                {campaign.servingStatus && (
                  <Badge color="blue" size="xs">
                    {campaign.servingStatus}
                  </Badge>
                )}
              </div>
              <div className="card-content">
                <div className="card-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Status</span>
                    <span className="metric-value">{campaign.status}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Serving</span>
                    <span className="metric-value">{campaign.servingStatus || "N/A"}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Platform</span>
                    <span className="metric-value">{platformName}</span>
                  </div>
                </div>
                <div className="platform-views mt-2">
                  <span className="metric-label">Actions:</span>
                  <div className="d-flex gap-2 mt-1">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={(e) => { e.stopPropagation(); handleClick(campaign.id, campaign.platform, campaign.accountId); }}
                    >
                      See Details
                    </Button>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <small className="text-muted">Started: {campaign.startDate}</small>
              </div>
            </Card>
          </Col>
        );
      })}
    </Grid>
  );
};
export default CampaignTab;