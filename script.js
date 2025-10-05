// Theme Toggle
    function toggleTheme() {
      const body = document.body;
      const themeIcon = document.getElementById('themeIcon');
      const currentTheme = body.getAttribute('data-theme');
      
      if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
      } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
      }
    }

    // Load saved theme
    document.addEventListener('DOMContentLoaded', function() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const themeIcon = document.getElementById('themeIcon');
      
      document.body.setAttribute('data-theme', savedTheme);
      themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Get common parameters
    function getCommonParams() {
      let d_mm = parseFloat(document.getElementById("common-d").value);
      let eps_r = parseFloat(document.getElementById("common-eps").value);
      return {
        d: d_mm / 1000, // Convert to meters
        eps_r: eps_r
      };
    }

    // Calculate characteristic impedance
    function calcZ0_coax(d, D, eps_r) {
      return (60 / Math.sqrt(eps_r)) * Math.log(D / d);
    }

    // Calculate capacitance per unit length
    function calcCapacitance(d, D, eps_r) {
      const eps_0 = 8.854e-12; // F/m
      return (2 * Math.PI * eps_0 * eps_r) / Math.log(D / d);
    }

    function updateResultValue(elementId, value, unit = '') {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = value + unit;
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 500);
      }
    }

    function clearResults() {
      const resultElements = [
        'z0-value', 'diameter-value', 'ratio-value', 'capacitance-value'
      ];
      
      resultElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = '--' + (id === 'z0-value' ? ' Ω' : 
                                      id === 'diameter-value' ? ' mm' : 
                                      id === 'capacitance-value' ? ' pF/m' : '');
        }
      });
    }

    // Z₀ → D calculation
    function calculateD() {
      const button = event.target;
      button.classList.add('calculating');
      
      setTimeout(() => {
        try {
          let common = getCommonParams();
          let targetZ0 = parseFloat(document.getElementById("target-z0").value);
          
          // Validate inputs
          if (isNaN(common.d) || isNaN(common.eps_r) || isNaN(targetZ0) || 
              common.d <= 0 || common.eps_r < 1 || targetZ0 <= 0) {
            throw new Error('Invalid input parameters');
          }
          
          let d_mm = common.d * 1000;
          
          // Calculate D using formula: D = d * exp(Z0_target * sqrt(εᵣ) / 60)
          let D = common.d * Math.exp((targetZ0 * Math.sqrt(common.eps_r)) / 60);
          let D_mm = D * 1000;
          
          // Calculate other parameters
          let ratio = D_mm / d_mm;
          let capacitance = calcCapacitance(common.d, D, common.eps_r) * 1e12; // Convert to pF/m
          
          // Update results
          updateResultValue('z0-value', targetZ0.toFixed(2), ' Ω');
          updateResultValue('diameter-value', D_mm.toFixed(4), ' mm');
          updateResultValue('ratio-value', ratio.toFixed(2));
          updateResultValue('capacitance-value', capacitance.toFixed(2), ' pF/m');
          
        } catch (error) {
          console.error('Calculation error:', error);
          handleCalculationError(error);
          clearResults();
        }
        
        button.classList.remove('calculating');
      }, 300);
    }

    // D → Z₀ calculation
    function calculateZ0() {
      const button = event.target;
      button.classList.add('calculating');
      
      setTimeout(() => {
        try {
          let common = getCommonParams();
          let D_mm = parseFloat(document.getElementById("calc-D").value);
          let D = D_mm / 1000;
          
          // Validate inputs
          if (isNaN(common.d) || isNaN(common.eps_r) || isNaN(D) || 
              common.d <= 0 || common.eps_r < 1 || D <= common.d) {
            throw new Error('Invalid input parameters');
          }
          
          let d_mm = common.d * 1000;
          
          // Calculate impedance
          let Z0 = calcZ0_coax(common.d, D, common.eps_r);
          let ratio = D_mm / d_mm;
          let capacitance = calcCapacitance(common.d, D, common.eps_r) * 1e12; // Convert to pF/m
          
          // Update results
          updateResultValue('z0-value', Z0.toFixed(2), ' Ω');
          updateResultValue('diameter-value', D_mm.toFixed(4), ' mm');
          updateResultValue('ratio-value', ratio.toFixed(2));
          updateResultValue('capacitance-value', capacitance.toFixed(2), ' pF/m');
          
        } catch (error) {
          console.error('Calculation error:', error);
          handleCalculationError(error);
          clearResults();
        }
        
        button.classList.remove('calculating');
      }, 300);
    }

    // Enhanced error handling
    function handleCalculationError(error) {
      console.error('Calculation error:', error);
      clearResults();
      
      // Show user-friendly error message
      const errorMsg = document.createElement('div');
      errorMsg.innerHTML = `
        <div style="color: var(--error); text-align: center; padding: 1rem;">
          <i class="fas fa-exclamation-triangle"></i>
          Calculation Error: Please check your input values.
        </div>
      `;
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card);
        border: 2px solid var(--error);
        border-radius: var(--radius);
        z-index: 1000;
        animation: fadeInUp 0.3s ease-out;
        box-shadow: var(--shadow-large);
      `;
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    }

    // Add copy to clipboard functionality
    function copyResult() {
      const results = {
        z0: document.getElementById('z0-value').textContent,
        diameter: document.getElementById('diameter-value').textContent,
        ratio: document.getElementById('ratio-value').textContent,
        capacitance: document.getElementById('capacitance-value').textContent
      };
      
      const resultText = `Coaxial Line Calculation Results:
Characteristic Impedance: ${results.z0}
Outer Conductor Diameter: ${results.diameter}
Diameter Ratio (D/d): ${results.ratio}
Capacitance per Length: ${results.capacitance}`;
      
      navigator.clipboard.writeText(resultText).then(() => {
        // Show temporary success message
        const button = document.createElement('div');
        button.innerHTML = '<i class="fas fa-check"></i> Results Copied!';
        button.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--success);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: var(--radius);
          z-index: 1000;
          animation: fadeInUp 0.3s ease-out;
          box-shadow: var(--shadow-large);
        `;
        document.body.appendChild(button);
        setTimeout(() => button.remove(), 2000);
      });
    }

    // Add click to copy functionality to result display
    document.addEventListener('DOMContentLoaded', function() {
      const resultDisplay = document.querySelector('.result-display');
      if (resultDisplay) {
        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Results';
        copyButton.className = 'btn btn-secondary';
        copyButton.style.marginTop = '1rem';
        copyButton.onclick = copyResult;
        resultDisplay.appendChild(copyButton);
      }
    });

    // Animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = Math.random() * 0.3 + 's';
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all cards on page load
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
      });
    });

    // Input validation and real-time feedback
    function validateInputs() {
      const inputs = document.querySelectorAll('.input-field');
      inputs.forEach(input => {
        input.addEventListener('input', function() {
          const value = parseFloat(this.value);
          
          // Special validation for dielectric constant (allow εᵣ ≥ 1)
          if (this.id === 'common-eps') {
            if (isNaN(value) || value < 1) {
              this.style.borderColor = 'var(--error)';
            } else {
              this.style.borderColor = 'var(--border)';
            }
          } else {
            // Standard validation for other inputs
            if (isNaN(value) || value <= 0) {
              this.style.borderColor = 'var(--error)';
            } else {
              this.style.borderColor = 'var(--border)';
            }
          }
        });
      });
    }

    // Initialize validation on page load
    document.addEventListener('DOMContentLoaded', validateInputs);

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
          case '1':
            event.preventDefault();
            calculateD();
            break;
          case '2':
            event.preventDefault();
            calculateZ0();
            break;
          case 'd':
            event.preventDefault();
            toggleTheme();
            break;
        }
      }
    });

    // Add tooltips for better UX
    function addTooltips() {
      const tooltips = {
        'common-d': 'Inner conductor diameter of the coaxial line',
        'common-eps': 'Relative permittivity of the dielectric material (εᵣ ≥ 1)',
        'target-z0': 'Desired characteristic impedance (typically 50Ω)',
        'calc-D': 'Outer conductor inner diameter'
      };

      Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.title = tooltips[id];
        }
      });
    }

    // Initialize tooltips
    document.addEventListener('DOMContentLoaded', addTooltips);
