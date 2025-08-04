import { render } from "@forge/ui";
import ForgeUI, { 
  AdminPage, 
  Text, 
  Button, 
  Form, 
  TextField, 
  Select, 
  Option,
  Table,
  Head,
  Row,
  Cell
} from "@forge/ui";
import { useState, useEffect } from "react";

// In-memory storage for demo (replace with database in production)
let tasks = [];
let approvals = [];

const App = () => {
  const [currentUser, setCurrentUser] = useState("user@company.com");
  const [tasksList, setTasksList] = useState([]);
  const [approvalsList, setApprovalsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasksList(tasks);
    setApprovalsList(approvals);
  };

  const createTask = async (formData) => {
    const newTask = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      requester: currentUser,
      approvers: formData.approvers.split(',').map(email => email.trim()),
      status: 'pending',
      createdAt: new Date(),
      currentStep: 0,
      approvedBy: [],
      rejectedBy: []
    };

    tasks.push(newTask);
    
    // Create approval records for each approver
    newTask.approvers.forEach(approver => {
      approvals.push({
        id: `${newTask.id}-${approver}`,
        taskId: newTask.id,
        approver: approver,
        status: 'pending',
        createdAt: new Date()
      });
    });

    loadData();
    console.log('Task created:', newTask);
  };

  const approveTask = async (taskId, approver) => {
    const task = tasks.find(t => t.id === taskId);
    const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
    
    if (task && approval) {
      approval.status = 'approved';
      approval.approvedAt = new Date();
      
      task.approvedBy.push(approver);
      task.currentStep++;
      
      // Check if all approvers have approved
      if (task.approvedBy.length === task.approvers.length) {
        task.status = 'approved';
      }
      
      loadData();
      console.log('Task approved by:', approver);
    }
  };

  const rejectTask = async (taskId, approver, reason) => {
    const task = tasks.find(t => t.id === taskId);
    const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
    
    if (task && approval) {
      approval.status = 'rejected';
      approval.rejectedAt = new Date();
      approval.reason = reason;
      
      task.status = 'rejected';
      task.rejectedBy.push({ approver, reason });
      
      loadData();
      console.log('Task rejected by:', approver);
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === 'approved') return '✅ Approved';
    if (task.status === 'rejected') return '❌ Rejected';
    return `⏳ Pending (${task.approvedBy.length}/${task.approvers.length})`;
  };

  const getApprovalStatus = (task, approver) => {
    const approval = approvals.find(a => a.taskId === task.id && a.approver === approver);
    if (!approval) return 'pending';
    return approval.status;
  };

  const canProceed = (task) => {
    return task.approvedBy.length === task.approvers.length;
  };

  return render(
    AdminPage({
      children: [
        Text({
          children: [
            "🚀 Task Approval Workflow",
            "Tasks require approval from ALL users before proceeding"
          ]
        }),
        
        // Create New Task Form
        Text({ children: ["📝 Create New Task"] }),
        Form({
          onSubmit: createTask,
          children: [
            TextField({
              name: "title",
              label: "Task Title",
              placeholder: "Implement new feature"
            }),
            TextField({
              name: "description",
              label: "Description",
              placeholder: "Detailed description of the task"
            }),
            TextField({
              name: "approvers",
              label: "Approvers (comma-separated emails)",
              placeholder: "user1@company.com, user2@company.com, user3@company.com"
            }),
            Button({
              type: "submit",
              text: "Create Task"
            })
          ]
        }),

        // Tasks List
        Text({ children: ["📋 Tasks Overview"] }),
        Table({
          children: [
            Head({
              children: [
                Cell({ children: ["Task"] }),
                Cell({ children: ["Status"] }),
                Cell({ children: ["Progress"] }),
                Cell({ children: ["Actions"] })
              ]
            }),
            ...tasksList.map(task => 
              Row({
                children: [
                  Cell({ 
                    children: [
                      Text({ children: [task.title] }),
                      Text({ children: [task.description] })
                    ]
                  }),
                  Cell({ children: [getTaskStatus(task)] }),
                  Cell({ 
                    children: [
                      `${task.approvedBy.length}/${task.approvers.length} approved`
                    ]
                  }),
                  Cell({
                    children: task.status === 'pending' ? [
                      Button({
                        text: "View Details",
                        onClick: () => console.log('View task:', task.id)
                      })
                    ] : []
                  })
                ]
              })
            )
          ]
        }),

        // Pending Approvals for Current User
        Text({ children: ["⏳ Your Pending Approvals"] }),
        Table({
          children: [
            Head({
              children: [
                Cell({ children: ["Task"] }),
                Cell({ children: ["Requester"] }),
                Cell({ children: ["Your Status"] }),
                Cell({ children: ["Actions"] })
              ]
            }),
            ...approvalsList
              .filter(approval => 
                approval.approver === currentUser && 
                approval.status === 'pending'
              )
              .map(approval => {
                const task = tasks.find(t => t.id === approval.taskId);
                return Row({
                  children: [
                    Cell({ 
                      children: [
                        Text({ children: [task?.title || 'Unknown Task'] }),
                        Text({ children: [task?.description || ''] })
                      ]
                    }),
                    Cell({ children: [task?.requester || ''] }),
                    Cell({ children: ["⏳ Pending"] }),
                    Cell({
                      children: [
                        Button({
                          text: "✅ Approve",
                          onClick: () => approveTask(approval.taskId, currentUser)
                        }),
                        Button({
                          text: "❌ Reject",
                          onClick: () => rejectTask(approval.taskId, currentUser, "Rejected by user")
                        })
                      ]
                    })
                  ]
                });
              })
          ]
        }),

        // Task Details and Progress
        Text({ children: ["📊 Task Progress Details"] }),
        ...tasksList.map(task => 
          render(
            Text({
              children: [
                `Task: ${task.title}`,
                `Status: ${getTaskStatus(task)}`,
                `Progress: ${task.approvedBy.length}/${task.approvers.length} approvals`,
                `Approvers: ${task.approvers.join(', ')}`,
                `Approved by: ${task.approvedBy.join(', ') || 'None'}`,
                task.status === 'rejected' ? `Rejected by: ${task.rejectedBy.map(r => r.approver).join(', ')}` : '',
                canProceed(task) ? "✅ Task can proceed!" : "⏳ Waiting for all approvals",
                "---"
              ]
            })
          )
        )
      ]
    })
  );
};

export const run = App;

// Handler function for Forge
export const handler = async (event, context) => {
  return run(event, context);
}; 