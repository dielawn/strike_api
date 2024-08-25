require('dotenv').config(); 
const { 
  newStrikeInvoice,
  fetchStrikeAcctProfile,
  findStrikeInvoice, 
  getStrikeExchangeRate, 
  newStrikeQuote,
  checkStrikePaymentStatus,
  allInvoiceOf,
  strikeLightningQuote,
  strikeOnChainQuotes,
  onChainByFeeTier,
  executeStrikePayment,
  getPaymentStateById,
  invFromHandle
} = require('./index.');

// const invoiceId = '7e653b7b-de1b-4ce6-a9ad-a4ce22a1a8ca'
// const quoteId = 'c809943a-8d73-4f94-830e-d09f7e591629'
const lightningInv = 'lnbc690n1pnv5w23pp57j6296xvj5n4vgdylr8cy3tddnlrkm3skpxkksqtlqu27a4hdhcsdq5w3jhxapqd9h8vmmfvdjscqzzsxqrrs0sp5zc7j6wxzaayec0xzr6fvjglaw8qmg8keqepd0jw3s20p4xv0tzrq9qyyssq7p8ehrhws26jpjng2m3k68xts0e5j8e7946a0rjc97gl3nh82al4e3e6dlmwu0pz54tp2urv4f40xc2fxve8pj8jglhqr33zrx0gkwcqyx9qx5'
const btcAddress = process.env.STRIKE_ONCHAIN_ADDRESS
async function testNewInvoice(description, currency, amount) {
  const formattedCurrency = currency.toUpperCase()
  if (formattedCurrency !== 'BTC' && formattedCurrency !== 'USD') {
    throw new Error(`Invalid currency. Expecting "BTC" or "USD". Recieved ${currency}`)
  } 
  try {
    const invoice = await newStrikeInvoice(
      description,
      formattedCurrency,
      amount
    );
    console.log("Created invoice:", invoice);
    return invoice
  } catch (error) {
    console.error("Error in test:", error);
  }
};

// testNewInvoice('test invoice', 'BTC', .00000069);

async function testGetProfile(handle) {
    try {
      const acctProfile = await fetchStrikeAcctProfile(handle);
        if (acctProfile === 404) {
            return `Account ${handle} set to private`
        }
      const allCurrenciesAvailable = acctProfile.currencies.every((currencies) => currencies.isInvoiceable)
      const defaultCurrency =  acctProfile.currencies[0].isDefaultCurrency ? 'BTC is default' : 'USD is default'
      console.log(`${handle}`, acctProfile, `BTC & USD accepted ${allCurrenciesAvailable}, ${defaultCurrency}`);
      return acctProfile
    } catch (error) {
        if (error.name === "NetworkError") {
        return `Failed to fetch account profile for ${handle}: Network error`;
        }
        console.error("Error in test:", error);
        return `Unknown error fetching account profile for ${handle}`;
        }
        }

//   testGetProfile('dmercill');


async function testFindInvoice(invoiceId) {
    try {
        const invoice = await findStrikeInvoice(invoiceId);    
        console.log(`${invoice}`);
        return invoice
    } catch (error) {
        if (error.name === "NetworkError") {
        return `Failed to fetch invoice: Network error`;
        }
        console.error("Error in test:", error);
        return `Unknown error fetching invoice: ${invoiceId}`;
    }
}


// testFindInvoice(invoiceId)

async function testExchangeCurrency(sourceCurrency, targetCurrency, exchangeAmount) {
  try {
    const rates = await getStrikeExchangeRate()
    const rate = rates.find(rate =>
      rate.sourceCurrency === sourceCurrency.toUpperCase() && rate.targetCurrency === targetCurrency.toUpperCase()
    );
    if (!rate) {
      throw new Error(`Exchange rate not found for ${sourceCurrency} to ${targetCurrency}`)
    }
    console.log(`1 ${sourceCurrency} for ${rate.amount} ${targetCurrency}`)
    const convertedCurrency = exchangeAmount * rate.amount;
    
    console.log(convertedCurrency)
    return convertedCurrency
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error("Network error while fetching exchange rates");
      return null;
    }
    console.error("Error in currency conversion:", error.message);
    return null;
  }
};

// testExchangeCurrency('btc', 'usd', .05)

async function testNewQuote(invoiceId) {
  try {
    console.log(invoiceId)
    const quote = await newStrikeQuote(invoiceId)
    console.log(quote)
    return quote
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error("Network error while creating new quote");
      return null;
    }
    console.error("Error in new quote:", error.message);
    return null;
  }
};

// testNewQuote(invoiceId) //qrcode.react

async function testStatus(invoiceId) {
  try {
    const status = await checkStrikePaymentStatus(invoiceId)
    console.log('Payment status', status)
    return status  
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error("Network error while checking payment status");
      return null;
    }
    console.error("Error checking payment status:", error.message);
    return null;
  }
};

// testStatus(invoiceId)

async function testAllInvOf(status) {
  try {
    const filteredInvoices = await allInvoiceOf(status.toUpperCase())
    console.log(`${filteredInvoices.length} ${status} invoices`, filteredInvoices)
    return filteredInvoices
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error getting all invoices of ${status}`);
      return null;
    }
    console.error(`Error getting all invoices of ${status}:`, error.message);
    return null;
  }
};

// testAllInvOf('unpaid')

async function testPayStrikeLightning(lnInvoice) {
  try {
    const response = await strikeLightningQuote('btc', lnInvoice)
    const responseData = response.data
    console.log(responseData)
    return responseData
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error paying lightning invoice`);
      return null;
    }
    console.error(`Error paying lightning invoice:`, error.message);
    return null;
  }
};

// testPayStrikeLightning('lnbc690n1pnv50qfsp5enda6qd5zukc67600rvxyd5sc24el3l64mmh7sfwmpqms5gc6rpspp5e2j79mw69s60vmy4h4hlas88srvt5v303qr840kemupksffpc8asdqqnp4qwh05slmksqfkgdyz2wst9fewjmah2amldg3jg2pqzqgvr723mslqxqrrsxcqzzn9qyysgq2fxqlmx27zdwu2zmpgqpjm4smqe9d80h4e729mw9gq6xk0s65d0hjnzdyztudpdrenje06pfxqggvn7g0zh3aaf42fhsj36zvkduw2spz8p3qs')


async function lnInvoice() {
  const invoice = await testNewInvoice('test invoice', 'BTC', .00000069)
  console.log('invoice', invoice)
  const quote = await testNewQuote(invoice.invoiceId)
  console.log('quote', quote)
  const lightningInv = quote.lnInvoice
  console.log(lightningInv)
  return lightningInv
}

// lnInvoice()
testAllInvOf('unpaid')
testAllInvOf('paid')
testAllInvOf('pending')

//On chain quote
async function testOnChainQuote(amount, currency, btcAddress) {
  try {
    const quote = await strikeOnChainQuotes(amount, currency, btcAddress)
    console.log('On chain quote: ', quote)
    return quote
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error getting on chain quote`);
      return null;
    }
    console.error(`Error getting on chain quote:`, error.message);
    return null;
  }
};

// testOnChainQuote(.005, 'btc', btcAddress)

//Example response 
// [
//   {
//     "id": "tier_fast",
//     "estimatedDeliveryDurationInMin": 10,
//     "estimatedFee": {
//       "amount": "0.00002862",
//       "currency": "BTC"
//     }
//   },
//   {
//     "id": "tier_standard",
//     "estimatedDeliveryDurationInMin": 60,
//     "estimatedFee": {
//       "amount": "0.00000363",
//       "currency": "BTC"
//     }
//   },
//   {
//     "id": "tier_free",
//     "estimatedDeliveryDurationInMin": 720,
//     "estimatedFee": {
//       "amount": "0",
//       "currency": "BTC"
//     }
//   }
// ]

//Quote by tier
async function testFeeByTier(amount, currency, btcAddress, tier, description) {
  try {
    const tierQuote = await onChainByFeeTier(amount, currency, btcAddress, tier, description)
    console.log(`Estimated delivery ${tierQuote.estimatedDeliveryDurationInMin} min. Fee: ${tierQuote.totalFee.amount} ${tierQuote.totalFee.currency}`)
    return tierQuote
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error getting on chain tier quote`);
      return null;
    }
    console.error(`Error getting on chain tier quote:`, error.message);
    return null;
  }
};
const aquaAddress = process.env.AQUA_ONCHAIN_ADDRESS
// testFeeByTier(.0069, 'btc', aquaAddress, 'tier_free', 'free tier test')
// testFeeByTier(.0069, 'btc', aquaAddress, 'tier_standard', 'standard fee quote test')
// testFeeByTier(.0069, 'btc', aquaAddress, 'tier_fast', 'fast fee quote test')


//Execute payment
async function testExecutePayment(quoteId) {
  try {
    console.log('quoteId', quoteId)

    const response = await executeStrikePayment(quoteId);
    console.log('Executed payment', response)
    return response
  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error executing payment`);
      return null;
    }
    console.error(`Error executing payment:`, error.message);
    return null;
  }
};

// testExecutePayment(quoteId) 

async function paymentState(paymentId) {
 try {
  const payment = await getPaymentStateById(paymentId)
  console.log('Payment', payment)

  const state = payment.state
  console.log('Payment state: ', state)
  return state

 } catch (error) {
  if (error.name === "NetworkError") {
    console.error(`Network error getting payment state`);
    return null;
  }
  console.error(`Error getting payment state:`, error.message);
  return null;
}
};


// Invoice from user handle
async function  invFrom(handle, description, currency, amount) {
  try {
    const invoice = await invFromHandle(handle, description, currency, amount)
    console.log(`User ${handle} invoice: `, invoice)
    return invoice

  } catch (error) {
    if (error.name === "NetworkError") {
      console.error(`Network error getting invoice from handle`);
      return null;
    }
    console.error(`Error egetting invoice from handle:`, error.message);
    return null;
  }
};
invFrom('dmercill', 'test inv from handle', 'BTC', .00000069)
