/* eslint-disable no-underscore-dangle */
/* eslint-disable no-else-return */
import { Router } from 'express';
import bodyParser from 'body-parser';
import { orders, Order } from '../models/orders';
import { User } from '../models/user';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json(orders);
});

router.post('/', (req, res) => {
  const contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0) {
    return res.status(406).send({
      success: false,
      message: 'invalid content type',
    });
  } else if (!req.body.origin) {
    return res.status(400).send({
      success: false,
      message: 'pickup location is required',
    });
  } else if (!req.body.destination) {
    return res.status(400).send({
      success: false,
      message: 'destination is required',
    });
  } else if (!req.body.recipientPhone) {
    return res.status(400).send({
      success: false,
      message: 'recipient phone is required',
    });
  }
  const orderDetails = req.body;
  // should retrieve initiator by his id and implement

  const order = new Order(
    orderDetails.origin,
    orderDetails.destination,
    orderDetails.recipientPhone,
    orderDetails.initiatorId,
    orderDetails.comment,
  );
  order.save();
  return res.status(201).send({
    success: true,
    message: 'delivery order successfully created!',
    orderId: order.id,
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const order = orders[id];
  if (order) {
    return res.status(200).send({
      success: true,
      message: 'delivery order  retrieved successfully',
      order,
    });
  } else {
    return res.status(404).send({
      success: false,
      message: `delivery order with id ${id} does not exist`,
    });
  }
});

router.put('/:id/cancel', (req, res) => {
  const id = req.params.id;
  const order = orders[id];
  if (order.status !== 'delivered') {
    order.status = 'canceled';
    return res.status(200).send({
      success: true,
      message: 'delivery order has been canceled',
    });
  } else {
    return res.status(401).send({
      success: false,
      message: 'cannot cancel a delivered order',
    });
  }
});

export default router;
