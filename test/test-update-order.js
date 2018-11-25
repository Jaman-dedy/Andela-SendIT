import chai from 'chai';
import chaiHttp from 'chai-http';
import { Order, orders } from '../app/models/orders';
import { token } from './test-0Initial';
import { app } from '../app/server';

chai.use(chaiHttp);
const { should } = chai.should();
const { expect } = chai.expect;

const canCannotCancelOrder = (done) => {
  /**
   * test if we cannot cancel a delivery order if the status
   * marked as delivered
   * in the future we need to allow only admin or a person who create order to implement
   */
  const id = 1;
  const order = orders.get(id.toString());
  order.status = 'delivered';
  chai
    .request(app)
    .put(`/api/v1/parcels/${id}/cancel `)
    .set('authorization', `Beared ${token}`)
    .end((request, response) => {
      response.should.have.status(401);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql('cannot cancel a delivered order');
      done();
    });
};

const canCancelOrder = (done) => {
  /**
   * test if we cancel a delivery order if the status
   * marked is not  delivered
   */
  const id = 1;
  const order = orders.get(id.toString());
  chai
    .request(app)
    .put(`/api/v1/parcels/${id}/cancel `)
    .set('authorization', `Beared ${token}`)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('delivery order has been canceled');
      done();
    });
};

const canCannotCancelOrderCanceled = (done) => {
  /**
   * test if we cannot cancel a delivery order if the status
   * cannot cancel an already canceled orders
   */
  const id = 1;
  const order = orders.get(id.toString());
  order.status = 'canceled';
  chai
    .request(app)
    .put(`/api/v1/parcels/${id}/cancel`)
    .set('authorization', `Beared ${token}`)
    .end((request, response) => {
      response.should.have.status(401);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql('order has already been canceled');
      done();
    });
};

const canCannotCancelNoExistOrder = (done) => {
  /**
   * if we cannot cancel and order if it doesn't exist
   */
  const id = '56YYYT';
  chai
    .request(app)
    .put(`/api/v1/parcels/${id}/cancel `)
    .set('authorization', `Beared ${token}`)
    .end((request, response) => {
      response.should.have.status(404);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql(`delivery order with id ${id} does not exist`);
      done();
    });
};

const cannotChangepresentLocationDelivered = (done) => {
  /**
   * test if we cannot change present location a delivery order if the status
   * marked as delivered
   */
  const orderId = '1';
  const order = orders.get(orderId);
  order.status = 'delivered';
  chai
    .request(app)
    .put(`/api/v1/parcels/${orderId}`)
    .set('authorization', `Beared ${token}`)
    .send(order)
    .end((request, response) => {
      response.should.have.status(401);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql(
          'cannot change the present location or status  of  a delivered order'
        );
      done();
    });
};

const canChangepresentLocation = (done) => {
  /**
   * test if we can change the present location if the status
   * marked is not  delivered
   */
  const orderId = '1';
  const presentLocationData = { presentLocation: 'kamembe' };
  chai
    .request(app)
    .put(`/api/v1/parcels/${orderId}`)
    .set('authorization', `Beared ${token}`)
    .send(presentLocationData)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('delivery order  present location has been changed');
      done();
    });
};

const cannotChangePresentLocationOrderMissing = (done) => {
  /**
   * cannot update the present location if it missing in payload
   *  */
  const order = new Order();

  order.origin = 'Goma';
  order.weight = 500;
  order.presentLocation = undefined;
  order.initiatorId = 1;
  order.status = undefined;
  order.save();
  chai
    .request(app)
    .put(`/api/v1/parcels/${order.id}`)
    .set('authorization', `Beared ${token}`)
    .send(order.toJSON())
    .type('application/json')
    .end((request, response) => {
      response.should.have.status(400);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql('either present location or status is required');
      done();
    });
};

const canChangeStatusOrder = (done) => {
  /**
   * test if we can change the status of an order
   */
  const orderId = '1';
  const statusData = { status: 'en route for delivery' };
  chai
    .request(app)
    .put(`/api/v1/parcels/${orderId}`)
    .set('authorization', `Beared ${token}`)
    .send(statusData)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('delivery order status has been changed');
      done();
    });
};

const canChangeStatusLocationOrder = (done) => {
  /**
   * test if we can change both the status and present location of an order
   */
  const orderId = '1';
  const orderData = {
    status: 'en route for delivery',
    presentLocation: 'Kamembe',
  };
  chai
    .request(app)
    .put(`/api/v1/parcels/${orderId}`)
    .set('authorization', `Beared ${token}`)

    .send(orderData)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('order status and present location have been changed');
      done();
    });
};

const canChangeStatusOrderDate = (done) => {
  /**
   * test if when updating the status of an order to delivered the date is changed and it's not empty
   */
  const order = orders.get('1');
  const statusData = { status: 'delivered' };
  order.deliveryDate = new Date().toJSON();
  chai
    .request(app)
    .put(`/api/v1/parcels/${order.id}`)
    .set('authorization', `Beared ${token}`)
    .send(statusData)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('delivery order status has been changed');
      response.body.order.deliveryDate.should.be.eql(order.deliveryDate);
      done();
    });
};

describe.skip('can change cancel, update parcel', () => {
  it('can cancel order by id', canCancelOrder);
  it('can change present location', canChangepresentLocation);
  it(
    'can update location and status at the same time',
    canChangeStatusLocationOrder
  );
  it('can change status of a parcel delivery', canChangeStatusOrder);
  it(
    'test date is update when status is changed to delivered',
    canChangeStatusOrderDate
  );

  it('cannot cancel if already canceled', canCannotCancelOrderCanceled);
});

// test cancel order
describe.skip('cannot update order', () => {
  it(
    'cannot  change present location if delivered',
    cannotChangepresentLocationDelivered
  );
  it('cannot cancel if delivered', canCannotCancelOrder);
  it('cannot cancel non existant order', canCannotCancelNoExistOrder);
  it(
    'cannot change if present location is missing ',
    cannotChangePresentLocationOrderMissing
  );
});
