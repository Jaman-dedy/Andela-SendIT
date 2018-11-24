/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
import chai from 'chai';
import chaiHttp from 'chai-http';
import { users, User } from '../app/models/user';
import { app } from '../app/server';
import { Order } from '../app/models/orders';
import { getMaxListeners } from 'cluster';

/** setting up the test server */
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
// close the sever after running our tests
let token;

const loginUser = async done => {
  const user = new User('test', 'test@gmail.com', '250788888', '98745236');
  await user
    .save()
    .then(result => {
      // save to the db
      token = encodeToken(result);
      chai
        .request(app)
        .post('/auth/signin')
        .send(result)
        .end((error, response) => {
          console.log(response);
          should.not.exist(error);
          token = response.body.token;
          //token.should.not.be(undefined);
          token.should.be.a('string');
          done();
        });
    })
    .catch(error => {
      done(error);
    });
};

const deleteAll = async done => {
  await User.deleteAll()
    .then(result => {
      console.log(result);
      done;
    })
    .catch(done);
};
const canGetUserOrders = done => {
  /**
   * test if we can all users delivery orders
   *
   */
  const id = 1;
  const user = users[id.toString()];
  let orders;
  if (user) {
    orders = user.orders;
  } else {
    orders = {};
  }
  chai
    .request(app)
    .get(`/api/v1/users/${id}/parcels`)
    .set('authorization', 'Bearer ' + token)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('user delivery orders  retrieved successfully');
      response.body.should.have.property('orders');
      response.body.should.have.property('orders').eql(orders);
      done();
    });
};

const cannotGetUserOrderById = done => {
  /**
   * test if we can return 404 if
   * if user is not found
   *
   */
  const id = '1STFF';
  chai
    .request(app)
    .get(`/api/v1/users/${id}/parcels`)
    .set('authorization', 'Bearer ' + token)
    .end((request, response) => {
      response.should.have.status(404);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql(`user with  id ${id} does not exist`);
      done();
    });
};
// check if you can get a given order for a given user

const canGetUserOrdersByid = done => {
  /**
   * test if we can retrieve a user order by it id
   *
   */
  const userId = '1';
  const user = users.get(userId);
  const orderId = '1';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  chai
    .request(app)
    .get(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .end((request, response) => {
      const receivedOrder = response.body.order;
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('user delivery order retrieved successfully');
      response.body.should.have.property('order');
      receivedOrder.origin.should.be.eql(order.origin);
      receivedOrder.destination.should.be.eql(order.destination);
      receivedOrder.recipientPhone.should.be.eql(order.recipientPhone);
      receivedOrder.initiatorId.should.be.eql(order.initiatorId);
      receivedOrder.orderDate.should.be.eql(order.orderDate);
      receivedOrder.id.should.be.eql(order.id);
      expect(receivedOrder.presentLocation).to.eql(order.presentLocation);
      expect(receivedOrder.weight).to.be.eql(order.weight);
      expect(typeof order.deliveryDate).to.be.eql('undefined');
      expect(typeof order.weight).to.be.eql(typeof receivedOrder.weight);
      done();
    });
};

const cannotGetUserOrdersByid = done => {
  /**
   * test if we 404 if an order is not found for the given user
   *
   */
  const userId = '1';
  const user = users.get(userId);
  const orderId = '33332ER';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  chai
    .request(app)
    .get(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .end((request, response) => {
      response.should.have.status(404);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql(`order with  id ${orderId} does not exist`);
      done();
    });
};

const cannotGetUserByIdOrdersByid = done => {
  /**
   * test if we 404 if an order is the user id is invalid for this endpoint
   *
   */
  const userId = '2222EEE';
  const user = users.get(userId);
  const orderId = '1';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  chai
    .request(app)
    .get(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .end((request, response) => {
      response.should.have.status(404);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .equals(`user with id ${userId} cannot be found`);
      done();
    });
};

const canCannotCancelOrder = done => {
  /**
   * test if we cannot cancel a delivery order if the status
   * marked as delivered
   */
  const userId = '1';
  const user = users.get(userId);
  const orderId = '1';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  order.status = 'delivered';
  chai
    .request(app)
    .put(`/api/v1/users/${userId}/parcels/${orderId}/cancel`)
    .set('authorization', 'Bearer ' + token)
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

const canCancelOrder = done => {
  /**
   * test if we cancel a delivery order if the status
   * marked is not  delivered
   */
  const userId = '1';
  const user = users[userId];
  const orderId = '1';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  order.status = 'canceled';
  order.recipientPhone = '25078888';
  chai
    .request(app)
    .put(`/api/v1/users/${userId}/parcels/${orderId}/cancel `)
    .set('authorization', 'Bearer ' + token)
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

const cannotChangeDestinationOrder = done => {
  /**
   * test if we cannot change destination a delivery order if the status
   * marked as delivered
   */
  const userId = '1';
  const user = users.get(userId);
  const orderId = '1';
  let order;
  if (user) {
    order = user.orders.get(orderId);
  } else {
    order = {};
  }
  order.status = 'delivered';
  order.recipientPhone = '25078889';
  chai
    .request(app)
    .put(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .send(order.toJSON())
    .end((request, response) => {
      response.should.have.status(401);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql('cannot change the destination of  a delivered order');
      done();
    });
};

const canChangeDestinationOrder = done => {
  /**
   * test if we can change the destination if the status
   * marked is not  delivered
   */
  const userId = '1';
  const orderId = '1';
  const destinationData = { destination: 'kamembe' };
  chai
    .request(app)
    .put(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .send(destinationData)
    .end((request, response) => {
      response.should.have.status(200);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(true);
      response.body.should.have
        .property('message')
        .eql('delivery order  destination has been changed');
      done();
    });
};

const cannotChangeDesinationOrderMissing = done => {
  /**
   * cannot update the destination if it missing in payload
   *  */
  const order = {};
  const userId = '1';
  const orderId = '1';
  chai
    .request(app)
    .put(`/api/v1/users/${userId}/parcels/${orderId}`)
    .set('authorization', 'Bearer ' + token)
    .send(order)
    .type('application/json')
    .end((request, response) => {
      response.should.have.status(400);
      response.body.should.be.a('object');
      response.body.should.have.property('success').eql(false);
      response.body.should.have
        .property('message')
        .eql('new destination is required');
      done();
    });
};
//before('login the user and set the token', loginUser);
//after('delete all users', deleteAll);
// check if we can update a given order for a given user
describe.skip('get user orders by id', () => {
  it('cannot get user if  id invalid', cannotGetUserOrderById);
  it('can get user orders by id', canGetUserOrders);
});

describe.skip('can cancel or change', () => {
  it('can cancel if not delivered', canCancelOrder);
  it('can change destination if not delivered', canChangeDestinationOrder);
});

describe.skip('cannot change destination update if order delivered', () => {
  it(
    'cannot change destination if bad content',
    cannotChangeDesinationOrderMissing
  );
  it('cannot cancel a delivery order if it is delivered', canCannotCancelOrder);
  it('cannot change destination if delivered', cannotChangeDestinationOrder);
});

describe.skip('get one order for a given user', () => {
  it('cannot get order for if orderId not found', cannotGetUserByIdOrdersByid);
  it('cannot get order if userId not found', cannotGetUserOrdersByid);
  it('can get one order', canGetUserOrdersByid);
});
