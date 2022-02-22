export interface QspLocation {
  name: string;
  desc: string;
  code: string;
  actions: QspAction[];
}

export interface QspAction {
  image: string;
  action_name: string;
  action_code: string;
}
