import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EvidenceLedgerModule", (m) => {
  const ledger = m.contract("EvidenceLedger", []);
  return { ledger };
});
