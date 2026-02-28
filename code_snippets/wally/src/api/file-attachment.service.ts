import apiClient from './client';

// Types for file attachments
export interface FileAttachmentUploadRequest {
  file: File;
  parentId?: string;
  parentType?: string;
  description?: string;
}

export interface FileAttachmentInfo {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  description?: string;
  status: 'pending' | 'verified' | 'rejected';
  extractedData?: ExtractedData;
}

export interface ExtractedData {
  amount?: number;
  currency?: string;
  date?: string;
  reference?: string;
  bankName?: string;
  confidence?: number;
}

export interface FileAttachmentListResponse {
  attachments: FileAttachmentInfo[];
  totalCount: number;
}

export const fileAttachmentService = {
  /**
   * Upload a file attachment (deposit proof)
   */
  async upload(request: FileAttachmentUploadRequest): Promise<FileAttachmentInfo> {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.parentId) formData.append('parentId', request.parentId);
    if (request.parentType) formData.append('parentType', request.parentType);
    if (request.description) formData.append('description', request.description);

    const response = await apiClient.post<FileAttachmentInfo>(
      '/api/v1/FileAttachment',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * List attachments for a parent entity
   */
  async list(parentId: string): Promise<FileAttachmentListResponse> {
    const response = await apiClient.get<FileAttachmentListResponse>(
      `/api/v1/FileAttachmentInfoList/${parentId}`
    );
    return response.data;
  },

  /**
   * Extract data from an uploaded document using AI
   */
  async extractData(attachmentId: string): Promise<ExtractedData> {
    const response = await apiClient.post<ExtractedData>(
      `/api/v1/FileAttachment/ExtractData/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Delete an attachment
   */
  async delete(attachmentId: string): Promise<void> {
    await apiClient.delete(`/api/v1/FileAttachment/${attachmentId}`);
  },
};
