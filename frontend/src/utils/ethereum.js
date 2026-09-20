import { ethers } from 'ethers';

// TODO: Replace with the deployed contract address from Ganache/Remix
export const CONTRACT_ADDRESS = "0x3a4701A93EE5A0557CbA74391cff97d212aE9D4c";

// The ABI for the EvidenceLedger contract
const CONTRACT_ABI = [
  "function logAction(string evidenceId, string actionType, string officerId, string details) public",
  "function getEvidenceChain(string evidenceId) public view returns (tuple(uint256 timestamp, string actionType, string officerId, string details)[])",
  "event ActionLogged(string indexed evidenceId, uint256 timestamp, string actionType, string officerId)"
];

/**
 * Request MetaMask account access
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask (or compatible Web3 wallet) is not installed!");
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

/**
 * Get a read-only instance of the contract
 */
export async function getContractReadOnly() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Get a writable instance of the contract (requires signer)
 */
export async function getContractWritable() {
  const { signer } = await connectWallet();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Fetch the chain of custody for a given evidence ID
 */
export async function fetchEvidenceChain(evidenceId) {
  try {
    const contract = await getContractReadOnly();
    const chain = await contract.getEvidenceChain(evidenceId);

    // Convert the returned ethers Result into standard JS objects
    return chain.map(entry => ({
      timestamp: Number(entry.timestamp),
      actionType: entry.actionType,
      officerId: entry.officerId,
      details: entry.details
    }));
  } catch (error) {
    console.error("Error fetching evidence chain:", error);
    throw error;
  }
}

/**
 * Log a new action on the blockchain via MetaMask
 */
export async function logEvidenceAction(evidenceId, actionType, officerId, details) {
  try {
    const contract = await getContractWritable();

    // This will prompt MetaMask to sign the transaction
    const tx = await contract.logAction(evidenceId, actionType, officerId, details);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error logging evidence action:", error);
    throw error;
  }
}
