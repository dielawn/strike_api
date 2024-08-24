const axios = require('axios')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
// ** RECEIVING PAYMENT ** //

// Create invoice
const newStrikeInvoice = async (description, currency, amount) => {
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


//Example response to newStrikeInvoice
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
const fetchStrikeAcctProfile = async (handle) => {
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
        return responseData
            
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

const findStrikeInvoice = async (invoiceId) => {
    try {
        const response = await axios.get(`https://api.strike.me/v1/invoices/${invoiceId}`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseData = response.data

        // do something with the data
        console.log('Invoice:', responseData)
        return responseData
            
    } catch (error) {
        console.error('Error ', error.response?.data || error.message)
    }
};
//Example response
// {
//     "invoiceId": "6b91e56d-fce9-4eec-995f-1d08fe6ba380",
//     "amount": {
//       "amount": "150.00",
//       "currency": "USD"
//     },
//     "state": "UNPAID",
//     "created": "2021-11-12T20:08:45.98159+00:00",
//     "description": "Invoice for order 123",
//     "issuerId": "bf909224-3432-400b-895a-3010302f80f5",
//     "receiverId": "bf909224-3432-400b-895a-3010302f80f5"
//    }

const getStrikeExchangeRate = async () => {
    try {
        const response = await axios.get(`https://api.strike.me/v1/rates/ticker`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseData = response.data
        console.log('Exchange rate:', responseData)
        return responseData
            
    } catch (error) {
        console.error('Error ', error.response?.data || error.message)
    }
};

//Example response
// [
//     {
//       "amount": "23096.6400",
//       "sourceCurrency": "BTC",
//       "targetCurrency": "USD"
//     },
//     {
//       "amount": "0.0000433",
//       "sourceCurrency": "USD",
//       "targetCurrency": "BTC"
//     },
//     {
//       "amount": "0.9998",
//       "sourceCurrency": "USD",
//       "targetCurrency": "USDT"
//     },
//     {
//       "amount": "1.0002",
//       "sourceCurrency": "USDT",
//       "targetCurrency": "USD"
//     },
//     {
//       "amount": "23092.9500",
//       "sourceCurrency": "BTC",
//       "targetCurrency": "USDT"
//     },
//     {
//       "amount": "0.0000433",
//       "sourceCurrency": "USDT",
//       "targetCurrency": "BTC"
//     }
//   ]




// Request amount, currency, state = UNPAID
// Generate quote specifies cost of paying invoice in btc with expiration
const newStrikeQuote = async (invoiceId) => {
    try {
        const response = await axios.post(`https://api.strike.me/v1/invoices/${invoiceId}/quote`, null,{ 
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
             },    
         })
         const responseData = response.data
         console.log('Quote created:', responseData)
         return responseData
     } catch (error) {
         console.error('Error creating new quote:', error.response?.data || error.message);
         throw error; 
     }
};
// Example quote
// {
//     "quoteId": "ee1c09c4-a6a3-4856-b886-e75fc613fea2",
//     "description": "Invoice for order 123",
//     "lnInvoice": "lnbcrt2406610n1pscajk9pp53w8whfszxhwyukdmeqgvrnavqzck68x9np8fhrvssg2s66zdrdcsdpzf9h8vmmfvdjjqen0wgsx7unyv4ezqvfjxvcqzpgxqzpffppqcuvchrllhnku2vxfdgjceup6xdnha94qsp5kgaq5vxhls6ug07saqkxkfn84hakmaztrcclychklna0jmen6hds9qyyssqzr5cfw9lqcaz7qzqtxyrzsp60ndezrg9nlqqzs6t8alffs7yay4r2w5vd6kpgde38kwx0vge7cxlur50hul6ky68pjprw6suc7c6encq3xfh93",
//     "onchainAddress": "bcrt1qcuvchrllhnku2vxfdgjceup6xdnha94q3s2jdy",
//     "expiration": "2021-11-12T20:13:35.019+00:00",
//     "expirationInSec": 41,
//     "sourceAmount": {
//       "amount": "0.00240661",
//       "currency": "BTC"
//     },
//     "targetAmount": {
//       "amount": "150.00",
//       "currency": "USD"
//     },
//     "conversionRate": {
//       "amount": "62328.3374",
//       "sourceCurrency": "BTC",
//       "targetCurrency": "USD"
//     }
//    }

const checkStrikePaymentStatus = async (invoiceId) => {
    try {
        const response = await axios.get(`https://api.strike.me/v1/invoices/${invoiceId}`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseData = response.data
        console.log('Invoice status:', responseData.state)
        return responseData.state
            
    } catch (error) {
        console.error('Error ', error.response?.data || error.message)
    }
};

// Invoices of same status paid, pending, or unpaid
const allInvoiceOf = async (status) => {
    if (status !== 'PAID' && status !== 'UNPAID' && status !== 'PENDING') {
        throw new Error(`Expecting "PAID", "UNPAID" or "PENDING". Recieved: ${status}`)
    }
    try {
        const response = await axios.get(`https://api.strike.me/v1/invoices?%24filter=state%20eq%20%27${status}%27&%24orderby=created%20asc&%24skip=1&%24top=2`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
            },    
        })
        const responseDataItems = response.data.items
        console.log(`Invoices of ${status} status:`, responseDataItems)
        return responseDataItems
            
    } catch (error) {
        console.error('Error ', error.response?.data || error.message)
    }
};

//** SENDING PAYMENT **//
const strikeLightningQuote = async (sourceCurrency, lnInvoice) => {
    const formattedCurrency = sourceCurrency.toUpperCase();
    if (formattedCurrency !== 'BTC' && formattedCurrency !== 'USD') {
        throw new Error(`Invalid source currency. Expecting "BTC" or "USD" recieved ${sourceCurrency}`)
    }
    const data = {
        lnInvoice,
        sourceCurrency: formattedCurrency
    }
    try {
        const response = await axios.post(`https://api.strike.me/v1/payment-quotes/lightning`, data,{ 
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`, 
             },    
         })
         const responseData = response.data
         console.log('Lightning quote created:', responseData)
         return responseData
     } catch (error) {
         console.error('Error creating new lightning quote:', error.response?.data || error.message);
         throw error; 
     }
}

module.exports = {
    newStrikeInvoice, 
    fetchStrikeAcctProfile,
    findStrikeInvoice,
    getStrikeExchangeRate,
    newStrikeQuote,
    checkStrikePaymentStatus,
    allInvoiceOf,
    strikeLightningQuote
}