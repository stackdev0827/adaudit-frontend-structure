import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Grid, Col, Button } from "@tremor/react";

interface Audience {
  audience_id: string;
  name: string;
  status: string;
  resource_name: string;
  min_age: number;
  max_age: number;
  income_ranges: string;
  audience_segments: string;
  last_synced: string;
}

interface Props {
  viewMode: "table" | "grid";
}

const AudienceTab: React.FC<Props> = ({ viewMode }) => {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);

  const fetchAudiences = useCallback(async (page: number) => {
    try {
      const response = await fetch(
        `/api/v1/creative-board/audiences?page=${page}&limit=${itemsPerPage}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setAudiences(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setTotalItems(data.total);
        setError(null);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch audiences'
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchAudiences(1);
  }, []);

  const loadMore = () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    fetchAudiences(currentPage + 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    return status === 'ENABLED' ? 'emerald' : 'slate';
  };

  const handleViewDetails = (audience: Audience) => {
    setSelectedAudience(audience);
  };

  const closeModal = () => {
    setSelectedAudience(null);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading audiences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading audiences: {error}
        <Button onClick={() => fetchAudiences(1)} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {viewMode === "table" ? (
        <Card className="table-card">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="table-header">Audience ID</TableHeaderCell>
                <TableHeaderCell className="table-header">Name</TableHeaderCell>
                <TableHeaderCell className="table-header">Status</TableHeaderCell>
                <TableHeaderCell className="table-header">Age Range</TableHeaderCell>
                <TableHeaderCell className="table-header">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audiences.map((audience) => (
                <TableRow key={audience.audience_id} className="table-row">
                  <TableCell className="table-cell font-medium">{audience.audience_id}</TableCell>
                  <TableCell className="table-cell">{audience.name}</TableCell>
                  <TableCell className="table-cell">
                    <Badge color={getStatusColor(audience.status)} size="xs">
                      {audience.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="table-cell">{audience.min_age} - {audience.max_age}</TableCell>
                  <TableCell className="table-cell">
                    <Button 
                      size="xs" 
                      variant="secondary" 
                      onClick={() => handleViewDetails(audience)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {audiences.length < totalItems && (
            <div className="text-center mt-4">
              <Button onClick={loadMore} loading={isLoadingMore} loadingText="Loading...">
                Load More Audiences
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
          {audiences.map((audience) => (
            <Col key={audience.audience_id}>
              <Card className="grid-card">
                <div className="card-header">
                  <div className="card-title-wrapper">
                    <div className="card-id">ID: {audience.audience_id}</div>
                    <h5 className="card-title">{audience.name}</h5>
                  </div>
                </div>
                <div className="card-badges">
                  <Badge color={getStatusColor(audience.status)} size="xs" className="filled-badge">
                    {audience.status}
                  </Badge>
                </div>
                <div className="card-content">
                  <div className="card-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Age Range</span>
                      <span className="metric-value">{audience.min_age} - {audience.max_age}</span>
                    </div>
                  </div>
                  <Button 
                    size="xs" 
                    variant="secondary" 
                    onClick={() => handleViewDetails(audience)}
                    className="mt-2"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
          {audiences.length < totalItems && (
            <Col>
              <div className="text-center mt-4">
                <Button onClick={loadMore} loading={isLoadingMore} loadingText="Loading..." className="w-full">
                  Load More Audiences
                </Button>
              </div>
            </Col>
          )}
        </Grid>
      )}

      {/* Audience Details Modal */}
      {selectedAudience && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-white p-4 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAudience.name}</h2>
              <Button onClick={closeModal} variant="light">Close</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Audience ID:</strong> {selectedAudience.audience_id}</p>
                <p><strong>Status:</strong> {selectedAudience.status}</p>
                <p><strong>Age Range:</strong> {selectedAudience.min_age} - {selectedAudience.max_age}</p>
                <p><strong>Last Synced:</strong> {formatDate(selectedAudience.last_synced)}</p>
              </div>
              <div>
                <p><strong>Resource Name:</strong> {selectedAudience.resource_name}</p>
                <p><strong>Income Ranges:</strong> {selectedAudience.income_ranges}</p>
                <p><strong>Audience Segments:</strong> {selectedAudience.audience_segments}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AudienceTab;