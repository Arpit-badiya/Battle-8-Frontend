import api from './api';

const unwrapWallet = (
  payload
) =>
  payload?.wallet ||
  payload?.data ||
  payload ||
  {};

const normalizeTransaction = (
  transaction = {}
) => {
  const rawAmount = Number(
    transaction.amount ??
      transaction.coins ??
      0
  );
  const isDebit = transaction.type === 'debit';
  const amount = isDebit ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  return {
    ...transaction,

    id:
      transaction._id ||
      transaction.id,

    title:
      transaction.title ||
      transaction.description ||
      transaction.reason ||
      transaction.type ||
      'Transaction',

    amount,

    time:
      transaction.time ||
      transaction.createdAt ||
      '',

    type:
      isDebit ||
      amount < 0
        ? 'debit'
        : 'credit',
  };
};

export const getWallet =
  async () => {
    const response =
      await api.get(
        '/wallet'
      );

    const wallet =
      unwrapWallet(
        response.data
      );

    return {
      ...wallet,

      balance: Number(
        wallet.balance ??
          wallet.coins ??
          0
      ),

      transactions:
        Array.isArray(
          wallet.transactions
        )
          ? wallet.transactions.map(
              normalizeTransaction
            )
          : Array.isArray(
              wallet.history
            )
          ? wallet.history.map(
              normalizeTransaction
            )
          : [],
    };
  };
