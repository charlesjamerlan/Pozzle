export interface ConsistencyMetric {
  category: string;
  score: number;
  total: number;
  unique: number;
  issues: string[];
  recommendation: string;
}

export interface ConsistencyReport {
  overallScore: number;
  grade: string;
  metrics: ConsistencyMetric[];
  topIssues: string[];
  recommendations: string[];
}
