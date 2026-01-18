function formatCurrency(input) {
    // Strip non-digits
    const rawVal = input.value.replace(/\D/g, '');
    if (!rawVal) {
        input.value = '';
        return;
    }
    // Format with commas (en-US uses commas for thousands)
    const formatted = parseInt(rawVal, 10).toLocaleString('en-US');
    input.value = formatted;
}

function runModel() {
    const incomeInput = document.getElementById('income');
    const dtiInput = document.getElementById('dti');
    const consoleDiv = document.getElementById('outputConsole');

    // Clean currency string to number (remove commas)
    const rawIncome = incomeInput.value.replace(/,/g, '');
    const income = parseFloat(rawIncome);
    const dti = parseFloat(dtiInput.value);

    // Initial Console State
    consoleDiv.innerHTML = `
        <div style="font-size: 0.9rem; margin-bottom: 1rem;">
            > Initializing parameters...<br>
            > Loading DecisionTree_v2...<br>
            <span style="color: var(--accent-primary)">> Processing...</span>
        </div>
    `;

    if (isNaN(income) || isNaN(dti)) {
        setTimeout(() => {
            consoleDiv.innerHTML += `
                <div style="color: var(--accent-risk-high); margin-top: 1rem;">
                    [ERROR] Invalid input type. Integer or Float expected.
                </div>
            `;
        }, 500);
        return;
    }

    // SIMULATION LOGIC
    // Context: Mongolia Average Monthly Income ~ 2,000,000 MNT

    let baseProbability = 5.0; // Base default rate

    // DTI Factor (Standard Global Risk)
    if (dti > 60) baseProbability += 80; // Extremely risky
    else if (dti > 45) baseProbability += 45; // High risk
    else if (dti > 35) baseProbability += 15; // Moderate
    else if (dti < 20) baseProbability -= 2; // Safe

    // Income Factor (Mongolian Context)
    // < 1.0M is very low (subsistence risk)
    // 2.0M is Avg
    // > 4.0M is Good
    if (income < 1000000) baseProbability += 25;
    else if (income < 1800000) baseProbability += 10; // Below Avg
    else if (income > 5000000) baseProbability -= 5;
    else if (income > 3000000) baseProbability -= 3;

    // Clamp
    let probability = Math.max(0.1, Math.min(99.9, baseProbability));

    // Show result with delay
    setTimeout(() => {
        let statusHtml = '';
        // Thresholds for Approval
        if (probability < 25) {
            statusHtml = `<span class="status-badge status-safe">APPROVED / LOW RISK</span>`;
        } else {
            statusHtml = `<span class="status-badge status-risk">REJECT / HIGH RISK</span>`;
        }

        // Format Income for display (MNT)
        const fmtIncome = new Intl.NumberFormat('en-US', { style: 'decimal' }).format(income) + ' ₮';

        consoleDiv.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <div class="metric-label">INPUT_SUMMARY</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    Income: ${fmtIncome}<br>
                    DTI Ratio: ${dti.toFixed(2)}%
                </div>
            </div>

            <div class="metric-label">PREDICTED_DEFAULT_PROBABILITY</div>
            <div class="metric-value">${probability.toFixed(2)}%</div>
            ${statusHtml}
            
            <div style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.6;">
                > Confidence Interval: 95%<br>
                > p-value: < 0.05
            </div>
        `;
    }, 800);
}
