const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// In-memory storage (replace with database in production)
let tasks = [];
let approvals = [];
let users = [
  // Team members for approval workflow
  { email: 'singhkashiee20@gmail.com', name: 'Khushi Singh - Project Manager' },
  { email: 'tech.lead@company.com', name: 'Tech Lead' },
  { email: 'qa.engineer@company.com', name: 'QA Engineer' },
  { email: 'security.officer@company.com', name: 'Security Officer' },
  { email: 'product.owner@company.com', name: 'Product Owner' },
  { email: 'stakeholder@company.com', name: 'Stakeholder' }
];

// Helper functions
const getTaskById = (taskId) => tasks.find(t => t.id === taskId);
const getApprovalById = (approvalId) => approvals.find(a => a.id === approvalId);
const getUserByEmail = (email) => users.find(u => u.email === email);

// Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get task by ID
app.get('/api/tasks/:taskId', (req, res) => {
  const task = getTaskById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description, requester, approvers } = req.body;
  
  if (!title || !description || !requester || !approvers || !Array.isArray(approvers)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    requester,
    approvers,
    status: 'pending',
    createdAt: new Date(),
    currentStep: 0,
    approvedBy: [],
    rejectedBy: [],
    canProceed: false
  };

  tasks.push(newTask);
  
  // Create approval records for each approver
  approvers.forEach(approver => {
    const approval = {
      id: `${newTask.id}-${approver}`,
      taskId: newTask.id,
      approver: approver,
      status: 'pending',
      createdAt: new Date(),
      approvedAt: null,
      rejectedAt: null,
      reason: null
    };
    approvals.push(approval);
  });

  res.json(newTask);
});

// Approve task
app.post('/api/tasks/:taskId/approve', (req, res) => {
  const { taskId } = req.params;
  const { approver } = req.body;
  
  const task = getTaskById(taskId);
  const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (!approval) {
    return res.status(404).json({ error: 'Approval record not found' });
  }
  
  if (approval.status !== 'pending') {
    return res.status(400).json({ error: 'Approval already processed' });
  }
  
  // Update approval status
  approval.status = 'approved';
  approval.approvedAt = new Date();
  
  // Update task
  task.approvedBy.push(approver);
  task.currentStep++;
  
  // Check if all approvers have approved
  if (task.approvedBy.length === task.approvers.length) {
    task.status = 'approved';
    task.canProceed = true;
  }
  
  res.json({
    task,
    approval,
    message: 'Task approved successfully'
  });
});

// Reject task
app.post('/api/tasks/:taskId/reject', (req, res) => {
  const { taskId } = req.params;
  const { approver, reason } = req.body;
  
  const task = getTaskById(taskId);
  const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (!approval) {
    return res.status(404).json({ error: 'Approval record not found' });
  }
  
  if (approval.status !== 'pending') {
    return res.status(400).json({ error: 'Approval already processed' });
  }
  
  // Update approval status
  approval.status = 'rejected';
  approval.rejectedAt = new Date();
  approval.reason = reason || 'Rejected by approver';
  
  // Update task
  task.status = 'rejected';
  task.rejectedBy.push({ approver, reason: approval.reason });
  task.canProceed = false;
  
  res.json({
    task,
    approval,
    message: 'Task rejected'
  });
});

// Get approvals for a task
app.get('/api/tasks/:taskId/approvals', (req, res) => {
  const { taskId } = req.params;
  const taskApprovals = approvals.filter(a => a.taskId === taskId);
  res.json(taskApprovals);
});

// Get pending approvals for a user
app.get('/api/users/:userEmail/approvals', (req, res) => {
  const { userEmail } = req.params;
  const userApprovals = approvals.filter(a => 
    a.approver === userEmail && a.status === 'pending'
  );
  
  // Add task details to each approval
  const approvalsWithTasks = userApprovals.map(approval => {
    const task = getTaskById(approval.taskId);
    return {
      ...approval,
      task: task
    };
  });
  
  res.json(approvalsWithTasks);
});

// Get task progress
app.get('/api/tasks/:taskId/progress', (req, res) => {
  const { taskId } = req.params;
  const task = getTaskById(taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const taskApprovals = approvals.filter(a => a.taskId === taskId);
  const approvedCount = taskApprovals.filter(a => a.status === 'approved').length;
  const rejectedCount = taskApprovals.filter(a => a.status === 'rejected').length;
  const pendingCount = taskApprovals.filter(a => a.status === 'pending').length;
  
  const progress = {
    taskId,
    totalApprovers: task.approvers.length,
    approvedCount,
    rejectedCount,
    pendingCount,
    canProceed: approvedCount === task.approvers.length,
    isRejected: rejectedCount > 0,
    progressPercentage: (approvedCount / task.approvers.length) * 100
  };
  
  res.json(progress);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    tasksCount: tasks.length,
    approvalsCount: approvals.length
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const approvedTasks = tasks.filter(t => t.status === 'approved').length;
  const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
  
  const totalApprovals = approvals.length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const approvedApprovals = approvals.filter(a => a.status === 'approved').length;
  const rejectedApprovals = approvals.filter(a => a.status === 'rejected').length;
  
  res.json({
    tasks: {
      total: totalTasks,
      pending: pendingTasks,
      approved: approvedTasks,
      rejected: rejectedTasks
    },
    approvals: {
      total: totalApprovals,
      pending: pendingApprovals,
      approved: approvedApprovals,
      rejected: rejectedApprovals
    }
  });
});

app.listen(PORT, () => {
  console.log(`Task Approval Workflow Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api`);
});

module.exports = app; 