/**
 * Calendar Section Responsive Testing Script
 * Tests the love-cal calendar section across multiple viewport sizes
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'http://127.0.0.1:4173/index.html';

// Test viewport configurations
const VIEWPORTS = [
  { width: 375, height: 812, name: 'iPhone 13 mini' },
  { width: 390, height: 844, name: 'iPhone 13/14' },
  { width: 430, height: 932, name: 'iPhone 14 Pro Max' },
  { width: 768, height: 1024, name: 'iPad portrait' },
  { width: 1024, height: 1366, name: 'iPad Pro portrait' },
  { width: 1280, height: 800, name: 'Laptop' },
  { width: 1440, height: 900, name: 'Desktop' }
];

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'calendar-test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function testViewport(page, viewport) {
  console.log(`\n=== Testing ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
  
  const report = {
    viewport: `${viewport.width}x${viewport.height}`,
    name: viewport.name,
    overlaps: [],
    alignment: [],
    animation: '',
    verdict: 'PASS'
  };

  try {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    // Reload to test initial animation
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Scroll to calendar section to trigger reveal animation
    await page.evaluate(() => {
      const calendarSection = document.querySelector('.love-cal');
      if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Wait for scroll and animation to complete
    await page.waitForTimeout(2000);

    // Check if animations are smooth by measuring frame rate (simplified approach)
    const animationPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimestamps = [];
        let rafId;
        let startTime = performance.now();
        
        function measureFrame(timestamp) {
          frameTimestamps.push(timestamp);
          
          if (timestamp - startTime < 1000) {
            rafId = requestAnimationFrame(measureFrame);
          } else {
            cancelAnimationFrame(rafId);
            
            // Calculate frame intervals
            let jankyFrames = 0;
            for (let i = 1; i < frameTimestamps.length; i++) {
              const interval = frameTimestamps[i] - frameTimestamps[i - 1];
              // Frame taking more than 33ms (< 30fps) is considered janky
              if (interval > 33) {
                jankyFrames++;
              }
            }
            
            const totalFrames = frameTimestamps.length;
            const fps = totalFrames;
            const jankyPercent = (jankyFrames / totalFrames) * 100;
            
            resolve({
              fps,
              jankyFrames,
              jankyPercent: jankyPercent.toFixed(1),
              smooth: jankyPercent < 5
            });
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });

    report.animation = animationPerformance.smooth 
      ? `Smooth (${animationPerformance.jankyPercent}% jank, ~${animationPerformance.fps}fps)`
      : `Janky (${animationPerformance.jankyPercent}% jank, ~${animationPerformance.fps}fps)`;

    if (!animationPerformance.smooth) {
      report.verdict = 'FAIL';
    }

    // Get bounding boxes of calendar elements
    const elementPositions = await page.evaluate(() => {
      const svg = document.querySelector('.love-cal__svg');
      if (!svg) return null;

      const svgRect = svg.getBoundingClientRect();
      const svgBox = svg.viewBox.baseVal;

      // Helper to get element bounding box in SVG coordinates
      function getSVGBBox(selector) {
        const elem = svg.querySelector(selector);
        if (!elem) return null;
        
        const bbox = elem.getBBox();
        return {
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          right: bbox.x + bbox.width,
          bottom: bbox.y + bbox.height
        };
      }

      // Get all text elements
      const weekdayTexts = Array.from(svg.querySelectorAll('.love-cal__weekdays text')).map(t => {
        const bbox = t.getBBox();
        return {
          text: t.textContent,
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          centerX: parseFloat(t.getAttribute('x')),
          centerY: parseFloat(t.getAttribute('y'))
        };
      });

      const dayTexts = Array.from(svg.querySelectorAll('.love-cal__days text')).map(t => {
        const bbox = t.getBBox();
        return {
          text: t.textContent,
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          centerX: parseFloat(t.getAttribute('x')),
          centerY: parseFloat(t.getAttribute('y'))
        };
      });

      const heartPath = getSVGBBox('.love-cal__heart path');
      const heartNum = svg.querySelector('.love-cal__heart-num');
      const heartNumBBox = heartNum ? heartNum.getBBox() : null;
      const heartNumData = heartNumBBox ? {
        text: heartNum.textContent,
        x: heartNumBBox.x,
        y: heartNumBBox.y,
        width: heartNumBBox.width,
        height: heartNumBBox.height,
        centerX: parseFloat(heartNum.getAttribute('x')),
        centerY: parseFloat(heartNum.getAttribute('y'))
      } : null;

      const monthElem = svg.querySelector('.love-cal__month');
      const monthBBox = monthElem ? monthElem.getBBox() : null;
      const monthData = monthBBox ? {
        text: monthElem.textContent,
        x: monthBBox.x,
        y: monthBBox.y,
        width: monthBBox.width,
        height: monthBBox.height,
        centerX: parseFloat(monthElem.getAttribute('x')),
        centerY: parseFloat(monthElem.getAttribute('y'))
      } : null;

      const yearElem = svg.querySelector('.love-cal__year');
      const yearBBox = yearElem ? yearElem.getBBox() : null;
      const yearData = yearBBox ? {
        text: yearElem.textContent,
        x: yearBBox.x,
        y: yearBBox.y,
        width: yearBBox.width,
        height: yearBBox.height,
        centerX: parseFloat(yearElem.getAttribute('x')),
        centerY: parseFloat(yearElem.getAttribute('y'))
      } : null;

      return {
        svgRect: {
          width: svgRect.width,
          height: svgRect.height,
          viewBoxWidth: svgBox.width,
          viewBoxHeight: svgBox.height
        },
        weekdays: weekdayTexts,
        days: dayTexts,
        heart: heartPath,
        heartNum: heartNumData,
        month: monthData,
        year: yearData
      };
    });

    if (!elementPositions) {
      report.verdict = 'FAIL';
      report.alignment.push('Calendar SVG not found');
    } else {
      // Check for overlaps
      function checkOverlap(box1, box2, name1, name2, threshold = 2) {
        if (!box1 || !box2) return false;
        
        const horizontalOverlap = Math.max(0, 
          Math.min(box1.x + box1.width, box2.x + box2.width) - 
          Math.max(box1.x, box2.x)
        );
        const verticalOverlap = Math.max(0,
          Math.min(box1.y + box1.height, box2.y + box2.height) - 
          Math.max(box1.y, box2.y)
        );
        
        const hasOverlap = horizontalOverlap > threshold && verticalOverlap > threshold;
        
        if (hasOverlap) {
          report.overlaps.push(
            `${name1} overlaps ${name2} (${horizontalOverlap.toFixed(1)}px × ${verticalOverlap.toFixed(1)}px)`
          );
          report.verdict = 'FAIL';
        }
        
        return hasOverlap;
      }

      const { heart, heartNum, month, year, weekdays, days } = elementPositions;

      // Check heart number (6) against month text
      checkOverlap(heartNum, month, 'Heart number "6"', 'Month "Август"');

      // Check heart number against year
      checkOverlap(heartNum, year, 'Heart number "6"', 'Year "2026"');

      // Check month against year
      checkOverlap(month, year, 'Month "Август"', 'Year "2026"');

      // Check heart shape against weekday labels
      weekdays.forEach(wd => {
        checkOverlap(heart, wd, 'Heart shape', `Weekday "${wd.text}"`);
      });

      // Check heart shape against day numbers
      days.forEach(day => {
        checkOverlap(heart, day, 'Heart shape', `Day number "${day.text}"`);
      });

      // Check heart number against weekdays
      weekdays.forEach(wd => {
        checkOverlap(heartNum, wd, 'Heart number "6"', `Weekday "${wd.text}"`);
      });

      // Check heart number against day numbers (excluding "6" itself)
      days.forEach(day => {
        checkOverlap(heartNum, day, 'Heart number "6"', `Day number "${day.text}"`);
      });

      // Check month against weekdays
      weekdays.forEach(wd => {
        checkOverlap(month, wd, 'Month "Август"', `Weekday "${wd.text}"`);
      });

      // Check month against days
      days.forEach(day => {
        checkOverlap(month, day, 'Month "Август"', `Day number "${day.text}"`);
      });

      // Check year against days (especially important)
      days.forEach(day => {
        checkOverlap(year, day, 'Year "2026"', `Day number "${day.text}"`);
      });

      // Check for visual alignment issues
      const expectedHeartX = 450;
      const expectedMonthX = 450;
      const expectedYearX = 450;

      if (heartNum && Math.abs(heartNum.centerX - expectedHeartX) > 5) {
        report.alignment.push(
          `Heart number "6" horizontally shifted (expected x=${expectedHeartX}, actual x=${heartNum.centerX})`
        );
        report.verdict = 'FAIL';
      }

      if (month && Math.abs(month.centerX - expectedMonthX) > 5) {
        report.alignment.push(
          `Month "Август" horizontally shifted (expected x=${expectedMonthX}, actual x=${month.centerX})`
        );
        report.verdict = 'FAIL';
      }

      if (year && Math.abs(year.centerX - expectedYearX) > 5) {
        report.alignment.push(
          `Year "2026" horizontally shifted (expected x=${expectedYearX}, actual x=${year.centerX})`
        );
        report.verdict = 'FAIL';
      }

      // Log element positions for debugging
      console.log('Element positions (SVG coordinates):');
      console.log(`  Heart: (${heart?.x.toFixed(1)}, ${heart?.y.toFixed(1)}) ${heart?.width.toFixed(1)}×${heart?.height.toFixed(1)}`);
      console.log(`  Number "6": x=${heartNum?.centerX}, y=${heartNum?.centerY}`);
      console.log(`  Month: x=${month?.centerX}, y=${month?.centerY}`);
      console.log(`  Year: x=${year?.centerX}, y=${year?.centerY}`);
    }

    // Take screenshot
    const screenshotPath = path.join(
      screenshotsDir, 
      `${viewport.width}x${viewport.height}-${viewport.name.replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false
    });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Summary for this viewport
    console.log(`\nVerdict: ${report.verdict}`);
    console.log(`Animation: ${report.animation}`);
    if (report.overlaps.length > 0) {
      console.log('Overlaps detected:');
      report.overlaps.forEach(o => console.log(`  - ${o}`));
    } else {
      console.log('No overlaps detected ✓');
    }
    if (report.alignment.length > 0) {
      console.log('Alignment issues:');
      report.alignment.forEach(a => console.log(`  - ${a}`));
    } else {
      console.log('Alignment OK ✓');
    }

  } catch (error) {
    console.error(`Error testing ${viewport.name}:`, error.message);
    report.verdict = 'ERROR';
    report.alignment.push(`Error: ${error.message}`);
  }

  return report;
}

async function main() {
  console.log('Starting calendar section responsive testing...');
  console.log(`Target URL: ${SITE_URL}`);
  console.log(`Screenshots will be saved to: ${screenshotsDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to site
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Site loaded successfully\n');
  } catch (error) {
    console.error(`Failed to load site: ${error.message}`);
    console.error('\nMake sure the dev server is running at http://127.0.0.1:4173');
    await browser.close();
    process.exit(1);
  }

  const allReports = [];

  // Test each viewport
  for (const viewport of VIEWPORTS) {
    const report = await testViewport(page, viewport);
    allReports.push(report);
  }

  await browser.close();

  // Generate final summary report
  console.log('\n\n' + '='.repeat(80));
  console.log('FINAL TEST REPORT');
  console.log('='.repeat(80));

  const passCount = allReports.filter(r => r.verdict === 'PASS').length;
  const failCount = allReports.filter(r => r.verdict === 'FAIL').length;
  const errorCount = allReports.filter(r => r.verdict === 'ERROR').length;

  console.log(`\nSummary: ${passCount} PASS, ${failCount} FAIL, ${errorCount} ERROR\n`);

  allReports.forEach(report => {
    console.log(`${report.verdict === 'PASS' ? '✓' : '✗'} ${report.viewport} (${report.name})`);
    console.log(`  Animation: ${report.animation}`);
    if (report.overlaps.length > 0) {
      console.log(`  Overlaps: ${report.overlaps.length} detected`);
      report.overlaps.forEach(o => console.log(`    - ${o}`));
    }
    if (report.alignment.length > 0) {
      console.log(`  Alignment issues: ${report.alignment.length} detected`);
      report.alignment.forEach(a => console.log(`    - ${a}`));
    }
    console.log('');
  });

  // Save JSON report
  const reportPath = path.join(__dirname, 'calendar-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass: passCount, fail: failCount, error: errorCount },
    results: allReports
  }, null, 2));
  console.log(`Detailed report saved to: ${reportPath}`);

  console.log('\n' + '='.repeat(80));
  
  process.exit(failCount > 0 || errorCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
