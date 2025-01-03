const Workspace = require("../model/Workspace");
const User = require("../model/user");

const ShareWorkspace = async (req, res) => {
  const { email, workspaceId, permission } = req.body;
  try {
    // Validate email
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "User not found. Please ask them to register." });
    }

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    // Ensure only owner can share
    if (workspace.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: "You are not the owner of this workspace." });
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(
      (member) => member.user.toString() === userToShare._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already a member of this workspace." });
    }

    // Add user to workspace
    workspace.members.push({ user: userToShare._id, permission });
    await workspace.save();

    res.status(200).json({ message: "Workspace shared successfully!" });
  } catch (error) {
    console.error("Error sharing workspace:", error);
    res.status(500).json({ message: "Failed to share workspace." });
  }
};
const getWorkspaces = async (req, res) => {
    try {
      // Fetch workspaces the user owns
      const ownedWorkspaces = await Workspace.find({ owner: req.user._id });
  
      // Fetch workspaces shared with the user
      const sharedWorkspaces = await Workspace.find({
        "members.user": req.user._id,
      });
  
      res.status(200).json({ ownedWorkspaces, sharedWorkspaces });
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces." });
    }
  };

  

module.exports = { ShareWorkspace,getWorkspaces };
