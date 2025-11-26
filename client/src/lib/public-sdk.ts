import { api } from './api'; // Assuming you have a configured axios instance

/**
 * SDK for public-facing API endpoints that do not require authentication.
 */
export const publicSDK = {
  /**
   * Fetches the list of approved condominiums that new users can register with.
   * @returns {Promise<any>} A promise that resolves to the list of condominiums.
   */
  async listApprovedCondominiums() {
    try {
      const response = await api.get('/public/condominiums/approved');
      return response.data;
    } catch (error) {
      console.error('Error fetching approved condominiums:', error);
      // Re-throw the error so the calling component can handle it (e.g., show a toast)
      throw error;
    }
  },

  // You can add other public methods here, for example:
  // async getCondominiumDetails(condoId: string) { ... }
};
