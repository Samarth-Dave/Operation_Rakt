const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EvidenceLedgerModule", (m) => {
  const ledger = m.contract("EvidenceLedger", []);
  return { ledger };
});
