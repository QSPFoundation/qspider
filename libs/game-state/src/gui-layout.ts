import { buildLayoutTree, CfgData, convertLayer, convertPane } from './qsp-gui-cfg';

export function buildGuiLayoutTemplate(cfg: CfgData, defaultTemplate: string): string {
  const layout = buildLayoutTree(cfg.Panels);
  let template = '';
  if (layout.layer) template += convertLayer(layout.layer, cfg.Docks, defaultTemplate);
  for (const floating of layout.floating) {
    template += convertPane(floating, defaultTemplate, true);
  }
  return template;
}
