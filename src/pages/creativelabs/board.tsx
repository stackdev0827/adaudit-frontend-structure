import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Button, Tab, TabGroup, TabList, TabPanel, TabPanels, TextInput, Title, Text } from '@tremor/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import CampaignTab from './components/CampaignTab';
import HeadlinesTab from './components/HeadlinesTab';
import MediaTab from './components/MediaTab';
import AudienceTab from './components/AudienceTab';
import FilterDropdown from './components/FilterDropdown';
import { creativeBoardApi } from '../../services/api';
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

/* ---------------------------------- types ---------------------------------- */
interface AdAccount {
  ads_account_id: string;
  refresh_token: string;
  client_id: string; // keep as-is if backend sends string
}
interface BackendCampaign {
  campaign_id: string;
  name: string;
  status: string;
  serving_status: string;
  start_date: string;
  objective: string;
  platform: string;
  ads_account_id: string;
}
interface MappedCampaign {
  id: string;
  name: string;
  status: string;
  servingStatus: string;
  startDate: string;
  objective: string;
  platform: string;
  accountId: string;
}

/* -------------------------------- constants -------------------------------- */
const ALL_STATUSES = ['Active', 'Enabled', 'Paused', 'Removed', 'Deleted', 'Archived'] as const;
const ALL_PLATFORMS = ['Meta', 'Google Ads'] as const;

/* -------------------------------- component -------------------------------- */
const Board: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [backendCampaigns, setBackendCampaigns] = useState<BackendCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [metaAccounts, setMetaAccounts] = useState<AdAccount[]>([]);
  const [googleAccounts, setGoogleAccounts] = useState<AdAccount[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMetaAccounts, setSelectedMetaAccounts] = useState<string[]>([]);
  const [selectedGoogleAccounts, setSelectedGoogleAccounts] = useState<string[]>([]);
  const [textAssetTypes, setTextAssetTypes] = useState<string[]>([]);
  const [selectedTextAssets, setSelectedTextAssets] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
  const [groupMedia, setGroupMedia] = useState(false);
  const [groupText, setGroupText] = useState(false);

  const CLIENT_ID = useClientId();

  if (!CLIENT_ID) {
    return <div className="p-4">Please login again. Client ID not found.</div>;
  }

  /* ----------------------------- derived values ----------------------------- */
  const allMetaIds = useMemo(() => metaAccounts.map(a => a.ads_account_id), [metaAccounts]);
  const allGoogleIds = useMemo(() => googleAccounts.map(a => a.ads_account_id), [googleAccounts]);

  const effectiveTextAssets = useMemo(
    () => (selectedTextAssets.length ? selectedTextAssets : textAssetTypes),
    [selectedTextAssets, textAssetTypes]
  );
  const effectiveMediaTypes = useMemo(
    () => (selectedMediaTypes.length ? selectedMediaTypes : mediaTypes),
    [selectedMediaTypes, mediaTypes]
  );

  const userChoseAnyPlatform = selectedPlatforms.length > 0;
  const userChoseAnyAccounts = selectedMetaAccounts.length > 0 || selectedGoogleAccounts.length > 0;

  const effectivePlatformsForTabs = useMemo(() => {
    if (userChoseAnyPlatform) return selectedPlatforms;
    if (userChoseAnyAccounts) {
      return [
        ...(selectedMetaAccounts.length ? ['Meta'] : []),
        ...(selectedGoogleAccounts.length ? ['Google Ads'] : []),
      ];
    }
    return [...ALL_PLATFORMS];
  }, [userChoseAnyPlatform, userChoseAnyAccounts, selectedPlatforms, selectedMetaAccounts, selectedGoogleAccounts]);

  const effectiveMetaAccountsForTabs = useMemo(() => {
    if (!effectivePlatformsForTabs.includes('Meta')) return [];
    return selectedMetaAccounts.length ? selectedMetaAccounts : allMetaIds;
  }, [effectivePlatformsForTabs, selectedMetaAccounts, allMetaIds]);

  const effectiveGoogleAccountsForTabs = useMemo(() => {
    if (!effectivePlatformsForTabs.includes('Google Ads')) return [];
    return selectedGoogleAccounts.length ? selectedGoogleAccounts : allGoogleIds;
  }, [effectivePlatformsForTabs, selectedGoogleAccounts, allGoogleIds]);

  /* -------------------------------- API calls -------------------------------- */

  // fetch ad accounts (depends on CLIENT_ID)
  useEffect(() => {
    if (!CLIENT_ID) return;
    (async () => {
      try {
        const { data } = await creativeBoardApi.getConnectedAccounts(CLIENT_ID);
        const metas: AdAccount[] = data.meta || [];
        const googles: AdAccount[] = data.google || [];

        const uniqueMetas = Array.from(new Map(metas.map(a => [a.ads_account_id, a])).values());
        const uniqueGoogles = Array.from(new Map(googles.map(a => [a.ads_account_id, a])).values());

        setMetaAccounts(uniqueMetas);
        setGoogleAccounts(uniqueGoogles);
      } catch (err) {
        console.error('Error fetching ad accounts:', err);
      }
    })();
  }, [CLIENT_ID]);

  // text asset types (keep as-is unless backend needs client_id)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await creativeBoardApi.getHeadlinesTypes(1);
        if (data.success) setTextAssetTypes(data.data);
      } catch (err) {
        console.error('Error fetching text asset types:', err);
      }
    })();
  }, []);

  // media types (keep as-is unless backend needs client_id)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await creativeBoardApi.getMediaTypes(1);
        if (data.success) setMediaTypes(data.data);
      } catch (err) {
        console.error('Error fetching media types:', err);
      }
    })();
  }, []);

  const buildCampaignQuery = (page: number) => {
    const userChoseAnyPlatform = selectedPlatforms.length > 0;
    const userChoseAnyAccounts = selectedMetaAccounts.length > 0 || selectedGoogleAccounts.length > 0;

    const effectivePlatforms = userChoseAnyPlatform
      ? selectedPlatforms
      : userChoseAnyAccounts
      ? [
          ...(selectedMetaAccounts.length ? ['Meta'] : []),
          ...(selectedGoogleAccounts.length ? ['Google Ads'] : []),
        ]
      : [...ALL_PLATFORMS];

    const effectiveStatuses = selectedStatuses.length ? selectedStatuses : [...ALL_STATUSES];

    const effectiveMetaIds = effectivePlatforms.includes('Meta')
      ? (selectedMetaAccounts.length ? selectedMetaAccounts : (userChoseAnyAccounts ? undefined : allMetaIds))
      : undefined;

    const effectiveGoogleIds = effectivePlatforms.includes('Google Ads')
      ? (selectedGoogleAccounts.length ? selectedGoogleAccounts : (userChoseAnyAccounts ? undefined : allGoogleIds))
      : undefined;

    return {
      client_id: CLIENT_ID,
      page,
      limit: 50,
      search_term: searchTerm || undefined,
      status_filter: effectiveStatuses,
      platforms: effectivePlatforms,
      meta_account_ids: effectiveMetaIds,
      google_account_ids: effectiveGoogleIds,
    };
  };

  const fetchCampaigns = useCallback(async () => {
    if (!CLIENT_ID) return;
    if (metaAccounts.length === 0 && googleAccounts.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAccountError(null);
    try {
      const { data: json } = await creativeBoardApi.getCampaigns(buildCampaignQuery(1));
      if (!json.success) throw new Error(json.message || 'Failed to fetch campaigns');

      setBackendCampaigns(json.data || []);
      setCurrentPage(1);
      setTotalPages(json.pagination?.total_pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    CLIENT_ID,
    searchTerm,
    selectedStatuses,
    selectedPlatforms,
    selectedMetaAccounts,
    selectedGoogleAccounts,
    metaAccounts,
    googleAccounts,
  ]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    if (nextPage > totalPages || isLoading || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { data: json } = await creativeBoardApi.getCampaigns(buildCampaignQuery(nextPage));
      if (!json.success) throw new Error(json.message || 'Failed to fetch more campaigns');

      setBackendCampaigns(prev => [...prev, ...(json.data || [])]);
      setCurrentPage(nextPage);
      setTotalPages(json.pagination?.total_pages || totalPages);
    } catch (err) {
      console.error('Error loading more campaigns:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  /* ------------------------------ data mapping ------------------------------ */
  const mappedCampaigns: MappedCampaign[] = useMemo(() => {
    return backendCampaigns
      .map(c => ({
        id: c.campaign_id,
        name: c.name,
        status: c.status,
        servingStatus: c.serving_status,
        startDate: c.start_date ? new Date(c.start_date).toLocaleDateString('en-GB') : 'N/A',
        objective: c.objective,
        platform: c.platform.toLowerCase(),
        accountId: c.ads_account_id,
      }))
      .sort((a, b) => {
        const parseDate = (str: string): number => {
          if (str === 'N/A') return 0;
          const parts = str.split('/');
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        };
        return parseDate(b.startDate) - parseDate(a.startDate);
      });
  }, [backendCampaigns]);

  const hasMore = currentPage < totalPages;

  /* --------------------------------- utils --------------------------------- */
  const getStatusColor = (s: string) => {
    if (['Active', 'Enabled'].includes(s)) return 'emerald';
    if (s === 'Paused') return 'slate';
    if (['Removed', 'Deleted'].includes(s)) return 'red'; // fixed
    if (s === 'Archived') return 'gray';
    return 'slate';
  };

  const handleFilterChange = useCallback(
    (f: {
      statuses: string[];
      platforms: string[];
      metaAccounts: string[];
      googleAccounts: string[];
      textAssets: string[];
      mediaTypes: string[];
      groupMedia: boolean;
      groupText: boolean;
    }) => {
      setSelectedStatuses(f.statuses);
      setSelectedPlatforms(f.platforms);
      setSelectedMetaAccounts(f.metaAccounts);
      setSelectedGoogleAccounts(f.googleAccounts);
      setSelectedTextAssets(f.textAssets);
      setSelectedMediaTypes(f.mediaTypes);
      setGroupMedia(f.groupMedia);
      setGroupText(f.groupText);
    },
    []
  );

  const handleSelectAllTextAssets = () => setSelectedTextAssets(textAssetTypes);
  const handleSelectAllMediaTypes = () => setSelectedMediaTypes(mediaTypes);

  const handleSelectAllAccounts = useCallback(() => {
    setSelectedMetaAccounts(metaAccounts.map((a: AdAccount) => a.ads_account_id));
    setSelectedGoogleAccounts(googleAccounts.map((a: AdAccount) => a.ads_account_id));
  }, [metaAccounts, googleAccounts]);

  /* ------------------------------- bootstrap ------------------------------- */
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <div className="space-y-6">
      <div className="min-vh-100" style={{ backgroundColor: 'var(--primary-bg)', position: 'relative', zIndex: 0 }}>
        <div className="container-fluid px-1 py-2" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="header-icon"></div>
                <div>
                  <Title>Creative Asset Manager</Title>
                  <Text>Unified campaign analysis for Google Ads & Meta</Text>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-3">
                <button className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                  <span>📋</span> Table View
                </button>
                <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <span>⊞</span> Grid View
                </button>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <div className="filter-section" style={{ position: 'relative', zIndex: 2 }}>
                <div className="row g-4 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label text-muted mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Search campaigns
                    </label>
                    <div className="search-container position-relative">
                      <TextInput
                        placeholder="Search by name, ID, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input w-full"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 offset-md-5">
                    <label className="form-label text-muted mb-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Filters
                    </label>
                    <FilterDropdown
                      onFilterChange={handleFilterChange}
                      metaAccounts={metaAccounts}
                      googleAccounts={googleAccounts}
                      textAssetTypes={textAssetTypes}
                      mediaTypes={mediaTypes}
                      selectedStatuses={selectedStatuses}
                      selectedPlatforms={selectedPlatforms}
                      selectedMetaAccounts={selectedMetaAccounts}
                      selectedGoogleAccounts={selectedGoogleAccounts}
                      selectedTextAssets={selectedTextAssets}
                      selectedMediaTypes={selectedMediaTypes}
                      selectedGroupMedia={groupMedia}
                      selectedGroupText={groupText}
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex flex-wrap gap-2 mt-4 col-md-12">
                  {selectedStatuses.map(s => (
                    <Badge key={`status_${s}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedStatuses(prev => prev.filter(v => v !== s))} className="cursor-pointer">
                      {s}
                    </Badge>
                  ))}
                  {selectedPlatforms.map(p => (
                    <Badge key={`platform_${p}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedPlatforms(prev => prev.filter(v => v !== p))} className="cursor-pointer">
                      {p}
                    </Badge>
                  ))}
                  {selectedMetaAccounts.map(id => (
                    <Badge key={`meta_${id}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedMetaAccounts(prev => prev.filter(v => v !== id))}
                      className="cursor-pointer">
                      {id}
                    </Badge>
                  ))}
                  {selectedGoogleAccounts.map(id => (
                    <Badge key={`google_${id}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedGoogleAccounts(prev => prev.filter(v => v !== id))}
                      className="cursor-pointer">
                      {id}
                    </Badge>
                  ))}
                  {selectedTextAssets.map(t => (
                    <Badge key={`text_${t}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedTextAssets(prev => prev.filter(v => v !== t))}
                      className="cursor-pointer">
                      {t}
                    </Badge>
                  ))}
                  {selectedMediaTypes.map(m => (
                    <Badge key={`media_${m}`} color="blue" icon={XCircleIcon}
                      onClick={() => setSelectedMediaTypes(prev => prev.filter(v => v !== m))}
                      className="cursor-pointer">
                      {m}
                    </Badge>
                  ))}
                  {groupMedia && (
                    <Badge key="group-media" color="blue" icon={XCircleIcon}
                      onClick={() => setGroupMedia(false)} className="cursor-pointer">
                      Grouping: Media
                    </Badge>
                  )}
                  {groupText && (
                    <Badge key="group-text" color="blue" icon={XCircleIcon}
                      onClick={() => setGroupText(false)} className="cursor-pointer">
                      Grouping: Text
                    </Badge>
                  )}
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatuses([]);
                      setSelectedPlatforms([]);
                      setSelectedMetaAccounts([]);
                      setSelectedGoogleAccounts([]);
                      setSelectedTextAssets([]);
                      setSelectedMediaTypes([]);
                      setGroupMedia(false);
                      setGroupText(false);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <TabGroup>
            <TabList className="custom-tab-list">
              <Tab className="custom-tab">🎯 Campaigns</Tab>
              <Tab className="custom-tab">👥 Audiences</Tab>
              <Tab className="custom-tab">📝 Text Assets</Tab>
              <Tab className="custom-tab">🎨 Media</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading campaigns...</p>
                  </div>
                ) : accountError ? (
                  <div className="alert alert-info text-center">
                    <div className="d-flex flex-column align-items-center">
                      <p className="mb-0">{accountError}</p>
                      <Button className="mt-3" onClick={() => {
                        setSelectedMetaAccounts(metaAccounts.map(a => a.ads_account_id));
                        setSelectedGoogleAccounts(googleAccounts.map(a => a.ads_account_id));
                      }}>
                        Select All Accounts
                      </Button>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">Error loading campaigns: {error}</div>
                ) : mappedCampaigns.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No campaigns found matching your criteria</p>
                    {searchTerm && (
                      <Button variant="light" className="mt-2" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <CampaignTab campaigns={mappedCampaigns} viewMode={viewMode} getStatusColor={getStatusColor} />
                    {hasMore && (
                      <div className="text-center mt-4">
                        {isLoadingMore ? (
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading more...</span>
                          </div>
                        ) : (
                          <Button onClick={loadMore}>Load More</Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </TabPanel>

              <TabPanel>
                <AudienceTab viewMode={viewMode} />
              </TabPanel>

              <TabPanel>
              <HeadlinesTab
                  clientId={CLIENT_ID} // <- pass the actual value you want, not 1
                  viewMode={viewMode}
                  getAssetTypeColor={() => 'blue'}
                  selectedTextAssets={effectiveTextAssets}
                  onSelectAllTextAssets={handleSelectAllTextAssets}
                  selectedMetaAccounts={effectiveMetaAccountsForTabs}
                  selectedGoogleAccounts={effectiveGoogleAccountsForTabs}
                  onSelectAllAccounts={handleSelectAllAccounts}
                  groupText={groupText}
                />
              </TabPanel>

              <TabPanel>
                <MediaTab
                  clientId={CLIENT_ID} // <- pass your real client id here
                  viewMode={viewMode}
                  selectedMediaTypes={effectiveMediaTypes}
                  onSelectAllMediaTypes={handleSelectAllMediaTypes}
                  selectedMetaAccounts={effectiveMetaAccountsForTabs}
                  selectedGoogleAccounts={effectiveGoogleAccountsForTabs}
                  onSelectAllAccounts={handleSelectAllAccounts}
                  groupMedia={groupMedia}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default Board;
