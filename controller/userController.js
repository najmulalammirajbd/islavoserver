import User from '../models/userModel.js';
import PaymentDetails from '../models/paymentDetailsModel.js'
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';

// @desc    Check user transaction status
// @route   GET /api/users
// @access  Public
const getUserPaymentData = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (user && user.transactionId !== null) {
    console.log(user.transactionId);
    const data = new FormData();
    data.append('transaction_id', user.transactionId);

    var config = {
      method: 'get',
      url: `https://api.sheba.xyz/v1/ecom-payment/details?transaction_id=${user.transactionId}`,
      headers: {
        Accept: 'application/json',
        'client-id': `${process.env.CLIENT_ID}`,
        'client-secret': `${process.env.CLIENT_SECRET}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        console.log(JSON.stringify(response.data));
        const paymentData = await PaymentDetails.findOne({ email: email });
        if(response.data.data.payment_details === 'completed'){
          if(paymentData){
            paymentData.payment_status = 'completed';
            await paymentData.save();
          }
          else {
            const paymentDetails = new PaymentDetails({
              user: user._id,
              amount: response.data.data.amount,
              success_url: response.data.data.success_url,
              fail_url: response.data.data.fail_url,
              customer_mobile: response.data.data.customer_mobile,
              customer_name: response.data.data.customer_name,
              emi_month: response.data.data.emi_month,
              purpose: response.data.data.purpose,
              client_id: response.data.data.client_id,
              client_name: response.data.data.client_name,
              transaction_id: response.data.data.transaction_id,
              payment_status: response.data.data.payment_status,
              payment_details: response.data.data.payment_details,
            });
            console.log(paymentDetails);

            const paymentDetailsReq = await paymentDetails.save();
            user.paymentStatus = true;
            await user.save();
            console.log(paymentDetailsReq);
            res.status(200).send({ paymentStatus: 'completed' });
          }
        }
        else {
          res.status(200).send({ paymentStatus: 'pending' });
        }
      })
      .catch(function (error) {
        console.log(error);
        res.send(error);
      });
  } else {
    res.status(401);
    throw new Error('Invalid email');
  }
});

// @desc    Create Payment Link & Save user Transaction id
// @route   POST /api/users
// @access  Public
const saveUserPaymentData = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  const userExist = await User.findOne({ email: email });

  if (userExist && userExist.paymentStatus) {
    res.status(400);
    throw new Error('User already paid');
  } else {
    const transactionId = uuidv4();

    const data = new FormData();
    data.append('amount', '64.2');
    data.append('transaction_id', `${transactionId}`);
    data.append('success_url', 'https://mydomain.com/success');
    data.append('fail_url', 'https://mydomain.com/fail');
    data.append('customer_name', name);
    data.append('customer_mobile', phone);
    data.append('purpose', 'Online Payment');
    data.append('payment_details', '');
    console.log(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    const config = {
      method: 'post',
      url: 'https://api.sheba.xyz/v1/ecom-payment/initiate',
      headers: {
        'client-id': `${process.env.CLIENT_ID}`,
        'client-secret': `${process.env.CLIENT_SECRET}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        console.log(JSON.stringify(response.data));

        if (userExist) {
          userExist.paymentStatus = false;
          userExist.transactionId = transactionId;
          await userExist.save();
        } else {
          await User.create({ name, email, phone, transactionId });
        }
        //res.send({paymentLink: response.data.data.link});
        res.status(200).json({
          paymentLink: response.data.data.link,
        });
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

export {
getUserPaymentData,
  saveUserPaymentData,

};
