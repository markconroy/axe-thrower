const app = document.querySelector('#app');
const violations = fetch('violations.json').then(response => response.json());

violations.then(data => {
  const numberOfURLsTested = data.numberOfURLsTested;
  const allViolations = data.violations;

  // Filter for color-contrast violations
  const colorContrastViolations = allViolations.filter(violation => violation.id === 'color-contrast');

  // Count the number of nodes in color-contrast violations
  const numberOfColorContrastNodes = colorContrastViolations.reduce((acc, violation) => acc + violation.nodes.length, 0);

  // Get unique URLs with violations
  const uniqueURLsWithViolations = [...new Set(allViolations.map(violation => violation.url))];

  app.innerHTML = `
    <h2 id="summary">Summary</h2>
    <h3>URLs with violations</h3>
    <p>We tested <strong>${numberOfURLsTested} URLs</strong> and found <strong>${uniqueURLsWithViolations.length} URLs</strong> with accessibility violations <strong>(${(uniqueURLsWithViolations.length / numberOfURLsTested * 100).toFixed(2)}%</strong> of URLs).</p>
    <ul>
      ${uniqueURLsWithViolations.map(url => `
        <li>
          <a href="${url}">${url}</a>
        </li>
      `).join('')}
    </ul>
    <h2 id="violations">Accessibility Violations</h2>
    <h3>Colour contrast issues</h3>
    <p>We found <strong>${numberOfColorContrastNodes}</strong> color-contrast issues across the tested pages.</p>
    <p>Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds.</p>
    <p>For more information, see <a href="https://www.w3.org/TR/WCAG20/#visual-audio-contrast">WCAG 2.0 Guideline 1.4</a>.</p>
    <p>For a list of pages with color-contrast issues, see below:</p>
    <ol>
      ${colorContrastViolations.map(violation => `
        <li>
          <a href="${violation.url}">${violation.url}</a>
          <ul>
            ${violation.nodes.map(node => `
              <li>
                <ul>
                  <li>HTML: ${node.html}</li>
                  <li>Violating selector: ${node.target.join(' > ')}</li>
                  <li>Failure summary: ${node.failureSummary}</li>
                </ul>
              </li>
            `).join('')}
          </ul>
        </li>
      `).join('')}
    </ol>
  `;
});