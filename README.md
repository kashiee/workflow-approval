# Task Approval Workflow App

A comprehensive Jira Forge app that implements a strict approval workflow where tasks **cannot proceed** until **every single approver** has approved.

## 🎯 Key Features

### ✅ **Strict Approval Requirements**
- Tasks require approval from **ALL** specified users
- **No partial approvals** - all approvers must approve
- **Single rejection** stops the entire process
- **Real-time status tracking** for each approver

### 📊 **Status Tracking**
- **⏳ Pending** - Waiting for approvals
- **✅ Approved** - All approvers have approved
- **❌ Rejected** - Any approver has rejected
- **📈 Progress tracking** - Shows X/Y approvals completed

### 🔄 **Workflow States**
1. **Task Created** → Status: Pending
2. **Approvers Notified** → Individual approval records created
3. **Approvals Processed** → Each approver can approve/reject
4. **Final State**:
   - **All Approved** → Task can proceed ✅
   - **Any Rejected** → Task stopped ❌

## 🏗️ Technical Architecture

### Frontend (Forge UI)
- **React-based UI** with Forge UI components
- **Real-time updates** for approval status
- **User-specific views** showing pending approvals
- **Progress visualization** with status indicators

### Backend (Node.js/Express)
- **RESTful API** for task and approval management
- **In-memory storage** (easily replaceable with database)
- **Comprehensive validation** and error handling
- **Statistics and reporting** endpoints

### Data Models

#### Task
```javascript
{
  id: "unique-task-id",
  title: "Task Title",
  description: "Task Description",
  requester: "user@company.com",
  approvers: ["user1@company.com", "user2@company.com"],
  status: "pending|approved|rejected",
  createdAt: Date,
  approvedBy: ["user1@company.com"],
  rejectedBy: [],
  canProceed: false
}
```

#### Approval
```javascript
{
  id: "task-id-user-email",
  taskId: "unique-task-id",
  approver: "user@company.com",
  status: "pending|approved|rejected",
  createdAt: Date,
  approvedAt: Date|null,
  rejectedAt: Date|null,
  reason: "Rejection reason"
}
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm start
```
Backend runs on `http://localhost:3000`

### 3. Deploy Forge App
```bash
forge deploy
```

### 4. Install App
```bash
forge install
```

## 📋 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:taskId` - Get specific task
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:taskId/progress` - Get task progress

### Approvals
- `POST /api/tasks/:taskId/approve` - Approve task
- `POST /api/tasks/:taskId/reject` - Reject task
- `GET /api/tasks/:taskId/approvals` - Get task approvals
- `GET /api/users/:userEmail/approvals` - Get user's pending approvals

### Statistics
- `GET /api/stats` - Get system statistics
- `GET /health` - Health check

## 🔄 Workflow Process

### 1. Task Creation
```javascript
POST /api/tasks
{
  "title": "Implement new feature",
  "description": "Add user authentication",
  "requester": "dev@company.com",
  "approvers": ["manager@company.com", "qa@company.com", "security@company.com"]
}
```

### 2. Approval Process
Each approver receives a pending approval and can:

**Approve:**
```javascript
POST /api/tasks/123/approve
{
  "approver": "manager@company.com"
}
```

**Reject:**
```javascript
POST /api/tasks/123/reject
{
  "approver": "security@company.com",
  "reason": "Security concerns identified"
}
```

### 3. Status Updates
- **Pending**: `2/3 approved` (waiting for final approval)
- **Approved**: `3/3 approved` ✅ (can proceed)
- **Rejected**: `Rejected by security@company.com` ❌ (stopped)

## 🎨 UI Features

### Dashboard Views
1. **Task Overview** - All tasks with status
2. **Pending Approvals** - User's approvals to process
3. **Progress Details** - Detailed approval tracking
4. **Statistics** - System-wide metrics

### Status Indicators
- 🟡 **Pending** - Waiting for approvals
- 🟢 **Approved** - All approvals received
- 🔴 **Rejected** - Rejected by any approver
- 📊 **Progress** - X/Y approvals completed

## 🔧 Configuration

### Environment Variables
- `PORT` - Backend server port (default: 3000)
- `FORGE_EMAIL` - Your Atlassian email
- `FORGE_API_TOKEN` - Your Atlassian API token

### Customization
- **Add more approvers** - Modify approvers array
- **Change approval logic** - Update approval validation
- **Add notifications** - Integrate with email/Slack
- **Database integration** - Replace in-memory storage

## 📊 Example Usage

### Creating a Task
1. Navigate to the app in Jira
2. Fill in task details
3. Add all required approvers
4. Submit task

### Approving a Task
1. View pending approvals
2. Review task details
3. Click "Approve" or "Reject"
4. Add rejection reason if needed

### Monitoring Progress
- View task status in real-time
- Track individual approver status
- See overall progress percentage
- Monitor approval/rejection reasons

## 🔒 Security Features

- **User validation** - Only authorized approvers can approve
- **Status validation** - Cannot approve already processed tasks
- **Audit trail** - Complete history of approvals/rejections
- **Reason tracking** - All rejections require reasons

## 🚀 Production Deployment

### Database Integration
Replace in-memory storage with:
- **PostgreSQL** - For production data
- **Redis** - For caching and sessions
- **MongoDB** - For flexible document storage

### Additional Features
- **Email notifications** - Notify approvers automatically
- **Slack integration** - Real-time updates
- **Webhook support** - External system integration
- **Advanced reporting** - Detailed analytics

## 🐛 Troubleshooting

### Common Issues
1. **App not loading** - Check Forge deployment
2. **API errors** - Verify backend is running
3. **Permission errors** - Check Jira permissions
4. **Approval not working** - Validate user permissions

### Debug Commands
```bash
# Check app status
forge logs

# Test backend
curl http://localhost:3000/health

# View statistics
curl http://localhost:3000/api/stats
```

## 📈 Future Enhancements

- **Sequential approvals** - Require approvals in order
- **Conditional approvals** - Different paths based on conditions
- **Approval delegation** - Allow approvers to delegate
- **Time-based approvals** - Auto-approve after time limit
- **Multi-level approvals** - Hierarchical approval structure

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details 