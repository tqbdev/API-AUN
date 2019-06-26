const BelongToChecks = require('./BelongToChecks');
const CloneAndEvidenceTools = require('./CloneAndEvidenceTools');
const Extraction = require('./Extraction');

module.exports = {
  ...BelongToChecks,
  ...CloneAndEvidenceTools,
  ...Extraction
};
