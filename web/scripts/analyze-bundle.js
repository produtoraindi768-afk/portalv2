#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Generates webpack bundle analysis and optimization recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUNDLE_ANALYSIS_DIR = path.join(__dirname, '../.next-analysis');

async function createAnalysisDirectory() {
  if (!fs.existsSync(BUNDLE_ANALYSIS_DIR)) {
    fs.mkdirSync(BUNDLE_ANALYSIS_DIR, { recursive: true });
  }
}

async function runBundleAnalyzer() {
  console.log('🔍 Running bundle analysis...');
  
  try {
    // Set environment variable to enable bundle analyzer
    process.env.ANALYZE = 'true';
    
    // Build the project with analysis
    console.log('Building project with bundle analysis enabled...');
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, ANALYZE: 'true' }
    });

    console.log('✅ Bundle analysis complete!');
    console.log('📊 Check the opened browser window for bundle visualization.');
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

async function generatePerformanceReport() {
  console.log('📈 Generating performance recommendations...');
  
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      {
        category: 'Bundle Splitting',
        items: [
          'Split vendor bundles (React, Firebase, GSAP)',
          'Separate animation libraries into dedicated chunks',
          'Implement route-based code splitting',
          'Use dynamic imports for heavy components'
        ]
      },
      {
        category: 'Image Optimization',
        items: [
          'Convert images to WebP/AVIF format',
          'Implement responsive images with next/image',
          'Add blur placeholders for better UX',
          'Use lazy loading for below-the-fold images'
        ]
      },
      {
        category: 'JavaScript Optimization',
        items: [
          'Tree shake unused Firebase SDK features',
          'Defer non-critical JavaScript execution',
          'Use web workers for heavy computations',
          'Implement selective hydration patterns'
        ]
      },
      {
        category: 'Caching & Compression',
        items: [
          'Enable Brotli compression',
          'Implement service worker for offline caching',
          'Set up aggressive CDN caching',
          'Use ISR for dynamic content'
        ]
      }
    ],
    nextSteps: [
      'Review bundle analyzer output for large dependencies',
      'Implement lazy loading for Twitch players',
      'Add performance budgets to CI/CD pipeline',
      'Set up Core Web Vitals monitoring'
    ]
  };

  const reportPath = path.join(BUNDLE_ANALYSIS_DIR, 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 Performance report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('🚀 Starting bundle analysis and optimization recommendations...\n');
  
  await createAnalysisDirectory();
  await runBundleAnalyzer();
  const report = await generatePerformanceReport();
  
  console.log('\n📊 Performance Optimization Summary:');
  console.log('=====================================');
  
  report.recommendations.forEach(category => {
    console.log(`\n${category.category}:`);
    category.items.forEach(item => {
      console.log(`  • ${item}`);
    });
  });
  
  console.log('\n🎯 Next Steps:');
  report.nextSteps.forEach(step => {
    console.log(`  • ${step}`);
  });
  
  console.log('\n✨ Analysis complete! Happy optimizing! 🚀');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generatePerformanceReport };
