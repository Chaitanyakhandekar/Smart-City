import axios from 'axios';
import { io } from 'socket.io-client';
import fs from 'fs';
import FormData from 'form-data';

const API = 'http://localhost:3000/api/v1';
const SERVER_ROOT = 'http://localhost:3000';

async function runNotificationSuite() {
  console.log('====================================================');
  console.log('🔔 SMARTCITY NOTIFICATION & PWA PUSH TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Fetch VAPID public key without authentication
  console.log('[Test 1] Testing public VAPID public key endpoint...');
  try {
    const vapidRes = await axios.get(`${API}/notifications/vapid-public-key`);
    console.log('  ✓ VAPID endpoint returned status:', vapidRes.status);
    console.log('  ✓ VAPID public key received:', vapidRes.data.data.vapidPublicKey.slice(0, 25) + '...');
    if (!vapidRes.data.data.vapidPublicKey) {
      throw new Error('VAPID public key missing in response');
    }
  } catch (err) {
    console.error('  ✗ Failed to get VAPID key:', err.response?.data || err.message);
    process.exit(1);
  }

  // Test 2: Authenticate as Citizen and Admin
  console.log('\n[Test 2] Authenticating test users (Citizen & Admin)...');
  let citizenToken, citizenUser, adminToken, adminUser;
  try {
    const cRes = await axios.post(`${API}/auth/login`, {
      email: 'citizen@smartcity.local',
      password: 'Citizen@123'
    });
    citizenToken = cRes.data.data.token;
    citizenUser = cRes.data.data.user;
    console.log(`  ✓ Logged in as Citizen: ${citizenUser.name} (${citizenUser._id})`);

    const aRes = await axios.post(`${API}/auth/login`, {
      email: 'admin@smartcity.local',
      password: 'Admin@123'
    });
    adminToken = aRes.data.data.token;
    adminUser = aRes.data.data.user;
    console.log(`  ✓ Logged in as Admin: ${adminUser.name} (${adminUser._id})`);
  } catch (err) {
    console.error('  ✗ Login failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // Test 3: Get Initial Unread Count & Notification History
  console.log('\n[Test 3] Testing notification list & unread count...');
  try {
    const unreadRes = await axios.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('  ✓ Citizen initial unread count:', unreadRes.data.data.unreadCount);

    const listRes = await axios.get(`${API}/notifications?limit=5`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`  ✓ Fetched notifications: ${listRes.data.data.notifications.length} items`);
  } catch (err) {
    console.error('  ✗ Notification fetch failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // Test 4: Register Push Subscription (PWA Web Push endpoint)
  console.log('\n[Test 4] Testing Web Push subscription registration...');
  const mockEndpoint = `https://fcm.googleapis.com/fcm/send/test-token-${Date.now()}`;
  try {
    const subRes = await axios.post(
      `${API}/notifications/push/subscribe`,
      {
        subscription: {
          endpoint: mockEndpoint,
          keys: {
            p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYO-XGk60Gf7yK0E23eZ2K7W_qgOoA1mHbYDPPf9g',
            auth: 'tHxF5zLkJjN_9M8X2Q-w1w'
          }
        },
        deviceName: 'Chrome on Windows (Automated Test)'
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('  ✓ Push subscription saved successfully:', subRes.data.message);
  } catch (err) {
    console.error('  ✗ Push subscription failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // Test 5: Connect Admin and Citizen Sockets
  console.log('\n[Test 5] Testing Socket.IO connection and private room join for Admin & Citizen...');
  const adminSocket = io(SERVER_ROOT, {
    auth: { token: adminToken },
    transports: ['websocket']
  });

  const citizenSocket = io(SERVER_ROOT, {
    auth: { token: citizenToken },
    transports: ['websocket']
  });

  await Promise.all([
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Admin Socket timeout')), 5000);
      adminSocket.on('connect', () => {
        clearTimeout(timer);
        console.log('  ✓ Admin Socket connected (ID:', adminSocket.id, ')');
        resolve(true);
      });
      adminSocket.on('connect_error', reject);
    }),
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Citizen Socket timeout')), 5000);
      citizenSocket.on('connect', () => {
        clearTimeout(timer);
        console.log('  ✓ Citizen Socket connected (ID:', citizenSocket.id, ')');
        resolve(true);
      });
      citizenSocket.on('connect_error', reject);
    })
  ]);

  // Test 6: Citizen Creates Complaint -> Admin Receives Real-time Socket Event
  console.log('\n[Test 6] Testing real-time complaint submission notification to Admin...');
  let adminReceivedNotif = null;
  const adminNotifPromise = new Promise((resolve) => {
    adminSocket.on('notification:new', (data) => {
      console.log('  ✓ Admin received real-time socket event:');
      console.log('    - Type:', data.type);
      console.log('    - Title:', data.title);
      console.log('    - Message:', data.message);
      adminReceivedNotif = data;
      resolve(data);
    });
  });

  const form = new FormData();
  form.append('title', `Notification Test Grievance ${Date.now()}`);
  form.append('description', 'Automated test complaint for verifying real-time dispatch and notification pipeline.');
  form.append('locationAddress', 'Civic Center Boulevard, Ward 4');
  form.append('category', 'Drainage');
  form.append('subcategory', 'Blocked Drain');
  form.append('priority', 'HIGH');
  if (fs.existsSync('public/uploads/sample-drainage-before.svg')) {
    form.append('image', fs.createReadStream('public/uploads/sample-drainage-before.svg'), 'sample-drainage-before.svg');
  }

  const compRes = await axios.post(`${API}/complaints`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${citizenToken}` }
  });
  const createdComplaint = compRes.data.data.complaint;
  console.log('  ✓ Citizen created complaint:', createdComplaint.complaintNumber);

  await Promise.race([
    adminNotifPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Admin socket notification timed out')), 6000))
  ]);

  // Test 7: Admin Updates Complaint Status -> Citizen Receives Real-time Notification
  console.log('\n[Test 7] Testing complaint update -> real-time notification to Citizen...');
  let citizenReceivedNotif = null;
  const citizenNotifPromise = new Promise((resolve) => {
    citizenSocket.on('notification:new', (data) => {
      console.log('  ✓ Citizen received real-time socket event:');
      console.log('    - Type:', data.type);
      console.log('    - Title:', data.title);
      console.log('    - Message:', data.message);
      citizenReceivedNotif = data;
      resolve(data);
    });
  });

  await axios.patch(
    `${API}/admin/complaints/${createdComplaint._id}`,
    { priority: 'CRITICAL' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );

  await Promise.race([
    citizenNotifPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Citizen socket notification timed out')), 6000))
  ]);

  // Test 8: Mark Notification as Read & Verify Unread Count Sync
  console.log('\n[Test 8] Testing mark notification as read...');
  if (citizenReceivedNotif && citizenReceivedNotif._id) {
    const markRes = await axios.patch(
      `${API}/notifications/${citizenReceivedNotif._id}/read`,
      {},
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('  ✓ Notification marked as read:', markRes.data.message);
  }

  // Test 9: Mark All as Read
  console.log('\n[Test 9] Testing mark all notifications as read...');
  const markAllRes = await axios.patch(
    `${API}/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${citizenToken}` } }
  );
  console.log('  ✓ All notifications marked read:', markAllRes.data.message);

  const finalUnread = await axios.get(`${API}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  console.log('  ✓ Final unread count after mark all read:', finalUnread.data.data.unreadCount);

  // Test 10: Unsubscribe Web Push
  console.log('\n[Test 10] Testing push unsubscribe endpoint...');
  const unsubRes = await axios.delete(`${API}/notifications/push/unsubscribe`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
    data: { endpoint: mockEndpoint }
  });
  console.log('  ✓ Push unsubscribed successfully:', unsubRes.data.message);

  // Disconnect sockets
  adminSocket.disconnect();
  citizenSocket.disconnect();

  console.log('\n====================================================');
  console.log('🎉 ALL 10 NOTIFICATION & WEB PUSH TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
  process.exit(0);
}

runNotificationSuite().catch((err) => {
  console.error('\nSuite encountered an unhandled error:', err.response?.data || err);
  process.exit(1);
});
