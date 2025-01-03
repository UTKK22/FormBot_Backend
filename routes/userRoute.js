const express = require('express');
const router = express.Router();
const User = require('../model/user');
const { registerUser, loginUser, updateUser,shareemail,sharelink } = require('../controllers/userController');
const validateNewUser = require('../middleware/validateNewUser');
const verifyToken = require('../middleware/verifyToken')
const Workspace=require('../model/Workspace')
require("dotenv").config();
const JWT_PRIVATE_KEY= process.env.JWT_PRIVATE_KEY;
router.post('/register',validateNewUser,registerUser);
router.post('/login', loginUser);
router.put('/update', verifyToken, updateUser);  
  const checkPermission = async (req, res, next) => {
    try {
      const workspace = await Workspace.findById(req.params.id);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
  
      const sharedWorkspace = workspace.sharedUsers.find(
        (user) => user.userId.toString() === req.user.userId
      );
  
      if (!sharedWorkspace || (sharedWorkspace.permission === "view" && req.method !== "GET")) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      req.workspace = workspace;
      next();
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  };
//   router.post("/workspaces/share/email", verifyToken, async (req, res) => {
//     const { email, permission,workspaceId } = req.body;
//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       console.log("workspaceId",workspaceId)
//       const workspace = await Workspace.findById(workspaceId);
//       if (!workspace) {
//         return res.status(404).json({ message: "Workspace not found" });
//       }
  
//       const alreadyShared = user.sharedWorkspaces.some(
//         (shared) => shared.workspaceId.toString() === workspace._id.toString()
//       );
  
//       if (!alreadyShared) {
//         user.sharedWorkspaces.push({ workspaceId: workspace._id, permission });
//         await user.save();
//       }
  
//       res.status(200).json({ message: "Workspace shared successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "An error occurred" });
//     }
//   });
  
  // Route to generate and share link
  router.post("/workspaces/share/email", verifyToken, async (req, res) => {
    const { email, permission, workspaceId } = req.body;
  console.log({email, permission, workspaceId }, '>>>>>>>>>>>>>>>>>')
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!workspaceId) {
        return res.status(404).json({ message: "Workspace not found" });
      }
  
      // Check if the user has already been invited to the workspace
      const alreadyShared = user.sharedWorkspaces.some(
        (sharedUser) => sharedUser.userId.toString() === workspaceId.toString()
      );
      
      if (alreadyShared) {
        return res.status(400).json({ message: "User already has access to this workspace" });
      }
  
      // Add the user to the workspace's sharedUsers list with the given permission
      user.sharedWorkspaces.push({ userId: workspaceId, permission });
      await user.save();
  
      // Optionally, add this workspace to the sharedWorkspaces array for the user
      // if (!user.sharedWorkspaces.some(ws => ws.workspaceId.toString() === workspace._id.toString())) {
      //   user.sharedWorkspaces.push({ workspaceId: workspace._id, permission });
      //   await user.save();
      // }
  
      res.status(200).json({ message: "Workspace shared successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  router.post("/workspaces/share/link", verifyToken, async (req, res) => {
    const { permission,workspaceId, email} = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!workspaceId) {
        return res.status(404).json({ message: "Workspace not found" });
      }
  
      // Check if the user has already been invited to the workspace
      const alreadyShared = user.sharedWorkspaces.some(
        (sharedUser) => sharedUser.userId.toString() === workspaceId.toString()
      );
      
      if (alreadyShared) {
        return res.status(400).json({ message: "User already has access to this workspace" });
      }
  
      // Add the user to the workspace's sharedUsers list with the given permission
      user.sharedWorkspaces.push({ userId: workspaceId, permission });
      await user.save();
  
      // Optionally, add this workspace to the sharedWorkspaces array for the user
      // if (!user.sharedWorkspaces.some(ws => ws.workspaceId.toString() === workspace._id.toString())) {
      //   user.sharedWorkspaces.push({ workspaceId: workspace._id, permission });
      //   await user.save();
      // }
  
      res.status(200).json({ message: "Workspace shared successfully" });
      // const token = jwt.sign({ workspaceId, permission }, JWT_PRIVATE_KEY, { expiresIn: "7d" });
      // res.status(200).json({ link: `${process.env.CLIENT_URL}/shared/${token}` });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Get all workspaces (owned and shared)
  router.get("/workspaces", verifyToken, async (req, res) => {
    console.log("I am called ")
    try {
      const user = await User.findById(req.user.userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }



      // const workspaces= user.sharedWorkspaces.map(async ({userId: workspaceId})=>{
      //  const user = await User.findById(workspaceId)
      //  console.log(user, ">>>>>>>>user>>>>>>>>>", workspaceId)
      //  return user.name;
      // })

      const workspaces = await Promise.all(
        user.sharedWorkspaces.map(async ({ userId: workspaceId }) => {
            const workspace = await User.findById(workspaceId);
            if (!workspace) {
                console.log(`Workspace with ID ${workspaceId} not found.`);
                return null; // You could also handle this case differently, like skipping or returning an error
            }
            return { name: workspace.name , workspaceId : workspace._id };
        })
    );

      console.log(workspaces, '<<<<<<<<<<workspaces>>>>>>>>>>>')

      res.status(200).json({
        workspaces
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
    
module.exports = router;