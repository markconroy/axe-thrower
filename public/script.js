const app = document.querySelector('#app');
const violations = fetch('violations.json').then(response => response.json());
// Helper function to convert to sentence case
const toSentenceCase = (string) => {
  return string
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const replaceHyphensWithSpaces = (string) => string.replace(/-/g, ' ');

// Helper function to escape HTML
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const dialog = document.querySelector('.dialog-violations');
const violationsList = dialog.querySelector('.dialog-violations__list');

violations.then(data => {
  const numberOfURLsTested = data.numberOfURLsTested;
  const allViolations = data.violations;

  // Group violations by type
  const violationsByType = allViolations.reduce((acc, violation) => {
    if (!acc[violation.id]) {
      acc[violation.id] = [];
    }
    acc[violation.id].push(violation);
    return acc;
  }, {});

  // Create variables for each violation type dynamically
  const violationTypes = Object.keys(violationsByType);
  const violationVariables = violationTypes.reduce((acc, type) => {
    acc[type] = violationsByType[type];
    return acc;
  }, {});

  // Count the number of nodes in color-contrast violations
  // const numberOfColorContrastNodes = violationVariables['color-contrast'].reduce((acc, violation) => acc + violation.nodes.length, 0);

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
    <div class="grid grid--2">
    ${violationTypes.map(type => `
      <article class="violations">
        <h3>${toSentenceCase(replaceHyphensWithSpaces(type))}</h3>
        <p>There are <strong>${violationVariables[type].length} ${type} violations</strong> across <strong>${uniqueURLsWithViolations.length} URLs</strong>.</p>
        <ol class="violations__list">
          ${violationVariables[type].map((violation, index) => `
            <li>
              <a href="${violation.url}">${violation.url}</a>
              <ul>
                <li>Description: ${violation.description}</li>
                <li>Impact: <span class="impact impact--${violation.impact}">${toSentenceCase(violation.impact)}</span></li>
                <li>Instances: ${violation.nodes.length} - <button data-index="${index}" data-type="${type}" class="view-violations" type="button">View All</button></li>
              </ul>
            </li>
          `).join('')}
        </ol>
      </article>
    `).join('')}
    </div>
  `;

  // Event listener for the view violations buttons
  document.querySelectorAll('.view-violations').forEach(button => {
    button.addEventListener('click', (event) => {
      const type = event.target.getAttribute('data-type');
      const index = event.target.getAttribute('data-index');
      const violation = violationVariables[type][index];
      violationsList.innerHTML = '';

      violation.nodes.forEach(node => {
        console.log(node);
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <p><strong>HTML:</strong></p>
          <code>${escapeHtml(node.html)}</code>
          <p><strong>Target:</strong> ${node.target.join(' > ')}</p>
          <p><strong>Summary:</strong> ${node.failureSummary}</p>
        `;
        violationsList.appendChild(listItem);
      });

      dialog.showModal();
    });
  });

  // Event listener for the close dialog button
  dialog.querySelector('.dialog-close').addEventListener('click', () => {
    document.querySelector('.dialog-violations').close();
  });

});