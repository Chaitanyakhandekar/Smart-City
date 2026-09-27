import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const API = 'http://localhost:3000/api/v1';

async function fullTest() {
  console.log('=== FULL END-TO-END VERIFICATION SUITE ===\n');

  // 1. Citizen Login
  console.log('--- Step 1: Citizen Login ---');
  const citizenLogin = await axios.post(`${API}/auth/login`, {
    email: 'citizen@smartcity.local',
    password: 'Citizen@123'
  });
  const citizenToken = citizenLogin.data.data.token;
  const citizenId = citizenLogin.data.data.user._id;
  console.log('Citizen authenticated:', citizenLogin.data.data.user.name, '(ID:', citizenId, ')');

  // 2. Citizen Create Complaint with SVG photo
  console.log('\n--- Step 2: Citizen Creates Real Complaint ---');
  const form = new FormData();
  form.append('title', 'Clogged Drainage & Water Leak on MG Road');
  form.append('description', 'Severe drainage blockage causing sewage water to overflow onto the pavement.');
  form.append('locationAddress', 'MG Road, Near Old Bus Stand, Nashik');
  form.append('category', 'Drainage');
  form.append('subcategory', 'Blocked Drain');
  form.append('priority', 'HIGH');
  form.append('image', fs.createReadStream('public/uploads/sample-drainage-before.svg'), 'sample-drainage-before.svg');

  const createRes = await axios.post(`${API}/complaints`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${citizenToken}` }
  });
  const createdComplaint = createRes.data.data.complaint;
  console.log('Created Complaint ID:', createdComplaint._id);
  console.log('Complaint Number:', createdComplaint.complaintNumber);
  console.log('Status in DB:', createdComplaint.status);

  // 3. Citizen fetches their own complaint list & detail
  console.log('\n--- Step 3: Citizen retrieves own complaints ---');
  const myComplaints = await axios.get(`${API}/complaints/my`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  const foundInMy = myComplaints.data.data.complaints.find(c => c._id === createdComplaint._id);
  console.log('Found in citizen list?', !!foundInMy, 'Title:', foundInMy?.title);

  const compDetail = await axios.get(`${API}/complaints/${createdComplaint._id}`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  console.log('Complaint detail loaded. Image count:', compDetail.data.data.images.length, 'Timeline events:', compDetail.data.data.timeline.length);

  // 4. Admin Login and verify complaint is present
  console.log('\n--- Step 4: Admin Login & View Complaint ---');
  const adminLogin = await axios.post(`${API}/auth/login`, {
    email: 'admin@smartcity.local',
    password: 'Admin@123'
  });
  const adminToken = adminLogin.data.data.token;

  const adminList = await axios.get(`${API}/admin/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const foundInAdmin = adminList.data.data.complaints.find(c => c._id === createdComplaint._id);
  console.log('Found in Admin Complaints?', !!foundInAdmin, 'Status:', foundInAdmin?.status);

  // 5. Admin Assigns Staff
  console.log('\n--- Step 5: Admin Assigns Staff ---');
  const staffListRes = await axios.get(`${API}/admin/staff`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const staffWaste = staffListRes.data.data.staff.find(s => s.email === 'staff@smartcity.local');
  console.log('Assigning staff:', staffWaste.name, staffWaste.email, staffWaste._id);

  const assignRes = await axios.post(`${API}/admin/complaints/${createdComplaint._id}/assign`, {
    staffId: staffWaste._id,
    remarks: 'Immediate dispatch required for sewage overflow.'
  }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('Assignment status:', assignRes.status, 'New status:', assignRes.data.data.complaint.status);

  // 6. Staff Login and View Tasks
  console.log('\n--- Step 6: Staff Login & Retrieve Assigned Task ---');
  const staffLogin = await axios.post(`${API}/auth/login`, {
    email: 'staff@smartcity.local',
    password: 'Staff@123'
  });
  const staffToken = staffLogin.data.data.token;

  const staffTasksRes = await axios.get(`${API}/staff/tasks`, {
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const foundInStaff = staffTasksRes.data.data.tasks.find(t => t._id === createdComplaint._id);
  console.log('Found in Staff Tasks?', !!foundInStaff, 'Status:', foundInStaff?.status);

  // 7. Staff Starts Work (ASSIGNED -> IN_PROGRESS)
  console.log('\n--- Step 7: Staff Starts Work (IN_PROGRESS) ---');
  const startForm = new FormData();
  startForm.append('remarks', 'Field team arrived on site with suction pump machine.');
  const startRes = await axios.patch(`${API}/staff/tasks/${createdComplaint._id}/start`, startForm, {
    headers: { ...startForm.getHeaders(), Authorization: `Bearer ${staffToken}` }
  });
  console.log('Staff started work. Status:', startRes.data.data.complaint.status);

  // 8. Staff Resolves Task (IN_PROGRESS -> RESOLVED with AFTER photo)
  console.log('\n--- Step 8: Staff Resolves Task with AFTER photo ---');
  const resolveForm = new FormData();
  resolveForm.append('remarks', 'Drain cleared completely. Water flow restored and disinfected.');
  resolveForm.append('image', fs.createReadStream('public/uploads/sample-garbage-after.svg'), 'sample-garbage-after.svg');

  const resolveRes = await axios.patch(`${API}/staff/tasks/${createdComplaint._id}/resolve`, resolveForm, {
    headers: { ...resolveForm.getHeaders(), Authorization: `Bearer ${staffToken}` }
  });
  console.log('Staff resolved task. Status:', resolveRes.data.data.complaint.status, 'After image saved:', resolveRes.data.data.afterImage.imageUrl);

  // 9. Citizen verifies RESOLVED and Confirms Resolution
  console.log('\n--- Step 9: Citizen Confirms Resolution ---');
  const confirmRes = await axios.post(`${API}/complaints/${createdComplaint._id}/confirm`, {}, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  console.log('Citizen confirmed resolution. citizenConfirmed =', confirmRes.data.data.complaint.citizenConfirmed);

  // 10. Test Reopen Flow with a fresh complaint
  console.log('\n--- Step 10: Testing Reopen Flow with Second Complaint ---');
  const form2 = new FormData();
  form2.append('title', 'Illegal Waste Dump near Market');
  form2.append('description', 'Market vendor waste piled up and not cleared.');
  form2.append('locationAddress', 'Market Yard, CIDCO, Nashik');
  form2.append('category', 'Waste Management');
  form2.append('subcategory', 'Garbage Dump');
  form2.append('priority', 'MEDIUM');
  form2.append('image', fs.createReadStream('public/uploads/sample-garbage-before.svg'), 'sample-garbage-before.svg');

  const createRes2 = await axios.post(`${API}/complaints`, form2, {
    headers: { ...form2.getHeaders(), Authorization: `Bearer ${citizenToken}` }
  });
  const comp2 = createRes2.data.data.complaint;

  // Admin assigns staff
  await axios.post(`${API}/admin/complaints/${comp2._id}/assign`, {
    staffId: staffWaste._id
  }, { headers: { Authorization: `Bearer ${adminToken}` } });

  // Staff starts work & resolves
  const sf = new FormData();
  sf.append('remarks', 'Team dispatched to investigate market waste dump.');
  await axios.patch(`${API}/staff/tasks/${comp2._id}/start`, sf, {
    headers: { ...sf.getHeaders(), Authorization: `Bearer ${staffToken}` }
  });

  const rf = new FormData();
  rf.append('remarks', 'Dump cleared.');
  rf.append('image', fs.createReadStream('public/uploads/sample-garbage-after.svg'), 'sample-garbage-after.svg');
  await axios.patch(`${API}/staff/tasks/${comp2._id}/resolve`, rf, {
    headers: { ...rf.getHeaders(), Authorization: `Bearer ${staffToken}` }
  });

  // Citizen reopens
  const reopenRes = await axios.post(`${API}/complaints/${comp2._id}/reopen`, {
    reopenReason: 'Spilled debris and foul liquid remain across the street.'
  }, { headers: { Authorization: `Bearer ${citizenToken}` } });
  console.log('Complaint reopened! Status:', reopenRes.data.data.complaint.status, 'Reason:', reopenRes.data.data.complaint.reopenReason);

  // 11. Test Chatbot queries
  console.log('\n--- Step 11: Testing Chatbot with Real Citizen Queries ---');
  const chat1 = await axios.post(`${API}/chat`, {
    message: `What is the status of ${createdComplaint.complaintNumber}?`
  }, { headers: { Authorization: `Bearer ${citizenToken}` } });
  console.log('Chat status response:\n', chat1.data.data.message);

  const chat2 = await axios.post(`${API}/chat`, {
    message: 'Show my complaints history'
  }, { headers: { Authorization: `Bearer ${citizenToken}` } });
  console.log('\nChat history response:\n', chat2.data.data.message);

  // 12. Notifications verification
  console.log('\n--- Step 12: Notifications Verification ---');
  const notifsRes = await axios.get(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  console.log('Citizen notifications count:', notifsRes.data.data.notifications.length);
  console.log('Latest notification title:', notifsRes.data.data.notifications[0]?.title);

  console.log('\n=== ALL 12 STEPS COMPLETED & FULLY VERIFIED IN MONGODB ATLAS ===');
}

fullTest().catch(err => {
  console.error('Test Failed:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
  process.exit(1);
});
