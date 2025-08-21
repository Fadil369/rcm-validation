/**
 * BrainSAIT RCM Validation & Outreach System API
 * Cloudflare Workers backend with AI-powered analysis
 * 
 * @author Dr. Mohamed El Fadil Abuagla
 * @version 2.0.0
 */

import { Router } from 'itty-router';
import { Ai } from '@cloudflare/ai';
import { z } from 'zod';

// Initialize router
const router = Router();

// Validation schemas
const SurveyResponseSchema = z.object({
  answers: z.object({
    q1: z.object({
      value: z.string(),
      text: z.string(),
      aiScore: z.number()
    }).optional(),
    q2: z.object({
      value: z.string(),
      text: z.string(),
      aiScore: z.number()
    }).optional(),
    q3: z.object({
      value: z.string(),
      text: z.string(),
      aiScore: z.number()
    }).optional(),
    q4: z.object({
      value: z.string(),
      text: z.string(),
      sar: z.number().optional(),
      aiScore: z.number()
    }).optional(),
    q5: z.object({
      value: z.string(),
      text: z.string(),
      aiScore: z.number()
    }).optional(),
    contact: z.object({
      name: z.string(),
      email: z.string().email(),
      organization: z.string(),
      phone: z.string().optional(),
      location: z.string().optional(),
      jobTitle: z.string().optional()
    })
  }),
  score: z.number(),
  aiRecommendations: z.array(z.string()),
  qualificationLevel: z.enum(['critical', 'high', 'medium', 'low', 'minimal']),
  timestamp: z.string(),
  version: z.string().default('2.0')
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Utility functions
function generateId() {
  return crypto.randomUUID();
}

function createAuditLog(env, eventType, action, details = {}) {
  const auditId = generateId();
  const auditEntry = {
    id: auditId,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    action: action,
    details: JSON.stringify(details),
    success: true,
    compliance_flags: JSON.stringify(['GDPR', 'HIPAA', 'NPHIES'])
  };
  
  // Store in D1 database
  return env.SURVEY_DB.prepare(`
    INSERT INTO audit_log (id, timestamp, event_type, action, details, success, compliance_flags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    auditEntry.id,
    auditEntry.timestamp,
    auditEntry.event_type,
    auditEntry.action,
    auditEntry.details,
    auditEntry.success,
    auditEntry.compliance_flags
  ).run();
}

async function generateAIInsights(env, surveyData) {
  if (!env.ENABLE_AI_ANALYSIS || env.ENABLE_AI_ANALYSIS !== 'true') {
    return { insights: [], trends: [], recommendations: [] };
  }

  try {
    // Use Cloudflare AI for analysis
    const ai = new Ai(env.AI);
    
    const prompt = `
    Analyze this Saudi healthcare RCM survey response and provide insights:
    
    Role: ${surveyData.answers.q1?.text}
    Organization: ${surveyData.answers.contact.organization}
    Challenge: ${surveyData.answers.q3?.text}
    Financial Impact: ${surveyData.answers.q4?.sar ? `SAR ${surveyData.answers.q4.sar}` : 'Not specified'}
    AI Readiness: ${surveyData.answers.q5?.text}
    Score: ${surveyData.score}/25
    
    Provide:
    1. Market insights for Saudi healthcare RCM
    2. Specific recommendations for this organization
    3. Industry trends this response indicates
    
    Focus on NPHIES compliance, Saudi healthcare regulations, and practical implementation strategies.
    `;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a healthcare RCM expert specializing in Saudi Arabia market analysis.' },
        { role: 'user', content: prompt }
      ]
    });

    return {
      insights: response.response ? [response.response] : [],
      trends: ['AI adoption in Saudi healthcare', 'NPHIES compliance challenges'],
      recommendations: surveyData.aiRecommendations || []
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return { insights: [], trends: [], recommendations: surveyData.aiRecommendations || [] };
  }
}

// API Routes

// Health check
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    service: 'BrainSAIT RCM Validation API'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Submit survey response
router.post('/api/submit', async (request, env) => {
  try {
    const body = await request.json();
    const validatedData = SurveyResponseSchema.parse(body);
    
    // Generate unique ID for this response
    const responseId = generateId();
    const now = new Date().toISOString();
    
    // Extract data for database insertion
    const contact = validatedData.answers.contact;
    const q1 = validatedData.answers.q1;
    const q2 = validatedData.answers.q2;
    const q3 = validatedData.answers.q3;
    const q4 = validatedData.answers.q4;
    const q5 = validatedData.answers.q5;
    
    // Calculate priority score
    const priorityScore = validatedData.score + 
      (validatedData.qualificationLevel === 'critical' ? 10 : 
       validatedData.qualificationLevel === 'high' ? 5 : 0);
    
    // Store in D1 database
    await env.SURVEY_DB.prepare(`
      INSERT INTO survey_responses (
        id, timestamp, contact_name, contact_email, contact_organization,
        contact_phone, contact_location, contact_job_title,
        role_value, role_text, role_score,
        organization_size_value, organization_size_text, organization_size_score,
        primary_challenge_value, primary_challenge_text, primary_challenge_score,
        financial_impact_value, financial_impact_text, financial_impact_sar, financial_impact_score,
        ai_readiness_value, ai_readiness_text, ai_readiness_score,
        total_score, qualification_level, ai_recommendations, priority_score,
        processing_status, language_preference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      responseId, now, contact.name, contact.email, contact.organization,
      contact.phone || null, contact.location || null, contact.jobTitle || null,
      q1?.value || null, q1?.text || null, q1?.aiScore || 0,
      q2?.value || null, q2?.text || null, q2?.aiScore || 0,
      q3?.value || null, q3?.text || null, q3?.aiScore || 0,
      q4?.value || null, q4?.text || null, q4?.sar || null, q4?.aiScore || 0,
      q5?.value || null, q5?.text || null, q5?.aiScore || 0,
      validatedData.score, validatedData.qualificationLevel, 
      JSON.stringify(validatedData.aiRecommendations), priorityScore,
      'processed', 'en' // Default language preference
    ).run();
    
    // Store in KV for quick access
    await env.SURVEY_RESPONSES.put(responseId, JSON.stringify({
      ...validatedData,
      id: responseId,
      processedAt: now
    }), {
      expirationTtl: 86400 * 365 // 1 year retention
    });
    
    // Generate AI insights
    const aiInsights = await generateAIInsights(env, validatedData);
    
    // Create audit log
    await createAuditLog(env, 'survey_submit', 'create', {
      responseId,
      organization: contact.organization,
      score: validatedData.score,
      qualificationLevel: validatedData.qualificationLevel
    });
    
    return new Response(JSON.stringify({
      success: true,
      responseId,
      qualificationLevel: validatedData.qualificationLevel,
      score: validatedData.score,
      aiInsights,
      timestamp: now
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Survey submission error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request data',
      details: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get analytics dashboard data
router.get('/api/analytics', async (request, env) => {
  try {
    // Check cache first
    const cacheKey = `analytics_dashboard_${new Date().toISOString().split('T')[0]}`;
    let analyticsData = await env.ANALYTICS_CACHE.get(cacheKey, 'json');
    
    if (!analyticsData) {
      // Generate fresh analytics
      const totalResponses = await env.SURVEY_DB.prepare(`
        SELECT COUNT(*) as count FROM survey_responses
      `).first();
      
      const avgScore = await env.SURVEY_DB.prepare(`
        SELECT AVG(total_score) as avg_score FROM survey_responses
      `).first();
      
      const qualificationDistribution = await env.SURVEY_DB.prepare(`
        SELECT 
          qualification_level,
          COUNT(*) as count
        FROM survey_responses 
        GROUP BY qualification_level
      `).all();
      
      const challengeDistribution = await env.SURVEY_DB.prepare(`
        SELECT 
          primary_challenge_value,
          COUNT(*) as count
        FROM survey_responses 
        WHERE primary_challenge_value IS NOT NULL
        GROUP BY primary_challenge_value
      `).all();
      
      const monthlyTrends = await env.SURVEY_DB.prepare(`
        SELECT 
          created_month,
          COUNT(*) as responses,
          AVG(total_score) as avg_score,
          AVG(financial_impact_sar) as avg_financial_impact
        FROM survey_responses 
        WHERE created_month IS NOT NULL
        GROUP BY created_month
        ORDER BY created_month DESC
        LIMIT 12
      `).all();
      
      analyticsData = {
        summary: {
          totalResponses: totalResponses?.count || 0,
          avgScore: avgScore?.avg_score ? Math.round(avgScore.avg_score * 10) / 10 : 0,
          generatedAt: new Date().toISOString()
        },
        qualificationDistribution: qualificationDistribution.results || [],
        challengeDistribution: challengeDistribution.results || [],
        monthlyTrends: monthlyTrends.results || []
      };
      
      // Cache for 1 hour
      await env.ANALYTICS_CACHE.put(cacheKey, JSON.stringify(analyticsData), {
        expirationTtl: 3600
      });
    }
    
    // Create audit log
    await createAuditLog(env, 'data_access', 'analytics_view', {
      dataType: 'dashboard_analytics'
    });
    
    return new Response(JSON.stringify(analyticsData), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch analytics',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get AI recommendations for specific organization type
router.get('/api/recommendations/:orgType', async (request, env) => {
  const { orgType } = request.params;
  
  try {
    const cacheKey = `recommendations_${orgType}`;
    let recommendations = await env.ANALYTICS_CACHE.get(cacheKey, 'json');
    
    if (!recommendations) {
      // Query similar organizations
      const similarOrgs = await env.SURVEY_DB.prepare(`
        SELECT 
          primary_challenge_value,
          ai_readiness_value,
          AVG(total_score) as avg_score,
          AVG(financial_impact_sar) as avg_financial_impact,
          COUNT(*) as count
        FROM survey_responses 
        WHERE organization_size_value = ?
        GROUP BY primary_challenge_value, ai_readiness_value
        ORDER BY count DESC
      `).bind(orgType).all();
      
      recommendations = {
        organizationType: orgType,
        benchmarks: similarOrgs.results || [],
        aiRecommendations: [
          'Implement automated NPHIES submission workflows',
          'Deploy AI-powered denial prediction and prevention',
          'Establish centralized revenue cycle dashboard',
          'Invest in staff training for emerging technologies'
        ],
        generatedAt: new Date().toISOString()
      };
      
      // Cache for 6 hours
      await env.ANALYTICS_CACHE.put(cacheKey, JSON.stringify(recommendations), {
        expirationTtl: 21600
      });
    }
    
    return new Response(JSON.stringify(recommendations), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch recommendations',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// CORS preflight
router.options('*', () => {
  return new Response(null, { headers: corsHeaders });
});

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'API endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};
