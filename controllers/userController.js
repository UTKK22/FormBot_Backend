const User = require('../model/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Workspace=require('../model/Workspace')
 require('dotenv').config();
const JWT_PRIVATE_KEY= process.env.JWT_PRIVATE_KEY
const CLIENT_URL=process.env.CLIENT_URL
const registerUser = async (req,res) =>{
    try{
        const {name,email,password} = req.body;
        // console.log(name,email,password);
       
        const existingUser = await User.findOne({email})
        // console.log(existingUser);
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists, please use another email address',
        });
       }else{
      
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword)
        
        const newUser = new User({
            name,
            email,
            password:hashedPassword,
        });
        await newUser.save()
        res.status(201).json({
            message: 'User created successfully',
            status:'success',
        });
    }
        
    }catch(error){
     console.log(error)
    }
}
const loginUser = async (req,res)=>{
    try{
     const {email,password} = req.body;
    //  console.log("entry in loginUser");
    //  console.log({email},{password});
     const existingUser = await User.findOne({email: email});
     
     if(existingUser){
         const isPassword = await bcrypt.compare(password,existingUser.password);
         if(isPassword){
             const token = jwt.sign({userId: existingUser._id,username: existingUser.name}, JWT_PRIVATE_KEY,{ expiresIn: "1h",});
             res.status(200).json({
                message: 'User logged in successfully',
                email: existingUser.email,
                token,
                userId: existingUser._id,
                username: existingUser.name
              });
         }else{
             res.status(401).json({
                 message:'Email or password is incorrect'
             })
         }
     }else{
         res.status(404).json({
             message:'user not found'
         })
     }
    }catch(error){
      console.log(error)
    }
 
 }
const updateUser = async (req, res) => {
    try {
        const { name, email, oldPassword, newPassword } = req.body; 
        const userId = req.user.userId; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

      
        if (name) {
            user.name = name;
        }

       
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            user.email = email;
        }

      
        if (oldPassword || newPassword) {
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'Both old and new passwords are required to change the password' });
            }
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }
            if (oldPassword === newPassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the old password' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

       
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error({error});
        res.status(500).json({ message: 'Internal server error' });
    }
};
// const shareemail=async (req, res) => {
//     const { email, permission } = req.body;
//     try {
//       // Find user by email
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(404).send("User not found");
//       }
  
//       // Add shared workspace to the user's account
//       const workspace = await Workspace.findById(req.workspaceId);
//       if (!workspace) {
//         return res.status(404).send("Workspace not found");
//       }
  
//       // Add shared workspace details if not already added
//       const isAlreadyShared = user.sharedWorkspaces.some(
//         (sharedWs) => sharedWs.workspaceId.toString() === workspace._id.toString()
//       );
  
//       if (!isAlreadyShared) {
//         user.sharedWorkspaces.push({ workspaceId: workspace._id, permission });
//         await user.save();
//       }
  
  
//       res.status(200).send("Invitation sent successfully");
//     } catch (error) {
//       res.status(500).send("An error occurred");
//     }
//   };
  
//   const sharelink= async (req, res) => {
//     const { permission } = req.body;
//     try {
//       const token = jwt.sign(
//         { workspaceId: req.workspaceId, permission },
//         process.env.JWT_PRIVATE_KEY,
//         { expiresIn: "7d" }
//       );
//       res.status(200).send({ link: `${CLIENT_URL}/shared/${token}` });
//     } catch (error) {
//       res.status(500).send("An error occurred");
//     }
//   };
  
 
 module.exports = {registerUser, loginUser, updateUser};