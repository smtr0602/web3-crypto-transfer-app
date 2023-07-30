import { MetaMaskInpageProvider } from '@metamask/providers';
import { BigNumber } from 'ethers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export interface Transaction {
  addressTo: string;
  addressFrom: string;
  timestamp: BigNumber;
  message: string;
  amount: BigNumber;
}
