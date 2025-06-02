import React, { useEffect, useState, useRef } from 'react';

const ApplePayButton = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const applePayConfigRef = useRef(null);

  const addDebugInfo = (message) => {
    console.log(message);
    setDebugInfo((prev) => prev + '\n' + message);
  };

  const REACT_APP_PAYPAL_CLIENT_ID =
    'AX844i_ZliVK_y_p8UCEb6lqmSc6xfZn9k8UV5_1ep5zSmXnVFO_gG7m9MwhGy97re9a8dOpU7yOxLxy';

  useEffect(() => {
    // Load PayPal SDK first
    const loadPayPalSDK = () => {
      if (document.querySelector('script[src*="paypal-sdk"]')) {
        addDebugInfo('PayPal SDK already loaded');
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const clientId = REACT_APP_PAYPAL_CLIENT_ID;
        addDebugInfo(
          'Using PayPal Client ID: ' +
            (clientId ? clientId.substring(0, 5) + '...' : 'Not found'),
        );

        // Updated PayPal SDK URL with all necessary components and debug mode
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons,applepay&currency=USD&intent=capture&enable-funding=applepay&debug=true`;
        script.async = true;
        script.onload = () => {
          addDebugInfo('PayPal SDK loaded successfully phase 9');
          setTimeout(() => {
            if (window.paypal?.Applepay) {
              addDebugInfo('PayPal Apple Pay component is available');
              addDebugInfo('PayPal SDK version: ' + window.paypal.version);
              resolve();
            } else {
              addDebugInfo(
                'PayPal Apple Pay component is not available after loading',
              );
              addDebugInfo(
                'Available PayPal components: ' +
                  Object.keys(window.paypal || {}).join(', '),
              );
              reject(new Error('PayPal Apple Pay component not available'));
            }
          }, 2000);
        };
        script.onerror = (error) => {
          addDebugInfo('Error loading PayPal SDK: ' + error.message);
          reject(error);
        };
        document.body.appendChild(script);
      });
    };

    // Load Apple Pay SDK
    const loadApplePaySDK = () => {
      if (document.querySelector('script[src*="apple-pay-sdk.js"]')) {
        addDebugInfo('Apple Pay SDK already loaded');
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js';
        script.async = true;
        script.onload = () => {
          addDebugInfo('Apple Pay SDK loaded');
          resolve();
        };
        script.onerror = (error) => {
          addDebugInfo('Error loading Apple Pay SDK: ' + error.message);
          reject(error);
        };
        document.body.appendChild(script);
      });
    };

    // Initialize Apple Pay
    const initializeApplePay = async () => {
      addDebugInfo('Initializing Apple Pay...');

      // Check if Apple Pay is available
      if (typeof window.ApplePaySession === 'undefined') {
        addDebugInfo('Apple Pay is not available on this device/browser');
        return;
      }
      addDebugInfo('ApplePaySession is available');

      // Check if device can make payments
      const canMakePayments = window.ApplePaySession.canMakePayments();
      addDebugInfo('Can make payments: ' + canMakePayments);

      if (!canMakePayments) {
        addDebugInfo('This device cannot make Apple Pay payments');
        return;
      }

      // Check if device can make payments with specific networks
      try {
        const canMakePaymentsWithNetworks =
          await window.ApplePaySession.canMakePaymentsWithActiveCard(
            'merchant.com.paypal',
          );
        addDebugInfo(
          'Can make payments with networks: ' + canMakePaymentsWithNetworks,
        );

        // Add detailed environment information
        addDebugInfo('Environment Details:');
        addDebugInfo(
          '- Is Private Browsing: ' +
            (window.webkit?.messageHandlers?.applepay ? 'No' : 'Yes'),
        );
        addDebugInfo(
          '- Is Sandbox: ' +
            (window.location.hostname.includes('sandbox') ||
              window.location.hostname.includes('vercel')),
        );
        addDebugInfo(
          '- Current Environment: ' +
            (window.location.hostname.includes('sandbox')
              ? 'Sandbox'
              : 'Production'),
        );
        addDebugInfo(
          '- Device Type: ' +
            (navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Mac'),
        );
        addDebugInfo(
          '- Safari Version: ' +
            (navigator.userAgent.match(/Version\/(\d+\.\d+)/)?.[1] ||
              'unknown'),
        );

        if (!canMakePaymentsWithNetworks) {
          addDebugInfo('No active cards found for Apple Pay. Please check:');
          addDebugInfo(
            '1. Cards are added in System Settings > Wallet & Apple Pay',
          );
          addDebugInfo('2. Cards are properly configured in PayPal Sandbox');
          addDebugInfo('3. You are not in private browsing mode');
          addDebugInfo('4. Your device supports Apple Pay');

          // Add sandbox-specific instructions
          if (
            window.location.hostname.includes('sandbox') ||
            window.location.hostname.includes('vercel')
          ) {
            addDebugInfo('\nSandbox Setup Instructions:');
            addDebugInfo(
              '1. Go to PayPal Developer Dashboard > Sandbox > Accounts',
            );
            addDebugInfo(
              '2. Set up Apple Pay in your sandbox business account',
            );
            addDebugInfo('3. Add test card: 4242 4242 4242 4242');
            addDebugInfo("4. Add the card to your Mac's Wallet & Apple Pay");
            addDebugInfo(
              '5. Use a regular Safari window (not private browsing)',
            );
            addDebugInfo(
              '6. Make sure the card is set as default in Wallet & Apple Pay',
            );
          }
          return;
        }

        // Check for sandbox-specific requirements
        if (
          window.location.hostname.includes('sandbox') ||
          window.location.hostname.includes('vercel')
        ) {
          addDebugInfo(
            'Running in sandbox environment. Verifying sandbox configuration...',
          );

          // Check if we're in private browsing
          if (!window.webkit?.messageHandlers?.applepay) {
            addDebugInfo(
              'WARNING: Private browsing mode detected. Apple Pay may not work properly in private browsing.',
            );
            addDebugInfo('Please try in a regular Safari window.');
          }

          // Check if we're on a Mac
          if (navigator.userAgent.includes('Macintosh')) {
            addDebugInfo('Testing on Mac. Please ensure:');
            addDebugInfo(
              '1. You have added the test card to Wallet & Apple Pay',
            );
            addDebugInfo('2. You are using a regular Safari window');
            addDebugInfo('3. You are logged into your PayPal sandbox account');
            addDebugInfo(
              '4. The test card is set as default in Wallet & Apple Pay',
            );
            addDebugInfo(
              '5. The card shows as "Ready to Pay" in Wallet & Apple Pay',
            );
          }

          // Verify sandbox configuration
          addDebugInfo('\nVerifying Sandbox Configuration:');
          addDebugInfo(
            '1. Domain registered: ' +
              (window.location.hostname === 'paypal-nine-omega.vercel.app'
                ? 'Yes'
                : 'No'),
          );
          addDebugInfo(
            '2. Environment: ' +
              (window.location.hostname.includes('sandbox')
                ? 'Sandbox'
                : 'Production'),
          );
          addDebugInfo('3. Merchant ID: merchant.com.paypal');
        }
      } catch (error) {
        addDebugInfo('Error checking network support: ' + error.message);
        addDebugInfo('Error details: ' + JSON.stringify(error));
        return;
      }

      // Check if PayPal SDK is loaded and Apple Pay is available
      if (!window.paypal?.Applepay) {
        addDebugInfo('PayPal Apple Pay is not available');
        return;
      }

      try {
        addDebugInfo('Getting Apple Pay configuration...');
        const applepay = window.paypal.Applepay();
        addDebugInfo(
          'PayPal Apple Pay instance created: ' + JSON.stringify(applepay),
        );

        // Log available methods on applepay object
        addDebugInfo(
          'Available methods on applepay: ' + Object.keys(applepay).join(', '),
        );

        const config = await applepay.config();
        addDebugInfo('Raw config response: ' + JSON.stringify(config));

        if (!config) {
          addDebugInfo('Config is empty or undefined');
          return;
        }

        applePayConfigRef.current = config;
        addDebugInfo(
          'Apple Pay configuration received: ' + JSON.stringify(config),
        );

        // Check eligibility from config instead of calling isEligible directly
        if (!config.isEligible) {
          addDebugInfo('Apple Pay is not eligible for this device/browser');
          return;
        }
        addDebugInfo('Apple Pay is eligible: true');

        // Add mobile-specific checks
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        addDebugInfo('Is iOS device: ' + isIOS);
        addDebugInfo('User Agent: ' + navigator.userAgent);
        addDebugInfo('Device pixel ratio: ' + window.devicePixelRatio);
        addDebugInfo(
          'Screen size: ' + window.screen.width + 'x' + window.screen.height,
        );
      } catch (error) {
        addDebugInfo('Error checking Apple Pay eligibility: ' + error.message);
        addDebugInfo('Error stack: ' + error.stack);
        addDebugInfo('Error details: ' + JSON.stringify(error));
      }

      const container = document.getElementById('applepay-container');
      if (!container) {
        addDebugInfo('Apple Pay container not found');
        return;
      }
      addDebugInfo('Apple Pay container found');

      // Create Apple Pay button with mobile-specific styling
      const button = document.createElement('apple-pay-button');
      button.setAttribute('buttonstyle', 'black');
      button.setAttribute('type', 'buy');
      button.setAttribute('locale', 'en');
      button.style.height = '44px';
      button.style.width = '100%';
      button.style.borderRadius = '10px';
      button.style.webkitAppearance = 'none';
      button.style.appearance = 'none';
      button.style.margin = '0';
      button.style.padding = '0';
      button.style.border = 'none';
      button.style.background = 'none';
      button.style.fontSize = '16px';
      button.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Handle button click
      button.addEventListener('click', () => {
        addDebugInfo('Apple Pay button clicked');
        addDebugInfo('Device info at click:');
        addDebugInfo('- User Agent: ' + navigator.userAgent);
        addDebugInfo('- Platform: ' + navigator.platform);
        addDebugInfo('- Vendor: ' + navigator.vendor);
        addDebugInfo('- Language: ' + navigator.language);

        const config = applePayConfigRef.current;
        if (!config) {
          addDebugInfo('Apple Pay configuration not available');
          return;
        }

        const paymentRequest = {
          countryCode: config.countryCode,
          currencyCode: config.currencyCode,
          supportedNetworks: config.supportedNetworks,
          merchantCapabilities: config.merchantCapabilities,
          merchantIdentifier: 'merchant.com.paypal', // Add PayPal's merchant identifier
          total: {
            label: 'Demo Product',
            amount: '10.00',
          },
        };

        addDebugInfo(
          'Creating Apple Pay session with request: ' +
            JSON.stringify(paymentRequest),
        );
        const session = new window.ApplePaySession(4, paymentRequest);

        // Track session state
        let sessionState = 'created';
        const updateSessionState = (newState) => {
          sessionState = newState;
          addDebugInfo('Session state updated to: ' + sessionState);
        };

        // Handle payment authorization
        session.onpaymentauthorized = async (event) => {
          updateSessionState('payment_authorized');
          addDebugInfo('Payment authorization started');
          addDebugInfo('Payment details: ' + JSON.stringify(event.payment));

          try {
            // Create a new instance of Applepay for the confirmation
            const applepay = window.paypal.Applepay();
            addDebugInfo('Created new Applepay instance for confirmation');

            // First create an order
            const orderDetails = {
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: '10.00',
                  },
                  description: 'Demo Product',
                  custom_id: 'DEMO_PRODUCT_001',
                },
              ],
              application_context: {
                brand_name: 'Your Store Name',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: window.location.href,
                cancel_url: window.location.href,
              },
            };

            addDebugInfo(
              'Creating order with details: ' + JSON.stringify(orderDetails),
            );

            // Create the order with error handling
            let order;
            try {
              order = await window.paypal.Orders.create(orderDetails);
              addDebugInfo(
                'Order created successfully: ' + JSON.stringify(order),
              );
            } catch (orderError) {
              addDebugInfo('Error creating order: ' + orderError.message);
              addDebugInfo(
                'Order error details: ' + JSON.stringify(orderError),
              );
              throw orderError;
            }

            // Call confirmOrder with the payment token
            addDebugInfo('Calling confirmOrder with payment token');
            addDebugInfo(
              'Payment token: ' + JSON.stringify(event.payment.token),
            );

            let confirmResult;
            try {
              confirmResult = await applepay.confirmOrder({
                orderId: order.id,
                payment: event.payment,
              });
              addDebugInfo(
                'Order confirmation result: ' + JSON.stringify(confirmResult),
              );
            } catch (confirmError) {
              addDebugInfo('Error confirming order: ' + confirmError.message);
              addDebugInfo(
                'Confirmation error details: ' + JSON.stringify(confirmError),
              );
              throw confirmError;
            }

            // Complete the payment with success status
            updateSessionState('payment_completed');
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            addDebugInfo('Payment successful!');
          } catch (err) {
            updateSessionState('payment_failed');
            addDebugInfo('Payment failed: ' + err.message);
            addDebugInfo('Error details: ' + JSON.stringify(err));
            addDebugInfo('Error stack: ' + err.stack);

            // Log specific error types
            if (err.name === 'OrderError') {
              addDebugInfo(
                'Order creation failed. Check PayPal sandbox account settings.',
              );
            } else if (err.name === 'ConfirmError') {
              addDebugInfo(
                'Order confirmation failed. Check payment token and merchant configuration.',
              );
            }

            // Complete the payment with failure status
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          }
        };

        // Add support for payment method selection with error handling
        session.onpaymentmethodselected = (event) => {
          updateSessionState('payment_method_selected');
          addDebugInfo('Payment method selected: ' + JSON.stringify(event));

          try {
            session.completePaymentMethodSelection({
              total: paymentRequest.total,
              lineItems: [
                {
                  label: 'Demo Product',
                  amount: '10.00',
                },
              ],
            });
            addDebugInfo('Payment method selection completed successfully');
          } catch (error) {
            addDebugInfo(
              'Error completing payment method selection: ' + error.message,
            );
            session.abort();
          }
        };

        // Add support for shipping contact selection
        session.onshippingcontactselected = (event) => {
          updateSessionState('shipping_contact_selected');
          addDebugInfo('Shipping contact selected: ' + JSON.stringify(event));
          try {
            session.completeShippingContactSelection(
              window.ApplePaySession.STATUS_SUCCESS,
              [],
              paymentRequest.total,
              [],
            );
            addDebugInfo('Shipping contact selection completed successfully');
          } catch (error) {
            addDebugInfo(
              'Error completing shipping contact selection: ' + error.message,
            );
            session.abort();
          }
        };

        // Add support for shipping method selection
        session.onshippingmethodselected = (event) => {
          updateSessionState('shipping_method_selected');
          addDebugInfo('Shipping method selected: ' + JSON.stringify(event));
          try {
            session.completeShippingMethodSelection(
              window.ApplePaySession.STATUS_SUCCESS,
              paymentRequest.total,
              [],
            );
            addDebugInfo('Shipping method selection completed successfully');
          } catch (error) {
            addDebugInfo(
              'Error completing shipping method selection: ' + error.message,
            );
            session.abort();
          }
        };

        // Add support for payment sheet dismissal
        session.oncancel = (event) => {
          addDebugInfo('Session state at cancellation: ' + sessionState);
          addDebugInfo('Cancellation event details: ' + JSON.stringify(event));
          addDebugInfo('Current session state: ' + session.state);
          addDebugInfo(
            'Session validation status: ' +
              (session.merchantSession ? 'Validated' : 'Not validated'),
          );

          // Log additional debugging information
          addDebugInfo('Environment check:');
          addDebugInfo('- Current URL: ' + window.location.href);
          addDebugInfo('- Protocol: ' + window.location.protocol);
          addDebugInfo('- Hostname: ' + window.location.hostname);
          addDebugInfo('- PayPal Client ID: ' + REACT_APP_PAYPAL_CLIENT_ID);
          addDebugInfo('- Apple Pay Session Version: ' + session.version);

          // Check if this was a manual cancellation
          if (event && event.reason === 'addCard') {
            addDebugInfo('User is adding a card - this is expected behavior');
            return;
          }

          // Add more specific cancellation reasons
          if (sessionState === 'validated') {
            addDebugInfo(
              'Session was cancelled after successful validation. This might indicate:',
            );
            addDebugInfo('1. User manually cancelled the payment sheet');
            addDebugInfo('2. Payment sheet failed to display properly');
            addDebugInfo('3. Device compatibility issue');
            addDebugInfo('4. Payment authorization failed');
          }

          addDebugInfo('Apple Pay session was cancelled by user');
        };

        // Add session state change handler with more detailed logging
        session.onstatechange = (event) => {
          const previousState = sessionState;
          sessionState = event.state;
          addDebugInfo(
            `Session state changed from ${previousState} to ${sessionState}`,
          );

          // Log additional state-specific information
          switch (event.state) {
            case 'validating':
              addDebugInfo('Merchant validation in progress');
              break;
            case 'validated':
              addDebugInfo('Merchant validation completed successfully');
              break;
            case 'payment_method_selected':
              addDebugInfo('Payment method selection completed');
              break;
            case 'shipping_contact_selected':
              addDebugInfo('Shipping contact selection completed');
              break;
            case 'payment_authorized':
              addDebugInfo('Payment authorization completed');
              break;
            case 'completed':
              addDebugInfo('Session completed successfully');
              break;
            case 'failed':
              addDebugInfo('Session failed');
              break;
          }
        };

        // Handle payment sheet errors with more detailed logging
        session.onerror = (error) => {
          addDebugInfo('Session state at error: ' + sessionState);
          addDebugInfo('Apple Pay session error: ' + JSON.stringify(error));

          // Add specific error handling
          if (error.code === 'addCard') {
            addDebugInfo('User is adding a card - this is expected behavior');
            return;
          }

          // Log device-specific information
          addDebugInfo('Device information at error:');
          addDebugInfo(
            '- iOS Version: ' +
              (navigator.userAgent.match(/OS (\d+)_/)?.[1] || 'unknown'),
          );
          addDebugInfo(
            '- Device Type: ' +
              (navigator.userAgent.includes('iPhone') ? 'iPhone' : 'iPad'),
          );
          addDebugInfo(
            '- Safari Version: ' +
              (navigator.userAgent.match(/Version\/(\d+\.\d+)/)?.[1] ||
                'unknown'),
          );

          addDebugInfo('Error stack: ' + error.stack);
        };

        // Validate merchant
        session.onvalidatemerchant = async (event) => {
          updateSessionState('validating');
          addDebugInfo('Validating merchant with URL: ' + event.validationURL);
          try {
            const currentDomain = window.location.hostname;
            addDebugInfo('Current domain: ' + currentDomain);

            // Create a new instance of Applepay for each validation
            const applepay = window.paypal.Applepay();
            addDebugInfo('Created new Applepay instance for validation');

            // Log the validation URL and configuration
            addDebugInfo('Validation URL: ' + event.validationURL);

            // First, get the Apple Pay configuration
            const applePayConfig = await applepay.config();
            addDebugInfo('Apple Pay config: ' + JSON.stringify(applePayConfig));

            const validationConfig = {
              validationUrl: event.validationURL,
              displayName: 'Your Store Name',
              domainName: currentDomain,
              environment: 'sandbox',
              clientId: REACT_APP_PAYPAL_CLIENT_ID,
              merchantCountry: applePayConfig.merchantCountry,
              supportedNetworks: applePayConfig.supportedNetworks,
              merchantCapabilities: applePayConfig.merchantCapabilities,
              currencyCode: applePayConfig.currencyCode,
              countryCode: applePayConfig.countryCode,
            };

            addDebugInfo(
              'Validation config: ' + JSON.stringify(validationConfig),
            );

            // Try to validate the merchant
            const merchantSession = await applepay.validateMerchant(
              validationConfig,
            );

            if (!merchantSession) {
              throw new Error(
                'Merchant session validation returned empty response',
              );
            }

            addDebugInfo(
              'Merchant validation successful: ' +
                JSON.stringify(merchantSession),
            );
            updateSessionState('validated');
            session.completeMerchantValidation(merchantSession);
          } catch (err) {
            updateSessionState('validation_failed');
            addDebugInfo('Merchant validation failed: ' + err.message);
            addDebugInfo('Error details: ' + JSON.stringify(err));
            addDebugInfo('Error stack: ' + err.stack);

            // Add sandbox-specific error messages
            if (
              window.location.hostname.includes('sandbox') ||
              window.location.hostname.includes('vercel')
            ) {
              addDebugInfo('Sandbox Environment Check:');
              addDebugInfo(
                '1. Verify your PayPal sandbox account is properly configured for Apple Pay',
              );
              addDebugInfo(
                '2. Ensure your test cards are properly set up in the sandbox environment',
              );
              addDebugInfo(
                '3. Check that you are not in private browsing mode',
              );
              addDebugInfo(
                '4. Verify your domain is properly registered in the sandbox environment',
              );
            }

            session.abort();
          }
        };

        addDebugInfo('Starting Apple Pay session...');
        updateSessionState('starting');
        session.begin();
      });

      // Add button to container if not already present
      if (!container.querySelector('apple-pay-button')) {
        container.appendChild(button);
        addDebugInfo('Apple Pay button added to container');
      }
    };

    // Initialize everything in sequence
    const initialize = async () => {
      try {
        await loadPayPalSDK();
        await loadApplePaySDK();
        setIsSDKLoaded(true);
        await initializeApplePay();
      } catch (error) {
        addDebugInfo('Initialization error: ' + error.message);
        addDebugInfo('Error stack: ' + error.stack);
      }
    };

    initialize();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        '& button': {
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '10px',
          height: '44px !important',
          width: '100% !important',
        },
      }}
    >
      {!isSDKLoaded && (
        <div style={{ color: '#fff', marginBottom: '10px' }}>
          Loading PayPal SDK...
        </div>
      )}
      <div id='applepay-container' style={{ width: '100%', marginTop: '10px' }}>
        {/* The Apple Pay button will be inserted here */}
      </div>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        {debugInfo}
      </div>
    </div>
  );
};

export default ApplePayButton;
