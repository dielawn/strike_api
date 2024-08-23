import axios from 'axios';
const { v4: uuidv4 } = require('uuid');
// ** RECEIVING PAYMENT ** //

// Create invoice
export const newInvoice = async (description, currency, amount) => {
    if (!description || !currency || amount === undefined) {
        throw new Error('Missing required parameters');
    }
    const correlationId = uuidv4();
    const formattedCurrency = currency.toUpperCase();
    let formattedAmount;
    if (currency === 'USD') {
        formattedAmount = amount.toFixed(2)
    } else {
        formattedAmount = amount.toFixed(8)
    }
    const data = { 
        // universally identifiable, must be unique
        correlationId,
        description,
        amount: {
            currency: formattedCurrency,
            amount: formattedAmount
        }
     }
    try {
       const response = await axios.post('https://api.strike.me/v1/invoices', data, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseData = response.data
        console.log('Invoice created:', responseData)
        return responseData
    } catch (error) {
        console.error('Error creating new invoice:', error.response?.data || error.message);
        throw error; 
    }
};

//Example response to newInvoice
// {
//     "invoiceId": "6b91e56d-fce9-4eec-995f-1d08fe6ba380",
//     "amount": {
//       "amount": "150.00",
//       "currency": "USD"
//     },
//     "state": "UNPAID",
//     "created": "2021-11-12T20:08:45.98159+00:00",
//     "correlationId": "224bff37-021f-43e5-9b9c-390e3d834750",
//     "description": "Invoice for order 123",
//     "issuerId": "bf909224-3432-400b-895a-3010302f80f5",
//     "receiverId": "bf909224-3432-400b-895a-3010302f80f5"
//    }


// To check which currencies are invoiceable for a specific Strike user
const fetchAcctProfile = async (handle) => {
    try {
        const response = await axios.get(`https://api.strike.me/v1/accounts/handle/${handle}/profile`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseData = response.data

        // do something with the data
        console.log('Acct Profile:', responseData)
            
    } catch (error) {
        console.error('Error ', error.response?.data || error.message)
    }
};

//Example profile response
// {
//     "invoiceId": "6b91e56d-fce9-4eec-995f-1d08fe6ba380",
//     "amount": {
//       "amount": "150.00",
//       "currency": "USD"
//     },
//     "state": "UNPAID",
//     "created": "2021-11-12T20:08:45.98159+00:00",
//     "correlationId": "224bff37-021f-43e5-9b9c-390e3d834750",
//     "description": "Invoice for order 123",
//     "issuerId": "bf909224-3432-400b-895a-3010302f80f5",
//     "receiverId": "bf909224-3432-400b-895a-3010302f80f5"
//    }


// Request amount, currency, state = UNPAID
// Generate quote specifies cost of paying invoice in btc with expiration
// 