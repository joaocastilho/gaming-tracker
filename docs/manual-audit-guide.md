# Manual Audit Guide - Reaching 10/10

**Project**: Gaming Tracker  
**Current Grade**: 9.7/10  
**Target Grade**: 10/10  
**Estimated Time**: 30-45 minutes

---

## Overview

This document provides detailed, step-by-step instructions for completing the manual audits required to achieve a perfect 10/10 grade. These audits cannot be automated and require browser-based tools.

**Prerequisites**:
- Production build created (`bun run build`)
- Local server running (`bun run preview`)
- Chrome or Firefox browser
- Access to Chrome DevTools

---

## Task 1: Lighthouse Performance Audit

**Purpose**: Measure Core Web Vitals, accessibility, best practices, and SEO  
**Target Scores**:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Method A: Chrome DevTools (Recommended)

#### Step 1: Build and Serve Production

```bash
# Build production version
bun run build

# Start production server
bun run preview
# Server starts on http://localhost:4173
```

#### Step 2: Open Chrome DevTools

1. Open **Google Chrome** browser
2. Navigate to `http://localhost:4173`
3. Open **Chrome DevTools** using one of:
   - Press `F12`
   - Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
   - Right-click → Inspect
4. Click the **Lighthouse** tab in DevTools

#### Step 3: Configure Audit Settings

In the Lighthouse panel:

**Categories to check**:
- [x] Performance
- [x] Accessibility
- [x] Best Practices
- [x] SEO
- [ ] Progressive Web App (optional)

**Device selection**:
- Select **Mobile** (primary test - Google uses mobile-first indexing)
- Run again with **Desktop** (secondary test)

**Other options**:
- Keep "Simulated throttling" enabled
- Clear storage between runs (recommended)

#### Step 4: Run the Audit

1. Click the **"Analyze page load"** button
2. Wait for audit to complete (30-60 seconds)
3. Review the results dashboard

#### Step 5: Interpret Results

**Score Ranges**:
- **90-100**: Excellent (green)
- **50-89**: Needs improvement (orange)
- **0-49**: Poor (red)

**Critical metrics to watch**:

| Metric | Target | Description |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.8s | First text/image appears |
| Largest Contentful Paint (LCP) | < 2.5s | Largest element rendered |
| Total Blocking Time (TBT) | < 200ms | Main thread blocked time |
| Cumulative Layout Shift (CLS) | < 0.1 | Visual stability |
| Speed Index | < 3.4s | Visual completeness |

#### Step 6: Address Issues

**Common Issues and Fixes**:

**Issue**: "Reduce unused JavaScript"
- **Impact**: High
- **Fix**: 
  - Review code splitting in `vite.config.ts`
  - Consider dynamic imports for heavy components
  - Use `bun run build` and analyze chunk sizes

**Issue**: "Serve images in next-gen formats"
- **Impact**: Medium
- **Fix**:
  - Ensure covers are in WebP format (already done)
  - Consider AVIF for future enhancement
  - Verify `srcset` is correctly implemented

**Issue**: "Eliminate render-blocking resources"
- **Impact**: Medium
- **Fix**:
  - Check if any CSS is blocking
  - Verify fonts load with `font-display: swap`
  - Ensure critical CSS is inlined if needed

**Issue**: "Properly size images"
- **Impact**: Medium
- **Fix**:
  - Verify `generateSrcset()` works correctly
  - Check responsive image sizes
  - Ensure lazy loading is active

#### Step 7: Save Results

1. Click **"Export"** button in Lighthouse panel
2. Save as JSON: `lighthouse-report-[date].json`
3. Save as HTML: `lighthouse-report-[date].html`
4. Move files to `docs/audits/` directory (create if needed)

---

### Method B: Node.js CLI (Alternative)

For automated/repeatable testing:

```bash
# Install Lighthouse as dev dependency
bun add -D lighthouse

# Build and serve
bun run build
bun run preview &
SERVER_PID=$!

# Run Lighthouse audit
npx lighthouse http://localhost:4173 \
  --output=json \
  --output-path=./docs/audits/lighthouse-report.json \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo

# Stop server
kill $SERVER_PID

# View results summary
cat docs/audits/lighthouse-report.json | jq '.categories | to_entries[] | {name: .key, score: (.value.score * 100 | round)}'
```

---

## Task 2: axe-core Accessibility Audit

**Purpose**: Verify WCAG 2.1 AA compliance  
**Target**: Zero violations (critical or serious)  
**Standard**: WCAG 2.1 Level AA

### Method A: Browser Extension (Recommended)

#### Step 1: Install axe DevTools

**Chrome**:
1. Visit: https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd
2. Click **"Add to Chrome"**
3. Confirm installation

**Firefox**:
1. Visit: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/
2. Click **"Add to Firefox"**
3. Confirm installation

#### Step 2: Start Server

```bash
bun run build
bun run preview
# Keep this running in a terminal
```

#### Step 3: Test Each Route

Navigate to each URL and run axe:

**Route 1: Home Page**
- URL: `http://localhost:4173/`
- Features: Game grid, filters, search, header
- Critical elements: Game cards, filter dropdowns, search bar

**Route 2: Completed Games**
- URL: `http://localhost:4173/completed`
- Features: Filtered completed games
- Critical elements: Rating displays, tier badges

**Route 3: Planned Games**
- URL: `http://localhost:4173/planned`
- Features: Filtered planned games
- Critical elements: Status indicators

**Route 4: Tier List**
- URL: `http://localhost:4173/tierlist`
- Features: Drag-and-drop tier visualization
- Critical elements: Tier rows, game placement

**Route 5: Login Page**
- URL: `http://localhost:4173/login`
- Features: Login form
- Critical elements: Form inputs, submit button

#### Step 4: Run Audit on Each Page

For each route:

1. Navigate to the URL
2. Open **axe DevTools** extension:
   - Click extension icon in toolbar
   - Or open DevTools (F12) → axe DevTools tab
3. Click **"Scan ALL of my page"** button
4. Wait for scan to complete (5-10 seconds)
5. Review results

#### Step 5: Interpret Results

**Violation Severity Levels**:

| Level | Color | Action Required |
|-------|-------|-----------------|
| **Critical** | Red | Must fix immediately |
| **Serious** | Orange | Must fix before release |
| **Moderate** | Yellow | Should fix if possible |
| **Minor** | Blue | Fix when convenient |

**Common Violations**:

**Violation**: "Elements must have sufficient color contrast"
- **Impact**: Serious
- **Standard**: WCAG 1.4.3 Contrast (Minimum)
- **Fix**:
  ```css
  /* Check in app.css or Tailwind config */
  /* Minimum contrast ratio: 4.5:1 for normal text */
  /* Minimum contrast ratio: 3:1 for large text */
  ```

**Violation**: "Form elements must have labels"
- **Impact**: Critical
- **Standard**: WCAG 1.3.1 Info and Relationships
- **Fix**: Add `aria-label` or `<label>` elements
  ```svelte
  <!-- Before -->
  <input type="text" placeholder="Search games" />
  
  <!-- After -->
  <label for="search">Search games</label>
  <input id="search" type="text" placeholder="Search games" />
  <!-- OR -->
  <input type="text" aria-label="Search games" placeholder="Search games" />
  ```

**Violation**: "Page should have a main landmark"
- **Impact**: Moderate
- **Standard**: WCAG 1.3.1 Info and Relationships
- **Fix**: Wrap main content in `<main>` element
  ```svelte
  <main>
    <!-- Main page content here -->
  </main>
  ```

**Violation**: "Interactive elements must be keyboard accessible"
- **Impact**: Serious
- **Standard**: WCAG 2.1.1 Keyboard
- **Fix**: Ensure all interactive elements have:
  - `tabindex` if needed
  - Keyboard event handlers
  - Visible focus indicators

**Violation**: "Images must have alternate text"
- **Impact**: Serious
- **Standard**: WCAG 1.1.1 Non-text Content
- **Fix**: Add `alt` attribute to all images
  ```svelte
  <img src="cover.webp" alt="Game cover for {game.title}" />
  ```

#### Step 6: Keyboard Navigation Test

Manual keyboard test (not automated by axe):

1. Navigate to `http://localhost:4173/`
2. Press `Tab` key repeatedly
3. Verify:
   - All interactive elements receive focus
   - Focus order is logical (top to bottom, left to right)
   - Focus indicator is visible
   - Can activate buttons with `Enter` or `Space`
   - Can navigate dropdowns with arrow keys
   - Modal can be closed with `Escape`

#### Step 7: Screen Reader Test (Optional but Recommended)

If available:

1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate through the app
3. Verify:
   - All content is announced
   - Interactive elements have descriptive labels
   - State changes are announced
   - Navigation is logical

---

### Method B: CLI (Automated)

For CI/CD integration:

```bash
# Install axe-core CLI
bun add -D @axe-core/cli

# Start server in background
bun run preview &
SERVER_PID=$!

# Wait for server
sleep 3

# Run axe on each route
ROUTES=("/" "/completed" "/planned" "/tierlist" "/login")
for route in "${ROUTES[@]}"; do
  echo "Testing route: $route"
  npx axe "http://localhost:4173$route" \
    --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
    --dir ./docs/audits \
    --save "axe-report-$(echo $route | tr '/' '-').json"
done

# Stop server
kill $SERVER_PID

# Check results
if [ $? -eq 0 ]; then
  echo "✓ No accessibility violations found"
else
  echo "✗ Accessibility violations detected - check reports"
fi
```

---

## Interpreting and Fixing Issues

### Lighthouse Performance Issues

**Low Performance Score (< 95)**:

1. **Check Largest Contentful Paint (LCP)**
   - If > 2.5s:
     - Optimize hero images
     - Preload critical resources
     - Improve server response time

2. **Check Total Blocking Time (TBT)**
   - If > 200ms:
     - Break up long JavaScript tasks
     - Defer non-critical scripts
     - Use web workers for heavy calculations

3. **Check Cumulative Layout Shift (CLS)**
   - If > 0.1:
     - Set explicit image dimensions
     - Reserve space for dynamic content
     - Avoid inserting content above existing content

### axe-core Violations

**Fix Priority**:

1. **Fix all Critical and Serious violations** (required for 10/10)
2. **Fix Moderate violations** (strongly recommended)
3. **Fix Minor violations** (when possible)

**Documentation**:
- After fixing, re-run the audit
- Document any intentional exceptions
- Update `docs/project-audit.md` with results

---

## Post-Audit Documentation

### Update Project Documents

1. **docs/project-audit.md**
   ```markdown
   ## Performance Audit Results
   
   **Date**: [Date of audit]
   **Tool**: Lighthouse v[X.X]
   
   ### Scores
   - Performance: [XX]/100
   - Accessibility: [XX]/100
   - Best Practices: [XX]/100
   - SEO: [XX]/100
   
   ### Key Metrics
   - FCP: [X.X]s
   - LCP: [X.X]s
   - TBT: [X]ms
   - CLS: [X.XX]
   
   ### axe-core Results
   - Critical violations: 0
   - Serious violations: 0
   - Moderate violations: [X]
   - Minor violations: [X]
   
   **Grade Updated**: 9.7/10 → 10/10
   ```

2. **AGENTS.md**
   - Update grade badge to 10/10

3. **README.md** (if applicable)
   - Add performance badges
   - Link to audit reports

---

## Quick Reference Checklist

### Before Starting
- [ ] Production build created (`bun run build`)
- [ ] Server running (`bun run preview`)
- [ ] Chrome browser open
- [ ] DevTools accessible

### Lighthouse Audit
- [ ] Mobile audit completed
- [ ] Desktop audit completed
- [ ] All scores 95+ (or 100 for non-performance)
- [ ] Results exported and saved
- [ ] Issues addressed (if any)

### axe-core Audit
- [ ] Extension installed
- [ ] All routes tested (/)
- [ ] All routes tested (/completed)
- [ ] All routes tested (/planned)
- [ ] All routes tested (/tierlist)
- [ ] All routes tested (/login)
- [ ] Zero critical/serious violations
- [ ] Keyboard navigation tested
- [ ] Results documented

### Final Verification
- [ ] Re-run all audits after fixes
- [ ] All quality gates pass
- [ ] Documentation updated
- [ ] Grade updated to 10/10

---

## Troubleshooting

### Lighthouse Issues

**Issue**: "Audit failed" or timeout
- **Solution**: Ensure server is running and accessible
- **Check**: Try refreshing page before audit

**Issue**: Inconsistent scores between runs
- **Solution**: Close other browser tabs and applications
- **Note**: Run audit 3 times and take average

### axe-core Issues

**Issue**: Extension not detecting page
- **Solution**: Refresh page and try again
- **Check**: Ensure page is fully loaded

**Issue**: False positives
- **Solution**: Review axe documentation for context
- **Note**: Some violations may be intentional (e.g., decorative images)

---

## Expected Timeline

| Task | Estimated Time |
|------|---------------|
| Setup (build, serve) | 2 minutes |
| Lighthouse Mobile audit | 5 minutes |
| Lighthouse Desktop audit | 5 minutes |
| axe-core (5 routes) | 10 minutes |
| Keyboard navigation test | 5 minutes |
| Fix issues (if any) | 15-30 minutes |
| Documentation | 5 minutes |
| **Total** | **45-60 minutes** |

---

## Success Criteria

**Achieving 10/10 requires**:

1. ✓ Lighthouse Performance: 95+
2. ✓ Lighthouse Accessibility: 100
3. ✓ Lighthouse Best Practices: 100
4. ✓ Lighthouse SEO: 100
5. ✓ axe-core: Zero critical violations
6. ✓ axe-core: Zero serious violations
7. ✓ Manual keyboard navigation works
8. ✓ All routes tested

**Bonus** (not required for 10/10):
- Screen reader compatibility
-axe-core: Zero moderate violations
- Lighthouse PWA: 90+

---

## Next Steps After 10/10

Once 10/10 is achieved:

1. **Commit changes**: `git commit -m "perf(audit): achieve 10/10 grade"`
2. **Create tag**: `git tag v1.0.0-final`
3. **Update badges**: Add to README and documentation
4. **Archive reports**: Store audit reports in docs/audits/
5. **Celebrate!** 🎉 You've achieved perfect code quality!

---

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Maintainer**: AI Development Team
