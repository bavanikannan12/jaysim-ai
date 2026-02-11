const scenarios = [
  {
    id: 'internal-discussion',
    title: 'Internal Discussion',
    description: 'Low-stakes internal team discussion about solution approach',
    context: {
      clientName: 'Internal Team',
      industry: 'Technology',
      background: 'Your team is exploring a new feature for the existing product.',
      constraints: 'Limited development bandwidth, tight timeline of 2 sprints',
      personality: 'Collaborative and open to ideas'
    },
    prompt: 'Discuss your proposed solution for adding a user analytics dashboard to the existing platform. Consider technical feasibility, user experience, and timeline.'
  },
  {
    id: 'client-clarification',
    title: 'Client Clarification',
    description: 'Clarifying ambiguous requirements with a client',
    context: {
      clientName: 'TechStart Inc.',
      industry: 'E-commerce',
      background: 'Client wants to "improve the checkout experience" but hasn\'t specified what\'s wrong.',
      constraints: 'Budget of $50K, wants to launch before holiday season (3 months)',
      personality: 'Busy executive, values clarity and speed'
    },
    prompt: 'The client said they want to improve checkout but gave minimal details. Frame your clarifying questions and propose an initial solution direction.'
  },
  {
    id: 'scope-negotiation',
    title: 'Scope Negotiation',
    description: 'Negotiating scope reduction under timeline pressure',
    context: {
      clientName: 'FinanceFlow Corp',
      industry: 'Financial Services',
      background: 'Client wants 10 features in 6 weeks, but realistic timeline is 12 weeks for all features.',
      constraints: 'Fixed deadline (investor demo), fixed team size, regulatory requirements',
      personality: 'Skeptical, worried about delivery'
    },
    prompt: 'Propose which features to prioritize for the 6-week deadline and explain the tradeoffs. The client is skeptical and needs confidence.'
  },
  {
    id: 'feature-rejection',
    title: 'Feature Rejection',
    description: 'Explaining why a requested feature should not be built',
    context: {
      clientName: 'HealthTech Solutions',
      industry: 'Healthcare',
      background: 'Client wants to add a "social sharing" feature to a HIPAA-compliant patient portal.',
      constraints: 'HIPAA compliance, security concerns, scope creep risk',
      personality: 'Enthusiastic but not technical, focused on "modern features"'
    },
    prompt: 'Explain why social sharing is problematic for this application and propose alternative ways to achieve their underlying goal (patient engagement).'
  },
  {
    id: 'executive-presentation',
    title: 'Executive Presentation',
    description: 'High-pressure conversation with C-level executive',
    context: {
      clientName: 'RetailGiant LLC',
      industry: 'Retail',
      background: 'CTO wants to understand why the migration is taking longer than initially estimated.',
      constraints: 'You have 15 minutes, executive is frustrated, technical debt was underestimated',
      personality: 'Direct, impatient, bottom-line focused'
    },
    prompt: 'Explain the delay, maintain credibility, and propose a revised plan with clear milestones. You have limited time.'
  },
  {
    id: 'ambiguous-problem',
    title: 'Ambiguous Problem',
    description: 'Solving a problem with limited information',
    context: {
      clientName: 'EduLearn Platform',
      industry: 'Education',
      background: 'Client says "students are dropping off" but hasn\'t provided data or specifics.',
      constraints: 'No analytics in place, anecdotal evidence only, budget unclear',
      personality: 'Friendly but disorganized, expects you to lead'
    },
    prompt: 'You need to propose a diagnostic approach first, then suggest potential solutions. Guide the conversation despite limited data.'
  },
  {
    id: 'cost-tradeoff',
    title: 'Cost vs Quality Tradeoff',
    description: 'Explaining technical tradeoffs with cost implications',
    context: {
      clientName: 'CloudStore Inc',
      industry: 'SaaS',
      background: 'Client wants to reduce infrastructure costs but maintain 99.9% uptime.',
      constraints: 'Current costs: $20K/month, target: $12K/month, uptime is contractually guaranteed',
      personality: 'Data-driven, wants specifics, risk-averse'
    },
    prompt: 'Propose a cost reduction strategy that honestly addresses the uptime risk. Include specific tradeoffs and alternatives.'
  }
];

module.exports = scenarios;
