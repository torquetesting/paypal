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
          addDebugInfo('PayPal SDK loaded successfully phase 1');
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

      // Create Apple Pay button
      const button = document.createElement('apple-pay-button');
      button.setAttribute('buttonstyle', 'black');
      button.setAttribute('type', 'buy');
      button.setAttribute('locale', 'en');
      button.style.height = '44px';
      button.style.width = '100%';
      button.style.borderRadius = '10px';

      // Handle button click
      button.addEventListener('click', () => {
        addDebugInfo('Apple Pay button clicked');

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

        // Handle payment sheet dismissal
        session.oncancel = (event) => {
          // Check if the cancellation was due to card addition
          if (event && event.reason === 'addCard') {
            addDebugInfo('User is adding a card - this is expected behavior');
            return;
          }
          addDebugInfo('Apple Pay session cancelled by user');
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
        };

        // Handle payment sheet errors
        session.onerror = (error) => {
          addDebugInfo('Apple Pay session error: ' + JSON.stringify(error));
          if (error.code === 'addCard') {
            addDebugInfo('User is adding a card - this is expected behavior');
            return;
          }
          addDebugInfo('Error stack: ' + error.stack);
        };

        // Validate merchant
        session.onvalidatemerchant = async (event) => {
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
              // Add additional configuration from the config response
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
            session.completeMerchantValidation(merchantSession);
          } catch (err) {
            addDebugInfo('Merchant validation failed: ' + err.message);
            addDebugInfo('Error details: ' + JSON.stringify(err));
            addDebugInfo('Error stack: ' + err.stack);

            if (
              err.message.includes(
                'APPLE_PAY_MERCHANT_SESSION_VALIDATION_ERROR',
              )
            ) {
              const currentDomain = window.location.hostname;
              addDebugInfo('Domain validation troubleshooting:');
              addDebugInfo('1. Current domain: ' + currentDomain);
              addDebugInfo('2. Protocol: ' + window.location.protocol);
              addDebugInfo('3. Full URL: ' + window.location.href);
              addDebugInfo(
                '4. PayPal Client ID: ' +
                  (REACT_APP_PAYPAL_CLIENT_ID ? 'Present' : 'Missing'),
              );
              addDebugInfo('Please ensure:');
              addDebugInfo(
                '- The domain matches exactly (including subdomain)',
              );
              addDebugInfo('- You are using HTTPS');
              addDebugInfo('- The domain is registered in PayPal sandbox');
              addDebugInfo(
                '- Your PayPal client ID is correct and has Apple Pay enabled',
              );
              addDebugInfo(
                '- Try removing and re-adding the domain in PayPal sandbox',
              );
              addDebugInfo(
                '- Try creating a new PayPal sandbox app with Apple Pay enabled',
              );

              // Add specific checks for the current configuration
              addDebugInfo('Current configuration check:');
              addDebugInfo('- Environment: sandbox');
              addDebugInfo('- Domain registered: ' + currentDomain);
              addDebugInfo(
                '- Client ID present: ' +
                  (REACT_APP_PAYPAL_CLIENT_ID ? 'Yes' : 'No'),
              );
              addDebugInfo('- Protocol: ' + window.location.protocol);
            }

            session.abort();
          }
        };

        // Handle payment authorization
        session.onpaymentauthorized = async (event) => {
          addDebugInfo(
            'Payment authorized with: ' + JSON.stringify(event.payment),
          );
          try {
            const applepay = window.paypal.Applepay();
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

            // First create an order
            const order = await window.paypal.Orders.create(orderDetails);
            addDebugInfo('Order created: ' + JSON.stringify(order));

            // Then confirm the order with Apple Pay
            await applepay.confirmOrder({
              orderId: order.id,
              payment: event.payment,
            });

            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            addDebugInfo('Payment successful!');
          } catch (err) {
            addDebugInfo('Payment failed: ' + err.message);
            addDebugInfo('Error details: ' + JSON.stringify(err));
            addDebugInfo('Error stack: ' + err.stack);
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          }
        };

        // Add support for card addition
        session.onpaymentmethodselected = (event) => {
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
          addDebugInfo('Shipping contact selected: ' + JSON.stringify(event));
          session.completeShippingContactSelection(
            window.ApplePaySession.STATUS_SUCCESS,
            [],
            paymentRequest.total,
            [],
          );
        };

        addDebugInfo('Starting Apple Pay session...');
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
