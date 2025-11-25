import { MarketplaceSDK } from './MarketplaceSDK';
import { AuthSDK } from './AuthSDK';
import { LoanSDK } from './LoanSDK'; // Import the new LoanSDK

class SDK {
  public marketplace: MarketplaceSDK;
  public auth: AuthSDK;
  public loans: LoanSDK; // Add the loans SDK

  constructor() {
    this.marketplace = new MarketplaceSDK();
    this.auth = new AuthSDK();
    this.loans = new LoanSDK(); // Instantiate it
  }
}

export const sdk = new SDK();
