import './App.css';

import {
  FUNDING,
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import ApplePayButton from './ApplePayButton';

function App() {
  return (
    <div>
      <PayPalScriptProvider
        options={{
          'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID,
          components: 'buttons,card-fields,applepay',
          intent: 'capture',
          currency: 'USD',
          'enable-funding': 'card,applepay',
        }}
      >
        <ApplePayButton />
      </PayPalScriptProvider>
    </div>
  );
}

export default App;
