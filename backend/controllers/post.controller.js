import { v2 as cloudinary } from "cloudinary";

//models
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
    try {
        //getting the information from the request body
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        //checking if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(!text && !img) {
            return res.status(400).json({ message: "Please provide text or image" });
        }

        //upload image to cloudinary
        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }
        
        //after checking all the ifs we can pass the post model
        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in createPost controller", error);
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        //check if we are the owner for the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You are not authorized to delete this post" });
        }

        // delete the img from cloudinary if there is one
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        // delete the post
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in deletePost controller", error);
        
    }
};

export const commentOnPost = async (req, res) => {
    try {
        //get the info being passed in the post
        const { text } = req.body;
        const userId = req.user._id;
        const postId = req.params.id;
        
        //if there is no text
        if (!text) {
            return res.status(400).json({ message: "Please provide text" });
        }

        //check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        //push the comment
        const comment = {
            user: userId, 
            text: text
        };
        post.comments.push(comment);

        //save the post
        await post.save();
        res.status(200).json(post);


    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in commentOnPost controller", error);    
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        //check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        //check if the user has already liked the post
        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //if the user has already liked the post, unlike it
            await Post.updateOne({_id: postId}, { $pull: { likes: userId } });
            await User.updateOne({_id: userId}, { $pull: { likedPosts: postId } });
            res.status(200).json({ message: "Post unliked" });
        }
        else {
            //if the user has not liked the post, like it
            post.likes.push(userId);
            await User.updateOne({_id: userId}, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });

            await notification.save();
            res.status(200).json({ message: "Post liked" });
        }

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in likeUnlikePost controller", error);
        
    }
};

export const getAllPosts = async (req, res) => {
    try {
        //get all posts, latest first
        // using populate method to be able to see the information of the user. like, name, username, profile pic. 
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
            // using this format to not get the password
        })
        .populate({
            path: "comments.user",
            select: "-password",
            // using this format to not get the password
        });

        //if there is no posts, return an empty array
        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in getAllPosts controller", error);
        
    }
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        //get the list of users that the user is following
        const following = user.following;
        //get the posts of the users that the user is following 
        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in getFollowingPosts controller", error);
        
    }
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
