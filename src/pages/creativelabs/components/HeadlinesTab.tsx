import React, { useState, useEffect, useMemo, useCallback, Fragment } from "react";
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
  TextInput,
} from "@tremor/react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { creativeBoardApi } from '../../../services/api';

interface HeadlineRow {
  asset_id: string;               // fb: title_asset_id, google: asset_id
  asset_text: string;             // normalized text
  asset_type: string;             // 'TITLE' for FB or Google types
  start_date: string | null;      // kept for completeness
  end_date: string | null;        // kept for completeness
  platform: "facebook" | "google" | string;
  internal_asset_id: string;      // grouping key (also used as display variant id for originals)
  variant: "Yes" | "No" | null;
  similarity_score: number | null;
  variant_id: string | null;      // actual variant id for variants; null for originals
  has_variants: boolean;          // whether this internal group has any variants
}

interface VariantRow {
  asset_id: string;
  asset_text: string;
  asset_type: string;
  start_date: string | null;
  end_date: string | null;
  platform: "facebook" | "google" | string;
  internal_asset_id: string;
  variant: "Yes" | "No" | null;
  similarity_score: number | null;
  variant_id: string | null;
}

interface GroupOption {
  internal_asset_id: string;
  asset_text: string;
}

interface Props {
  /** 🔑 Pass this down from the parent (Board, page, etc.) */
  clientId: number;

  viewMode: "table" | "grid";
  getAssetTypeColor: (type: string) => string;
  selectedTextAssets?: string[];
  onSelectAllTextAssets: () => void;

  selectedMetaAccounts: string[];
  selectedGoogleAccounts: string[];
  onSelectAllAccounts: () => void;
  groupText: boolean; // when true -> originals only; when false -> originals + variants
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

const HeadlinesTab: React.FC<Props> = ({
  clientId,
  viewMode,
  getAssetTypeColor,
  selectedTextAssets,
  onSelectAllTextAssets,
  selectedMetaAccounts,
  selectedGoogleAccounts,
  onSelectAllAccounts,
  groupText,
}) => {
  const [rows, setRows] = useState<HeadlineRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);

  // New states for set as variant dialog
  const [showSetDialog, setShowSetDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HeadlineRow | VariantRow | null>(null);
  const [isMove, setIsMove] = useState(false);
  const [possibleGroups, setPossibleGroups] = useState<GroupOption[]>([]);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string | null>(null);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isSettingVariant, setIsSettingVariant] = useState(false);

  // State for promote confirmation
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [selectedVariantToPromote, setSelectedVariantToPromote] = useState<HeadlineRow | VariantRow | null>(null);

  const truncate = (s: string, n: number) => (s && s.length > n ? s.slice(0, n) + "..." : s);
  const truncateModal = (s: string, n: number = 50) => truncate(s, n);

  const PlatformLogo = ({ platform }: { platform: string }) => {
    if (platform === "facebook")
      return (
        <div className="platform-logo facebook-logo">
          <span className="logo-text">f</span>
        </div>
      );
    if (platform === "google")
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

  const fetchHeadlines = useCallback(
    async (page: number) => {
      try {
        const { data: json } = await creativeBoardApi.getHeadlines({
          client_id: clientId,
          page,
          limit: itemsPerPage,
          asset_type_filter: selectedTextAssets?.length ? selectedTextAssets : undefined,
          meta_account_ids: selectedMetaAccounts?.length ? selectedMetaAccounts : undefined,
          google_account_ids: selectedGoogleAccounts?.length ? selectedGoogleAccounts : undefined,
          group_text: groupText ? 1 : undefined,
        });
  
        if (!json.success) throw new Error(json.message || "Unknown error occurred");
  
        // Ensure json.data is an array, default to empty array if null/undefined
        setRows((prev) => (page === 1 ? (json.data as HeadlineRow[] || []) : [...prev, ...(json.data as HeadlineRow[] || [])]));
        setTotalItems(json.total ?? 0);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch text assets");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      clientId,
      selectedTextAssets,
      selectedMetaAccounts,
      selectedGoogleAccounts,
      groupText,
      itemsPerPage,
    ]
  );

  const fetchVariants = useCallback(async (internalAssetId: string, platform: string) => {
    setIsVariantsLoading(true);
    try {
      const { data: json } = await creativeBoardApi.getHeadlineVariants({
        client_id: clientId,
        internal_asset_id: internalAssetId,
        platform,
      });
      if (!json.success) {
        throw new Error(json.message || "Unknown error occurred");
      }
      setVariants(json.data as VariantRow[]);
    } catch (e) {
      setVariants([] as VariantRow[]);
      console.error(e);
    } finally {
      setIsVariantsLoading(false);
    }
  }, [clientId]);

  const fetchPossibleGroups = useCallback(async (platform: string, excludeId: string) => {
    setIsGroupsLoading(true);
    try {
      const { data: json } = await creativeBoardApi.getTextGroups({
        client_id: clientId,
        platform,
        exclude_id: excludeId,
      });
      if (!json.success) {
        throw new Error(json.message || "Unknown error occurred");
      }
      // Remove duplicates if any
      const uniqueGroups = Array.from(new Map((json.data as GroupOption[]).map(g => [g.internal_asset_id, g])).values());
      setPossibleGroups(uniqueGroups);
    } catch (e) {
      setPossibleGroups([] as GroupOption[]);
      console.error(e);
    } finally {
      setIsGroupsLoading(false);
    }
  }, [clientId]);

  const promoteToOriginal = useCallback(async (row: HeadlineRow | VariantRow) => {
    try {
      const { data } = await creativeBoardApi.promoteTextVariant({
        client_id: clientId,
        platform: row.platform,
        asset_id: row.asset_id,
        variant_id: row.variant_id,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to promote');
      }
      // Refresh data
      setRows([] as HeadlineRow[]);
      setCurrentPage(1);
      fetchHeadlines(1);
      if (selectedGroupId) {
        fetchVariants(selectedGroupId, row.platform);
      }
    } catch (e) {
      console.error('Error promoting:', e);
      alert('Failed to promote to original.');
    }
  }, [clientId, fetchHeadlines, selectedGroupId, fetchVariants]);

  const setAsVariant = useCallback(async (row: HeadlineRow | VariantRow, targetInternalId: string) => {
    setIsSettingVariant(true);
    try {
      const { data } = await creativeBoardApi.setTextAsVariant({
        client_id: clientId,
        platform: row.platform,
        asset_id: row.asset_id,
        target_internal_asset_id: targetInternalId,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to set as variant');
      }
      // Refresh data
      setRows([] as HeadlineRow[]);
      setCurrentPage(1);
      fetchHeadlines(1);
      if (selectedGroupId) {
        fetchVariants(selectedGroupId, row.platform);
      }
      setShowSetDialog(false);
      setSelectedTargetGroup(null);
      setGroupSearchTerm('');
    } catch (e) {
      console.error('Error setting as variant:', e);
      alert('Failed to set as variant.');
    } finally {
      setIsSettingVariant(false);
    }
  }, [clientId, fetchHeadlines, selectedGroupId, fetchVariants]);

  const moveVariant = useCallback(async (row: HeadlineRow | VariantRow, targetInternalId: string) => {
    setIsSettingVariant(true);
    try {
      const { data } = await creativeBoardApi.moveTextVariant({
        client_id: clientId,
        platform: row.platform,
        asset_id: row.asset_id,
        variant_id: row.variant_id,
        target_internal_asset_id: targetInternalId,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to move variant');
      }
      // Refresh data
      setRows([] as HeadlineRow[]);
      setCurrentPage(1);
      fetchHeadlines(1);
      if (selectedGroupId) {
        fetchVariants(selectedGroupId, row.platform);
      }
      setShowSetDialog(false);
      setSelectedTargetGroup(null);
      setGroupSearchTerm('');
    } catch (e) {
      console.error('Error moving variant:', e);
      alert('Failed to move variant.');
    } finally {
      setIsSettingVariant(false);
    }
  }, [clientId, fetchHeadlines, selectedGroupId, fetchVariants]);

  // Need at least one text type + at least one account
  useEffect(() => {
    if (!selectedTextAssets || selectedTextAssets.length === 0) {
      setIsLoading(false);
      return;
    }
    if (selectedMetaAccounts.length === 0 && selectedGoogleAccounts.length === 0) {
      setAccountError("Please select at least one Google Ads or Meta account.");
      setIsLoading(false);
      return;
    }
    setAccountError(null);
    setRows([] as HeadlineRow[]);
    setCurrentPage(1);
    setIsLoading(true);
    fetchHeadlines(1);
  }, [fetchHeadlines, selectedTextAssets, selectedMetaAccounts, selectedGoogleAccounts, clientId]);

  useEffect(() => {
    if (selectedGroupId) {
      const row = rows.find((r) => r.internal_asset_id === selectedGroupId);
      if (row) fetchVariants(selectedGroupId, row.platform);
    }
  }, [selectedGroupId, rows, fetchVariants]);

  useEffect(() => {
    if (showSetDialog && selectedItem) {
      fetchPossibleGroups(selectedItem.platform, selectedItem.internal_asset_id);
    }
  }, [showSetDialog, selectedItem, fetchPossibleGroups]);

  const loadMore = () => {
    setIsLoadingMore(true);
    const next = currentPage + 1;
    setCurrentPage(next);
    fetchHeadlines(next);
  };

  // Build base list (grouping off = originals + variants; grouping on = originals only)
  const processedRows = useMemo(() => {
    if (groupText) return rows; // server already filtered variants out
    // ungrouped: originals first, then variants by similarity within each internal group
    const groups: Record<string, HeadlineRow[]> = rows.reduce((acc, r) => {
      const k = r.internal_asset_id || r.asset_id;
      if (!acc[k]) acc[k] = [];
      acc[k].push(r);
      return acc;
    }, {} as Record<string, HeadlineRow[]>);

    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return keys.flatMap((k) => {
      const g = groups[k];
      g.sort((a, b) => {
        const av = a.variant === "Yes" ? 1 : 0;
        const bv = b.variant === "Yes" ? 1 : 0;
        if (av !== bv) return av - bv; // originals (0) first
        const as = a.similarity_score ?? -Infinity;
        const bs = b.similarity_score ?? -Infinity;
        return bs - as;
      });
      return g;
    });
  }, [rows, groupText]);

  // displayVariantId: for variants = variant_id; for originals = internal_asset_id
  const uniqueRows = useMemo(() => {
    const seen = new Set<string>();
    const out: HeadlineRow[] = [];
    for (const r of processedRows) {
      const displayVariantId =
        r.variant === "Yes" ? (r.variant_id ?? "") : (r.internal_asset_id ?? "");
      if (!r.asset_id || !displayVariantId) continue;
      const key = `${r.asset_id}::${displayVariantId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [processedRows]);

  // Modal: distinct by variant_id (fallback internal_asset_id if missing)
  const uniqueVariants = useMemo(() => {
    const seen = new Set<string>();
    const out: VariantRow[] = [];
    for (const v of variants) {
      const vid = v.variant_id || v.internal_asset_id || "";
      if (!vid) continue;
      if (seen.has(vid)) continue;
      seen.add(vid);
      out.push(v);
    }
    return out;
  }, [variants]);

  const filteredGroups = useMemo(() => {
    if (!groupSearchTerm) return possibleGroups;
    const lower = groupSearchTerm.toLowerCase();
    return possibleGroups.filter(g => 
      g.internal_asset_id.toLowerCase().includes(lower) || 
      g.asset_text.toLowerCase().includes(lower)
    );
  }, [possibleGroups, groupSearchTerm]);

  if (!selectedTextAssets || selectedTextAssets.length === 0) {
    return (
      <div className="alert alert-info text-center">
        <div className="d-flex flex-column align-items-center">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <p className="mb-0">Please select at least one text asset type.</p>
          <Button className="mt-3" onClick={onSelectAllTextAssets}>
            Select All Text Assets
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
        <p className="mt-2">Loading text assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading text assets: {error}
        <Button onClick={() => fetchHeadlines(1)} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  const VariantBadge = ({ r }: { r: HeadlineRow }) =>
    r.variant === "Yes" ? (
      <Badge color="purple" size="xs">
        Variant
      </Badge>
    ) : (
      <Badge color="emerald" size="xs">
        Original
      </Badge>
    );

  const ActionCell = ({ r }: { r: HeadlineRow }) => (
    <>
      {groupText && r.has_variants && (
        <Button size="xs" variant="secondary" onClick={() => setSelectedGroupId(r.internal_asset_id)}>
          View Variants
        </Button>
      )}
    </>
  );

  const ActionMenu = ({ r }: { r: HeadlineRow | VariantRow }) => {
    const isVariant = r.variant === "Yes";
    return (
      <div className="relative">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center rounded-md bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
              <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {isVariant && (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSelectedVariantToPromote(r);
                            setShowPromoteConfirm(true);
                          }}
                          className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left`}
                        >
                          Promote to Original
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSelectedItem(r);
                            setIsMove(true);
                            setShowSetDialog(true);
                          }}
                          className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left`}
                        >
                          Move to another variant group
                        </button>
                      )}
                    </Menu.Item>
                  </>
                )}
                {!isVariant && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setSelectedItem(r);
                          setIsMove(false);
                          setShowSetDialog(true);
                        }}
                        className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left`}
                      >
                        Set as Variant
                      </button>
                    )}
                  </Menu.Item>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    );
  };

  const closeVariants = () => {
    setSelectedGroupId(null);
    setVariants([] as VariantRow[]);
  };

  return (
    <>
      {viewMode === "table" ? (
         <Card className="table-card py-2 px-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="table-header">Text</TableHeaderCell>
                <TableHeaderCell className="table-header">ID</TableHeaderCell>
                <TableHeaderCell className="table-header">Type</TableHeaderCell>
                <TableHeaderCell className="table-header">Platform</TableHeaderCell>
                <TableHeaderCell className="table-header">Edit</TableHeaderCell>
                {groupText && <TableHeaderCell className="table-header">Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueRows.map((r) => {
                const displayVariantId =
                  r.variant === "Yes" ? (r.variant_id ?? "") : (r.internal_asset_id ?? "");
                const rowKey = `${r.asset_id}::${displayVariantId}`;
                return (
                  <TableRow key={rowKey} className={`table-row ${r.variant === "Yes" ? "variant-row" : ""}`}>
                    {/* Text */}
                    <TableCell className="table-cell py-2">{truncate(r.asset_text, 60)}</TableCell>

                    {/* ID with badge saying Variant/Original */}
                    <TableCell className="table-cell py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <VariantBadge r={r} />
                        <Badge color="cyan" size="xs">{displayVariantId}</Badge>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="table-cell py-2">
                      <Badge color={getAssetTypeColor(r.asset_type)} size="xs" className="p-1">
                        {r.asset_type}
                      </Badge>
                    </TableCell>

                    {/* Platform */}
                    <TableCell className="table-cell py-2">
                      <PlatformLogo platform={r.platform} />
                    </TableCell>

                    {/* Edit Menu */}
                    <TableCell className="table-cell py-2">
                      <ActionMenu r={r} />
                    </TableCell>

                    {/* Actions (only when grouped and there are variants) */}
                    {groupText && <TableCell className="table-cell"><ActionCell r={r} /></TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {rows.length < totalItems && (
            <div className="text-center mt-4">
              <Button onClick={loadMore} loading={isLoadingMore} loadingText="Loading...">
                Load More
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Grid numItems={1} numItemsSm={2} numItemsMd={3} numItemsLg={4} className="gap-4">
          {uniqueRows.map((r) => {
            const displayVariantId =
              r.variant === "Yes" ? (r.variant_id ?? "") : (r.internal_asset_id ?? "");
            const cardKey = `${r.asset_id}::${displayVariantId}`;
            return (
              <Col key={cardKey}>
                <Card className={`grid-card flex flex-col h-full ${r.variant === "Yes" ? "variant-card" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <PlatformLogo platform={r.platform} />
                    <ActionMenu r={r} />
                  </div>
                  <h5 className="text-lg font-semibold line-clamp-3 mb-2">{r.asset_text}</h5>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <VariantBadge r={r} />
                    <Badge color={getAssetTypeColor(r.asset_type)} size="xs" className="p-1">
                      {r.asset_type}
                    </Badge>
                    {r.variant === "Yes" && r.similarity_score !== null && (
                      <Badge color="yellow" size="xs">
                        Sim: {r.similarity_score.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm flex items-center gap-2 mb-2">
                    <Badge color="cyan" size="xs">{displayVariantId}</Badge>
                  </div>
                  {groupText && r.has_variants && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setSelectedGroupId(r.internal_asset_id)}
                      className="w-full mt-auto"
                    >
                      View Variants
                    </Button>
                  )}
                </Card>
              </Col>
            );
          })}

          {rows.length < totalItems && (
            <Col>
              <div className="text-center mt-4">
                <Button onClick={loadMore} loading={isLoadingMore} loadingText="Loading..." className="w-full">
                  Load More
                </Button>
              </div>
            </Col>
          )}
        </Grid>
      )}

      {/* Variants Modal */}
      {selectedGroupId && (
        <Transition appear show={!!selectedGroupId} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => { setSelectedGroupId(null); }}>
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
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Text Variants
                    </Dialog.Title>

                    {isVariantsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading variants...</p>
                      </div>
                    ) : uniqueVariants.length === 0 ? (
                      <p className="mt-2">No variants found.</p>
                    ) : (
                      <Table className="mt-4">
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Variant ID</TableHeaderCell>
                            <TableHeaderCell>Text</TableHeaderCell>
                            <TableHeaderCell>Type</TableHeaderCell>
                            <TableHeaderCell>Platform</TableHeaderCell>
                            <TableHeaderCell>Similarity</TableHeaderCell>
                            <TableHeaderCell>Edit</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uniqueVariants.map((v) => {
                            const variantIdToShow = v.variant_id || v.internal_asset_id || "—";
                            return (
                              <TableRow key={variantIdToShow}>
                                <TableCell>
                                  <Badge color="blue" size="xs">{variantIdToShow}</Badge>
                                </TableCell>
                                <TableCell title={v.asset_text || ""}>{truncateModal(v.asset_text || "", 25)}</TableCell>
                                <TableCell>
                                  <Badge color="indigo" size="xs">{v.asset_type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <PlatformLogo platform={v.platform} />
                                </TableCell>
                                <TableCell>{v.similarity_score?.toFixed(2) ?? "N/A"}</TableCell>
                                <TableCell>
                                  <ActionMenu r={v} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}

                    <div className="mt-4">
                      <Button variant="light" onClick={() => { setSelectedGroupId(null); }}>
                        Close
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* Set/Move Dialog */}
      {showSetDialog && selectedItem && (
        <Transition appear show={showSetDialog} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowSetDialog(false)}>
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {isMove ? 'Move to Variant Group' : 'Set as Variant'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select a target variant group.
                      </p>
                    </div>

                    {isGroupsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading groups...</p>
                      </div>
                    ) : possibleGroups.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">No other groups available.</p>
                    ) : (
                      <div className="mt-4">
                        <TextInput
                          placeholder="Search groups..."
                          value={groupSearchTerm}
                          onChange={(e) => setGroupSearchTerm(e.target.value)}
                        />
                        {filteredGroups.length === 0 ? (
                          <p className="mt-2 text-sm text-gray-500">No matching groups found.</p>
                        ) : (
                          <div className="max-h-60 overflow-y-auto mt-2 border border-gray-200 rounded-md bg-white">
                            <ul className="divide-y divide-gray-200">
                              {filteredGroups.map((g) => (
                                <li
                                  key={g.internal_asset_id}
                                  className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedTargetGroup === g.internal_asset_id ? 'bg-blue-50' : ''}`}
                                  onClick={() => setSelectedTargetGroup(g.internal_asset_id)}
                                >
                                  {g.internal_asset_id} - {truncate(g.asset_text, 30)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="light" onClick={() => setShowSetDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        loading={isSettingVariant}
                        loadingText="Processing..."
                        disabled={!selectedTargetGroup || isSettingVariant}
                        onClick={() => {
                          if (selectedTargetGroup) {
                            if (isMove) {
                              moveVariant(selectedItem!, selectedTargetGroup);
                            } else {
                              setAsVariant(selectedItem!, selectedTargetGroup);
                            }
                          }
                        }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* Promote Confirmation Dialog */}
      {showPromoteConfirm && selectedVariantToPromote && (
        <Transition appear show={showPromoteConfirm} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowPromoteConfirm(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Confirm Promotion
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to promote this variant to original? This action creates a new group.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="light" onClick={() => setShowPromoteConfirm(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          promoteToOriginal(selectedVariantToPromote!);
                          setShowPromoteConfirm(false);
                        }}
                      >
                        Confirm
                      </Button>
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

export default HeadlinesTab;
