import mongoose from "mongoose";  

const postSchema = new mongoose.Schema({
    //this a reference to the user model
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text:{
        type: String
    },
    img:{
        type: String
    },
    //this a reference to the user model
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments:[
        {
            text:{
                type: String,
                required: true
            },
            //we are going to pass the user so we knoe who made the comment
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
        }
    ]
}, {timestamps: true});

const Post = mongoose.model("Post", postSchema);
export default Post;
