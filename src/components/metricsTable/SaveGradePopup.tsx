import React, { useState } from "react";
import { Card, Title, Button } from "@tremor/react";
import { metricsApi } from "../../services/api";

interface SaveGradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

const SaveGradePopup: React.FC<SaveGradePopupProps> = ({
  isOpen,
  onClose,
  campaignId,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedGrade) return;
    
    setIsSaving(true);
    try {
      await metricsApi.saveGrade(campaignId, selectedGrade);
      onClose();
    } catch (error) {
      console.error("Failed to save grade:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Title>Add Today's Grade</Title>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <Title className="text-lg mb-2">Select Grade</Title>
          <div className="space-y-2">
            {["Cut", "Below Average", "Above Average", "Good"].map((grade) => (
              <div key={grade} className="flex items-center">
                <input
                  type="radio"
                  id={grade}
                  name="grade"
                  value={grade}
                  checked={selectedGrade === grade}
                  onChange={() => setSelectedGrade(grade)}
                  className="mr-2"
                />
                <label htmlFor={grade}>{grade}</label>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!selectedGrade || isSaving}
              loading={isSaving}
            >
              Save Grade
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SaveGradePopup;