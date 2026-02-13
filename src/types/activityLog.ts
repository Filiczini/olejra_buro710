export type ActivityAction = 'create' | 'update' | 'delete';

export interface ActivityLog {
  id: string;
  user_email: string;
  action: ActivityAction;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  changes: ActivityChanges;
  created_at: string;
}

export interface ActivityChanges {
  fields?: string[];
  media_added?: number;
  media_removed?: number;
  media_reordered?: boolean;
  blocks_count?: number;
}

export interface ActivityLogsParams {
  page?: number;
  limit?: number;
  user_email?: string;
  action?: ActivityAction;
}
