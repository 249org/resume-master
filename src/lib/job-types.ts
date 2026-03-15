export interface JobType {
  id: string
  label: string
  category: string
  keywords: string[]
}

export const JOB_TYPES: JobType[] = [
  // ── Engineering ──────────────────────────────────────────────────────────
  {
    id: 'software-engineer',
    label: 'Software Engineer',
    category: 'Engineering',
    keywords: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'API', 'REST', 'SQL', 'Git', 'Agile', 'testing', 'code review', 'debugging'],
  },
  {
    id: 'frontend-engineer',
    label: 'Frontend Engineer',
    category: 'Engineering',
    keywords: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'responsive', 'accessibility', 'a11y', 'UI', 'UX', 'state management', 'Redux'],
  },
  {
    id: 'backend-engineer',
    label: 'Backend Engineer',
    category: 'Engineering',
    keywords: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'API', 'REST', 'GraphQL', 'database', 'SQL', 'PostgreSQL', 'Redis', 'microservices', 'Docker', 'Linux'],
  },
  {
    id: 'fullstack',
    label: 'Full Stack Engineer',
    category: 'Engineering',
    keywords: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'API', 'REST', 'database', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'CI/CD', 'frontend', 'backend'],
  },
  {
    id: 'mobile-engineer',
    label: 'Mobile Engineer',
    category: 'Engineering',
    keywords: ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xcode', 'mobile', 'app store', 'push notifications', 'offline', 'performance'],
  },
  {
    id: 'ios-engineer',
    label: 'iOS Engineer',
    category: 'Engineering',
    keywords: ['Swift', 'Objective-C', 'Xcode', 'iOS', 'UIKit', 'SwiftUI', 'CoreData', 'Apple', 'App Store', 'Instruments', 'networking', 'MVVM'],
  },
  {
    id: 'android-engineer',
    label: 'Android Engineer',
    category: 'Engineering',
    keywords: ['Kotlin', 'Java', 'Android', 'Jetpack Compose', 'Android Studio', 'MVVM', 'Retrofit', 'Room', 'Coroutines', 'Google Play', 'material design'],
  },
  {
    id: 'embedded-engineer',
    label: 'Embedded Systems Engineer',
    category: 'Engineering',
    keywords: ['C', 'C++', 'embedded', 'RTOS', 'firmware', 'microcontroller', 'ARM', 'FPGA', 'hardware', 'debugging', 'protocols', 'IoT', 'low-level'],
  },
  {
    id: 'game-developer',
    label: 'Game Developer',
    category: 'Engineering',
    keywords: ['Unity', 'Unreal Engine', 'C#', 'C++', 'game engine', '3D', '2D', 'physics', 'rendering', 'shaders', 'multiplayer', 'performance optimization'],
  },
  // ── Data & AI ─────────────────────────────────────────────────────────────
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    category: 'Data & AI',
    keywords: ['Python', 'R', 'SQL', 'machine learning', 'statistics', 'pandas', 'numpy', 'visualization', 'Tableau', 'experimentation', 'A/B test', 'model', 'data pipeline'],
  },
  {
    id: 'ml-engineer',
    label: 'ML / AI Engineer',
    category: 'Data & AI',
    keywords: ['machine learning', 'Python', 'TensorFlow', 'PyTorch', 'MLOps', 'model', 'training', 'inference', 'NLP', 'computer vision', 'data pipeline', 'AWS', 'GPU'],
  },
  {
    id: 'data-engineer',
    label: 'Data Engineer',
    category: 'Data & AI',
    keywords: ['SQL', 'Python', 'Spark', 'Airflow', 'ETL', 'data pipeline', 'Kafka', 'Redshift', 'BigQuery', 'dbt', 'Snowflake', 'data warehouse', 'orchestration'],
  },
  {
    id: 'data-analyst',
    label: 'Data Analyst',
    category: 'Data & AI',
    keywords: ['SQL', 'Excel', 'Tableau', 'Power BI', 'Python', 'data visualization', 'reporting', 'dashboard', 'KPI', 'metrics', 'analysis', 'business intelligence'],
  },
  {
    id: 'ai-researcher',
    label: 'AI Researcher',
    category: 'Data & AI',
    keywords: ['deep learning', 'research', 'publications', 'PyTorch', 'TensorFlow', 'NLP', 'computer vision', 'reinforcement learning', 'transformer', 'neural network', 'papers'],
  },
  // ── Infrastructure & Security ─────────────────────────────────────────────
  {
    id: 'devops',
    label: 'DevOps Engineer',
    category: 'Infrastructure & Security',
    keywords: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'monitoring', 'Jenkins', 'GitHub Actions', 'infrastructure', 'deployment'],
  },
  {
    id: 'sre',
    label: 'Site Reliability Engineer (SRE)',
    category: 'Infrastructure & Security',
    keywords: ['SRE', 'reliability', 'uptime', 'SLA', 'Kubernetes', 'monitoring', 'Prometheus', 'Grafana', 'incident response', 'on-call', 'observability', 'automation'],
  },
  {
    id: 'cloud-architect',
    label: 'Cloud Architect',
    category: 'Infrastructure & Security',
    keywords: ['AWS', 'Azure', 'GCP', 'architecture', 'cloud', 'microservices', 'serverless', 'networking', 'security', 'cost optimization', 'multi-region', 'IaC'],
  },
  {
    id: 'security-engineer',
    label: 'Security Engineer',
    category: 'Infrastructure & Security',
    keywords: ['security', 'penetration testing', 'vulnerability', 'SIEM', 'SOC', 'IAM', 'cryptography', 'compliance', 'threat modeling', 'firewall', 'zero trust', 'OWASP'],
  },
  {
    id: 'network-engineer',
    label: 'Network Engineer',
    category: 'Infrastructure & Security',
    keywords: ['networking', 'TCP/IP', 'BGP', 'OSPF', 'Cisco', 'routing', 'switching', 'firewalls', 'VPN', 'DNS', 'load balancing', 'Wireshark', 'troubleshooting'],
  },
  // ── Product & Design ──────────────────────────────────────────────────────
  {
    id: 'product-manager',
    label: 'Product Manager',
    category: 'Product & Design',
    keywords: ['product', 'roadmap', 'stakeholder', 'agile', 'scrum', 'user story', 'prioritization', 'metrics', 'KPI', 'cross-functional', 'requirements', 'launch', 'strategy'],
  },
  {
    id: 'technical-pm',
    label: 'Technical Product Manager',
    category: 'Product & Design',
    keywords: ['product', 'technical', 'API', 'engineering', 'roadmap', 'specifications', 'data', 'metrics', 'agile', 'sprint', 'architecture', 'requirements', 'integration'],
  },
  {
    id: 'ux-designer',
    label: 'UX Designer',
    category: 'Product & Design',
    keywords: ['UX', 'user research', 'wireframes', 'prototyping', 'Figma', 'usability', 'design thinking', 'information architecture', 'user testing', 'accessibility', 'personas'],
  },
  {
    id: 'ui-designer',
    label: 'UI Designer',
    category: 'Product & Design',
    keywords: ['UI', 'Figma', 'design systems', 'visual design', 'typography', 'color', 'components', 'prototyping', 'responsive', 'branding', 'illustrations', 'animations'],
  },
  {
    id: 'product-designer',
    label: 'Product Designer',
    category: 'Product & Design',
    keywords: ['product design', 'Figma', 'user research', 'prototyping', 'design systems', 'UX', 'UI', 'wireframes', 'usability testing', 'cross-functional', 'iterations'],
  },
  // ── Management & Leadership ────────────────────────────────────────────────
  {
    id: 'engineering-manager',
    label: 'Engineering Manager',
    category: 'Management & Leadership',
    keywords: ['engineering', 'management', 'team', 'leadership', 'roadmap', 'hiring', '1:1', 'performance', 'mentoring', 'delivery', 'agile', 'cross-functional', 'stakeholder'],
  },
  {
    id: 'cto',
    label: 'CTO / VP of Engineering',
    category: 'Management & Leadership',
    keywords: ['CTO', 'leadership', 'strategy', 'architecture', 'scaling', 'hiring', 'culture', 'roadmap', 'stakeholder', 'budget', 'OKR', 'vision', 'technical direction'],
  },
  {
    id: 'project-manager',
    label: 'Project Manager',
    category: 'Management & Leadership',
    keywords: ['project management', 'PMP', 'agile', 'scrum', 'waterfall', 'milestones', 'risk', 'budget', 'timeline', 'stakeholders', 'delivery', 'resource planning'],
  },
  {
    id: 'scrum-master',
    label: 'Scrum Master',
    category: 'Management & Leadership',
    keywords: ['Scrum', 'agile', 'sprint', 'retrospective', 'velocity', 'backlog', 'Kanban', 'facilitation', 'coaching', 'impediments', 'Jira', 'SAFe', 'ceremonies'],
  },
  // ── Business & Finance ────────────────────────────────────────────────────
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    category: 'Business & Finance',
    keywords: ['business analysis', 'requirements', 'stakeholder', 'process', 'documentation', 'SQL', 'Visio', 'BPMN', 'user stories', 'gap analysis', 'reporting', 'Excel'],
  },
  {
    id: 'financial-analyst',
    label: 'Financial Analyst',
    category: 'Business & Finance',
    keywords: ['financial modeling', 'Excel', 'forecasting', 'budgeting', 'valuation', 'DCF', 'P&L', 'variance analysis', 'reporting', 'SQL', 'Tableau', 'CFA', 'accounting'],
  },
  {
    id: 'consultant',
    label: 'Management Consultant',
    category: 'Business & Finance',
    keywords: ['consulting', 'strategy', 'analysis', 'recommendations', 'client', 'problem solving', 'presentations', 'Excel', 'PowerPoint', 'research', 'frameworks', 'MBA'],
  },
  {
    id: 'marketing-manager',
    label: 'Marketing Manager',
    category: 'Business & Finance',
    keywords: ['marketing', 'campaigns', 'digital marketing', 'SEO', 'SEM', 'content', 'branding', 'analytics', 'social media', 'email marketing', 'budget', 'ROI', 'growth'],
  },
  {
    id: 'growth-marketer',
    label: 'Growth / Performance Marketer',
    category: 'Business & Finance',
    keywords: ['growth', 'acquisition', 'retention', 'A/B testing', 'funnel', 'paid ads', 'Google Ads', 'Meta', 'LTV', 'CAC', 'analytics', 'conversion', 'experimentation'],
  },
  // ── Science & Research ────────────────────────────────────────────────────
  {
    id: 'research-scientist',
    label: 'Research Scientist',
    category: 'Science & Research',
    keywords: ['research', 'publications', 'experiments', 'methodology', 'statistics', 'Python', 'R', 'data analysis', 'literature review', 'hypothesis', 'peer review'],
  },
  {
    id: 'bioinformatics',
    label: 'Bioinformatics Scientist',
    category: 'Science & Research',
    keywords: ['bioinformatics', 'genomics', 'Python', 'R', 'sequencing', 'pipeline', 'BLAST', 'alignment', 'statistics', 'biology', 'computational', 'machine learning'],
  },
]

export const JOB_TYPE_CATEGORIES = [...new Set(JOB_TYPES.map((j) => j.category))]

const byId = new Map(JOB_TYPES.map((j) => [j.id, j]))

export function getJobType(id: string): JobType | undefined {
  return byId.get(id)
}

export function getJobTypeLabel(id: string): string {
  return byId.get(id)?.label ?? id
}
