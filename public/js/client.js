document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('marathonForm');
  const feeDisplay = document.getElementById('feeDisplay');

  const feeMap = {
    '5 kilometer': 250,
    '10 kilometer': 500,
    '21 kilometer': 500
  };

  // Custom Alert Function
  const showAlert = (title, message, type = 'success') => {
    const modal = document.getElementById('customAlert');
    const container = document.getElementById('alertContainer');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const iconEl = document.getElementById('alertIcon');
    const closeBtn = document.getElementById('closeAlert');

    titleEl.textContent = title;
    messageEl.textContent = message;

    // Set colors and icon based on type
    if (type === 'success') {
      iconEl.className = 'mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-green-500/20 text-green-500';
      iconEl.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
      titleEl.className = 'text-2xl font-bold text-green-500';
    } else {
      iconEl.className = 'mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-orange-500/20 text-orange-500';
      iconEl.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
      titleEl.className = 'text-2xl font-bold text-orange-500';
    }

    modal.classList.add('show');
    setTimeout(() => container.style.opacity = '1', 10);

    const closeModal = () => {
      modal.classList.remove('show');
    };

    closeBtn.onclick = closeModal;
    document.getElementById('alertBackdrop').onclick = closeModal;
  };

  // Helper to show error
  const showError = (fieldId, message) => {
    const errorDiv = document.getElementById(`${fieldId}_error`);
    if (errorDiv) {
      errorDiv.textContent = message || errorDiv.textContent;
      errorDiv.style.display = 'block';
    }
    const input = document.getElementById(fieldId);
    if (input && input.classList.contains('w-full')) {
      input.style.borderColor = '#f97316';
    } else if (fieldId === 'gender' || fieldId === 'category') {
      const trigger = document.querySelector(`#${fieldId}Dropdown .custom-select-trigger`);
      if (trigger) trigger.style.borderColor = '#f97316';
    }
  };

  // Helper to hide error
  const hideError = (fieldId) => {
    const errorDiv = document.getElementById(`${fieldId}_error`);
    if (errorDiv) errorDiv.style.display = 'none';

    const input = document.getElementById(fieldId);
    if (input && input.classList.contains('w-full')) {
      input.style.borderColor = '';
    } else if (fieldId === 'gender' || fieldId === 'category') {
      const trigger = document.querySelector(`#${fieldId}Dropdown .custom-select-trigger`);
      if (trigger) trigger.style.borderColor = '';
    }
  };

  // Custom Dropdown Logic
  const setupDropdown = (dropdownId, inputId, onChange) => {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const trigger = dropdown.querySelector('.custom-select-trigger');
    const triggerText = trigger.querySelector('span');
    const optionsCont = dropdown.querySelector('.custom-options');
    const options = dropdown.querySelectorAll('.custom-option');

    trigger.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      optionsCont.classList.toggle('show');
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        input.value = value;
        triggerText.textContent = value;
        triggerText.style.color = '#f1f5f9'; // slate-100

        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        dropdown.classList.remove('open');
        optionsCont.classList.remove('show');

        hideError(inputId);
        if (onChange) onChange(value);
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        optionsCont.classList.remove('show');
      }
    });
  };

  setupDropdown('genderDropdown', 'gender');
  setupDropdown('categoryDropdown', 'category', (value) => {
    const fee = feeMap[value] || 0;
    feeDisplay.textContent = `₹${fee.toLocaleString('en-IN')}`;
  });

  // Real-time validation clearing
  ['first_name', 'last_name', 'email', 'mobile_no', 'terms'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      if (id === 'mobile_no') {
        // Ensure +91 prefix stays and only digits follow
        let val = el.value;
        if (!val.startsWith('+91')) {
          val = '+91' + val.replace(/\D/g, '');
        } else {
          val = '+91' + val.substring(3).replace(/\D/g, '');
        }
        el.value = val.substring(0, 13); // +91 + 10 digits (max 13 chars)
      }
      hideError(id);
    });
    if (el.type === 'checkbox') el.addEventListener('change', () => hideError(id));
  });

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.first_name) { showError('first_name'); isValid = false; }
    if (!data.last_name) { showError('last_name'); isValid = false; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (data.email && !emailRegex.test(data.email)) {
      showError('email', 'Please enter a valid email address.'); isValid = false;
    }

    const mobileRegex = /^\+91[6-9][0-9]{9}$/;
    if (!data.mobile_no || data.mobile_no === '+91') {
      showError('mobile_no', 'Mobile number is required.'); isValid = false;
    } else if (!mobileRegex.test(data.mobile_no)) {
      showError('mobile_no', 'Please enter a valid 10-digit mobile number.'); isValid = false;
    }

    if (!data.gender) { showError('gender'); isValid = false; }
    if (!data.category) { showError('category'); isValid = false; }
    if (!data.terms) { showError('terms'); isValid = false; }

    return isValid;
  };

  // Form Submission handles Razorpay Payment
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // 1. Create Order and Save Pending Registration on Backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          mobile_no: data.mobile_no,
          gender: data.gender,
          category: data.category
        })
      });

      if (!orderResponse.ok) {
        const err = await orderResponse.json();
        throw new Error(err.message || 'Failed to create order');
      }

      const order = await orderResponse.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_RzN5L8eoRwHEjc', // Test Key
        amount: order.amount,
        currency: order.currency,
        name: 'Marathon 2026',
        description: `Registration for ${data.category}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment on Backend
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...data,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const result = await verifyResponse.json();

            if (verifyResponse.ok) {
              window.location.href = `/api/registration-success/${result.data._id}`;
            } else {
              showAlert('Payment Verification Failed', result.message, 'error');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            showAlert('Error', 'An error occurred while verifying payment.', 'error');
          }
        },
        prefill: {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          contact: data.mobile_no
        },
        theme: {
          color: '#f97316' // orange-500
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout modal closed');
            fetch('/api/log-payment-failure', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...data,
                order_id: order.id,
                error: { description: 'User closed the checkout modal (dismissed)' }
              })
            }).catch(e => console.error('Error logging dismissal:', e));
          }
        }
      };

      const rzp = new Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);

        // Log failure to DB
        fetch('/api/log-payment-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            order_id: order.id,
            payment_id: response.error.metadata.payment_id,
            error: response.error
          })
        }).catch(e => console.error('Error logging failure:', e));

        showAlert('Payment Failed', response.error.description + '\nReason: ' + (response.error.reason || 'Unknown'), 'error');
      });

      rzp.open();

    } catch (error) {
      console.error('Error:', error);
      showAlert('Payment Failed', error.message, 'error');
    }
  });
});
