const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to get the auth token from localStorage
const getAuthToken = () => {
    if (typeof window === 'undefined') return null; // Server-side rendering safety
    return localStorage.getItem('authToken');
};

// A helper to make authenticated requests
const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        // Try to parse error message from body, otherwise throw generic error
        try {
            const errorBody = await response.json();
            throw new Error(errorBody.message || `Request failed with status ${response.status}`);
        } catch {
            throw new Error(`Request failed with status ${response.status}`);
        }
    }
    // Handle 204 No Content response
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export class MarketplaceSDK {

    // ===== MARKETPLACE ITEMS ("Achadinhos") =====

    async listMarketplaceItems() {
        return authenticatedRequest(`${API_URL}/marketplace/items`);
    }

    async createMarketplaceItem(data: { title: string; description?: string; category: string; price: number; imageUrl?: string; }) {
        return authenticatedRequest(`${API_URL}/marketplace/items`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMarketplaceItemDetails(id: string) {
        return authenticatedRequest(`${API_URL}/marketplace/items/${id}`);
    }

    async updateMarketplaceItem(id: string, data: Partial<{ title: string; description: string; price: number; status: string; }>) {
        return authenticatedRequest(`${API_URL}/marketplace/items/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteMarketplaceItem(id: string) {
        return authenticatedRequest(`${API_URL}/marketplace/items/${id}`, {
            method: 'DELETE',
        });
    }

    // ===== SERVICES =====

    async listServices(userId?: string) {
        let url = `${API_URL}/services`;
        if (userId) {
            url += `?userId=${userId}`;
        }
        return authenticatedRequest(url);
    }

    // Other service methods (create, update, delete) can be added here following the same pattern.
    
    // ===== SELLERS =====

    async listSellers() {
         return authenticatedRequest(`${API_URL}/marketplace/sellers`);
    }
}
