import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface A11yResults {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

/**
 * Run accessibility audit on current page
 * @param page Playwright page object
 * @param testName Name of the test for logging purposes
 * @param options Additional AxeBuilder options
 */
export async function checkA11y(
  page: Page,
  testName: string,
  options?: {
    includeTags?: string[];
    excludeTags?: string[];
    disableRules?: string[];
  }
): Promise<A11yResults> {
  let builder = new AxeBuilder({ page })
    .withTags(options?.includeTags || ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

  if (options?.excludeTags) {
    builder = builder.exclude(options.excludeTags);
  }

  if (options?.disableRules) {
    builder = builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  if (results.violations.length > 0) {
    console.log(`\n❌ Accessibility violations found in ${testName}:`);
    results.violations.forEach((violation, index) => {
      console.log(`\n[${index + 1}] ${violation.id} (${violation.impact})`);
      console.log(`  Description: ${violation.description}`);
      console.log(`  Help: ${violation.help}`);
      console.log(`  Help URL: ${violation.helpUrl}`);
      console.log(`  Elements affected: ${violation.nodes.length}`);
      
      violation.nodes.forEach((node: any, nodeIndex: number) => {
        console.log(`\n  Element ${nodeIndex + 1}:`);
        console.log(`    HTML: ${node.html.substring(0, 100)}${node.html.length > 100 ? '...' : ''}`);
        console.log(`    Target: ${node.target.join(' ')}`);
        
        if (node.failureSummary) {
          console.log(`    Issue: ${node.failureSummary}`);
        }
        
        if (node.any.length > 0) {
          console.log(`    Fixes needed (any of):`);
          node.any.forEach((fix: any) => {
            console.log(`      - ${fix.message}`);
          });
        }
        
        if (node.all.length > 0) {
          console.log(`    Fixes needed (all of):`);
          node.all.forEach((fix: any) => {
            console.log(`      - ${fix.message}`);
          });
        }
      });
    });
    
    console.log(`\n📊 Summary for ${testName}:`);
    console.log(`  Violations: ${results.violations.length}`);
    console.log(`  Passes: ${results.passes.length}`);
    console.log(`  Incomplete: ${results.incomplete.length}`);
  } else {
    console.log(`\n✅ No accessibility violations found in ${testName}`);
    console.log(`  Passes: ${results.passes.length} checks`);
  }

  return results;
}

/**
 * Assert that there are no accessibility violations
 * Throws error if violations are found
 */
export function assertNoA11yViolations(results: A11yResults) {
  if (results.violations.length > 0) {
    const violationSummary = results.violations
      .map(v => `[${v.impact}] ${v.id}: ${v.description}`)
      .join('\n  ');
    
    throw new Error(
      `Found ${results.violations.length} accessibility violation(s):\n  ${violationSummary}\n\nCheck console output for detailed information.`
    );
  }
}

/**
 * Assert that critical violations are not present
 * Only fails on 'critical' and 'serious' impact violations
 */
export function assertNoCriticalA11yViolations(results: A11yResults) {
  const criticalViolations = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  );
  
  if (criticalViolations.length > 0) {
    const violationSummary = criticalViolations
      .map(v => `[${v.impact}] ${v.id}: ${v.description}`)
      .join('\n  ');
    
    throw new Error(
      `Found ${criticalViolations.length} critical accessibility violation(s):\n  ${violationSummary}`
    );
  }
}

/**
 * Get summary of accessibility results
 */
export function getA11ySummary(results: A11yResults) {
  return {
    violations: results.violations.length,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    violationsBySeverity: {
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length,
      moderate: results.violations.filter(v => v.impact === 'moderate').length,
      minor: results.violations.filter(v => v.impact === 'minor').length,
    }
  };
}
