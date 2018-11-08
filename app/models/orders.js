/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import orders from './orders.json';

class Order {
  constructor(origin, destination, recipientPhone, initiatorId, comments) {
    const lengthOrders = Object.keys(orders).length;
    this._id = lengthOrders + 1;
    this._origin = origin;
    this._destination = destination;
    this._orderDate = Date.now();
    this._recipientPhone = recipientPhone;
    this._initiatorId = initiatorId;
    this._deliveryDate = '';
    this._comments = comments;
    this._status = 'Created';
    this._weight = 0;
  }

  save() {
    /**
     *  save the object to the file */
    const id_ = this.id.toString();
    // adding the file to the prrevious one
    orders[id_] = this;

    const data = JSON.stringify(orders, null, 2);
    const Orderpath = path.join(__dirname, 'orders.json');
    fs.writeFile(Orderpath, data, (err) => {
      if (err) throw err;
    });
  }

  get id() {
    return this._id;
  }

  get origin() {
    return this._origin;
  }

  get destination() {
    return this._destination;
  }

  set destination(destination) {
    // this can be done by admins only
    this._destination = destination;
  }

  get status() {
    return this._status;
  }

  set status(status) {
    // only changed if not delivered
    this._status = status;
  }

  get orderDate() {
    return this._orderDate;
  }

  get deliveryDate() {
    return this._deliveryDate;
  }

  set deliveryDate(deliveryDate) {
    // only admins can update this
    this._deliveryDate = deliveryDate;
  }

  get comments() {
    return this.comments;
  }

  set comments(comments) {
    this.comments = comments;
  }

  get initiator() {
    return this.initiator.name;
  }

  get weigh() {
    return this._weight;
  }

  set weigh(weight) {
    this._weight = weight;
  }
}

export { Order, orders };
