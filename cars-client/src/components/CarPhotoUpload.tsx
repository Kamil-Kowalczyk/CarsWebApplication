import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadCarPhoto } from '../services/carService';
import { queryKeys } from '../queries/queryKey';

interface CarPhotoUploadProps {
  carId: string;
}

export const CarPhotoUpload = ({ carId }: CarPhotoUploadProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCarPhoto(carId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) });
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (selectedFile) uploadMutation.mutate(selectedFile);
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="photo-upload">
      <h3 className="photo-upload-title">Upload Photo</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="photo-upload-input"
      />
      {preview && (
        <div className="photo-upload-preview">
          <img src={preview} alt="Preview" className="photo-preview-img" />
          <div className="photo-upload-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {uploadMutation.isError && (
        <p className="form-error">
          Failed to upload photo: {uploadMutation.error?.message}
        </p>
      )}
    </div>
  );
};

export default CarPhotoUpload;
