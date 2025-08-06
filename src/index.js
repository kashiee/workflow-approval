import { render } from "@forge/ui";
import ForgeUI, { 
  AdminPage, 
  Text, 
  Button, 
  Form, 
  TextField, 
  Table,
  Head,
  Row,
  Cell
} from "@forge/ui";
import React, { useState, useEffect } from "react";

// In-memory storage for demo
let tasks = [];
let approvals = [];

const App = () => {
  const [currentUser, setCurrentUser] = React.useState("demo@company.com");
  const [tasksList, setTasksList] = React.useState([]);
  const [approvalsList, setApprovalsList] = React.useState([]);

  React.useEffect(() => {
    loadData();
    if (tasks.length === 0) {
      addDemoData();
    }
  }, []);

  const loadData = () => {
    setTasksList(tasks);
    setApprovalsList(approvals);
  };

  const addDemoData = () => {
    const demoTask = {
      id: 'demo-1',
      title: 'Implement Security Protocol',
      description: 'Add multi-factor authentication to user login system',
      requester: 'manager@company.com',
      approvers: ['security@company.com', 'user1@test.com', 'user2@test.com'],
      status: 'pending',
      createdAt: new Date(),
      approvedBy: ['security@company.com'],
      rejectedBy: []
    };
    
    tasks.push(demoTask);
    
    demoTask.approvers.forEach(approver => {
      approvals.push({
        id: `${demoTask.id}-${approver}`,
        taskId: demoTask.id,
        approver: approver,
        status: approver === 'security@company.com' ? 'approved' : 'pending',
        createdAt: new Date()
      });
    });
    
    loadData();
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
      approvedBy: [],
      rejectedBy: []
    };

    tasks.push(newTask);
    
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
  };

  const approveTask = async (taskId, approver) => {
    const task = tasks.find(t => t.id === taskId);
    const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
    
    if (task && approval) {
      approval.status = 'approved';
      approval.approvedAt = new Date();
      
      task.approvedBy.push(approver);
      
      if (task.approvedBy.length === task.approvers.length) {
        task.status = 'approved';
      }
      
      loadData();
    }
  };

  const rejectTask = async (taskId, approver) => {
    const task = tasks.find(t => t.id === taskId);
    const approval = approvals.find(a => a.taskId === taskId && a.approver === approver);
    
    if (task && approval) {
      approval.status = 'rejected';
      approval.rejectedAt = new Date();
      
      task.status = 'rejected';
      task.rejectedBy.push(approver);
      
      loadData();
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === 'approved') return '✅ Approved';
    if (task.status === 'rejected') return '❌ Rejected';
    return `⏳ Pending (${task.approvedBy.length}/${task.approvers.length})`;
  };

  return render(
    AdminPage({
      children: [
        Text({
          children: [
            "🚀 Professional Workflow Approval System",
            "Tasks require approval from ALL designated users before proceeding"
          ]
        }),
        
        // User Switcher
        Text({ children: ["👤 Current User: " + currentUser] }),
        Text({ children: ["Switch user to test different perspectives:"] }),
        Button({
          text: "Switch to user1@test.com",
          onClick: () => setCurrentUser("user1@test.com")
        }),
        Button({
          text: "Switch to user2@test.com", 
          onClick: () => setCurrentUser("user2@test.com")
        }),
        Button({
          text: "Switch to security@company.com",
          onClick: () => setCurrentUser("security@company.com")
        }),
        Text({ children: ["---"] }),
        
        // Create Task Form
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

        // Tasks Overview
        Text({ children: ["📋 Tasks Overview"] }),
        Table({
          children: [
            Head({
              children: [
                Cell({ children: ["Task"] }),
                Cell({ children: ["Status"] }),
                Cell({ children: ["Progress"] })
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
                  })
                ]
              })
            )
          ]
        }),

        // Pending Approvals
        Text({ children: [`⏳ Pending Approvals for ${currentUser}`] }),
        Table({
          children: [
            Head({
              children: [
                Cell({ children: ["Task"] }),
                Cell({ children: ["Requester"] }),
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
                    Cell({
                      children: [
                        Button({
                          text: "✅ Approve",
                          onClick: () => approveTask(approval.taskId, currentUser)
                        }),
                        Button({
                          text: "❌ Reject",
                          onClick: () => rejectTask(approval.taskId, currentUser)
                        })
                      ]
                    })
                  ]
                });
              })
          ]
        })
      ]
    })
  );
};

export const run = App;

export const handler = async (event, context) => {
  return run(event, context);
}; 