import puppeteer from 'puppeteer';
import axeCore from 'axe-core';
import fs from 'fs/promises';

const urlsFile = 'urls.json'; // Path to your local urls.json file

// Read URLs from the JSON file
const urlsData = await fs.readFile(urlsFile, 'utf8');
const urls = JSON.parse(urlsData);

console.log(`Testing ${urls.length} URLs`);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
  });
  const page = await browser.newPage();

  const allViolations = [];

  for (const url of urls) {
    console.log(`Testing ${url}`);

    await page.goto(url);
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    // Format violations
    const formattedViolations = results.violations.map(violation => ({
      url: url,
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))
    }));

    // Add to all violations
    allViolations.push(...formattedViolations);
  }

  // Create summary
  const summary = {
    numberOfURLsTested: urls.length,
    violations: allViolations
  };

  // Write summary and all violations to a single JSON file
  const outputFilePath = 'violations.json';
  await fs.writeFile(outputFilePath, JSON.stringify(summary, null, 2));
  console.log(`All violations have been written to ${outputFilePath}`);

  await browser.close();
})();