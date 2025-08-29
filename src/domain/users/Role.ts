/**
 * Enum for user roles in the system.
 * Business rule: Only these roles are allowed for access control and permissions.
 */
export enum UserRole {
	Admin = 'Admin',
	Editor = 'Editor',
	Viewer = 'Viewer',
}