// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EvidenceLedger {
    struct LedgerEntry {
        uint256 timestamp;
        string actionType; // e.g., "UPLOADED", "VIEWED", "ANALYZED", "TRANSFERRED"
        string officerId;
        string details;
    }

    // Mapping from a unique Evidence ID (string) to an array of its ledger entries
    mapping(string => LedgerEntry[]) private evidenceChains;

    // Event emitted when a new action is logged
    event ActionLogged(
        string indexed evidenceId,
        uint256 timestamp,
        string actionType,
        string officerId
    );

    /**
     * @dev Logs a new action on a specific piece of evidence.
     * @param evidenceId The unique identifier of the evidence (e.g., node ID or hash).
     * @param actionType The type of action performed.
     * @param officerId The ID/Badge of the officer performing the action.
     * @param details Any additional details or hashes (e.g., IPFS hash of forensic report).
     */
    function logAction(
        string memory evidenceId,
        string memory actionType,
        string memory officerId,
        string memory details
    ) public {
        LedgerEntry memory newEntry = LedgerEntry({
            timestamp: block.timestamp,
            actionType: actionType,
            officerId: officerId,
            details: details
        });

        evidenceChains[evidenceId].push(newEntry);

        emit ActionLogged(evidenceId, block.timestamp, actionType, officerId);
    }

    /**
     * @dev Retrieves the entire chain of custody for a specific piece of evidence.
     * @param evidenceId The unique identifier of the evidence.
     * @return An array of LedgerEntry structs representing the chronological history.
     */
    function getEvidenceChain(string memory evidenceId)
        public
        view
        returns (LedgerEntry[] memory)
    {
        return evidenceChains[evidenceId];
    }
}
