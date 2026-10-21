// Builds the derived fixtures: the web test pack (a zip of game.cfg and the games it lists, which
// the web player imports through its Open game input, see OperateWebPlayer.loadTestPack) and the
// open-route archives.
import { buildFixtures } from '../../fixtures/build-fixtures';

export default async function globalSetup(): Promise<void> {
  await buildFixtures();
}
