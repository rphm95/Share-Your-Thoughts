import { useEffect, useState } from "react";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import toast from "react-hot-toast";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";


const EditProfileModal = ({authUser}) => {
	// const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	// calling the hook now
	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	// this entire function became a hook to be utilized in 2 different places.
	// const {mutate:updateProfile, isPending:isUpdatingProfile} = useMutation({
	// 		mutationFn: async () => {
	// 			// here is just the cover and profile image, the rest of the profile is under EditProfileModal page
	// 			try {
	// 				const res = await fetch(`/api/users/update`,	{
	// 					method: "POST",
	// 					headers: {
	// 						"Content-Type": "application/json",
	// 					},
	// 					body: JSON.stringify(formData),
	// 				})
	// 				const data = await res.json();
	// 				if (!res.ok) {
	// 					throw new Error(data.error || "Something went wrong")
	// 				}
	// 				return data
	
	// 			} catch (error) {
	// 				throw new Error(error.message)
	// 			}
	// 		},
	// 		onSuccess: () => {
	// 			toast.success("Profile updated successfully")
	// 			// we are going to invalidade the user profile to display the image and the one on the side bar as well
	// 			Promise.all([
	// 				queryClient.invalidateQueries({ queryKey: ["authUser"]}),
	// 				queryClient.invalidateQueries({ queryKey: ["userProfile"]}),
	// 			])
	// 		},
	// 		onError: (error) => {
	// 			toast.error(error.message)
	// 		}
	// })
	




	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if(authUser){
			setFormData({
				fullName: authUser.fullName,
				username: authUser.username,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
				newPassword: "",
				currentPassword: "",
			})
		}
	},[authUser]);

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal' >
				<div className='modal-box border rounded-md border-gray-700 shadow-md bg-purple-300' style={{paddingBottom:"0px"}} >
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile(formData);
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.username}
								name='username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
							/>
                            <input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						    />
							{/* <textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/> */}
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
                        <div className='flex flex-wrap gap-2'>
                            <textarea
                                    placeholder='Bio'
                                    className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                    value={formData.bio}
                                    name='bio'
                                    onChange={handleInputChange}
                            />
                        </div>
						{/* <input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/> */}
						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{isUpdatingProfile? "Updating...": "Update"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none bg-black-700'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;