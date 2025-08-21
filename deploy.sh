#!/bin/bash
# BrainSAIT RCM Validation System - Automated Deployment Script
# This script automates the deployment to Cloudflare Pages and Workers

set -e

echo "🧠 BrainSAIT RCM Validation System - Deployment Script"
echo "=================================================="

# Configuration
PROJECT_NAME="rcm-validation-system"
WORKER_NAME="rcm-validation-api"
PAGES_PROJECT="rcm-validation"

# Function to check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        echo "❌ Wrangler CLI not found. Installing..."
        npm install -g wrangler
    else
        echo "✅ Wrangler CLI found"
    fi
}

# Function to authenticate with Cloudflare
authenticate() {
    echo "🔐 Authenticating with Cloudflare..."
    wrangler auth login
}

# Function to create and setup D1 database
setup_database() {
    echo "🗄️ Setting up D1 database..."
    
    # Create database (if not exists)
    echo "Creating D1 database..."
    wrangler d1 create $WORKER_NAME --env production 2>/dev/null || echo "Database may already exist"
    
    # Initialize schema
    echo "Initializing database schema..."
    wrangler d1 execute $WORKER_NAME --env production --file=./schema/database.sql
    
    echo "✅ Database setup complete"
}

# Function to create KV namespaces
setup_kv() {
    echo "📦 Setting up KV namespaces..."
    
    # Create KV namespaces
    wrangler kv:namespace create "SURVEY_RESPONSES" --env production 2>/dev/null || echo "SURVEY_RESPONSES namespace may exist"
    wrangler kv:namespace create "ANALYTICS_CACHE" --env production 2>/dev/null || echo "ANALYTICS_CACHE namespace may exist"
    
    echo "✅ KV namespaces setup complete"
}

# Function to create R2 bucket
setup_r2() {
    echo "💾 Setting up R2 storage..."
    
    wrangler r2 bucket create rcm-survey-files 2>/dev/null || echo "R2 bucket may already exist"
    
    echo "✅ R2 storage setup complete"
}

# Function to set secrets
setup_secrets() {
    echo "🔐 Setting up secrets..."
    
    echo "Please set the following secrets when prompted:"
    echo "1. OpenAI API Key (for AI analysis)"
    echo "2. Webhook Secret (for secure webhooks)"
    echo "3. Encryption Key (for data encryption)"
    
    read -p "Do you want to set up secrets now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Setting OpenAI API Key..."
        wrangler secret put OPENAI_API_KEY --env production
        
        echo "Setting Webhook Secret..."
        wrangler secret put WEBHOOK_SECRET --env production
        
        echo "Setting Encryption Key..."
        wrangler secret put ENCRYPTION_KEY --env production
    else
        echo "⚠️ Secrets not set. You can set them later using 'wrangler secret put'"
    fi
}

# Function to deploy Worker
deploy_worker() {
    echo "🚀 Deploying Cloudflare Worker..."
    
    # Deploy to production
    wrangler publish --env production
    
    echo "✅ Worker deployed successfully"
}

# Function to deploy Pages
deploy_pages() {
    echo "🌐 Deploying to Cloudflare Pages..."
    
    # Deploy to Pages
    wrangler pages publish . --project-name=$PAGES_PROJECT --compatibility-date="2024-08-01"
    
    echo "✅ Pages deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Test API health endpoint
    echo "Testing API health endpoint..."
    WORKER_URL="https://$WORKER_NAME.brainsait.workers.dev"
    curl -s "$WORKER_URL/health" | grep -q "healthy" && echo "✅ API is healthy" || echo "❌ API health check failed"
    
    # Test Pages deployment
    echo "Testing Pages deployment..."
    PAGES_URL="https://$PAGES_PROJECT.pages.dev"
    curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" | grep -q "200" && echo "✅ Pages are accessible" || echo "❌ Pages accessibility check failed"
}

# Function to show deployment summary
show_summary() {
    echo "📋 Deployment Summary"
    echo "===================="
    echo "🔗 Frontend URL: https://$PAGES_PROJECT.pages.dev"
    echo "🔗 Dashboard URL: https://$PAGES_PROJECT.pages.dev/dashboard"
    echo "🔗 API URL: https://$WORKER_NAME.brainsait.workers.dev"
    echo "🔗 Health Check: https://$WORKER_NAME.brainsait.workers.dev/health"
    echo ""
    echo "📊 Analytics Dashboard: https://$PAGES_PROJECT.pages.dev/dashboard"
    echo "📧 Email: dr.mf.12298@gmail.com"
    echo ""
    echo "🎉 Deployment complete! Your BrainSAIT RCM Validation System is now live."
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    check_wrangler
    authenticate
    setup_database
    setup_kv
    setup_r2
    setup_secrets
    deploy_worker
    deploy_pages
    verify_deployment
    show_summary
    
    echo "✅ All done! Your system is ready for use."
}

# Run main function
main "$@"