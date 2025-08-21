# RCM Validation Survey

A comprehensive web application for validating Revenue Cycle Management (RCM) challenges in Saudi Arabian healthcare organizations. This research tool combines an interactive survey with an outreach toolkit to help identify and understand RCM inefficiencies in the healthcare sector.

## 🎯 Purpose

This application serves as a research validation tool for BrainSAIT Healthcare AI Research Initiative, led by Dr. Mohamed El Fadil Abuagla. It aims to:

- **Validate RCM challenges** in Saudi healthcare organizations
- **Qualify potential research participants** through scoring
- **Collect structured data** about RCM inefficiencies
- **Facilitate outreach** to healthcare professionals
- **Schedule follow-up meetings** with qualified participants

## ✨ Features

### 📋 Interactive Survey
- **6-question survey** covering role, organization size, challenges, and technology adoption
- **Progressive qualification scoring** based on responses
- **Real-time progress tracking** with visual progress bar
- **Responsive design** optimized for desktop and mobile
- **Accessibility support** with ARIA labels and semantic HTML

### 🎯 Lead Qualification
- **Automatic scoring system** (0-15 points)
- **Dynamic qualification badges** (Highly Qualified, Qualified, Thank You)
- **Saudi Riyal (SAR) financial impact tracking**
- **Contact information collection** for follow-up

### 📧 Outreach Toolkit
- **LinkedIn message templates** for professional outreach
- **Email templates** for research recruitment
- **Follow-up email scripts** for post-survey engagement
- **One-click copy functionality** for all templates

### 🌍 Localization
- **RTL/LTR toggle** for Arabic and English support
- **Saudi Arabian localization** (SAR currency, date formats)
- **Cultural adaptation** for KSA healthcare market

## 🚀 Quick Start

### Prerequisites
- A web server (Apache, Nginx, Python HTTP server, etc.)
- Modern web browser with JavaScript enabled

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Fadil369/rcm-validation.git
   cd rcm-validation
   ```

2. **Configure the application:**
   Edit `config.js` to set your Calendly URL and email:
   ```javascript
   window.APP_CONFIG = {
     CALENDLY_URL: "https://calendly.com/your-username/meeting",
     SUBMIT_EMAIL: "your-email@domain.com"
   };
   ```

3. **Serve the application:**
   
   **Using Python (for development):**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Using Node.js:**
   ```bash
   npx serve .
   ```
   
   **Using Apache/Nginx:**
   Copy files to your web server document root.

4. **Access the application:**
   Open your browser and navigate to `http://localhost:8000` (or your configured URL).

## 📁 Project Structure

```
rcm-validation/
├── index.html              # Main application page
├── assets/
│   ├── app.js              # Survey logic and interactions
│   └── styles.css          # Styling and responsive design
├── config.js               # Configuration (Calendly, email)
├── app.js                  # Original app file (symlinked to assets/)
├── styles.css              # Original styles file (symlinked to assets/)
└── README.md               # This file
```

## ⚙️ Configuration

### config.js Settings

```javascript
window.APP_CONFIG = {
  // Calendly booking URL for scheduling meetings
  CALENDLY_URL: "https://calendly.com/your-username/15min",
  
  // Email address for survey response submissions
  SUBMIT_EMAIL: "dr.mf.12298@gmail.com"
};
```

### Survey Questions

The survey includes 6 questions designed to qualify RCM professionals:

1. **Role in Healthcare RCM** (4 options, weighted scoring)
2. **Organization Size** (4 provider count ranges)
3. **Biggest RCM Challenge** (4 key challenge areas)
4. **Monthly Revenue Loss** (SAR-denominated financial impact)
5. **Technology Adoption Attitude** (4 adoption levels)
6. **Contact Information** (required fields for follow-up)

### Scoring System

- **High qualification responses:** 3 points each
- **Medium qualification responses:** 2 points each
- **Low qualification responses:** 1 point each
- **Total possible score:** 15 points

**Qualification Levels:**
- **12-15 points:** Highly Qualified 🎯
- **8-11 points:** Qualified ✅
- **0-7 points:** Thank You 📋

## 🎨 Customization

### Styling
Edit `assets/styles.css` to customize:
- Color scheme (CSS custom properties in `:root`)
- Layout and spacing
- Typography and fonts
- Mobile responsiveness

### Survey Content
Modify `index.html` to:
- Update question text and options
- Adjust qualification scoring (`data-qualify` attributes)
- Change financial impact ranges (`data-sar` attributes)
- Customize result messages

### Outreach Templates
Edit the script templates in `index.html`:
- LinkedIn message content
- Email subject lines and body text
- Follow-up message templates
- Contact information

## 🚀 Deployment

### Static Hosting
This application can be deployed to any static hosting service:

- **GitHub Pages:** Push to `gh-pages` branch
- **Netlify:** Connect your repository for automatic deployment
- **Vercel:** Import project for instant deployment
- **AWS S3:** Upload files to S3 bucket with static website hosting

### Web Server
For production deployment:
1. Copy all files to your web server document root
2. Ensure `config.js` is properly configured
3. Configure HTTPS for secure data collection
4. Set up domain and DNS as needed

## 📊 Data Collection

### Survey Responses
Survey data is collected in two ways:
1. **Client-side storage:** Temporary storage for qualification
2. **Email submission:** Structured data sent via mailto links
3. **API integration:** Optional backend submission (requires server)

### API Integration
For backend integration, modify the `submitSurvey()` function in `app.js`:
```javascript
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers, score })
})
```

## 🔧 Browser Support

- **Chrome 90+**
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

**Required Features:**
- ES6+ JavaScript support
- CSS Grid and Flexbox
- Internationalization API for currency formatting

## 👥 Contributing

This is a research project. For suggestions or improvements:
1. Open an issue describing your proposal
2. Submit a pull request with clear documentation
3. Ensure changes maintain accessibility and mobile support

## 📧 Contact

**Dr. Mohamed El Fadil Abuagla**  
Founder, BrainSAIT Healthcare AI Research Initiative  
📧 Email: dr.mf.12298@gmail.com  
🌐 Organization: BrainSAIT Research • Saudi Arabia

## 📄 License

This project is developed for research purposes. Contact the author for usage permissions and licensing information.

## 🔄 Version History

- **v1.0.0** - Initial release with survey and outreach toolkit
- **v1.0.1** - Added proper asset organization and configuration

---

*Built with ❤️ for advancing healthcare revenue cycle management research in Saudi Arabia*