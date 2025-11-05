import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
interface AdAccount {
  ads_account_id: string;
  refresh_token: string;
  client_id: string;
}
interface FilterDropdownProps {
  onFilterChange: (filters: {
    statuses: string[];
    platforms: string[];
    metaAccounts: string[];
    googleAccounts: string[];
    textAssets: string[];
    mediaTypes: string[];
    groupMedia: boolean;
    groupText: boolean;
  }) => void;
  metaAccounts: AdAccount[];
  googleAccounts: AdAccount[];
  textAssetTypes: string[];
  mediaTypes: string[];
  selectedStatuses: string[];
  selectedPlatforms: string[];
  selectedMetaAccounts: string[];
  selectedGoogleAccounts: string[];
  selectedTextAssets: string[];
  selectedMediaTypes: string[];
  selectedGroupMedia: boolean;
  selectedGroupText: boolean;
}
type DropdownView = 'main' | 'accounts' | 'platform' | 'status' | 'textAssets' | 'mediaTypes' | 'grouping';

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  onFilterChange,
  metaAccounts,
  googleAccounts,
  textAssetTypes,
  mediaTypes,
  selectedStatuses,
  selectedPlatforms,
  selectedMetaAccounts,
  selectedGoogleAccounts,
  selectedTextAssets,
  selectedMediaTypes,
  selectedGroupMedia,
  selectedGroupText,
}) => {
  /* ---------------------------- local state ---------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DropdownView>('main');
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* --------------------- close menu on outside click ------------------- */
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ----------------------- checkbox change handler --------------------- */
  const handleCheckboxChange = (
    value: string,
    type: 'status' | 'platform' | 'metaAccount' | 'googleAccount' | 'textAsset' | 'mediaType' | 'groupMedia' | 'groupText',
  ) => {
    let newStatuses = [...selectedStatuses];
    let newPlatforms = [...selectedPlatforms];
    let newMetaIds = [...selectedMetaAccounts];
    let newGoogleIds = [...selectedGoogleAccounts];
    let newTextAssets = [...selectedTextAssets];
    let newMediaTypes = [...selectedMediaTypes];
    let newGroupMedia = selectedGroupMedia;
    let newGroupText = selectedGroupText;

    switch (type) {
      case 'status':
        newStatuses = selectedStatuses.includes(value)
          ? selectedStatuses.filter(v => v !== value)
          : [...new Set([...selectedStatuses, value])];
        break;
      case 'platform':
        if (selectedPlatforms.includes(value)) {
          newPlatforms = selectedPlatforms.filter(p => p !== value);
          if (value === 'Meta') newMetaIds = [];
          if (value === 'Google Ads') newGoogleIds = [];
        } else {
          newPlatforms = [...new Set([...selectedPlatforms, value])];
          if (value === 'Meta') newMetaIds = metaAccounts.map(a => a.ads_account_id);
          if (value === 'Google Ads') newGoogleIds = googleAccounts.map(a => a.ads_account_id);
        }
        break;
      case 'metaAccount':
        newMetaIds = selectedMetaAccounts.includes(value)
          ? selectedMetaAccounts.filter(v => v !== value)
          : [...new Set([...selectedMetaAccounts, value])];
        break;
      case 'googleAccount':
        newGoogleIds = selectedGoogleAccounts.includes(value)
          ? selectedGoogleAccounts.filter(v => v !== value)
          : [...new Set([...selectedGoogleAccounts, value])];
        break;
      case 'textAsset':
        newTextAssets = selectedTextAssets.includes(value)
          ? selectedTextAssets.filter(v => v !== value)
          : [...new Set([...selectedTextAssets, value])];
        break;
      case 'mediaType':
        newMediaTypes = selectedMediaTypes.includes(value)
          ? selectedMediaTypes.filter(v => v !== value)
          : [...new Set([...selectedMediaTypes, value])];
        break;
      case 'groupMedia':
        newGroupMedia = !selectedGroupMedia;
        break;
      case 'groupText':
        newGroupText = !selectedGroupText;
        break;
    }

    onFilterChange({
      statuses: newStatuses,
      platforms: newPlatforms,
      metaAccounts: newMetaIds,
      googleAccounts: newGoogleIds,
      textAssets: newTextAssets,
      mediaTypes: newMediaTypes,
      groupMedia: newGroupMedia,
      groupText: newGroupText,
    });
  };

  /* ------------------------------------------------------------------ */
  /* Tiny helpers */
  /* ------------------------------------------------------------------ */
  const PlatformLogo = ({ platform }: { platform: string }) => {
    if (platform === 'Meta') return <div className="platform-logo facebook-logo"><span className="logo-text">f</span></div>;
    if (platform === 'Google Ads') return <div className="platform-logo google-logo"><span className="logo-text">G</span></div>;
    return <div className="platform-logo generic-logo"><span className="logo-text">?</span></div>;
  };

  const getStatusIcon = (status: string) => {
    if (['Active', 'Enabled'].includes(status)) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="green">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (status === 'Paused') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="gray">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    } else if (['Removed', 'Deleted'].includes(status)) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="red">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    } else if (status === 'Archived') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="gray">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="orange">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  /* ------------------------------------------------------------------ */
  /* View renderers */
  /* ------------------------------------------------------------------ */
  const renderMainView = () => (
    <>
      <button
        onClick={() => setCurrentView('accounts')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Accounts</span><span>›</span>
      </button>
      <button
        onClick={() => setCurrentView('platform')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Platform</span><span>›</span>
      </button>
      <button
        onClick={() => setCurrentView('status')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Status</span><span>›</span>
      </button>
      <button
        onClick={() => setCurrentView('textAssets')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Text Assets</span><span>›</span>
      </button>
      <button
        onClick={() => setCurrentView('mediaTypes')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Media</span><span>›</span>
      </button>
      <button
        onClick={() => setCurrentView('grouping')}
        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Grouping</span><span>›</span>
      </button>
    </>
  );

  const renderAccountsView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      {/* Meta */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">META ACCOUNTS</div>
      {metaAccounts.map(acc => (
        <label
          key={acc.ads_account_id}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow flex items-center">
            <PlatformLogo platform="Meta" />
            <div className="ml-3">
              <div className="font-medium">Meta Account</div>
              <div className="text-xs text-gray-500">{acc.ads_account_id}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={selectedMetaAccounts.includes(acc.ads_account_id)}
            onChange={() => handleCheckboxChange(acc.ads_account_id, 'metaAccount')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
      {/* Google */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase mt-2">GOOGLE ACCOUNTS</div>
      {googleAccounts.map(acc => (
        <label
          key={acc.ads_account_id}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow flex items-center">
            <PlatformLogo platform="Google Ads" />
            <div className="ml-3">
              <div className="font-medium">Google Account</div>
              <div className="text-xs text-gray-500">{acc.ads_account_id}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={selectedGoogleAccounts.includes(acc.ads_account_id)}
            onChange={() => handleCheckboxChange(acc.ads_account_id, 'googleAccount')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
    </>
  );

  const renderPlatformView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">PLATFORMS</div>
      {['Meta', 'Google Ads'].map(platform => (
        <label
          key={platform}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow flex items-center">
            <PlatformLogo platform={platform} />
            <div className="ml-3 font-medium">{platform}</div>
          </div>
          <input
            type="checkbox"
            checked={selectedPlatforms.includes(platform)}
            onChange={() => handleCheckboxChange(platform, 'platform')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
    </>
  );

  const renderStatusView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">STATUS</div>
      {['Active', 'Enabled', 'Paused', 'Removed', 'Deleted', 'Archived'].map(status => (
        <label
          key={status}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow flex items-center">
            <div className="w-5 mr-3">
              {getStatusIcon(status)}
            </div>
            <div className="font-medium">{status}</div>
          </div>
          <input
            type="checkbox"
            checked={selectedStatuses.includes(status)}
            onChange={() => handleCheckboxChange(status, 'status')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
    </>
  );

  const renderTextAssetsView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">TEXT ASSETS</div>
      {textAssetTypes.map(type => (
        <label
          key={type}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow font-medium">{type}</div>
          <input
            type="checkbox"
            checked={selectedTextAssets.includes(type)}
            onChange={() => handleCheckboxChange(type, 'textAsset')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
    </>
  );

  const renderMediaTypesView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">MEDIA</div>
      {mediaTypes.map(type => (
        <label
          key={type}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex-grow font-medium">{type}</div>
          <input
            type="checkbox"
            checked={selectedMediaTypes.includes(type)}
            onChange={() => handleCheckboxChange(type, 'mediaType')}
            onClick={e => e.stopPropagation()}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
        </label>
      ))}
    </>
  );

  const renderGroupingView = () => (
    <>
      <button
        onClick={() => setCurrentView('main')}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
      >
        <ChevronLeftIcon className="h-4 w-3 mr-1" /> Back
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">GROUPING</div>
      <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <div className="flex-grow font-medium">Media</div>
        <input
          type="checkbox"
          checked={selectedGroupMedia}
          onChange={() => handleCheckboxChange('media', 'groupMedia')}
          onClick={e => e.stopPropagation()}
          className="form-checkbox h-4 w-4 text-blue-600 rounded"
        />
      </label>
      <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <div className="flex-grow font-medium">Text</div>
        <input
          type="checkbox"
          checked={selectedGroupText}
          onChange={() => handleCheckboxChange('text', 'groupText')}
          onClick={e => e.stopPropagation()}
          className="form-checkbox h-4 w-4 text-blue-600 rounded"
        />
      </label>
    </>
  );

  /* -------------------------- badge counter --------------------------- */
  const badgeCount =
    selectedStatuses.length +
    selectedPlatforms.length +
    selectedMetaAccounts.length +
    selectedGoogleAccounts.length +
    selectedTextAssets.length +
    selectedMediaTypes.length +
    (selectedGroupMedia ? 1 : 0) +
    (selectedGroupText ? 1 : 0);

  /* ------------------------------------------------------------------ */
  /* JSX */
  /* ------------------------------------------------------------------ */
  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <div className="flex items-center">
          {/* funnel icon */}
          <svg
            className="w-4 h-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {badgeCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {badgeCount}
            </span>
          )}
        </div>
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 max-h-96 overflow-y-auto">
            {currentView === 'main' && renderMainView()}
            {currentView === 'accounts' && renderAccountsView()}
            {currentView === 'platform' && renderPlatformView()}
            {currentView === 'status' && renderStatusView()}
            {currentView === 'textAssets' && renderTextAssetsView()}
            {currentView === 'mediaTypes' && renderMediaTypesView()}
            {currentView === 'grouping' && renderGroupingView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;