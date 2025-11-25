import { authenticatedFetch } from './auth'; // Assuming a shared auth fetch utility
import { Loan, LoanRequest, LoanOffer } from '@shared/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ===== LOAN REQUESTS =====

async function createLoanRequest(data: { itemName: string; description: string; duration: string; }): Promise<LoanRequest> {
    return authenticatedFetch(`${API_URL}/loans/requests`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

async function listOpenLoanRequests(): Promise<LoanRequest[]> {
    return authenticatedFetch(`${API_URL}/loans/requests`);
}

async function getLoanRequestDetails(id: string): Promise<any> {
    return authenticatedFetch(`${API_URL}/loans/requests/${id}`);
}

// ===== LOAN OFFERS =====

async function createLoanOffer(requestId: string): Promise<LoanOffer> {
    return authenticatedFetch(`${API_URL}/loans/requests/${requestId}/offers`, {
        method: 'POST',
    });
}

// ===== LOAN AGREEMENTS & LIFECYCLE =====

async function createLoanAgreement(data: { offerId: string; agreedReturnDate: Date; digitalTerm: string; }): Promise<Loan> {
    return authenticatedFetch(`${API_URL}/loans`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

async function getUserLoans(): Promise<Loan[]> {
    return authenticatedFetch(`${API_URL}/loans/my-loans`); // Assuming this route exists
}

async function getLoanDetails(id: string): Promise<any> {
    return authenticatedFetch(`${API_URL}/loans/${id}`);
}

async function confirmHandover(loanId: string, payload: { handoverPhotos?: string[]; conditionNotes?: string; }): Promise<Loan> {
    return authenticatedFetch(`${API_URL}/loans/${loanId}/handover`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

async function initiateReturn(loanId: string, payload: { returnPhotos?: string[]; conditionNotes?: string; }): Promise<Loan> {
    return authenticatedFetch(`${API_URL}/loans/${loanId}/return`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

async function confirmReturnByOwner(loanId: string): Promise<Loan> {
    return authenticatedFetch(`${API_URL}/loans/${loanId}/return-confirm`, {
        method: 'POST',
    });
}

export const loanSDK = {
    requests: {
        create: createLoanRequest,
        list: listOpenLoanRequests,
        get: getLoanRequestDetails,
    },
    offers: {
        create: createLoanOffer,
    },
    agreements: {
        create: createLoanAgreement,
        getUserLoans,
        getDetails: getLoanDetails,
        confirmHandover,
        initiateReturn,
        confirmReturnByOwner,
    },
};
