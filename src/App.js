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
          'client-id':
            'AX844i_ZliVK_y_p8UCEb6lqmSc6xfZn9k8UV5_1ep5zSmXnVFO_gG7m9MwhGy97re9a8dOpU7yOxLxy',
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
