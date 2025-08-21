# BrainSAIT RCM Validation System - Deployment Guide

## Overview
This guide covers the deployment of the BrainSAIT RCM Validation and Outreach System to Cloudflare Pages and Workers.

## Architecture
- **Frontend**: Static site hosted on Cloudflare Pages
- **API**: Cloudflare Workers with D1, KV, and R2 storage
- **Analytics**: Real-time dashboard with AI-powered insights
- **Compliance**: HIPAA/NPHIES compliant with audit logging

## Prerequisites
1. Cloudflare account with Workers and Pages access
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Domain configured in Cloudflare (optional)

## Deployment Steps

### 1. Deploy Cloudflare Workers API

```bash
# Login to Cloudflare
wrangler auth login

# Create D1 database
wrangler d1 create rcm_survey_db

# Update wrangler.toml with the database ID from above

# Initialize database schema
wrangler d1 execute rcm_survey_db --file=./schema/database.sql

# Create KV namespaces
wrangler kv:namespace create "SURVEY_RESPONSES"
wrangler kv:namespace create "ANALYTICS_CACHE"

# Create R2 bucket
wrangler r2 bucket create rcm-survey-files

# Set environment secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put WEBHOOK_SECRET
wrangler secret put ENCRYPTION_KEY

# Deploy to staging
wrangler publish --env staging

# Deploy to production
wrangler publish --env production
```

### 2. Deploy Frontend to Cloudflare Pages

#### Option A: Git Integration (Recommended)
1. Push code to GitHub repository
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - Build command: `echo "Static site"`
   - Build output directory: `.`
   - Environment variables: Set API endpoints

#### Option B: Direct Upload
```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Deploy to Pages
wrangler pages publish . --project-name=rcm-validation-system
```

### 3. Configure Domain (Optional)
1. Add custom domain in Cloudflare Pages dashboard
2. Update DNS records
3. Configure SSL/TLS settings

## Environment Configuration

### Production Environment Variables
```
API_BASE_URL=https://api.rcm-validation.brainsait.com
ENVIRONMENT=production
ANALYTICS_ENABLED=true
```

### Staging Environment Variables
```
API_BASE_URL=https://api-staging.rcm-validation.brainsait.com
ENVIRONMENT=staging
ANALYTICS_ENABLED=true
```

## Post-Deployment Configuration

### 1. Verify API Endpoints
```bash
# Health check
curl https://api.rcm-validation.brainsait.com/health

# Test analytics endpoint
curl https://api.rcm-validation.brainsait.com/api/analytics
```

### 2. Initialize Analytics Data
The system will automatically create initial analytics summaries when the first survey response is submitted.

### 3. Configure Monitoring
Set up alerts for:
- API response times
- Error rates
- Database performance
- Storage usage

## Security Considerations

### 1. Data Protection
- All data is encrypted at rest
- API endpoints use CORS protection
- Rate limiting is implemented
- Audit logging is enabled

### 2. Compliance
- GDPR compliance with data retention policies
- HIPAA compliance for healthcare data
- NPHIES compliance for Saudi healthcare

### 3. Access Control
- API keys for external integrations
- Role-based access for dashboard
- IP allowlisting for admin functions

## Monitoring and Maintenance

### 1. Analytics Dashboard
Access at: `https://rcm-validation.brainsait.com/dashboard`

Features:
- Real-time survey response metrics
- AI-powered insights and trends
- Export capabilities
- Filtering and search

### 2. Database Maintenance
```bash
# Backup database
wrangler d1 backup create rcm_survey_db

# Monitor database size
wrangler d1 execute rcm_survey_db --command="SELECT COUNT(*) FROM survey_responses"

# Clean up old data (if needed)
wrangler d1 execute rcm_survey_db --file=./scripts/cleanup.sql
```

### 3. Performance Optimization
- Monitor KV usage and implement TTL
- Optimize R2 storage for large files
- Use analytics to identify bottlenecks

## Troubleshooting

### Common Issues
1. **API 500 errors**: Check D1 database connection
2. **CORS errors**: Verify API endpoint configuration
3. **Slow dashboard**: Check analytics cache TTL
4. **Export failures**: Verify R2 bucket permissions

### Debug Commands
```bash
# View worker logs
wrangler tail --env production

# Check KV storage
wrangler kv:key list --binding=SURVEY_RESPONSES

# Database queries
wrangler d1 execute rcm_survey_db --command="SELECT * FROM survey_responses LIMIT 5"
```

## Support and Documentation

### Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)

### Contact
- **Technical Support**: dr.mf.12298@gmail.com
- **Project Lead**: Dr. Mohamed El Fadil Abuagla
- **Organization**: BrainSAIT Healthcare AI Research Initiative

## License
This project is proprietary to BrainSAIT Research. Contact the author for usage permissions.