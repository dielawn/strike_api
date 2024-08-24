require('dotenv').config(); 
const { 
  newStrikeInvoice,
  fetchStrikeAcctProfile,
  findStrikeInvoice, 
  getStrikeExchangeRate, 
  newStrikeQuote,
  checkStrikePaymentStatus,
  allInvoiceOf,
  strikeLightningQuote
} = require('./index.');

// const invoiceId = '7e653b7b-de1b-4ce6-a9ad-a4ce22a1a8ca'
// const quoteId = 'c809943a-8d73-4f94-830e-d09f7e591629'
// const lightningInv = ''

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

// testNewInvoice('test invoice', 'BTC' .0005476);

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

async function testPayStrikeLightning( lnInvoice) {
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

// testPayStrikeLightning(lightningInv)

async function lnInvoice() {
  const invoice = await testNewInvoice('test invoice', 'BTC', .00054)
  console.log('invoice', invoice)
  const quote = await testNewQuote(invoice.invoiceId)
  console.log('quote', quote)
  const lightningInv = quote.lnInvoice
  console.log(lightningInv)
}

lnInvoice()
// testAllInvOf('unpaid')