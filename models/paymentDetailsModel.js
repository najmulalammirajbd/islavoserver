import mongoose from 'mongoose';

const paymentDetailsSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  success_url: {
    type: String,
    required: true,
  },
  fail_url: {
    type: String,
    required: true,
  },
  customer_mobile: {
    type: String,
    required: true,
  },
  customer_name: {
    type: String,
    required: true,
  },
  emi_month: {
    type: Number,
    required: true,
    default: 0,
  },
  purpose: {
    type: String,
  },
  client_id: {
    type: String,
    required: true,
  },
  client_name: {
    type: String,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
  },
  payment_status: {
    type: String,
    required: true,
  },
  payment_details: {
    type: String,
  },
});

const PaymentDetails = mongoose.model('PaymentDetails', paymentDetailsSchema);

export default PaymentDetails;
