import React, { useState } from "react";
import {
  Dialog,
  DialogPanel,
  Button,
  TextInput,
  Select,
  SelectItem,
} from "@tremor/react";

interface AddTrackingDomainDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { mainDomain: string; subdomain: string; mode: "existing" | "new" }) => void;
  existingSubdomains: string[];
}

const AddTrackingDomainDialog: React.FC<AddTrackingDomainDialogProps> = ({
  open,
  onClose,
  onSubmit,
  existingSubdomains,
}) => {
  const [mainDomain, setMainDomain] = useState("");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedSubdomain, setSelectedSubdomain] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [showNSInstructions, setShowNSInstructions] = useState(false);
  const [touched, setTouched] = useState(false);

  const isMainDomainValid = !!mainDomain && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(mainDomain);
  const isNewSubdomainValid = !newSubdomain || /^[a-zA-Z0-9-]+$/.test(newSubdomain);

  const handleSubmit = () => {
    if (!isMainDomainValid) return;
    if (mode === "existing" && !selectedSubdomain) return;
    if (mode === "new" && (!newSubdomain || !isNewSubdomainValid)) return;
    onSubmit({
      mainDomain,
      subdomain: mode === "existing" ? selectedSubdomain : newSubdomain,
      mode,
    });
    setShowNSInstructions(false);
    setMainDomain("");
    setSelectedSubdomain("");
    setNewSubdomain("");
    setMode("existing");
    setTouched(false);
    onClose();
  };

  const handleModeChange = (value: "existing" | "new") => {
    setMode(value);
    setShowNSInstructions(false);
    setTouched(false);
  };

  const handleNewSubdomainBlur = () => {
    if (mode === "new" && newSubdomain) {
      setShowNSInstructions(true);
    }
    setTouched(true);
  };

  return (
    <Dialog open={open} onClose={onClose} static={true}>
      <DialogPanel>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Tracking Domain
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Domain
            </label>
            <TextInput
              value={mainDomain}
              onChange={e => setMainDomain(e.target.value)}
              placeholder="example.com"
              error={!!mainDomain && !isMainDomainValid}
            />
            {mainDomain && !isMainDomainValid && (
              <div className="text-xs text-red-500 mt-1">
                Enter a valid domain (e.g. example.com)
              </div>
            )}
          </div>
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="new"
                checked={mode === "new"}
                onChange={() => handleModeChange("new")}
                className="accent-blue-500"
              />
              <span>Create new subdomain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="existing"
                checked={mode === "existing"}
                onChange={() => handleModeChange("existing")}
                className="accent-blue-500"
              />
              <span>Use existing subdomain</span>
            </label>
          </div>
          {mode === "existing" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Subdomain
              </label>
              <Select
                value={selectedSubdomain}
                onValueChange={setSelectedSubdomain}
                placeholder="Select a subdomain"
              >
                {existingSubdomains.map(sub => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Subdomain
              </label>
              <TextInput
                value={newSubdomain}
                onChange={e => setNewSubdomain(e.target.value)}
                onBlur={handleNewSubdomainBlur}
                placeholder="track"
                error={touched && !!newSubdomain && !isNewSubdomainValid}
              />
              {touched && !!newSubdomain && !isNewSubdomainValid && (
                <div className="text-xs text-red-500 mt-1">
                  Only letters, numbers, and hyphens allowed.
                </div>
              )}
            </div>
          )}
          {showNSInstructions && mode === "new" && isMainDomainValid && isNewSubdomainValid && newSubdomain && (
            <div className="text-blue-700 bg-blue-50 rounded p-2 mt-2 text-sm">
              Please set the following NS records in your DNS server for <b>{newSubdomain}.{mainDomain}</b>.<br />
              <span>
                (Provide your actual NS record instructions here, e.g. point to ns1.yourservice.com and ns2.yourservice.com)
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={
                !isMainDomainValid ||
                (mode === "existing" && !selectedSubdomain) ||
                (mode === "new" && (!newSubdomain || !isNewSubdomainValid))
              }
              onClick={handleSubmit}
            >
              Add Domain
            </Button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default AddTrackingDomainDialog; 