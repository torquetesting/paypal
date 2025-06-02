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
          addDebugInfo('PayPal SDK loaded successfully phase 6');
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

        if (!canMakePaymentsWithNetworks) {
          addDebugInfo(
            'No active cards found for Apple Pay. Please add a card in System Settings > Wallet & Apple Pay',
          );
          return;
        }
      } catch (error) {
        addDebugInfo('Error checking network support: ' + error.message);
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

        // Handle payment sheet dismissal with improved logging
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

          addDebugInfo('Apple Pay session was cancelled by user');
        };

        // Add session state change handler
        session.onstatechange = (event) => {
          addDebugInfo('Session state changed: ' + event.state);
          updateSessionState(event.state);
        };

        // Handle payment sheet errors
        session.onerror = (error) => {
          addDebugInfo('Session state at error: ' + sessionState);
          addDebugInfo('Apple Pay session error: ' + JSON.stringify(error));
          if (error.code === 'addCard') {
            addDebugInfo('User is adding a card - this is expected behavior');
            return;
          }
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

            // Show a more user-friendly error message
            if (err.message.includes('domain')) {
              addDebugInfo(
                'Domain validation failed. Please ensure your domain is properly registered with PayPal.',
              );
            } else if (err.message.includes('merchant')) {
              addDebugInfo(
                'Merchant validation failed. Please check your PayPal merchant account settings.',
              );
            }

            session.abort();
          }
        };

        // Add support for payment method selection
        session.onpaymentmethodselected = (event) => {
          updateSessionState('payment_method_selected');
          addDebugInfo('Payment method selected: ' + JSON.stringify(event));
          session.completePaymentMethodSelection({
            total: paymentRequest.total,
            lineItems: [
              {
                label: 'Demo Product',
                amount: '10.00',
              },
            ],
          });
        };

        // Add support for shipping contact selection
        session.onshippingcontactselected = (event) => {
          updateSessionState('shipping_contact_selected');
          addDebugInfo('Shipping contact selected: ' + JSON.stringify(event));
          session.completeShippingContactSelection(
            window.ApplePaySession.STATUS_SUCCESS,
            [],
            paymentRequest.total,
            [],
          );
        };

        // Handle payment authorization
        session.onpaymentauthorized = async (event) => {
          updateSessionState('payment_authorized');
          addDebugInfo(
            'Payment authorized with: ' + JSON.stringify(event.payment),
          );

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
                },
              ],
            };

            addDebugInfo(
              'Creating order with details: ' + JSON.stringify(orderDetails),
            );
            const order = await window.paypal.Orders.create(orderDetails);
            addDebugInfo('Order created: ' + JSON.stringify(order));

            // Call confirmOrder with the payment token
            addDebugInfo('Calling confirmOrder with payment token');
            const confirmResult = await applepay.confirmOrder({
              orderId: order.id,
              payment: event.payment,
            });

            addDebugInfo(
              'Order confirmation result: ' + JSON.stringify(confirmResult),
            );

            // Complete the payment with success status
            updateSessionState('payment_completed');
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            addDebugInfo('Payment successful!');
          } catch (err) {
            updateSessionState('payment_failed');
            addDebugInfo('Payment failed: ' + err.message);
            addDebugInfo('Error details: ' + JSON.stringify(err));
            addDebugInfo('Error stack: ' + err.stack);

            // Complete the payment with failure status
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
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
