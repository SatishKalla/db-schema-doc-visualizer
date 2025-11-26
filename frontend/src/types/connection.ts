export interface Connection {
  id: string;
  name: string;
  db_type: string;
  host: string;
  port: number;
  db_user: string;
  db_password: string;
  user_id: string;
  recentDatabase: string;
  lastConnected: string;
  created_at?: string;
  updated_at?: string;
  databases: {
    name: string;
    id: string;
  };
}

export interface ConnectionPayload {
  client: string;
  connection: {
    name: string;
    host: string;
    port: number;
    user: string;
    password: string;
  };
  restrictConnection?: string;
}
