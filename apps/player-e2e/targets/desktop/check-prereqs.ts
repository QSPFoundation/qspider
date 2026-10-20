// Runs before the desktop E2E build so a missing prerequisite fails in seconds, not after the build.
import { atspiProbes, findMissingPrereqs, INSTALL_HINT, which } from './prereqs.ts';

const missing = findMissingPrereqs(process.platform, which, atspiProbes);
if (missing.length > 0) {
  console.error(`Missing desktop E2E prerequisites: ${missing.join(', ')}. ${INSTALL_HINT}`);
  process.exit(1);
}
