import contract from './Transactions.json';

export const { abi: contractAbi } = contract;
export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
