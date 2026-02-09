/** O*NET Career Clusters mapped to RIASEC codes */

export interface OnetCluster {
  id: string;
  name: string;
  riasecCodes: string[];
  description: string;
  exampleCareers: string[];
}

export const ONET_CLUSTERS: OnetCluster[] = [
  {
    id: 'agriculture',
    name: 'Agriculture, Food & Natural Resources',
    riasecCodes: ['RIC', 'RIS'],
    description: 'Careers in producing, processing, and distributing food and natural resources.',
    exampleCareers: ['Agricultural Engineer', 'Environmental Scientist', 'Food Scientist'],
  },
  {
    id: 'architecture',
    name: 'Architecture & Construction',
    riasecCodes: ['RIA', 'RIC'],
    description: 'Designing, building, and maintaining structures and infrastructure.',
    exampleCareers: ['Architect', 'Civil Engineer', 'Urban Planner'],
  },
  {
    id: 'arts',
    name: 'Arts, Audio/Video Technology & Communications',
    riasecCodes: ['AES', 'ASE'],
    description: 'Creating, performing, and producing artistic and media content.',
    exampleCareers: ['Graphic Designer', 'Film Director', 'UX Designer', 'Technical Writer'],
  },
  {
    id: 'business',
    name: 'Business Management & Administration',
    riasecCodes: ['ESC', 'ECS'],
    description: 'Planning, organizing, directing, and evaluating business operations.',
    exampleCareers: ['Management Consultant', 'Operations Manager', 'Project Manager'],
  },
  {
    id: 'education',
    name: 'Education & Training',
    riasecCodes: ['SAE', 'SEC'],
    description: 'Teaching, training, and supporting learning at all levels.',
    exampleCareers: ['Teacher', 'Instructional Designer', 'Corporate Trainer', 'School Counselor'],
  },
  {
    id: 'finance',
    name: 'Finance',
    riasecCodes: ['CEI', 'CES'],
    description: 'Managing money, banking, investments, and financial planning.',
    exampleCareers: ['Financial Analyst', 'Accountant', 'Investment Banker'],
  },
  {
    id: 'government',
    name: 'Government & Public Administration',
    riasecCodes: ['ESC', 'SEC'],
    description: 'Governing and administering public policy and programs.',
    exampleCareers: ['Policy Analyst', 'Public Administrator', 'Urban Planner'],
  },
  {
    id: 'health',
    name: 'Health Science',
    riasecCodes: ['ISR', 'SIR'],
    description: 'Promoting health, wellness, and treating medical conditions.',
    exampleCareers: ['Physician', 'Nurse', 'Biomedical Researcher', 'Physical Therapist'],
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    riasecCodes: ['ESA', 'SEA'],
    description: 'Managing restaurants, hotels, tourism, and recreation services.',
    exampleCareers: ['Hotel Manager', 'Event Planner', 'Chef', 'Travel Agent'],
  },
  {
    id: 'human_services',
    name: 'Human Services',
    riasecCodes: ['SEA', 'SAE'],
    description: 'Helping individuals and families meet their needs.',
    exampleCareers: ['Social Worker', 'Counselor', 'Community Organizer'],
  },
  {
    id: 'it',
    name: 'Information Technology',
    riasecCodes: ['IRC', 'ICR'],
    description: 'Designing, developing, and managing technology systems.',
    exampleCareers: ['Software Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'DevOps Engineer'],
  },
  {
    id: 'law',
    name: 'Law, Public Safety, Corrections & Security',
    riasecCodes: ['EIS', 'ESI'],
    description: 'Enforcing laws, providing security, and legal services.',
    exampleCareers: ['Lawyer', 'Paralegal', 'Forensic Analyst', 'Security Consultant'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    riasecCodes: ['RIC', 'RCI'],
    description: 'Processing materials into products using machines and tools.',
    exampleCareers: ['Industrial Engineer', 'Quality Control Specialist', 'CNC Programmer'],
  },
  {
    id: 'marketing',
    name: 'Marketing, Sales & Service',
    riasecCodes: ['EAS', 'ESA'],
    description: 'Communicating value and selling products or services.',
    exampleCareers: ['Marketing Manager', 'Sales Director', 'Brand Strategist', 'Product Manager'],
  },
  {
    id: 'science',
    name: 'Science, Technology, Engineering & Mathematics',
    riasecCodes: ['IRA', 'IRC'],
    description: 'Conducting research, engineering solutions, and advancing knowledge.',
    exampleCareers: ['Research Scientist', 'Mechanical Engineer', 'Mathematician', 'AI Researcher'],
  },
  {
    id: 'transportation',
    name: 'Transportation, Distribution & Logistics',
    riasecCodes: ['REC', 'RCE'],
    description: 'Moving people and materials efficiently and safely.',
    exampleCareers: ['Logistics Manager', 'Supply Chain Analyst', 'Transportation Planner'],
  },
];

export function getClusterById(id: string): OnetCluster | undefined {
  return ONET_CLUSTERS.find((c) => c.id === id);
}

export function getClustersByRiasec(riasecCode: string): OnetCluster[] {
  const topLetters = riasecCode.slice(0, 3).split('');
  return ONET_CLUSTERS
    .map((cluster) => {
      let score = 0;
      for (const code of cluster.riasecCodes) {
        const codeLetters = code.split('');
        for (let i = 0; i < topLetters.length; i++) {
          const idx = codeLetters.indexOf(topLetters[i]);
          if (idx !== -1) {
            score += (3 - i) * (3 - idx);
          }
        }
      }
      return { cluster, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.cluster);
}
