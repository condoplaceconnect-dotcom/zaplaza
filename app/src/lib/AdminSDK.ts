import { authenticatedFetch } from './auth'; 
import { Condominium, Report } from '@shared/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ===== ADMIN SDK =====

// --- Condominium Management ---

async function listPendingCondominiums(): Promise<Condominium[]> {
    return authenticatedFetch(`${API_URL}/admin/condominiums/pending`);
}

async function approveCondominium(condoId: string): Promise<Condominium> {
    return authenticatedFetch(`${API_URL}/admin/condominiums/${condoId}/approve`, {
        method: 'POST',
    });
}

// --- Report Management ---

async function listReports(): Promise<Report[]> {
    return authenticatedFetch(`${API_URL}/admin/reports`);
}


export const adminSDK = {
    condominiums: {
        listPending: listPendingCondominiums,
        approve: approveCondominium,
    },
    reports: {
        list: listReports,
    },
};
