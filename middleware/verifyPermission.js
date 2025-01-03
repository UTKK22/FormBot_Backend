const Workspace = require("../models/Workspace");

const checkWorkspacePermission = async (req, res, next) => {
  const { workspaceId } = req.params;
  try {
    const workspace = await Workspace.findById(workspaceId).populate("members.user");

    // Check if user is the owner
    if (workspace.owner.toString() === req.user._id) {
      return next(); // Owner always has full access
    }

    // Check if user is a member
    const member = workspace.members.find(
      (member) => member.user._id.toString() === req.user._id
    );

    if (!member) {
      return res.status(403).json({ message: "You do not have access to this workspace." });
    }

    // Attach permission to request object
    req.permission = member.permission;

    next();
  } catch (error) {
    console.error("Permission check error:", error);
    res.status(500).json({ message: "Failed to verify permissions." });
  }
};

module.exports = { checkWorkspacePermission };
