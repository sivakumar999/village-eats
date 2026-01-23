const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

// Store active connections
const orderSubscriptions = new Map(); // orderId -> Set of ws connections
const agentConnections = new Map(); // agentId -> ws connection
const locationSubscriptions = new Map(); // locationId -> Set of ws connections

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    let userId = null;
    let userRole = null;
    let agentId = null;

    // Parse token from query string
    const queryParams = url.parse(req.url, true).query;
    const token = queryParams.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        userRole = decoded.role;
        console.log(`WebSocket authenticated: User ${userId} (${userRole})`);
      } catch (err) {
        console.log('WebSocket auth failed, continuing as anonymous');
      }
    }

    ws.isAlive = true;
    ws.userId = userId;
    ws.userRole = userRole;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(ws, message);
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      // Cleanup subscriptions
      orderSubscriptions.forEach((subscribers, orderId) => {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          orderSubscriptions.delete(orderId);
        }
      });

      locationSubscriptions.forEach((subscribers, locationId) => {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          locationSubscriptions.delete(locationId);
        }
      });

      if (agentId) {
        agentConnections.delete(agentId);
      }

      console.log(`WebSocket disconnected: ${userId || 'anonymous'}`);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      payload: { userId, authenticated: !!userId }
    }));
  });

  // Heartbeat to detect dead connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  return wss;
}

function handleMessage(ws, message) {
  const { type, payload } = message;

  switch (type) {
    case 'subscribe_order':
      subscribeToOrder(ws, payload.orderId);
      break;

    case 'unsubscribe_order':
      unsubscribeFromOrder(ws, payload.orderId);
      break;

    case 'subscribe_new_orders':
      subscribeToNewOrders(ws, payload.locationId);
      break;

    case 'unsubscribe_new_orders':
      unsubscribeFromNewOrders(ws, payload.locationId);
      break;

    case 'agent_location_update':
      handleAgentLocationUpdate(ws, payload);
      break;

    case 'order_status_change':
      handleOrderStatusChange(ws, payload);
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

function subscribeToOrder(ws, orderId) {
  if (!orderSubscriptions.has(orderId)) {
    orderSubscriptions.set(orderId, new Set());
  }
  orderSubscriptions.get(orderId).add(ws);
  console.log(`Subscribed to order ${orderId}`);
}

function unsubscribeFromOrder(ws, orderId) {
  const subscribers = orderSubscriptions.get(orderId);
  if (subscribers) {
    subscribers.delete(ws);
    if (subscribers.size === 0) {
      orderSubscriptions.delete(orderId);
    }
  }
}

function subscribeToNewOrders(ws, locationId) {
  if (!locationSubscriptions.has(locationId)) {
    locationSubscriptions.set(locationId, new Set());
  }
  locationSubscriptions.get(locationId).add(ws);
  console.log(`Agent subscribed to new orders in location ${locationId}`);
}

function unsubscribeFromNewOrders(ws, locationId) {
  const subscribers = locationSubscriptions.get(locationId);
  if (subscribers) {
    subscribers.delete(ws);
    if (subscribers.size === 0) {
      locationSubscriptions.delete(locationId);
    }
  }
}

function handleAgentLocationUpdate(ws, payload) {
  const { latitude, longitude } = payload;
  const agentId = ws.userId;

  if (!agentId) return;

  // Store agent connection for location broadcasts
  agentConnections.set(agentId, ws);

  // Broadcast location to all subscribed order watchers
  // In a real app, you'd query which orders this agent is handling
  const update = {
    type: 'agent_location',
    payload: {
      agentId,
      latitude,
      longitude,
      updatedAt: new Date().toISOString()
    }
  };

  // For now, broadcast to all order subscriptions
  // In production, filter to only orders assigned to this agent
  orderSubscriptions.forEach((subscribers, orderId) => {
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...update, payload: { ...update.payload, orderId } }));
      }
    });
  });
}

function handleOrderStatusChange(ws, payload) {
  const { orderId, status } = payload;

  const update = {
    type: 'order_update',
    payload: {
      orderId,
      status,
      updatedAt: new Date().toISOString()
    }
  };

  // Broadcast to all subscribers of this order
  const subscribers = orderSubscriptions.get(orderId);
  if (subscribers) {
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }
}

// Export functions for use in routes to trigger notifications
function notifyOrderUpdate(orderId, status, agentId, agentName, agentLocation) {
  const update = {
    type: 'order_update',
    payload: {
      orderId,
      status,
      agentId,
      agentName,
      agentLocation,
      updatedAt: new Date().toISOString()
    }
  };

  const subscribers = orderSubscriptions.get(orderId);
  if (subscribers) {
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }
}

function notifyNewOrder(order, locationId) {
  const notification = {
    type: 'new_order',
    payload: order
  };

  const subscribers = locationSubscriptions.get(locationId);
  if (subscribers) {
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }
}

module.exports = { 
  setupWebSocket, 
  notifyOrderUpdate, 
  notifyNewOrder 
};
