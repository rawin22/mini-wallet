import apiClient from './client';
import { API_CONFIG } from './config';
import type {
  InstantPaymentCreateRequest,
  InstantPaymentCreateResponse,
  InstantPaymentPostRequest,
  InstantPaymentPostResponse,
  AliasExistsResponse,
} from '../types/instant-payment.types';

export const instantPaymentService = {
  /**
   * Check if a customer alias exists
   */
  async checkAliasExists(alias: string): Promise<AliasExistsResponse> {
    const response = await apiClient.get<AliasExistsResponse>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER_ALIAS.EXISTS}/${encodeURIComponent(alias)}`
    );
    return response.data;
  },

  /**
   * Create a new instant payment (draft)
   */
  async createPayment(
    request: InstantPaymentCreateRequest
  ): Promise<InstantPaymentCreateResponse> {
    const response = await apiClient.post<InstantPaymentCreateResponse>(
      API_CONFIG.ENDPOINTS.INSTANT_PAYMENT.CREATE,
      request
    );
    return response.data;
  },

  /**
   * Post (finalize) an instant payment
   */
  async postPayment(
    request: InstantPaymentPostRequest
  ): Promise<InstantPaymentPostResponse> {
    const response = await apiClient.post<InstantPaymentPostResponse>(
      API_CONFIG.ENDPOINTS.INSTANT_PAYMENT.POST,
      request
    );
    return response.data;
  },

  /**
   * Create and immediately post an instant payment (convenience method)
   */
  async sendPayment(
    request: InstantPaymentCreateRequest
  ): Promise<InstantPaymentPostResponse> {
    // Step 1: Create the payment
    const createResponse = await this.createPayment(request);

    if (createResponse.problems && createResponse.problems.length > 0) {
      throw new Error(createResponse.problems[0].message);
    }

    // Step 2: Post the payment
    const postResponse = await this.postPayment({
      paymentId: createResponse.paymentId,
    });

    return postResponse;
  },
};
