// Payload sent when a user requests access
export interface RequestAccessPayload {
  full_name: string;
  email: string;
  // optional message the user can include
  message?: string;
}
