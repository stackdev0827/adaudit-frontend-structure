import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Card, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Grid, Col, Button } from "@tremor/react";
import { Dialog, Transition } from "@headlessui/react";
import { creativeBoardApi } from '../../../services/api';

interface MediaAsset {
  asset_name: string;
  media_url: string;
  asset_id: string;
  type: 'image' | 'video';
  video_id?: string;
  thumbnail_url?: string;
  platform: string;
  internal_asset_id: string;
  variants: 'Yes' | 'No';
  similarity_score: number | null;
  variant_id: string | null;
  file_format: string | null;
  file_size: number | null;
  has_variants?: boolean;
}

interface Props {
  /** 🔑 Pass this down from the parent (e.g., Board) */
  clientId: number;

  viewMode: "table" | "grid";
  selectedMediaTypes: string[];
  onSelectAllMediaTypes: () => void;
  selectedMetaAccounts: string[];
  selectedGoogleAccounts: string[];
  onSelectAllAccounts: () => void;
  groupMedia: boolean;
}

const MediaTab: React.FC<Props> = ({
  clientId,
  viewMode,
  selectedMediaTypes,
  onSelectAllMediaTypes,
  selectedMetaAccounts,
  selectedGoogleAccounts,
  onSelectAllAccounts,
  groupMedia,
}) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [variants, setVariants] = useState<MediaAsset[]>([]);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '....' : text;
  };

  const PlatformLogo = ({ platform }: { platform: string }) => {
    if (platform === 'facebook') return <div className="platform-logo facebook-logo"><span className="logo-text">f</span></div>;
    if (platform === 'google') return <div className="platform-logo google-logo"><span className="logo-text">G</span></div>;
    return <div className="platform-logo generic-logo"><span className="logo-text">?</span></div>;
  };

  const fallbackThumbnail = 'https://placehold.co/200'; // Replace with your desired fallback thumbnail URL

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
    e.currentTarget.src = fallbackThumbnail;
  };

  const isExpiredFacebookUrl = (url: string): boolean => {
    if (!url.includes('fbcdn.net') || !url.includes('oe=')) {
      return false;
    }
    const params = new URLSearchParams(url.split('?')[1]);
    const oe = params.get('oe');
    if (!oe) {
      return false;
    }
    try {
      const expiration = parseInt(oe, 16);
      const now = Math.floor(Date.now() / 1000);
      return expiration < now;
    } catch {
      return false;
    }
  };

  const fetchMedia = useCallback(async (page: number) => {
    try {
      const { data } = await creativeBoardApi.getMediaList({
        client_id: clientId,
        page,
        limit: itemsPerPage,
        media_type_filter: selectedMediaTypes?.length ? selectedMediaTypes : undefined,
        meta_account_ids: selectedMetaAccounts?.length ? selectedMetaAccounts : undefined,
        google_account_ids: selectedGoogleAccounts?.length ? selectedGoogleAccounts : undefined,
        group_media: groupMedia ? 1 : undefined,
      });

      if (data.success) {
        const newAssets = (data.data ?? []) as MediaAsset[];
        setMediaAssets(prev => (page === 1 ? newAssets : [...prev, ...newAssets]));
        setTotalItems(data.total ?? 0);
        setError(null);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch media assets';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [clientId, selectedMediaTypes, selectedMetaAccounts, selectedGoogleAccounts, groupMedia, itemsPerPage]);

  const fetchVariants = useCallback(async (internalAssetId: string, platform: string) => {
    setIsVariantsLoading(true);
    try {
      const { data } = await creativeBoardApi.getMediaVariants({
        client_id: clientId,
        internal_asset_id: internalAssetId,
        platform,
      });
      if (data.success) {
        setVariants((data.data ?? []) as MediaAsset[]);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
    } finally {
      setIsVariantsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (selectedMediaTypes.length === 0) {
      setIsLoading(false);
      setMediaAssets([]);
      return;
    }
    if (selectedMetaAccounts.length === 0 && selectedGoogleAccounts.length === 0) {
      setAccountError('Please select at least one Google Ads or Meta account.');
      setIsLoading(false);
      setMediaAssets([]);
      return;
    }
    setAccountError(null);
    setMediaAssets([]);
    setCurrentPage(1);
    setIsLoading(true);
    fetchMedia(1);
  }, [fetchMedia, selectedMediaTypes, selectedMetaAccounts, selectedGoogleAccounts, clientId]);

  useEffect(() => {
    if (selectedGroupId) {
      const asset = mediaAssets.find(a => a.internal_asset_id === selectedGroupId);
      if (asset) {
        fetchVariants(selectedGroupId, asset.platform);
      }
    }
  }, [selectedGroupId, fetchVariants, mediaAssets]);

  useEffect(() => {
    console.log('MediaTab State:', {
      mediaAssets,
      selectedMediaTypes,
      selectedMetaAccounts,
      selectedGoogleAccounts,
      groupMedia,
      totalItems,
      currentPage,
    });
  }, [mediaAssets, selectedMediaTypes, selectedMetaAccounts, selectedGoogleAccounts, groupMedia, totalItems, currentPage]);

  const loadMore = () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    fetchMedia(currentPage + 1);
  };

  const handlePreviewClick = (asset: MediaAsset) => {
    setSelectedAsset(asset);
  };

  const closeModal = () => {
    setSelectedAsset(null);
  };

  const handleViewVariants = (asset: MediaAsset) => {
    setSelectedGroupId(asset.internal_asset_id);
    setVariants([]); // Reset variants
  };

  const closeVariantsModal = () => {
    setSelectedGroupId(null);
    setVariants([]);
  };

  const processedAssets = useMemo(() => {
    if (!Array.isArray(mediaAssets)) {
      return [];
    }
    if (groupMedia) {
      return mediaAssets;
    }
    const groups: Record<string, MediaAsset[]> = mediaAssets.reduce((acc: Record<string, MediaAsset[]>, asset) => {
      const groupKey = asset.internal_asset_id || asset.video_id || asset.asset_id; // Fallback for videos
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(asset);
      return acc;
    }, {});
    // Sort groups by internal_asset_id
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return sortedGroupKeys.flatMap(key => {
      const group = groups[key];
      group.sort((a, b) => {
        if (a.variants === 'No' && b.variants === 'Yes') return -1;
        if (a.variants === 'Yes' && b.variants === 'No') return 1;
        return (b.similarity_score ?? 0) - (a.similarity_score ?? 0);
      });
      return group;
    });
  }, [mediaAssets, groupMedia]);

  if (selectedMediaTypes.length === 0) {
    return (
      <div className="alert alert-info text-center">
        <div className="d-flex flex-column align-items-center">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <p className="mb-0">Please select at least one media type.</p>
          <Button className="mt-3" onClick={onSelectAllMediaTypes}>
            Select All Media Types
          </Button>
        </div>
      </div>
    );
  }

  if (accountError) {
    return (
      <div className="alert alert-info text-center">
        <div className="d-flex flex-column align-items-center">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <p className="mb-0">{accountError}</p>
          <Button className="mt-3" onClick={onSelectAllAccounts}>
            Select All Accounts
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading media assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading media assets: {error}
        <Button onClick={() => fetchMedia(1)} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (processedAssets.length === 0) {
    return (
      <div className="alert alert-info text-center">
        <p className="mb-0">No media assets found for the selected filters.</p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "table" ? (
          <Card className="table-card py-2 px-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="table-header">Preview</TableHeaderCell>
                <TableHeaderCell className="table-header">Asset Name</TableHeaderCell>
                <TableHeaderCell className="table-header">Asset ID</TableHeaderCell>
                <TableHeaderCell className="table-header">Type</TableHeaderCell>
                <TableHeaderCell className="table-header">Platform</TableHeaderCell>
                {groupMedia && <TableHeaderCell className="table-header">Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {processedAssets.map((asset) => {
                const previewSrc = asset.type === 'image' 
                  ? asset.media_url 
                  : asset.thumbnail_url || (asset.platform === 'google' && asset.video_id 
                    ? `https://img.youtube.com/vi/${asset.video_id}/0.jpg` 
                    : '');
                const effectivePreviewSrc = previewSrc && !isExpiredFacebookUrl(previewSrc) ? previewSrc : fallbackThumbnail;
                const displayId = asset.variants === 'Yes' ? asset.variant_id : asset.internal_asset_id;
                const rowClass = asset.variants === 'Yes' ? 'variant-row' : '';
                return (
                  <TableRow key={displayId || asset.asset_id} className={`table-row ${rowClass}`}>
                    <TableCell className="table-cell py-2 text-xs">
                      {effectivePreviewSrc ? (
                        <img 
                          src={effectivePreviewSrc} 
                          alt={asset.asset_name} 
                          className="media-preview cursor-pointer"
                          style={{ maxWidth: '90px', maxHeight: '50px', borderRadius: '4px' }}
                          onClick={() => handlePreviewClick(asset)}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="media-placeholder">No Preview</div>
                      )}
                    </TableCell>
                    <TableCell className="table-cell font-medium py-2 text-xs">{truncateText(asset.asset_name, 150)}</TableCell>
                    <TableCell className="table-cell py-2 text-xs">
                      <Badge color="blue" size="xs">
                        {displayId}
                      </Badge>
                      {groupMedia && asset.has_variants && (
                        <Badge color="green" size="xs" className="ml-2">
                          Has Variants
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="table-cell py-2 text-xs">
                      <Badge color="amber" size="xs">
                        {asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-cell py-2 text-xs">
                      <PlatformLogo platform={asset.platform} />
                    </TableCell>
                    {groupMedia && (
                      <TableCell className="table-cell py-2 text-xs">
                        {asset.has_variants && (
                          <Button size="xs" variant="secondary" onClick={() => handleViewVariants(asset)}>
                            View Variants
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {mediaAssets.length < totalItems && (
            <div className="text-center mt-4">
              <Button 
                onClick={loadMore}
                loading={isLoadingMore}
                loadingText="Loading..."
              >
                Load More Media
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
          {processedAssets.map((asset) => {
            const previewSrc = asset.type === 'image' 
              ? asset.media_url 
              : asset.thumbnail_url || (asset.platform === 'google' && asset.video_id 
                ? `https://img.youtube.com/vi/${asset.video_id}/0.jpg` 
                : '');
            const effectivePreviewSrc = previewSrc && !isExpiredFacebookUrl(previewSrc) ? previewSrc : fallbackThumbnail;
            const displayId = asset.variants === 'Yes' ? asset.variant_id : asset.internal_asset_id;
            const cardClass = asset.variants === 'Yes' ? 'variant-card' : '';
            return (
              <Col key={displayId || asset.asset_id}>
                <Card className={`grid-card ${cardClass}`}>
                  <div className="card-header">
                    <div className="card-title-wrapper">
                      <h5 className="card-title">{truncateText(asset.asset_name, 150)}</h5>
                    </div>
                  </div>
                  <div className="card-media-preview cursor-pointer" onClick={() => handlePreviewClick(asset)}>
                    {effectivePreviewSrc ? (
                      <img 
                        src={effectivePreviewSrc} 
                        alt={asset.asset_name} 
                        className="w-full h-40 object-contain"
                        style={{ borderRadius: '4px' }}
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="media-placeholder w-full h-40 flex items-center justify-center">
                        No Preview
                      </div>
                    )}
                  </div>
                  <div className="card-badges mt-3">
                    <Badge color="blue" size="xs">
                      Asset ID: {displayId}
                    </Badge>
                    {groupMedia && asset.has_variants && (
                      <Badge color="green" size="xs" className="ml-2">
                        Has Variants
                      </Badge>
                    )}
                    <Badge color="amber" size="xs" className="ml-2">
                      {asset.type}
                    </Badge>
                    <span className="ml-2">
                      <PlatformLogo platform={asset.platform} />
                    </span>
                  </div>
                  {groupMedia && asset.has_variants && (
                    <div className="mt-3">
                      <Button size="xs" variant="secondary" onClick={() => handleViewVariants(asset)} className="w-full">
                        View Variants
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
          {mediaAssets.length < totalItems && (
            <Col numColSpan={1} numColSpanSm={2} numColSpanLg={3}>
              <div className="text-center mt-4">
                <Button 
                  onClick={loadMore}
                  loading={isLoadingMore}
                  loadingText="Loading..."
                  className="w-full"
                >
                  Load More Media
                </Button>
              </div>
            </Col>
          )}
        </Grid>
      )}
      {/* Custom Media Preview Modal */}
      {selectedAsset && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{truncateText(selectedAsset.asset_name, 150)}</h2>
              <Button onClick={closeModal} variant="light">Close</Button>
            </div>
            <div className="mb-4">
              {selectedAsset.type === 'image' && selectedAsset.media_url ? (
                <img 
                  src={selectedAsset.media_url && !isExpiredFacebookUrl(selectedAsset.media_url) ? selectedAsset.media_url : fallbackThumbnail} 
                  alt={selectedAsset.asset_name} 
                  className="w-full h-auto"
                  onError={handleImageError}
                />
              ) : selectedAsset.type === 'video' ? (
                selectedAsset.platform === 'google' && selectedAsset.video_id ? (
                  <iframe 
                    width="100%" 
                    height="400" 
                    src={`https://www.youtube.com/embed/${selectedAsset.video_id}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : selectedAsset.platform === 'facebook' && selectedAsset.media_url ? (
                  <iframe 
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(`https://www.facebook.com${selectedAsset.media_url}`)}&show_text=0&width=560`} 
                    width="100%" 
                    height="400" 
                    style={{ border: 'none', overflow: 'hidden' }} 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen={true} 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                ) : (
                  <p>No video available</p>
                )
              ) : (
                <p>No media available</p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p>Type: {selectedAsset.type}</p>
              <div className="flex items-center">
                <span>Platform: </span>
                <PlatformLogo platform={selectedAsset.platform} />
              </div>
              <p>Asset ID: {selectedAsset.variants === 'Yes' ? selectedAsset.variant_id : selectedAsset.internal_asset_id}</p>
            </div>
          </div>
        </div>
      )}
      {/* Variants Modal */}
      {selectedGroupId && (
        <Transition appear show={!!selectedGroupId} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeVariantsModal}>
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
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Variants
                    </Dialog.Title>
                    {isVariantsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading variants...</p>
                      </div>
                    ) : variants.length === 0 ? (
                      <p className="mt-2">No variants found.</p>
                    ) : (
                      <Table className="mt-4">
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell className="ps-1">Preview</TableHeaderCell>
                            <TableHeaderCell className="ps-1">Asset Name</TableHeaderCell>
                            <TableHeaderCell className="ps-1">Variant ID</TableHeaderCell>
                            <TableHeaderCell className="ps-1">Type</TableHeaderCell>
                            <TableHeaderCell className="ps-1">Platform</TableHeaderCell>
                            <TableHeaderCell className="ps-1">Similarity Score</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {variants.map((variant) => {
                            const previewSrc = variant.type === 'image' ? variant.media_url : '';
                            const effectivePreviewSrc = previewSrc && !isExpiredFacebookUrl(previewSrc) ? previewSrc : fallbackThumbnail;
                            const displayId = variant.variant_id;
                            const truncatedName = truncateText(variant.asset_name, 10);
                            return (
                              <TableRow key={displayId}>
                                <TableCell className="px-0 py-2">
                                  {effectivePreviewSrc ? (
                                    <img 
                                      src={effectivePreviewSrc} 
                                      alt={variant.asset_name} 
                                      className="media-preview cursor-pointer"
                                      style={{ maxWidth: '100px', maxHeight: '60px', borderRadius: '4px' }}
                                      onClick={() => handlePreviewClick(variant)}
                                      onError={handleImageError}
                                    />
                                  ) : (
                                    <div className="media-placeholder">No Preview</div>
                                  )}
                                </TableCell>
                                <TableCell className="p-0">{truncatedName}</TableCell>
                                <TableCell className="p-0">
                                  <Badge color="blue" size="xs">
                                    {displayId}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-0">
                                  <Badge color="amber" size="xs">
                                    {variant.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-0">
                                  <PlatformLogo platform={variant.platform} />
                                </TableCell>
                                <TableCell className="p-0">{variant.similarity_score?.toFixed(2) ?? 'N/A'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                    <div className="mt-4">
                      <Button onClick={closeVariantsModal} variant="light">Close</Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
};

export default MediaTab;
