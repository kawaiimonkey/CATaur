import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_ACTION_KEY = 'audit_log_action';

/**
 * Decorator to specify the action type for audit logging
 * @param actionType Description of the action (e.g., 'Update User', 'Delete Post')
 */
export const AuditLog = (actionType: string) => SetMetadata(AUDIT_LOG_ACTION_KEY, actionType);
