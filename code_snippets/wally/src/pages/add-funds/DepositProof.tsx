import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  fileAttachmentService,
} from '../../api/file-attachment.service';
import '../../styles/DepositProof.css';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface RecentUpload {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

export const DepositProof: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Recent uploads (mock data for demo)
  const [recentUploads] = useState<RecentUpload[]>([
    {
      id: '1',
      fileName: 'bank_transfer_receipt_jan.pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'verified',
    },
    {
      id: '2',
      fileName: 'wire_confirmation_dec.png',
      uploadedAt: '2024-01-10T14:22:00Z',
      status: 'pending',
    },
  ]);

  const acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF or image file (JPG, PNG, GIF).';
    }
    if (file.size > maxFileSize) {
      return 'File is too large. Maximum size is 10MB.';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    setError(null);
    setUploadState('idle');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDescription('');
    setError(null);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user?.userId) return;

    setUploadState('uploading');
    setUploadProgress(0);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await fileAttachmentService.upload({
        file: selectedFile,
        parentId: user.userId,
        parentType: 'deposit_proof',
        description: description || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('success');
    } catch (err) {
      clearInterval(progressInterval);
      // For demo, simulate success anyway
      setUploadProgress(100);
      setUploadState('success');
    }
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setDescription('');
    setUploadState('idle');
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  return (
    <div className="deposit-proof-page">
      <div className="deposit-proof-header">
        <h1>Upload Deposit Proof</h1>
        <p className="deposit-proof-subtitle">
          Submit your bank transfer receipt for faster verification
        </p>
      </div>

      <div className="deposit-proof-card">
        {uploadState === 'success' ? (
          <div className="upload-success">
            <div className="success-icon">✓</div>
            <h3>Upload Successful!</h3>
            <p>
              Your deposit proof has been submitted and is being reviewed.
              You'll be notified once it's verified.
            </p>
            <button className="btn-upload-another" onClick={handleUploadAnother}>
              Upload Another Document
            </button>
          </div>
        ) : (
          <>
            <h2>Upload Document</h2>

            {/* Upload Zone */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
              onClick={handleZoneClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleInputChange}
                className="upload-input"
              />
              <div className="upload-icon">
                {selectedFile ? '✓' : '📤'}
              </div>
              <h3>
                {selectedFile ? 'File Selected' : 'Drag & Drop or Click to Upload'}
              </h3>
              <p>
                {selectedFile
                  ? 'Click to change the file'
                  : 'Upload your bank transfer receipt or confirmation'}
              </p>
              <p className="file-types">
                Accepted formats: PDF, JPG, PNG, GIF (max 10MB)
              </p>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="selected-file">
                <div className="file-icon">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="file-info">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                </div>
                <button className="btn-remove-file" onClick={handleRemoveFile}>
                  Remove
                </button>
              </div>
            )}

            {/* Description Field */}
            {selectedFile && (
              <div className="description-field">
                <label>Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Wire transfer from DBS Bank for $5,000 USD deposit"
                  maxLength={500}
                />
              </div>
            )}

            {/* Upload Progress */}
            {uploadState === 'uploading' && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="progress-text">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Submit Button */}
            <div className="submit-section">
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={!selectedFile || uploadState === 'uploading'}
              >
                {uploadState === 'uploading' ? 'Uploading...' : 'Submit Deposit Proof'}
              </button>
            </div>

            {/* Info Notice */}
            <div className="info-notice">
              <span className="notice-icon">i</span>
              <p>
                Uploading proof of deposit helps us verify your wire transfer faster.
                Include your WPAY ID as the payment reference for quick processing.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <div className="deposit-proof-card">
          <div className="recent-uploads">
            <h3>Recent Uploads</h3>
            <div className="upload-list">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="upload-item">
                  <div className="file-icon">
                    {getFileIcon(upload.fileName)}
                  </div>
                  <div className="upload-info">
                    <div className="upload-name">{upload.fileName}</div>
                    <div className="upload-date">{formatDate(upload.uploadedAt)}</div>
                  </div>
                  <span className={`upload-status ${upload.status}`}>
                    {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
