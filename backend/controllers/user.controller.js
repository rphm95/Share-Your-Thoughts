import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
//models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";


export const getUserProfile = async (req, res) => {
    // getting the username form the params
    const { username } = req.params;

    try {
        const user = await User.findOne({ username: username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id); // that is the user that you would like to follow or unfollow.
        const currentUser = await User.findById(req.user._id); // the user that is currently logged in.

        //we convert to string because it comes as an object.
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself!" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isFollowing = currentUser.following.includes(id); //check if the user is following or not the other user.

        if (isFollowing) {
            // if the user is following the other user, then unfollow.
            //update first the followers array of the user that you want to unfollow.
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id }
            });
            //current user object
            //update the following array of the current user.
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            //TODO RETURN THE ID OF THE USER AS A RESPONSE
            res.status(200).json({ message: "User unfollowed successfully!" });

        } else {
            // if the user is not following the other user, then follow.
            //update first the followers array of the user that you want to follow.
            await User.findByIdAndUpdate(id, { 
                $push: { followers: req.user._id }
            });
            //current user object
            //update the following array of the current user.
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            // send notification to the user - it has be created in the model first
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            //TODO RETURN THE ID OF THE USER AS A RESPONSE
            res.status(200).json({ message: "User followed successfully"});
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        // we want to make sure that we wont be suggested for ouserlves or users that we already follow.
        // get the user id of the current user.
        // get the list of users that the current user follows.
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match:{
                    _id: { $ne: userId }, // exclude the current user
                }
            },
            {$sample: { size: 10 }} // get 10 random users
        ])

        // we want to filter out the users that are already followed by the current user.
        const filteredUsers = users.filter( user => {
            // check if the user is not already followed by the current user
            return !usersFollowedByMe.following.includes(user._id);
        });
        
        const suggestedUsers = filteredUsers.slice(0,4) // get 4 different values
        
        suggestedUsers.forEach(user => {
            user.password = null; // remove the password from the user object
        });

        res.status(200).json(suggestedUsers);

    } catch (error) {

        console.log("Error in getSuggestedUsers controller: ", error.message);
        res.status(500).json({ error: error.message });
        
    }
};

export const updateUser = async (req, res) => {
    // this is the function that will update the user profile.
    // here we are getting all the values from the request body.
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        // check if the current password is correct.
        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(400).json({ message: "Please provide both current and new password!" });
        }
        if (currentPassword && newPassword) {
            // check if the current password is correct.
            // first is the one the user passed and second is the one in the database.
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect!" });
            }
            //check the length of the new password.
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long!" });
            }
            // hash the new password.
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // if user is passing prof image
        if(profileImg){
            // cloudinary will keep every picute, however we have a free account and we dont want to go above the limit.
            if (user.profileImg){
                // delete the old image from cloudinary
                // images comes in url format, so we have to split it and get the public id. it will be the last value.
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            //these are passing to cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
            // no we have to update the user profile
        }

        // if user is passing cover image
        if(coverImg){
            if(user.coverImg){ 
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        // here we are either updating or keeping the one we already have
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // save the user
        await user.save();
        user.password = null; // remove the password from the user response

        return res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
        console.log("Error in updateUser controller: ", error.message);
        return res.status(500).json({ error: error.message });
    }

};