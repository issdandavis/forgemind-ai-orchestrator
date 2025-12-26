
export enum TaskStatus {
  PENDING = 'Pending',
  RESEARCHING = 'Researching',
  GENERATING_CODE = 'Generating Code',
  TESTING = 'Testing',
  TESTED = 'Tested',
  TEST_FAILED = 'Test Failed',
  COMMITTING = 'Committing to GitHub',
  DEPLOYING = 'Deploying',
  UPDATING_NOTION = 'Updating Notion',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface ResearchOutput {
  summary: string;
  sources: { title: string; uri: string }[];
  keyFindings: string[];
}

export interface CodeImplementation {
  firebase: string;
  aiStudio: string;
  replit: string;
}

export interface TestSuite {
  framework: string;
  testCode: string;
  results?: string;
}

export interface ProjectFeedback {
  rating: number;
  comments: string;
  timestamp: Date;
}

export interface AmazonInfra {
  s3Bucket: string;
  lambdaArn: string;
  kindleSync: boolean;
}

export interface ResearchTask {
  id: string;
  topic: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  research?: ResearchOutput;
  code?: CodeImplementation;
  unitTests?: TestSuite;
  feedback?: ProjectFeedback;
  infra?: AmazonInfra;
  shopifyUpdate?: any;
  error?: string;
  notionPageId: string;
  retryCount?: number;
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'ai';
  message: string;
  taskId?: string;
}

export interface ZapActivity {
  id: string;
  name: string;
  status: 'success' | 'running' | 'failed';
  timestamp: Date;
}

export interface ProtonStatus {
  vpnConnected: boolean;
  server: string;
  encryptionLevel: string;
}

export interface AgentState {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'error';
  currentTask: string;
  progress: number;
  startTime?: number;
}

export interface ShopifyMetrics {
  sales: string;
  orders: number;
  conversion: string;
}
