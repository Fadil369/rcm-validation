/**
 * BrainSAIT RCM Analytics Dashboard
 * Real-time analytics and AI-powered insights
 */

(() => {
  const API_BASE = '/api'; // Adjust for production
  let analyticsData = null;
  let charts = {};
  
  // DOM elements
  const elements = {
    totalResponses: document.getElementById('totalResponses'),
    avgScore: document.getElementById('avgScore'),
    highQualified: document.getElementById('highQualified'),
    avgFinancialImpact: document.getElementById('avgFinancialImpact'),
    refreshBtn: document.getElementById('refreshBtn'),
    exportBtn: document.getElementById('exportBtn'),
    aiInsights: document.getElementById('aiInsights'),
    marketRecommendations: document.getElementById('marketRecommendations'),
    responsesTableBody: document.getElementById('responsesTableBody'),
    filterQualification: document.getElementById('filterQualification'),
    filterDate: document.getElementById('filterDate'),
    year: document.getElementById('year')
  };

  // Initialize dashboard
  async function initDashboard() {
    elements.year.textContent = new Date().getFullYear();
    
    try {
      await loadAnalyticsData();
      updateSummaryCards();
      createCharts();
      loadAIInsights();
      loadMarketRecommendations();
      loadRecentResponses();
      
      // Set up event listeners
      elements.refreshBtn.addEventListener('click', refreshDashboard);
      elements.exportBtn.addEventListener('click', openExportModal);
      elements.filterQualification.addEventListener('change', filterResponses);
      elements.filterDate.addEventListener('change', filterResponses);
      
      // Auto-refresh every 5 minutes
      setInterval(refreshDashboard, 300000);
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      showError('Failed to load dashboard data. Please refresh the page.');
    }
  }

  // Load analytics data from API
  async function loadAnalyticsData() {
    const response = await fetch(`${API_BASE}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    analyticsData = await response.json();
  }

  // Update summary cards
  function updateSummaryCards() {
    if (!analyticsData) return;
    
    const { summary, qualificationDistribution } = analyticsData;
    
    elements.totalResponses.textContent = summary.totalResponses.toLocaleString();
    elements.avgScore.textContent = summary.avgScore.toFixed(1);
    
    // Calculate high qualified (critical + high)
    const highQualified = qualificationDistribution.reduce((sum, item) => {
      if (item.qualification_level === 'critical' || item.qualification_level === 'high') {
        return sum + item.count;
      }
      return sum;
    }, 0);
    
    elements.highQualified.textContent = highQualified.toLocaleString();
    
    // Calculate average financial impact from monthly trends
    const avgFinancialImpact = analyticsData.monthlyTrends.reduce((sum, month) => {
      return sum + (month.avg_financial_impact || 0);
    }, 0) / Math.max(analyticsData.monthlyTrends.length, 1);
    
    elements.avgFinancialImpact.textContent = new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(avgFinancialImpact);
  }

  // Create charts
  function createCharts() {
    createQualificationChart();
    createChallengeChart();
    createTrendsChart();
  }

  function createQualificationChart() {
    const ctx = document.getElementById('qualificationChart').getContext('2d');
    const data = analyticsData.qualificationDistribution;
    
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#84cc16',
      minimal: '#64748b'
    };
    
    charts.qualification = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.qualification_level.charAt(0).toUpperCase() + item.qualification_level.slice(1)),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: data.map(item => colors[item.qualification_level] || '#64748b'),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#f8fafc', padding: 20 }
          }
        }
      }
    });
  }

  function createChallengeChart() {
    const ctx = document.getElementById('challengeChart').getContext('2d');
    const data = analyticsData.challengeDistribution;
    
    // Map challenge values to readable labels
    const challengeLabels = {
      'nphies-compliance': 'NPHIES Compliance',
      'staffing-shortage': 'Staffing Shortage',
      'manual-processes': 'Manual Processes',
      'denial-management': 'Denial Management',
      'system-integration': 'System Integration',
      'cash-flow': 'Cash Flow'
    };
    
    charts.challenge = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => challengeLabels[item.primary_challenge_value] || item.primary_challenge_value),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: '#0ea5e9',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1', maxRotation: 45 }
          },
          y: {
            ticks: { color: '#cbd5e1' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }

  function createTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    const data = analyticsData.monthlyTrends.reverse(); // Show oldest to newest
    
    charts.trends = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.created_month),
        datasets: [
          {
            label: 'Responses',
            data: data.map(item => item.responses),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Avg Score',
            data: data.map(item => item.avg_score),
            borderColor: '#ea580c',
            backgroundColor: 'rgba(234, 88, 12, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#f8fafc' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#cbd5e1' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#cbd5e1' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  // Load AI insights
  async function loadAIInsights() {
    try {
      // Simulate AI analysis for now - in production, this would call the AI endpoint
      const insights = [
        '🔍 NPHIES compliance is the top challenge for 35% of respondents',
        '📈 Organizations with 100+ providers show 23% higher AI readiness',
        '💡 Manual process automation could save average of SAR 180K monthly',
        '🎯 High-scoring organizations are 3x more likely to adopt AI solutions',
        '🏥 Eastern Province shows highest engagement with 28% of responses'
      ];
      
      elements.aiInsights.innerHTML = insights.map(insight => 
        `<div class="insight-item">${insight}</div>`
      ).join('');
      
    } catch (error) {
      elements.aiInsights.innerHTML = '<div class="error-state">Failed to load AI insights</div>';
    }
  }

  // Load market recommendations
  async function loadMarketRecommendations() {
    try {
      const recommendations = [
        'Prioritize NPHIES compliance automation for immediate ROI',
        'Implement AI-powered denial prediction for large hospitals',
        'Focus on staff training programs for manual process reduction',
        'Develop region-specific solutions for Eastern Province market',
        'Create pilot programs for cautious AI adopters'
      ];
      
      elements.marketRecommendations.innerHTML = recommendations.map(rec => 
        `<div class="recommendation-item">• ${rec}</div>`
      ).join('');
      
    } catch (error) {
      elements.marketRecommendations.innerHTML = '<div class="error-state">Failed to load recommendations</div>';
    }
  }

  // Load recent responses (simulated)
  function loadRecentResponses() {
    // In production, this would fetch from the API
    const sampleResponses = [
      {
        date: '2025-01-20',
        organization: 'King Faisal Specialist Hospital',
        role: 'RCM Director',
        challenge: 'NPHIES Compliance',
        score: 22,
        qualification: 'Critical',
        financialImpact: 'SAR 800K'
      },
      {
        date: '2025-01-20',
        organization: 'National Guard Hospital',
        role: 'IT Manager',
        challenge: 'System Integration',
        score: 18,
        qualification: 'High',
        financialImpact: 'SAR 450K'
      },
      {
        date: '2025-01-19',
        organization: 'Saudi German Hospital',
        role: 'Billing Manager',
        challenge: 'Manual Processes',
        score: 15,
        qualification: 'High',
        financialImpact: 'SAR 320K'
      }
    ];
    
    renderResponsesTable(sampleResponses);
  }

  function renderResponsesTable(responses) {
    elements.responsesTableBody.innerHTML = responses.map(response => `
      <tr>
        <td>${new Date(response.date).toLocaleDateString()}</td>
        <td>${response.organization}</td>
        <td>${response.role}</td>
        <td>${response.challenge}</td>
        <td><span class="score-badge">${response.score}/25</span></td>
        <td><span class="qualification-badge ${response.qualification.toLowerCase()}">${response.qualification}</span></td>
        <td>${response.financialImpact}</td>
        <td>
          <button class="btn-small secondary" onclick="viewDetails('${response.organization}')">View</button>
          <button class="btn-small primary" onclick="contactOrganization('${response.organization}')">Contact</button>
        </td>
      </tr>
    `).join('');
  }

  // Filter responses
  function filterResponses() {
    // Implementation for filtering - would query API with filters
    console.log('Filtering responses...');
  }

  // Refresh dashboard
  async function refreshDashboard() {
    elements.refreshBtn.textContent = '🔄 Refreshing...';
    elements.refreshBtn.disabled = true;
    
    try {
      await loadAnalyticsData();
      updateSummaryCards();
      
      // Update existing charts
      Object.values(charts).forEach(chart => chart.destroy());
      createCharts();
      
      loadAIInsights();
      loadMarketRecommendations();
      loadRecentResponses();
      
    } catch (error) {
      showError('Failed to refresh dashboard data');
    } finally {
      elements.refreshBtn.textContent = '🔄 Refresh';
      elements.refreshBtn.disabled = false;
    }
  }

  // Export modal functions
  function openExportModal() {
    document.getElementById('exportModal').hidden = false;
    
    // Set default dates
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    document.getElementById('exportToDate').value = today.toISOString().split('T')[0];
    document.getElementById('exportFromDate').value = lastMonth.toISOString().split('T')[0];
  }

  function closeExportModal() {
    document.getElementById('exportModal').hidden = true;
  }

  function performExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const fromDate = document.getElementById('exportFromDate').value;
    const toDate = document.getElementById('exportToDate').value;
    
    // Implementation for data export
    console.log(`Exporting data in ${format} format from ${fromDate} to ${toDate}`);
    
    // Simulate export
    const link = document.createElement('a');
    link.download = `rcm-survey-data-${fromDate}-to-${toDate}.${format}`;
    link.href = '#'; // In production, this would be the export URL
    link.click();
    
    closeExportModal();
  }

  // Utility functions
  function showError(message) {
    // Implementation for error display
    console.error(message);
  }

  function viewDetails(organization) {
    alert(`Viewing details for ${organization}`);
  }

  function contactOrganization(organization) {
    alert(`Contacting ${organization}`);
  }

  // Make functions global for onclick handlers
  window.openExportModal = openExportModal;
  window.closeExportModal = closeExportModal;
  window.performExport = performExport;
  window.viewDetails = viewDetails;
  window.contactOrganization = contactOrganization;

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initDashboard);
})();