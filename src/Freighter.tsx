import {
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";

// Function to check if connection is allowed
async function checkConnection(): Promise<boolean> {
  const isAllowed = await setAllowed();
  if (isAllowed) {
    return isAllowed;
  }
  return false;
}

// Function to retrieve the public key
const retrievePublicKey = async (): Promise<string> => {
  let publicKey = "";
  let error = "";

  try {
    publicKey = await requestAccess();
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return error;
  }

  return publicKey;
};

// Function to sign a transaction
const userSignTransaction = async (
  xdr: string,
  network: string,
  signWith: string
): Promise<string> => {
  let signedTransaction = "";
  let error = "";

  try {
    signedTransaction = await signTransaction(xdr, {
      network,
      accountToSign: signWith,
    });
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};

export { checkConnection, retrievePublicKey, userSignTransaction };
